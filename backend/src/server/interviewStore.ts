import { InterviewState } from '../types/interview';

const sessionMap = new Map<string, InterviewState>();

export const interviewStore = {
  get(sessionId: string): InterviewState | undefined {
    return sessionMap.get(sessionId);
  },

  set(sessionId: string, state: InterviewState): void {
    sessionMap.set(sessionId, state);
  },

  has(sessionId: string): boolean {
    return sessionMap.has(sessionId);
  },

  delete(sessionId: string): boolean {
    return sessionMap.delete(sessionId);
  },

  clear(): void {
    sessionMap.clear();
  }
};
