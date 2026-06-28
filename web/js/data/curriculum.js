export const WIZARD_STEPS = [
  'Define the Scenario',
  'Sketch the Architecture',
  'Justify Choices',
  'Call Out Tradeoffs',
  'Failure Modes & Mitigations',
  'Cost / Latency / Scale Considerations',
  'Teach It Back',
];

export const NODE_TYPES = ['Agent', 'Tool', 'Memory', 'HITL', 'Guardrail', 'Router'];

export const CAPSTONES = [
  {
    id: 'research-agent',
    name: 'Internal knowledge/research agent',
    description: 'GraphRAG + reflection + escalation paths',
    nodes: [
      { id: 'n1', type: 'Agent', label: 'Research Agent', x: 120, y: 80 },
      { id: 'n2', type: 'Tool', label: 'GraphRAG Retriever', x: 320, y: 80 },
      { id: 'n3', type: 'Memory', label: 'Session Memory', x: 120, y: 200 },
      { id: 'n4', type: 'HITL', label: 'Escalation Gate', x: 320, y: 200 },
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'retrieve' },
      { from: 'n1', to: 'n3', label: 'store' },
      { from: 'n1', to: 'n4', label: 'escalate' },
    ],
  },
  {
    id: 'dev-workflow',
    name: 'Multi-phase development workflow',
    description: 'Requirements → design → code → review with human gates',
    nodes: [
      { id: 'n1', type: 'Router', label: 'Workflow Router', x: 200, y: 60 },
      { id: 'n2', type: 'Agent', label: 'Requirements Agent', x: 80, y: 160 },
      { id: 'n3', type: 'Agent', label: 'Design Agent', x: 200, y: 160 },
      { id: 'n4', type: 'Agent', label: 'Code Agent', x: 320, y: 160 },
      { id: 'n5', type: 'HITL', label: 'Review Gate', x: 200, y: 260 },
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'phase 1' },
      { from: 'n1', to: 'n3', label: 'phase 2' },
      { from: 'n1', to: 'n4', label: 'phase 3' },
      { from: 'n4', to: 'n5', label: 'submit' },
    ],
  },
  {
    id: 'support-agent',
    name: 'Customer-facing support agent',
    description: 'Tool use, memory, and strong governance',
    nodes: [
      { id: 'n1', type: 'Agent', label: 'Support Agent', x: 200, y: 80 },
      { id: 'n2', type: 'Tool', label: 'CRM Lookup', x: 80, y: 180 },
      { id: 'n3', type: 'Memory', label: 'Customer History', x: 200, y: 180 },
      { id: 'n4', type: 'Guardrail', label: 'Policy Engine', x: 320, y: 180 },
      { id: 'n5', type: 'HITL', label: 'Refund Approval', x: 200, y: 280 },
    ],
    edges: [
      { from: 'n1', to: 'n2', label: 'lookup' },
      { from: 'n1', to: 'n3', label: 'recall' },
      { from: 'n1', to: 'n4', label: 'validate' },
      { from: 'n1', to: 'n5', label: 'approve' },
    ],
  },
];

export const TIMELINE = [
  { days: '1–2', focus: 'Modules 1–3', hours: '4–5' },
  { days: '3–4', focus: 'Modules 4–6', hours: '4–5' },
  { days: '5–6', focus: 'Modules 7–8', hours: '4–5' },
  { days: '7+', focus: 'Module 9 + Practice', hours: '3–5' },
];

export const RESOURCES = {
  written: [
    { title: 'LLM Powered Autonomous Agents', author: 'Lilian Weng' },
    { title: 'Patterns for Building LLM-based Systems & Products', author: 'Eugene Yan' },
    { title: 'Choosing the Right Multi-Agent Architecture', author: 'LangChain blog' },
    { title: 'LangGraph official documentation', author: 'LangChain' },
  ],
  podcasts: [
    { title: 'Max Agency', host: 'Harrison Chase', conceptBookmarks: [{ label: 'Production agents', time: '0:00' }] },
    { title: 'Latent Space: The AI Engineer Podcast', host: 'Swyx & Alessio', conceptBookmarks: [{ label: 'Agent infrastructure', time: '0:00' }] },
    { title: 'The TWIML AI Podcast', host: 'Sam Charrington', conceptBookmarks: [{ label: 'Research to production', time: '0:00' }] },
  ],
};

export const MODULES = [
  {
    id: 1,
    title: 'Foundations — Agent Mental Model & Production Mindset',
    objectives: [
      'Internalize what distinguishes agents from workflows or chatbots.',
      'Build the core mental model (LLM + tools + planning + memory + reflection + loop).',
      'Understand the production mindset and key enterprise constraints from day one.',
    ],
    lingo: ['Agent spectrum', 'ReAct loop', 'Tools/function calling', 'Plan-and-Execute', 'Reflection/critic'],
    practice: [
      'Draw and verbally explain the ReAct loop + where reflection fits.',
      'Identify one simple workflow from a representative enterprise context.',
      'Write down 3–4 production constraints for any enterprise agent system.',
    ],
    simulator: 'react',
    checkpoints: [
      {
        question: 'Why is pure autonomy rarely desirable in enterprise settings?',
        keywords: ['governance', 'audit', 'compliance', 'risk', 'oversight', 'human', 'control', 'liability'],
        explanation: 'Enterprise systems require governance, auditability, human oversight, and risk management that pure autonomy undermines.',
      },
      {
        question: 'How does reflection change the reliability profile of a ReAct agent?',
        keywords: ['quality', 'latency', 'critic', 'error', 'correct', 'reliability', 'cost', 'review'],
        explanation: 'Reflection adds a critic pass that catches errors and improves output quality, at the cost of added latency and tokens.',
      },
    ],
  },
  {
    id: 2,
    title: 'Core Agent Design Patterns',
    objectives: [
      'Master recurring patterns that improve quality and control.',
      'Understand when and why to apply each pattern.',
    ],
    lingo: ['Reflection', 'Plan-and-Execute', 'Tree-of-Thoughts', 'Skills/Personas', 'Routing'],
    practice: [
      'Sketch a research task using ReAct + reflection.',
      'List tradeoffs: quality gain vs. latency/cost/tokens.',
      'Map one pattern to a governed multi-agent workflow step.',
    ],
    simulator: 'react',
    checkpoints: [
      {
        question: 'When would you prefer a single agent with skills over multiple specialized agents?',
        keywords: ['simple', 'latency', 'context', 'overhead', 'coordination', 'cost', 'shared'],
        explanation: 'A single agent with skills reduces coordination overhead and latency when tasks share context and do not need isolation.',
      },
      {
        question: 'How does reflection interact with guardrails?',
        keywords: ['complement', 'quality', 'policy', 'enforce', 'critic', 'output', 'filter'],
        explanation: 'Reflection improves output quality iteratively; guardrails enforce hard policy boundaries. They complement each other.',
      },
    ],
  },
  {
    id: 3,
    title: 'Multi-Agent Architectures & Orchestration',
    objectives: [
      'Understand main multi-agent patterns and their tradeoffs.',
      'Develop intuition for when to introduce multiple agents.',
    ],
    lingo: ['Supervisor', 'Router', 'Handoffs', 'Hierarchical', 'Context isolation'],
    practice: [
      'Sketch the same use case in two different multi-agent patterns.',
      'Call out tradeoffs for each pattern.',
      'Identify which pattern fits governed internal development automation.',
    ],
    simulator: 'topology',
    checkpoints: [
      {
        question: 'What problem does a supervisor pattern solve that a single agent with good routing cannot?',
        keywords: ['specializ', 'isolat', 'modular', 'ownership', 'context', 'delegat', 'worker'],
        explanation: 'Supervisor patterns provide context isolation, specialized workers, and modular team ownership that a single router cannot.',
      },
      {
        question: 'How does state management complexity change across these patterns?',
        keywords: ['handoff', 'shared', 'checkpoint', 'overhead', 'isolation', 'sync', 'state'],
        explanation: 'Handoffs and parallel patterns increase state synchronization overhead; supervisor patterns centralize state but add delegation complexity.',
      },
    ],
  },
  {
    id: 4,
    title: 'Frameworks — LangGraph Focus & Comparisons',
    objectives: [
      'Understand why stateful graph frameworks dominate production.',
      'Compare frameworks at architecture discussion level.',
    ],
    lingo: ['StateGraph', 'Checkpointers', 'Interrupts', 'HITL', 'Streaming'],
    practice: [
      'Map a sketch onto a LangGraph-style graph with persistence and interrupt points.',
      'Articulate LangGraph advantages for governed enterprise systems.',
    ],
    simulator: 'langgraph',
    checkpoints: [
      {
        question: 'Why is persistence/checkpointing often non-negotiable in enterprise agent systems?',
        keywords: ['durab', 'resume', 'audit', 'long', 'failure', 'recover', 'govern'],
        explanation: 'Enterprise workflows are long-running and must survive failures, support audit trails, and resume from known states.',
      },
      {
        question: 'What are the main reasons teams choose LangGraph over simpler multi-agent frameworks?',
        keywords: ['control', 'state', 'interrupt', 'observ', 'durab', 'graph', 'conditional'],
        explanation: 'LangGraph offers explicit state graphs, conditional routing, persistence, HITL interrupts, and observability hooks.',
      },
    ],
  },
  {
    id: 5,
    title: 'Grounding with RAG & Enterprise Knowledge',
    objectives: [
      'Understand how agents incorporate external and enterprise data.',
      'Connect retrieval quality to system reliability.',
    ],
    lingo: ['Hybrid search', 'GraphRAG', 'Query rewriting', 'Agentic retrieval'],
    practice: [
      'Sketch an agent system using GraphRAG for a knowledge-intensive task.',
      'Identify where retrieval failures cascade and how to mitigate.',
    ],
    simulator: 'rag',
    checkpoints: [
      {
        question: 'How does GraphRAG change the failure modes compared to standard vector RAG?',
        keywords: ['relation', 'graph', 'entity', 'connect', 'complex', 'structure', 'hop'],
        explanation: 'GraphRAG handles relational queries better but introduces graph construction errors and multi-hop failure cascades.',
      },
      {
        question: 'Where in the agent loop should retrieval quality be evaluated?',
        keywords: ['before', 'after', 'retrieve', 'generate', 'critique', 'ground', 'downstream'],
        explanation: 'Evaluate retrieval immediately after the retrieve step and before generation, with downstream groundedness checks.',
      },
    ],
  },
  {
    id: 6,
    title: 'State, Memory & Long-Running Workflows',
    objectives: [
      'Appreciate why state and memory are first-class production concerns.',
      'Understand how they enable governance and long-horizon work.',
    ],
    lingo: ['Checkpointing', 'Durable execution', 'Episodic memory', 'Long-horizon'],
    practice: [
      'Design a multi-phase workflow with explicit state and checkpoint points.',
      'Explain how persistence supports reliability and governance.',
    ],
    simulator: 'timeline',
    checkpoints: [
      {
        question: 'What enterprise problems become solvable once you have durable state and checkpointing?',
        keywords: ['long', 'audit', 'resume', 'multi', 'phase', 'compliance', 'recover'],
        explanation: 'Multi-day workflows, compliance audits, crash recovery, and governed multi-phase processes become reliable.',
      },
      {
        question: 'How does memory design affect eval and debugging difficulty?',
        keywords: ['trace', 'reproduc', 'context', 'debug', 'state', 'history', 'observ'],
        explanation: 'Rich memory improves capability but increases debugging surface; structured memory with traces aids reproducibility.',
      },
    ],
  },
  {
    id: 7,
    title: 'Production Observability, Evals, Reliability & Optimization',
    objectives: [
      'Design measurable, debuggable, cost-aware agent systems.',
      'Handle cost, latency, and failure at scale.',
    ],
    lingo: ['Tracing', 'Spans', 'Faithfulness', 'Circuit breakers', 'Model routing'],
    practice: [
      'Design observability + evaluation strategy for a sketched system.',
      'List top 5 failure modes for a multi-agent workflow with mitigations.',
      'Add cost and latency considerations to an architecture sketch.',
    ],
    simulator: 'trace',
    checkpoints: [
      {
        question: 'How do you evaluate the performance of an entire multi-agent workflow rather than individual agents?',
        keywords: ['end', 'workflow', 'trace', 'outcome', 'integration', 'span', 'holistic'],
        explanation: 'Use end-to-end workflow traces, outcome metrics, and integration spans rather than per-agent accuracy alone.',
      },
      {
        question: 'What observability signals are most valuable for debugging long-running stateful agents?',
        keywords: ['state', 'transition', 'checkpoint', 'span', 'tool', 'decision', 'trace'],
        explanation: 'State transitions, checkpoint history, tool call spans, and decision points in distributed traces.',
      },
    ],
  },
  {
    id: 8,
    title: 'Governance, Guardrails, Safety & Enterprise Realities',
    objectives: [
      'Embed governance and safety as architectural concerns.',
      'Understand organizational and compliance dimensions.',
    ],
    lingo: ['Guardrails', 'HITL', 'Audit logs', 'RBAC', 'Prompt injection'],
    practice: [
      'Add guardrails and HITL decision points to an architecture sketch.',
      'Discuss reflection vs. stricter guardrails tradeoff.',
      'Consider organizational ownership and safe rollout.',
    ],
    simulator: 'hitl',
    checkpoints: [
      {
        question: 'Where are the highest-leverage places to insert HITL in a multi-agent system?',
        keywords: ['high', 'risk', 'external', 'action', 'deploy', 'approve', 'gate', 'tool'],
        explanation: 'Before irreversible external actions, deployments, financial transactions, and policy-sensitive tool calls.',
      },
      {
        question: 'How does good observability support governance and compliance requirements?',
        keywords: ['audit', 'trace', 'log', 'lineage', 'compliance', 'record', 'account'],
        explanation: 'Traces and audit logs provide accountability, data lineage, and evidence for compliance reviews.',
      },
    ],
  },
  {
    id: 9,
    title: 'Integration, Deployment, Scaling & 2026 Context',
    objectives: [
      'Understand integration into enterprise platforms at scale.',
      'Gain awareness of 2026-era developments.',
    ],
    lingo: ['MCP', 'CI/CD', 'Agent clouds', 'Event-driven', 'Sandboxes'],
    practice: [
      'Produce a deployment + integration view for a governed multi-agent system.',
      'Note where MCP and emerging standards simplify or complicate design.',
    ],
    simulator: 'integration',
    checkpoints: [
      {
        question: 'What changes when you move from prototype to enterprise integration?',
        keywords: ['identity', 'auth', 'audit', 'sso', 'data', 'compliance', 'govern'],
        explanation: 'Identity/auth integration, audit systems, data governance, and compliance requirements become mandatory.',
      },
      {
        question: 'How might 2026-era agent clouds or standards change your architectural choices?',
        keywords: ['mcp', 'standard', 'harness', 'interop', 'tool', 'platform', 'cloud'],
        explanation: 'MCP and agent clouds may standardize tool integration and hosting, reducing custom glue but adding platform dependency.',
      },
    ],
  },
];