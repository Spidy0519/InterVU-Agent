import { Candidate } from '../types/interview';

export const CANDIDATES_DATA: Candidate[] = [
  {
    member: {
      id: "CAND-001",
      name: "Sarah Johnson",
      email: "sarah.johnson@enterprise.ai",
      jobRole: "Senior Data Engineer",
      yearsExperience: 9,
      education: "MS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 2 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 4 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 2 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 2 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 3 },
      { day: 29, title: "Monitoring, Logging & Observability", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 28, missionsCompleted: 30, missionsFirstTry: 20 }
  },
  {
    member: {
      id: "CAND-002",
      name: "Alex Turner",
      email: "alex.turner@enterprise.ai",
      jobRole: "Backend Software Engineer",
      yearsExperience: 5,
      education: "B.Tech Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 3 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 2 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 4 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 5 },
      { day: 13, title: "Function Calling & Structured Outputs", passed: true, attempts: 4 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 18, title: "Streaming Responses", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 3 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 22, missionsCompleted: 29, missionsFirstTry: 10 }
  },
  {
    member: {
      id: "CAND-003",
      name: "Emily Chen",
      email: "emily.chen@enterprise.ai",
      jobRole: "AI Engineer",
      yearsExperience: 6,
      education: "MS Artificial Intelligence",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 1 },
      { day: 11, title: "RAG End-to-End & LLM API Basics", passed: true, attempts: 1 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 1 },
      { day: 13, title: "Function Calling & Structured Outputs", passed: true, attempts: 1 },
      { day: 21, title: "LangChain Agents", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 30 }
  },
  {
    member: {
      id: "CAND-004",
      name: "David Miller",
      email: "david.miller@enterprise.ai",
      jobRole: "Business Analyst",
      yearsExperience: 8,
      education: "MBA",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 4 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 5 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 5 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 3 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 2 },
      { day: 20, title: "Conversation Memory & Context Management", passed: true, attempts: 3 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 4 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 5 },
      { day: 28, title: "Docker & Kubernetes Deployment", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 18, missionsCompleted: 28, missionsFirstTry: 6 }
  },
  {
    member: {
      id: "CAND-005",
      name: "Michael Brown",
      email: "michael.brown@enterprise.ai",
      jobRole: "DevOps Engineer",
      yearsExperience: 10,
      education: "B.Tech Information Technology",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 2 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 2 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 2 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 4 },
      { day: 18, title: "Streaming Responses", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 2 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 3 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 29, title: "Monitoring, Logging & Observability", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 30, missionsCompleted: 31, missionsFirstTry: 22 }
  },
  {
    member: {
      id: "CAND-006",
      name: "Wendy Foster",
      email: "wendy.foster@enterprise.ai",
      jobRole: "Marketing Manager",
      yearsExperience: 12,
      education: "BA Marketing",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 3 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 5 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 5 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 4 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 4 },
      { day: 17, title: "Chatbot Frontend Development", passed: true, attempts: 2 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 5 },
      { day: 27, title: "Security, Privacy & Guardrails", skipped: true },
      { day: 28, title: "Docker & Kubernetes Deployment", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 3 }
    ],
    signals: { commitDays: 19, missionsCompleted: 24, missionsFirstTry: 2 }
  },
  {
    member: {
      id: "CAND-007",
      name: "Ethan Brooks",
      email: "ethan.brooks@enterprise.ai",
      jobRole: "Computer Science Intern",
      yearsExperience: 0,
      education: "BS Computer Science (in progress)",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 1 },
      { day: 3, title: "First AI Project, React Frontend & GitHub", passed: true, attempts: 1 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 2 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 1 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
      { day: 27, title: "Security, Privacy & Guardrails", skipped: true },
      { day: 28, title: "Docker & Kubernetes Deployment", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 26, missionsCompleted: 27, missionsFirstTry: 22 }
  },
  {
    member: {
      id: "CAND-008",
      name: "Harold Whitfield",
      email: "harold.whitfield@enterprise.ai",
      jobRole: "Distinguished Engineer",
      yearsExperience: 28,
      education: "BS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 1 },
      { day: 4, title: "Reading & Processing Structured Data", passed: true, attempts: 1 },
      { day: 5, title: "Reading & Processing Unstructured Data", passed: true, attempts: 1 },
      { day: 14, title: "Fine-Tuning: Concepts & When to Use It", skipped: true },
      { day: 15, title: "Fine-Tuning: Hands-On with LoRA & QLoRA", skipped: true },
      { day: 21, title: "LangChain Agents", passed: true, attempts: 5 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 4 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 5 },
      { day: 27, title: "Security, Privacy & Guardrails", passed: true, attempts: 1 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 25, missionsCompleted: 27, missionsFirstTry: 15 }
  },
  {
    member: {
      id: "CAND-009",
      name: "Zara Ahmadi",
      email: "zara.ahmadi@enterprise.ai",
      jobRole: "AI Engineer",
      yearsExperience: 1,
      education: "BS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 1 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 1 },
      { day: 13, title: "Function Calling & Structured Outputs", passed: true, attempts: 1 },
      { day: 21, title: "LangChain Agents", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 1 },
      { day: 27, title: "Security, Privacy & Guardrails", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 29 }
  },
  {
    member: {
      id: "CAND-010",
      name: "Gerald Combs",
      email: "gerald.combs@enterprise.ai",
      jobRole: "IT Support Specialist",
      yearsExperience: 20,
      education: "AAS Information Technology",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 2 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 5 },
      { day: 8, title: "Vector Databases Overview", passed: false, attempts: 4 },
      { day: 10, title: "Retrieval & Matching Engine", passed: false, attempts: 3 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 5 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 4 },
      { day: 22, title: "Multi-Agent Orchestration", passed: false, attempts: 3 },
      { day: 27, title: "Security, Privacy & Guardrails", skipped: true },
      { day: 28, title: "Docker & Kubernetes Deployment", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 3 }
    ],
    signals: { commitDays: 22, missionsCompleted: 23, missionsFirstTry: 1 }
  },
  {
    member: {
      id: "CAND-011",
      name: "Mia Alvarez",
      email: "mia.alvarez@enterprise.ai",
      jobRole: "UX Researcher",
      yearsExperience: 6,
      education: "MA Human-Computer Interaction",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 2 },
      { day: 2, title: "Local LLM & AI Coding Assistant Setup", passed: true, attempts: 1 },
      { day: 3, title: "First AI Project, React Frontend & GitHub", passed: true, attempts: 3 },
      { day: 4, title: "Reading & Processing Structured Data", passed: true, attempts: 2 },
      { day: 7, title: "Embeddings Explained", skipped: true },
      { day: 8, title: "Vector Databases Overview", skipped: true },
      { day: 12, title: "Prompt Engineering Fundamentals", skipped: true },
      { day: 16, title: "Chatbot Backend & API Integration", skipped: true },
      { day: 22, title: "Multi-Agent Orchestration", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 4 }
    ],
    signals: { commitDays: 9, missionsCompleted: 14, missionsFirstTry: 5 }
  },
  {
    member: {
      id: "CAND-012",
      name: "Chen Wei",
      email: "chen.wei@enterprise.ai",
      jobRole: "Mobile App Developer",
      yearsExperience: 7,
      education: "BS Computer Engineering",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 4 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 5 },
      { day: 9, title: "Building & Populating the Vector Database", passed: true, attempts: 4 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 4 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 18, title: "Streaming Responses", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 2 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 30, title: "Production Readiness & Final Testing", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 27, missionsCompleted: 30, missionsFirstTry: 14 }
  },
  {
    member: {
      id: "CAND-013",
      name: "Ravi Patel",
      email: "ravi.patel@enterprise.ai",
      jobRole: "Software Engineer",
      yearsExperience: 15,
      education: "MS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 3 },
      { day: 4, title: "Reading & Processing Structured Data", passed: true, attempts: 2 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 3 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 2 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 3 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 2 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 2 },
      { day: 27, title: "Security, Privacy & Guardrails", passed: true, attempts: 1 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 27, missionsCompleted: 30, missionsFirstTry: 13 }
  },
  {
    member: {
      id: "CAND-014",
      name: "Bethany Cole",
      email: "bethany.cole@enterprise.ai",
      jobRole: "HR Manager",
      yearsExperience: 10,
      education: "BA Human Resources",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 4 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 5 },
      { day: 8, title: "Vector Databases Overview", skipped: true },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 5 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 4 },
      { day: 20, title: "Conversation Memory & Context Management", passed: true, attempts: 3 },
      { day: 22, title: "Multi-Agent Orchestration", skipped: true },
      { day: 27, title: "Security, Privacy & Guardrails", skipped: true },
      { day: 28, title: "Docker & Kubernetes Deployment", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 4 }
    ],
    signals: { commitDays: 17, missionsCompleted: 20, missionsFirstTry: 1 }
  },
  {
    member: {
      id: "CAND-015",
      name: "Noah Kim",
      email: "noah.kim@enterprise.ai",
      jobRole: "Principal Architect",
      yearsExperience: 20,
      education: "MS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 1 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 14, title: "Fine-Tuning: Concepts & When to Use It", skipped: true },
      { day: 15, title: "Fine-Tuning: Hands-On with LoRA & QLoRA", skipped: true },
      { day: 21, title: "LangChain Agents", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 1 },
      { day: 27, title: "Security, Privacy & Guardrails", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 29, missionsCompleted: 29, missionsFirstTry: 27 }
  },
  {
    member: {
      id: "CAND-016",
      name: "Isabella Rossi",
      email: "isabella.rossi@enterprise.ai",
      jobRole: "Software Engineer",
      yearsExperience: 5,
      education: "BS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 2 },
      { day: 7, title: "Embeddings Explained", passed: false, attempts: 4 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 3 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: false, attempts: 5 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 2 },
      { day: 22, title: "Multi-Agent Orchestration", passed: false, attempts: 4 },
      { day: 27, title: "Security, Privacy & Guardrails", skipped: true },
      { day: 28, title: "Docker & Kubernetes Deployment", skipped: true },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 19, missionsCompleted: 21, missionsFirstTry: 2 }
  },
  {
    member: {
      id: "CAND-017",
      name: "Tyler Brooks",
      email: "tyler.brooks@enterprise.ai",
      jobRole: "Junior Developer",
      yearsExperience: 0,
      education: "GED + Coding Bootcamp Certificate",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 3 },
      { day: 3, title: "First AI Project, React Frontend & GitHub", passed: true, attempts: 5 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 5 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 5 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 5 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 5 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 4 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 5 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 4 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 3 }
    ],
    signals: { commitDays: 30, missionsCompleted: 31, missionsFirstTry: 1 }
  },
  {
    member: {
      id: "CAND-018",
      name: "Diane Foster",
      email: "diane.foster@enterprise.ai",
      jobRole: "AI Engineer",
      yearsExperience: 4,
      education: "MS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 1 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 1 },
      { day: 10, title: "Retrieval & Matching Engine", passed: true, attempts: 1 },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 1 },
      { day: 13, title: "Function Calling & Structured Outputs", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
      { day: 23, title: "Model Context Protocol (MCP)", passed: true, attempts: 1 },
      { day: 27, title: "Security, Privacy & Guardrails", passed: true, attempts: 1 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 31, missionsCompleted: 31, missionsFirstTry: 31 }
  },
  {
    member: {
      id: "CAND-019",
      name: "Frank DeLuca",
      email: "frank.deluca@enterprise.ai",
      jobRole: "Legacy Systems Engineer",
      yearsExperience: 25,
      education: "BS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 2 },
      { day: 4, title: "Reading & Processing Structured Data", passed: true, attempts: 1 },
      { day: 7, title: "Embeddings Explained", passed: true, attempts: 4 },
      { day: 8, title: "Vector Databases Overview", passed: true, attempts: 3 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 17, title: "Chatbot Frontend Development", passed: true, attempts: 5 },
      { day: 19, title: "Response Formatting & Rich Outputs", passed: true, attempts: 4 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 3 },
      { day: 28, title: "Docker & Kubernetes Deployment", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 2 }
    ],
    signals: { commitDays: 26, missionsCompleted: 29, missionsFirstTry: 11 }
  },
  {
    member: {
      id: "CAND-020",
      name: "Priyanka Sharma",
      email: "priyanka.sharma@enterprise.ai",
      jobRole: "Software Engineer",
      yearsExperience: 5,
      education: "BS Computer Science",
      status: "COMPLETED"
    },
    missions: [
      { day: 1, title: "VS Code & Python Environment Setup", passed: true, attempts: 1 },
      { day: 3, title: "First AI Project, React Frontend & GitHub", passed: true, attempts: 1 },
      { day: 4, title: "Reading & Processing Structured Data", skipped: true },
      { day: 7, title: "Embeddings Explained", passed: false, attempts: 2 },
      { day: 8, title: "Vector Databases Overview", skipped: true },
      { day: 12, title: "Prompt Engineering Fundamentals", passed: true, attempts: 1 },
      { day: 16, title: "Chatbot Backend & API Integration", passed: true, attempts: 1 },
      { day: 22, title: "Multi-Agent Orchestration", passed: true, attempts: 1 },
      { day: 27, title: "Security, Privacy & Guardrails", passed: true, attempts: 1 },
      { day: 31, title: "Capstone Project & Final Demo", passed: true, attempts: 1 }
    ],
    signals: { commitDays: 24, missionsCompleted: 27, missionsFirstTry: 19 }
  }
];
