import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { supabase } from "./supabaseClient";
import { initializeInterview, processTurn, compileFinalFeedback } from "./src/server/orchestrator";
import { Candidate } from "./src/types/interview";

dotenv.config();

const CANDIDATES_DATA = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../data/candidates.json"), "utf8"));
const CURRICULUM_DATA = JSON.parse(fs.readFileSync(path.join(import.meta.dirname, "../data/curriculum.json"), "utf8"));

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route: Health Check
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // API Route: Get Preseeded Candidates
  app.get("/api/candidates", (req, res) => {
    res.json(CANDIDATES_DATA);
  });

  // API Route: Get Curriculum Cohort
  app.get("/api/curriculum", (req, res) => {
    res.json(CURRICULUM_DATA);
  });

  // API Route: Get Interview Session State (Internal UI helper)
  app.get("/api/session/:sessionId", async (req, res) => {
    const { sessionId } = req.params;
    const { data: sessionData, error } = await supabase
      .from('interview_sessions')
      .select('*, interview_state(*), interview_turns(*)')
      .eq('session_id', sessionId)
      .single();

    if (error || !sessionData) {
      return res.status(404).json({ error: "Interview session not found in DB" });
    }
    
    let state = Array.isArray(sessionData.interview_state) 
      ? sessionData.interview_state[0] 
      : sessionData.interview_state;
    
    if (!state) {
      state = { questions_asked: 0, curriculum_days_covered: [] };
    }

    const turns = sessionData.interview_turns || [];
    
    // Reconstruct the { question, answer } paired history that the UI expects
    const history = [];
    let currentPair: any = null;

    // Sort turns by created_at to ensure chronological order
    const sortedTurns = turns.sort((a: any, b: any) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());

    for (const t of sortedTurns) {
      if (t.role === 'interviewer' || t.role === 'agent' || t.role === 'system') {
        if (currentPair) history.push(currentPair);
        currentPair = {
          question: {
            id: t.id || Math.random().toString(),
            text: t.content,
            curriculumDay: state.curriculum_days_covered?.[0] || 7,
            topic: 'Technical Interview',
            type: 'conceptual',
            difficulty: 'medium'
          }
        };
      } else if (t.role === 'candidate' && currentPair) {
        currentPair.answer = t.content;
        history.push(currentPair);
        currentPair = null;
      }
    }
    if (currentPair) history.push(currentPair);

    // Look up the candidate from static data
    const candidateData = CANDIDATES_DATA.candidates.find((c: any) => c.member.id === sessionData.candidate_id) || CANDIDATES_DATA.candidates[0];
    
    // Construct a mock structure for the UI if it expects history etc
    res.json({
      sessionId,
      candidate: candidateData,
      status: sessionData.status,
      questionCount: state.questions_asked,
      coveredDays: state.curriculum_days_covered || [],
      history
    });
  });

  // API Route: Abort Interview due to Fullscreen Exit
  app.post("/api/interview/abort", async (req, res) => {
    try {
      const { sessionId } = req.body;
      const { data: sessionData } = await supabase.from('interview_sessions').select('*').eq('session_id', sessionId).single();
      
      if (!sessionData) {
        return res.status(404).json({ error: "Session not found" });
      }

      await supabase.from('interview_sessions').update({ status: 'aborted' }).eq('session_id', sessionId);
      
      // Optionally record the abort reason as a system turn
      await supabase.rpc('record_interview_turn', {
        p_session_id: sessionId,
        p_role: 'system',
        p_content: 'Candidate abandoned interview by exiting fullscreen mode.',
        p_covers_day: null,
        p_topic: 'System Event',
        p_question_type: 'conceptual'
      });

      return res.json({ success: true, message: "Interview aborted" });
    } catch (err: any) {
      console.error("Error aborting interview:", err);
      res.status(500).json({ error: err?.message || "Failed to abort interview" });
    }
  });

  // API Route: User Feedback
  app.post("/api/feedback", async (req, res) => {
    try {
      const { sessionId, stars, description } = req.body;
      const fs = require('fs');
      const path = require('path');
      const feedbacksFile = path.resolve(__dirname, '../../data/feedbacks.json');
      
      let feedbacks = [];
      if (fs.existsSync(feedbacksFile)) {
        feedbacks = JSON.parse(fs.readFileSync(feedbacksFile, 'utf8'));
      }
      
      feedbacks.push({
        sessionId,
        stars,
        description,
        timestamp: new Date().toISOString()
      });
      
      fs.writeFileSync(feedbacksFile, JSON.stringify(feedbacks, null, 2));
      return res.json({ success: true });
    } catch (err: any) {
      console.error("Error saving feedback:", err);
      res.status(500).json({ error: "Failed to save feedback" });
    }
  });

  // API Route: Force Finish Interview and Generate Feedback
  app.post("/api/interview/finish", async (req, res) => {
    try {
      const { sessionId } = req.body;
      const { data: sessionData } = await supabase.from('interview_sessions').select('*').eq('session_id', sessionId).single();
      
      if (!sessionData) {
        return res.status(404).json({ error: "Session not found" });
      }

      const finalFeedback = await compileFinalFeedback(sessionId);
      await supabase.from('interview_sessions').update({ status: 'completed' }).eq('session_id', sessionId);

      return res.json({
        reply: "Interview concluded upon request. Detailed evaluation report generated.",
        done: true,
        feedback: {
          summary: finalFeedback.summary,
          strengths: finalFeedback.strengths,
          gaps: finalFeedback.gaps,
          next: finalFeedback.next
        }
      });
    } catch (err: any) {
      console.error("Error finishing interview:", err);
      res.status(500).json({ error: err?.message || "Failed to finalize interview" });
    }
  });

  // REQUIRED API CONTRACT: POST /api/interview
  app.post("/api/interview", async (req, res) => {
    try {
      const { sessionId, candidate, message } = req.body;

      if (!sessionId) {
        return res.status(400).json({ error: "sessionId is required" });
      }

      const { data: existingSession } = await supabase.from('interview_sessions').select('*').eq('session_id', sessionId).single();

      // 1. Initial Start Scenario: session doesn't exist yet
      if (!existingSession) {
        const candidateData: Candidate = candidate || CANDIDATES_DATA[0];
        const { stateSummary, initialReply } = await initializeInterview(sessionId, candidateData);

        return res.json({
          reply: initialReply,
          done: false
        });
      }

      // 2. Turn Scenario: session exists
      if (existingSession.status === 'completed') {
        const { data: feedbackData } = await supabase.from('interview_feedback').select('*').eq('session_id', sessionId).single();
        return res.json({
          reply: "This interview has already been completed.",
          done: true,
          feedback: feedbackData ? {
            summary: feedbackData.summary,
            strengths: feedbackData.strengths,
            gaps: feedbackData.gaps,
            next: feedbackData.next_steps
          } : undefined
        });
      }

      const candidateAnswer = message || "I understand the concept.";
      const turnResult = await processTurn(sessionId, candidateAnswer);

      const responsePayload: any = {
        reply: turnResult.reply,
        done: turnResult.done
      };

      if (turnResult.feedback) {
        responsePayload.feedback = turnResult.feedback;
      }

      return res.json(responsePayload);
    } catch (err: any) {
      console.error("Error handling /api/interview:", err);
      return res.status(500).json({
        error: "An error occurred during interview turn processing",
        details: err?.message
      });
    }
  });

  // Vite middleware setup removed for standalone backend
  if (process.env.NODE_ENV === "production") {
    const distPath = path.join(process.cwd(), '../frontend/dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`AI Interviewer server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();

