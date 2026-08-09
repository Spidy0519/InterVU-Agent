import express from "express";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
const CANDIDATES_DATA = JSON.parse(fs.readFileSync(path.join(process.cwd(), "../data/candidates.json"), "utf8"));
const CURRICULUM_DATA = JSON.parse(fs.readFileSync(path.join(process.cwd(), "../data/curriculum.json"), "utf8"));
import { interviewStore } from "./src/server/interviewStore";
import { initializeInterview, processTurn, compileFinalFeedback } from "./src/server/orchestrator";
dotenv.config();
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
    app.get("/api/session/:sessionId", (req, res) => {
        const { sessionId } = req.params;
        const session = interviewStore.get(sessionId);
        if (!session) {
            return res.status(404).json({ error: "Interview session not found" });
        }
        res.json(session);
    });
    // API Route: Force Finish Interview and Generate Feedback
    app.post("/api/interview/finish", async (req, res) => {
        try {
            const { sessionId } = req.body;
            const session = interviewStore.get(sessionId);
            if (!session) {
                return res.status(404).json({ error: "Session not found" });
            }
            session.status = 'completed';
            const finalFeedback = await compileFinalFeedback(session);
            session.finalFeedback = finalFeedback;
            interviewStore.set(sessionId, session);
            return res.json({
                reply: "Interview concluded upon request. Detailed evaluation report generated.",
                done: true,
                feedback: {
                    summary: finalFeedback.summary,
                    strengths: finalFeedback.strengths,
                    gaps: finalFeedback.gaps,
                    next: finalFeedback.next
                },
                session
            });
        }
        catch (err) {
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
            // 1. Initial Start Scenario: candidate object provided (or session doesn't exist yet)
            if (candidate || !interviewStore.has(sessionId)) {
                const candidateData = candidate || CANDIDATES_DATA[0];
                const { state, initialReply } = await initializeInterview(sessionId, candidateData);
                interviewStore.set(sessionId, state);
                return res.json({
                    reply: initialReply,
                    done: false,
                    sessionId,
                    stateSummary: {
                        questionCount: state.questionCount,
                        coveredDays: state.coveredDays,
                        difficulty: state.difficulty,
                        nextGoal: state.nextQuestionGoal
                    }
                });
            }
            // 2. Turn Scenario: message provided
            const session = interviewStore.get(sessionId);
            if (!session) {
                return res.status(404).json({ error: "Session not found. Please initialize interview first." });
            }
            if (session.status === 'completed') {
                return res.json({
                    reply: "This interview has already been completed.",
                    done: true,
                    feedback: session.finalFeedback ? {
                        summary: session.finalFeedback.summary,
                        strengths: session.finalFeedback.strengths,
                        gaps: session.finalFeedback.gaps,
                        next: session.finalFeedback.next
                    } : undefined
                });
            }
            const candidateAnswer = message || "I understand the concept.";
            const turnResult = await processTurn(session, candidateAnswer);
            interviewStore.set(sessionId, turnResult.state);
            return res.json({
                reply: turnResult.reply,
                done: turnResult.done,
                feedback: turnResult.feedback,
                sessionId,
                stateSummary: {
                    questionCount: turnResult.state.questionCount,
                    coveredDays: turnResult.state.coveredDays,
                    difficulty: turnResult.state.difficulty,
                    nextGoal: turnResult.state.nextQuestionGoal
                }
            });
        }
        catch (err) {
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
