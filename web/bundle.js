(() => {
  // web/js/data/curriculum.js
  var WIZARD_STEPS = [
    "Define the Scenario",
    "Sketch the Architecture",
    "Justify Choices",
    "Call Out Tradeoffs",
    "Failure Modes & Mitigations",
    "Cost / Latency / Scale Considerations",
    "Teach It Back"
  ];
  var NODE_TYPES = ["Agent", "Tool", "Memory", "HITL", "Guardrail", "Router"];
  var CAPSTONES = [
    {
      id: "research-agent",
      name: "Internal knowledge/research agent",
      description: "GraphRAG + reflection + escalation paths",
      nodes: [
        { id: "n1", type: "Agent", label: "Research Agent", x: 120, y: 80 },
        { id: "n2", type: "Tool", label: "GraphRAG Retriever", x: 320, y: 80 },
        { id: "n3", type: "Memory", label: "Session Memory", x: 120, y: 200 },
        { id: "n4", type: "HITL", label: "Escalation Gate", x: 320, y: 200 }
      ],
      edges: [
        { from: "n1", to: "n2", label: "retrieve" },
        { from: "n1", to: "n3", label: "store" },
        { from: "n1", to: "n4", label: "escalate" }
      ]
    },
    {
      id: "dev-workflow",
      name: "Multi-phase development workflow",
      description: "Requirements \u2192 design \u2192 code \u2192 review with human gates",
      nodes: [
        { id: "n1", type: "Router", label: "Workflow Router", x: 200, y: 60 },
        { id: "n2", type: "Agent", label: "Requirements Agent", x: 80, y: 160 },
        { id: "n3", type: "Agent", label: "Design Agent", x: 200, y: 160 },
        { id: "n4", type: "Agent", label: "Code Agent", x: 320, y: 160 },
        { id: "n5", type: "HITL", label: "Review Gate", x: 200, y: 260 }
      ],
      edges: [
        { from: "n1", to: "n2", label: "phase 1" },
        { from: "n1", to: "n3", label: "phase 2" },
        { from: "n1", to: "n4", label: "phase 3" },
        { from: "n4", to: "n5", label: "submit" }
      ]
    },
    {
      id: "support-agent",
      name: "Customer-facing support agent",
      description: "Tool use, memory, and strong governance",
      nodes: [
        { id: "n1", type: "Agent", label: "Support Agent", x: 200, y: 80 },
        { id: "n2", type: "Tool", label: "CRM Lookup", x: 80, y: 180 },
        { id: "n3", type: "Memory", label: "Customer History", x: 200, y: 180 },
        { id: "n4", type: "Guardrail", label: "Policy Engine", x: 320, y: 180 },
        { id: "n5", type: "HITL", label: "Refund Approval", x: 200, y: 280 }
      ],
      edges: [
        { from: "n1", to: "n2", label: "lookup" },
        { from: "n1", to: "n3", label: "recall" },
        { from: "n1", to: "n4", label: "validate" },
        { from: "n1", to: "n5", label: "approve" }
      ]
    }
  ];
  var TIMELINE = [
    { days: "1\u20132", focus: "Modules 1\u20133", hours: "4\u20135" },
    { days: "3\u20134", focus: "Modules 4\u20136", hours: "4\u20135" },
    { days: "5\u20136", focus: "Modules 7\u20138", hours: "4\u20135" },
    { days: "7+", focus: "Module 9 + Practice", hours: "3\u20135" }
  ];
  var RESOURCES = {
    written: [
      { title: "LLM Powered Autonomous Agents", author: "Lilian Weng" },
      { title: "Patterns for Building LLM-based Systems & Products", author: "Eugene Yan" },
      { title: "Choosing the Right Multi-Agent Architecture", author: "LangChain blog" },
      { title: "LangGraph official documentation", author: "LangChain" }
    ],
    podcasts: [
      { title: "Max Agency", host: "Harrison Chase", conceptBookmarks: [{ label: "Production agents", time: "0:00" }] },
      { title: "Latent Space: The AI Engineer Podcast", host: "Swyx & Alessio", conceptBookmarks: [{ label: "Agent infrastructure", time: "0:00" }] },
      { title: "The TWIML AI Podcast", host: "Sam Charrington", conceptBookmarks: [{ label: "Research to production", time: "0:00" }] }
    ]
  };
  var MODULES = [
    {
      id: 1,
      title: "Foundations \u2014 Agent Mental Model & Production Mindset",
      objectives: [
        "Internalize what distinguishes agents from workflows or chatbots.",
        "Build the core mental model (LLM + tools + planning + memory + reflection + loop).",
        "Understand the production mindset and key enterprise constraints from day one."
      ],
      lingo: ["Agent spectrum", "ReAct loop", "Tools/function calling", "Plan-and-Execute", "Reflection/critic"],
      practice: [
        "Draw and verbally explain the ReAct loop + where reflection fits.",
        "Identify one simple workflow from a representative enterprise context.",
        "Write down 3\u20134 production constraints for any enterprise agent system."
      ],
      simulator: "react",
      checkpoints: [
        {
          question: "Why is pure autonomy rarely desirable in enterprise settings?",
          keywords: ["governance", "audit", "compliance", "risk", "oversight", "human", "control", "liability"],
          explanation: "Enterprise systems require governance, auditability, human oversight, and risk management that pure autonomy undermines."
        },
        {
          question: "How does reflection change the reliability profile of a ReAct agent?",
          keywords: ["quality", "latency", "critic", "error", "correct", "reliability", "cost", "review"],
          explanation: "Reflection adds a critic pass that catches errors and improves output quality, at the cost of added latency and tokens."
        }
      ]
    },
    {
      id: 2,
      title: "Core Agent Design Patterns",
      objectives: [
        "Master recurring patterns that improve quality and control.",
        "Understand when and why to apply each pattern."
      ],
      lingo: ["Reflection", "Plan-and-Execute", "Tree-of-Thoughts", "Skills/Personas", "Routing"],
      practice: [
        "Sketch a research task using ReAct + reflection.",
        "List tradeoffs: quality gain vs. latency/cost/tokens.",
        "Map one pattern to a governed multi-agent workflow step."
      ],
      simulator: "react",
      checkpoints: [
        {
          question: "When would you prefer a single agent with skills over multiple specialized agents?",
          keywords: ["simple", "latency", "context", "overhead", "coordination", "cost", "shared"],
          explanation: "A single agent with skills reduces coordination overhead and latency when tasks share context and do not need isolation."
        },
        {
          question: "How does reflection interact with guardrails?",
          keywords: ["complement", "quality", "policy", "enforce", "critic", "output", "filter"],
          explanation: "Reflection improves output quality iteratively; guardrails enforce hard policy boundaries. They complement each other."
        }
      ]
    },
    {
      id: 3,
      title: "Multi-Agent Architectures & Orchestration",
      objectives: [
        "Understand main multi-agent patterns and their tradeoffs.",
        "Develop intuition for when to introduce multiple agents."
      ],
      lingo: ["Supervisor", "Router", "Handoffs", "Hierarchical", "Context isolation"],
      practice: [
        "Sketch the same use case in two different multi-agent patterns.",
        "Call out tradeoffs for each pattern.",
        "Identify which pattern fits governed internal development automation."
      ],
      simulator: "topology",
      checkpoints: [
        {
          question: "What problem does a supervisor pattern solve that a single agent with good routing cannot?",
          keywords: ["specializ", "isolat", "modular", "ownership", "context", "delegat", "worker"],
          explanation: "Supervisor patterns provide context isolation, specialized workers, and modular team ownership that a single router cannot."
        },
        {
          question: "How does state management complexity change across these patterns?",
          keywords: ["handoff", "shared", "checkpoint", "overhead", "isolation", "sync", "state"],
          explanation: "Handoffs and parallel patterns increase state synchronization overhead; supervisor patterns centralize state but add delegation complexity."
        }
      ]
    },
    {
      id: 4,
      title: "Frameworks \u2014 LangGraph Focus & Comparisons",
      objectives: [
        "Understand why stateful graph frameworks dominate production.",
        "Compare frameworks at architecture discussion level."
      ],
      lingo: ["StateGraph", "Checkpointers", "Interrupts", "HITL", "Streaming"],
      practice: [
        "Map a sketch onto a LangGraph-style graph with persistence and interrupt points.",
        "Articulate LangGraph advantages for governed enterprise systems."
      ],
      simulator: "langgraph",
      checkpoints: [
        {
          question: "Why is persistence/checkpointing often non-negotiable in enterprise agent systems?",
          keywords: ["durab", "resume", "audit", "long", "failure", "recover", "govern"],
          explanation: "Enterprise workflows are long-running and must survive failures, support audit trails, and resume from known states."
        },
        {
          question: "What are the main reasons teams choose LangGraph over simpler multi-agent frameworks?",
          keywords: ["control", "state", "interrupt", "observ", "durab", "graph", "conditional"],
          explanation: "LangGraph offers explicit state graphs, conditional routing, persistence, HITL interrupts, and observability hooks."
        }
      ]
    },
    {
      id: 5,
      title: "Grounding with RAG & Enterprise Knowledge",
      objectives: [
        "Understand how agents incorporate external and enterprise data.",
        "Connect retrieval quality to system reliability."
      ],
      lingo: ["Hybrid search", "GraphRAG", "Query rewriting", "Agentic retrieval"],
      practice: [
        "Sketch an agent system using GraphRAG for a knowledge-intensive task.",
        "Identify where retrieval failures cascade and how to mitigate."
      ],
      simulator: "rag",
      checkpoints: [
        {
          question: "How does GraphRAG change the failure modes compared to standard vector RAG?",
          keywords: ["relation", "graph", "entity", "connect", "complex", "structure", "hop"],
          explanation: "GraphRAG handles relational queries better but introduces graph construction errors and multi-hop failure cascades."
        },
        {
          question: "Where in the agent loop should retrieval quality be evaluated?",
          keywords: ["before", "after", "retrieve", "generate", "critique", "ground", "downstream"],
          explanation: "Evaluate retrieval immediately after the retrieve step and before generation, with downstream groundedness checks."
        }
      ]
    },
    {
      id: 6,
      title: "State, Memory & Long-Running Workflows",
      objectives: [
        "Appreciate why state and memory are first-class production concerns.",
        "Understand how they enable governance and long-horizon work."
      ],
      lingo: ["Checkpointing", "Durable execution", "Episodic memory", "Long-horizon"],
      practice: [
        "Design a multi-phase workflow with explicit state and checkpoint points.",
        "Explain how persistence supports reliability and governance."
      ],
      simulator: "timeline",
      checkpoints: [
        {
          question: "What enterprise problems become solvable once you have durable state and checkpointing?",
          keywords: ["long", "audit", "resume", "multi", "phase", "compliance", "recover"],
          explanation: "Multi-day workflows, compliance audits, crash recovery, and governed multi-phase processes become reliable."
        },
        {
          question: "How does memory design affect eval and debugging difficulty?",
          keywords: ["trace", "reproduc", "context", "debug", "state", "history", "observ"],
          explanation: "Rich memory improves capability but increases debugging surface; structured memory with traces aids reproducibility."
        }
      ]
    },
    {
      id: 7,
      title: "Production Observability, Evals, Reliability & Optimization",
      objectives: [
        "Design measurable, debuggable, cost-aware agent systems.",
        "Handle cost, latency, and failure at scale."
      ],
      lingo: ["Tracing", "Spans", "Faithfulness", "Circuit breakers", "Model routing"],
      practice: [
        "Design observability + evaluation strategy for a sketched system.",
        "List top 5 failure modes for a multi-agent workflow with mitigations.",
        "Add cost and latency considerations to an architecture sketch."
      ],
      simulator: "trace",
      checkpoints: [
        {
          question: "How do you evaluate the performance of an entire multi-agent workflow rather than individual agents?",
          keywords: ["end", "workflow", "trace", "outcome", "integration", "span", "holistic"],
          explanation: "Use end-to-end workflow traces, outcome metrics, and integration spans rather than per-agent accuracy alone."
        },
        {
          question: "What observability signals are most valuable for debugging long-running stateful agents?",
          keywords: ["state", "transition", "checkpoint", "span", "tool", "decision", "trace"],
          explanation: "State transitions, checkpoint history, tool call spans, and decision points in distributed traces."
        }
      ]
    },
    {
      id: 8,
      title: "Governance, Guardrails, Safety & Enterprise Realities",
      objectives: [
        "Embed governance and safety as architectural concerns.",
        "Understand organizational and compliance dimensions."
      ],
      lingo: ["Guardrails", "HITL", "Audit logs", "RBAC", "Prompt injection"],
      practice: [
        "Add guardrails and HITL decision points to an architecture sketch.",
        "Discuss reflection vs. stricter guardrails tradeoff.",
        "Consider organizational ownership and safe rollout."
      ],
      simulator: "hitl",
      checkpoints: [
        {
          question: "Where are the highest-leverage places to insert HITL in a multi-agent system?",
          keywords: ["high", "risk", "external", "action", "deploy", "approve", "gate", "tool"],
          explanation: "Before irreversible external actions, deployments, financial transactions, and policy-sensitive tool calls."
        },
        {
          question: "How does good observability support governance and compliance requirements?",
          keywords: ["audit", "trace", "log", "lineage", "compliance", "record", "account"],
          explanation: "Traces and audit logs provide accountability, data lineage, and evidence for compliance reviews."
        }
      ]
    },
    {
      id: 9,
      title: "Integration, Deployment, Scaling & 2026 Context",
      objectives: [
        "Understand integration into enterprise platforms at scale.",
        "Gain awareness of 2026-era developments."
      ],
      lingo: ["MCP", "CI/CD", "Agent clouds", "Event-driven", "Sandboxes"],
      practice: [
        "Produce a deployment + integration view for a governed multi-agent system.",
        "Note where MCP and emerging standards simplify or complicate design."
      ],
      simulator: "integration",
      checkpoints: [
        {
          question: "What changes when you move from prototype to enterprise integration?",
          keywords: ["identity", "auth", "audit", "sso", "data", "compliance", "govern"],
          explanation: "Identity/auth integration, audit systems, data governance, and compliance requirements become mandatory."
        },
        {
          question: "How might 2026-era agent clouds or standards change your architectural choices?",
          keywords: ["mcp", "standard", "harness", "interop", "tool", "platform", "cloud"],
          explanation: "MCP and agent clouds may standardize tool integration and hosting, reducing custom glue but adding platform dependency."
        }
      ]
    }
  ];

  // web/js/core/react-simulator.js
  var REACT_SCENARIO = [
    {
      phase: "thought",
      thought: "I need to find the latest compliance policy for data retention.",
      action: null,
      observation: null
    },
    {
      phase: "action",
      thought: "I need to find the latest compliance policy for data retention.",
      action: 'search_knowledge_base(query="data retention policy")',
      observation: null
    },
    {
      phase: "observation",
      thought: "I need to find the latest compliance policy for data retention.",
      action: 'search_knowledge_base(query="data retention policy")',
      observation: "Found 3 documents: Policy v2.1 (2025), GDPR Addendum, Internal Audit Guide."
    },
    {
      phase: "thought",
      thought: "The policy requires 7-year retention for financial records. I can now answer.",
      action: null,
      observation: "Found 3 documents: Policy v2.1 (2025), GDPR Addendum, Internal Audit Guide."
    },
    {
      phase: "action",
      thought: "The policy requires 7-year retention for financial records. I can now answer.",
      action: 'respond(answer="Financial records must be retained for 7 years per Policy v2.1.")',
      observation: null
    },
    {
      phase: "observation",
      thought: "The policy requires 7-year retention for financial records. I can now answer.",
      action: 'respond(answer="Financial records must be retained for 7 years per Policy v2.1.")',
      observation: "Response delivered to user."
    }
  ];
  var REFLECTION_ADDENDUM = {
    phase: "reflection",
    thought: "Critic: Verify the answer cites the correct policy version and mentions exceptions.",
    action: 'revise_response(add_caveat="Exceptions apply for litigation holds.")',
    observation: "Revised response with governance caveat appended."
  };
  function createReactState(reflectionEnabled = false) {
    return {
      stepIndex: 0,
      reflectionEnabled,
      reflectionApplied: false,
      complete: false,
      steps: []
    };
  }
  function reactStep(currentState, action = "advance") {
    if (action === "reset") {
      return {
        state: createReactState(currentState.reflectionEnabled),
        entry: null,
        display: "Simulation reset.",
        metrics: null
      };
    }
    const state2 = {
      stepIndex: currentState.stepIndex,
      reflectionEnabled: currentState.reflectionEnabled,
      reflectionApplied: currentState.reflectionApplied,
      complete: currentState.complete,
      steps: [...currentState.steps]
    };
    const steps = [...REACT_SCENARIO];
    if (state2.stepIndex >= steps.length) {
      if (state2.reflectionEnabled && !state2.reflectionApplied) {
        const entry2 = formatReactEntry(REFLECTION_ADDENDUM);
        const newState2 = {
          ...state2,
          reflectionApplied: true,
          steps: [...state2.steps, entry2],
          complete: true
        };
        return {
          state: newState2,
          entry: entry2,
          display: entry2.text,
          metrics: { latency: 1.4, cost: 0.08, quality: 0.92 }
        };
      }
      return { state: { ...state2, complete: true }, entry: null, display: "Simulation complete.", metrics: null };
    }
    const raw = steps[state2.stepIndex];
    const entry = formatReactEntry(raw);
    const newState = {
      ...state2,
      stepIndex: state2.stepIndex + 1,
      steps: [...state2.steps, entry],
      complete: state2.stepIndex + 1 >= steps.length && (!state2.reflectionEnabled || state2.reflectionApplied)
    };
    const metrics = {
      latency: 0.3 + state2.stepIndex * 0.15,
      cost: 0.02 + state2.stepIndex * 0.01,
      quality: state2.reflectionEnabled ? 0.85 + state2.stepIndex * 0.02 : 0.7 + state2.stepIndex * 0.03
    };
    return { state: newState, entry, display: entry.text, metrics };
  }
  function toggleReflection(state2, enabled) {
    return { ...state2, reflectionEnabled: enabled, reflectionApplied: false, stepIndex: 0, steps: [], complete: false };
  }
  function formatReactEntry(raw) {
    const parts = [];
    if (raw.thought) parts.push(`Thought: ${raw.thought}`);
    if (raw.action) parts.push(`Action: ${raw.action}`);
    if (raw.observation) parts.push(`Observation: ${raw.observation}`);
    if (raw.phase === "reflection") {
      parts.push(`Reflection: ${raw.thought}`);
      if (raw.action) parts.push(`Action: ${raw.action}`);
      if (raw.observation) parts.push(`Observation: ${raw.observation}`);
    }
    return { phase: raw.phase, text: parts.join("\n"), parts };
  }

  // web/js/core/topology-simulator.js
  var TOPOLOGIES = {
    supervisor: {
      name: "Supervisor / Orchestrator-Worker",
      nodes: [
        { id: "sup", label: "Supervisor", role: "orchestrator" },
        { id: "w1", label: "Research Worker", role: "worker" },
        { id: "w2", label: "Code Worker", role: "worker" },
        { id: "w3", label: "Review Worker", role: "worker" }
      ],
      edges: [
        { from: "sup", to: "w1", parallel: false },
        { from: "sup", to: "w2", parallel: false },
        { from: "sup", to: "w3", parallel: false }
      ],
      flow: ["Supervisor receives task", "Delegates to specialized worker", "Worker returns result", "Supervisor synthesizes"],
      tradeoffs: {
        complexity: "medium",
        latency: "sequential \u2014 higher",
        isolation: "high \u2014 workers are isolated",
        coordination: "centralized \u2014 easy to govern"
      }
    },
    router: {
      name: "Router + Parallel Dispatch",
      nodes: [
        { id: "router", label: "Router", role: "router" },
        { id: "a1", label: "Agent A", role: "agent" },
        { id: "a2", label: "Agent B", role: "agent" },
        { id: "syn", label: "Synthesizer", role: "synthesizer" }
      ],
      edges: [
        { from: "router", to: "a1", parallel: true },
        { from: "router", to: "a2", parallel: true },
        { from: "a1", to: "syn", parallel: false },
        { from: "a2", to: "syn", parallel: false }
      ],
      flow: ["Router classifies intent", "Parallel dispatch to agents", "Synthesizer merges results"],
      tradeoffs: {
        complexity: "medium-high",
        latency: "parallel \u2014 lower",
        isolation: "medium \u2014 shared router context",
        coordination: "decentralized synthesis step"
      }
    },
    handoffs: {
      name: "State-driven Handoffs",
      nodes: [
        { id: "req", label: "Requirements Agent", role: "agent" },
        { id: "des", label: "Design Agent", role: "agent" },
        { id: "cod", label: "Code Agent", role: "agent" },
        { id: "rev", label: "Review Agent", role: "agent" }
      ],
      edges: [
        { from: "req", to: "des", parallel: false },
        { from: "des", to: "cod", parallel: false },
        { from: "cod", to: "rev", parallel: false }
      ],
      flow: ["Agent completes phase", "State handoff to next agent", "Next agent resumes with context"],
      tradeoffs: {
        complexity: "high \u2014 state handoff management",
        latency: "sequential \u2014 phase-gated",
        isolation: "high per phase",
        coordination: "state synchronization required"
      }
    },
    skills: {
      name: "Single Agent with Skills",
      nodes: [{ id: "agent", label: "Unified Agent", role: "agent" }],
      skills: ["research_skill", "code_skill", "review_skill"],
      edges: [],
      flow: ["Agent selects skill dynamically", "Executes within shared context", "No inter-agent handoff"],
      tradeoffs: {
        complexity: "low",
        latency: "lowest \u2014 no delegation overhead",
        isolation: "low \u2014 shared context window",
        coordination: "none \u2014 simplest to operate"
      }
    }
  };
  function switchTopology(mode) {
    const topology = TOPOLOGIES[mode];
    if (!topology) throw new Error(`Unknown topology: ${mode}`);
    return {
      mode,
      topology,
      tradeoffPanel: formatTradeoffPanel(topology.tradeoffs),
      viz: {
        nodes: topology.nodes,
        edges: topology.edges || [],
        skills: topology.skills || [],
        flow: topology.flow
      }
    };
  }
  function getTopologyModes() {
    return Object.keys(TOPOLOGIES);
  }
  function formatTradeoffPanel(tradeoffs) {
    return Object.entries(tradeoffs).map(([key, value]) => `${key}: ${value}`).join("\n");
  }

  // web/js/core/langgraph-simulator.js
  function getLangGraphView() {
    return {
      nodes: [
        { id: "start", label: "START", type: "entry" },
        { id: "plan", label: "Plan", type: "node" },
        { id: "execute", label: "Execute Tools", type: "node" },
        { id: "hitl", label: "HITL Interrupt", type: "interrupt", highlight: true },
        { id: "checkpoint", label: "Checkpoint", type: "persistence", highlight: true },
        { id: "reflect", label: "Reflect", type: "node" },
        { id: "end", label: "END", type: "exit" }
      ],
      edges: [
        { from: "start", to: "plan", conditional: false },
        { from: "plan", to: "execute", conditional: true, label: "tools needed" },
        { from: "execute", to: "checkpoint", conditional: false },
        { from: "checkpoint", to: "hitl", conditional: true, label: "high risk" },
        { from: "hitl", to: "reflect", conditional: false },
        { from: "reflect", to: "end", conditional: true, label: "done" }
      ],
      highlights: {
        persistence: ["checkpoint"],
        interrupts: ["hitl"]
      },
      description: "Stateful graph with conditional routing. Checkpoint node persists state; HITL interrupt pauses for human approval before continuing."
    };
  }
  function stepLangGraph(state2) {
    const view = getLangGraphView();
    const order = ["start", "plan", "execute", "checkpoint", "hitl", "reflect", "end"];
    const idx = state2.stepIndex ?? 0;
    if (idx >= order.length) {
      return { state: { ...state2, complete: true }, activeNode: "end", message: "Graph execution complete." };
    }
    const activeNode = order[idx];
    const node = view.nodes.find((n) => n.id === activeNode);
    return {
      state: { stepIndex: idx + 1, complete: idx + 1 >= order.length },
      activeNode,
      message: `Executing node: ${node.label}${node.highlight ? " [highlighted]" : ""}`,
      isPersistence: node.type === "persistence",
      isInterrupt: node.type === "interrupt"
    };
  }

  // web/js/core/rag-simulator.js
  function simulateRagCascade(mode, failurePoint = null) {
    const vectorPath = [
      { step: "query", status: "ok", detail: "User query embedded" },
      { step: "vector_search", status: failurePoint === "vector_search" ? "fail" : "ok", detail: "Top-5 chunks retrieved" },
      { step: "generate", status: failurePoint === "vector_search" ? "cascade" : "ok", detail: "LLM generates answer from chunks" },
      { step: "downstream", status: failurePoint === "vector_search" ? "cascade" : "ok", detail: "Agent acts on potentially wrong context" }
    ];
    const graphPath = [
      { step: "query", status: "ok", detail: "Entity extraction from query" },
      { step: "graph_traverse", status: failurePoint === "graph_traverse" ? "fail" : "ok", detail: "Multi-hop graph traversal" },
      { step: "subgraph_build", status: failurePoint === "graph_traverse" ? "cascade" : "ok", detail: "Relevant subgraph assembled" },
      { step: "generate", status: failurePoint === "subgraph_build" ? "fail" : "ok", detail: "LLM generates from structured context" },
      { step: "downstream", status: "cascade", detail: "Relational errors propagate to tool calls" }
    ];
    const path = mode === "graphrag" ? graphPath : vectorPath;
    const failures = path.filter((p) => p.status === "fail" || p.status === "cascade");
    return {
      mode,
      path,
      failureCount: failures.length,
      summary: mode === "graphrag" ? "GraphRAG handles relational queries but multi-hop failures cascade through subgraph and generation." : "Vector RAG fails silently on wrong chunks; downstream agent acts on ungrounded context."
    };
  }
  function getRagModes() {
    return ["vector", "graphrag"];
  }

  // web/js/core/checkpoint-timeline.js
  var PHASES = [
    { id: "requirements", label: "Requirements", duration: "2h" },
    { id: "architecture", label: "Architecture", duration: "3h" },
    { id: "implementation", label: "Implementation", duration: "8h" },
    { id: "review", label: "Review", duration: "1h" }
  ];
  function createTimelineState() {
    return { phaseIndex: 0, crashed: false, resumed: false, checkpoints: [] };
  }
  function advanceTimeline(state2) {
    if (state2.phaseIndex >= PHASES.length) {
      return { state: { ...state2, complete: true }, phase: null, message: "Workflow complete." };
    }
    const phase = PHASES[state2.phaseIndex];
    const checkpoint = { phase: phase.id, timestamp: Date.now(), saved: true };
    return {
      state: {
        ...state2,
        phaseIndex: state2.phaseIndex + 1,
        checkpoints: [...state2.checkpoints, checkpoint],
        complete: state2.phaseIndex + 1 >= PHASES.length
      },
      phase,
      message: `Checkpoint saved at ${phase.label}`
    };
  }
  function simulateCrash(state2) {
    return {
      state: { ...state2, crashed: true },
      message: `Crash during ${PHASES[state2.phaseIndex]?.label || "unknown"} phase. State may be lost without checkpoint.`
    };
  }
  function simulateResume(state2) {
    const lastCheckpoint = state2.checkpoints[state2.checkpoints.length - 1];
    if (!lastCheckpoint) {
      return { state: state2, message: "No checkpoint available. Must restart from beginning.", resumed: false };
    }
    const resumeIndex = PHASES.findIndex((p) => p.id === lastCheckpoint.phase) + 1;
    return {
      state: { ...state2, crashed: false, resumed: true, phaseIndex: Math.min(resumeIndex, PHASES.length) },
      message: `Resumed from checkpoint at ${lastCheckpoint.phase}.`,
      resumed: true
    };
  }
  function getPhases() {
    return PHASES;
  }

  // web/js/core/trace-simulator.js
  var TRACE = {
    spans: [
      { id: "s1", name: "supervisor.route", duration: 120, status: "ok" },
      { id: "s2", name: "worker.research", duration: 890, status: "ok", parent: "s1" },
      { id: "s3", name: "tool.search_kb", duration: 340, status: "ok", parent: "s2" },
      { id: "s4", name: "worker.code", duration: 1200, status: "error", parent: "s1" },
      { id: "s5", name: "state.handoff", duration: 45, status: "ok", parent: "s4" }
    ],
    failureModes: [
      { id: "f1", risk: "Cascading tool errors", mitigation: "Circuit breaker on tool calls with fallback" },
      { id: "f2", risk: "State drift across handoffs", mitigation: "Schema-validated state checkpoints" },
      { id: "f3", risk: "Eval blind spots on multi-agent flows", mitigation: "End-to-end workflow traces with outcome metrics" },
      { id: "f4", risk: "Token cost explosion", mitigation: "Model routing and semantic caching" },
      { id: "f5", risk: "Hallucination in synthesis step", mitigation: "Groundedness checks before final output" }
    ]
  };
  function getTrace() {
    return TRACE;
  }
  function getFailureModes() {
    return TRACE.failureModes;
  }

  // web/js/core/hitl-simulator.js
  var GATE_OPTIONS = [
    { id: "pre-tool", label: "Pre-tool execution", leverage: "high", x: 100, y: 80 },
    { id: "pre-deploy", label: "Pre-deployment", leverage: "high", x: 280, y: 80 },
    { id: "post-generate", label: "Post-generation review", leverage: "medium", x: 100, y: 200 },
    { id: "financial", label: "Financial transaction", leverage: "high", x: 280, y: 200 }
  ];
  function getHitlGates() {
    return GATE_OPTIONS;
  }
  function placeHitlGate(state2, gateId) {
    const gate = GATE_OPTIONS.find((g) => g.id === gateId);
    if (!gate) return { state: state2, error: "Unknown gate" };
    if (state2.placed.includes(gateId)) return { state: state2, error: "Already placed" };
    const placed = [...state2.placed, gateId];
    const checklist = buildGovernanceChecklist(placed);
    return {
      state: { placed },
      gate,
      checklist,
      complete: placed.filter((id) => GATE_OPTIONS.find((g) => g.id === id)?.leverage === "high").length >= 2
    };
  }
  function createHitlState() {
    return { placed: [] };
  }
  function buildGovernanceChecklist(placed) {
    const items = [
      { id: "audit", label: "Audit logging enabled", done: placed.length > 0 },
      { id: "rbac", label: "RBAC on approval gates", done: placed.includes("financial") || placed.includes("pre-deploy") },
      { id: "policy", label: "Policy engine on outputs", done: placed.includes("post-generate") },
      { id: "lineage", label: "Data lineage tracked", done: placed.length >= 2 }
    ];
    return items;
  }

  // web/js/core/integration-simulator.js
  function getIntegrationDiff() {
    return {
      prototype: {
        auth: "None",
        audit: "Console logs",
        data: "Local files",
        deploy: "Manual script",
        ci: "None"
      },
      enterprise: {
        auth: "SSO / OIDC + RBAC",
        audit: "Centralized audit log + lineage",
        data: "Governed data lake + PII controls",
        deploy: "CI/CD pipelines with approval gates",
        ci: "Graph/prompt/model versioning"
      },
      trends2026: [
        { id: "mcp", title: "Model Context Protocol (MCP)", impact: "Standardizes tool integration" },
        { id: "clouds", title: "Agent clouds / harnesses", impact: "Managed hosting reduces ops burden" },
        { id: "a2a", title: "Agent-to-agent standards", impact: "Interop between vendor agents" },
        { id: "sandbox", title: "Advanced sandboxes", impact: "Safer tool execution environments" }
      ]
    };
  }

  // web/js/core/sketch-model.js
  function createSketch(name = "Untitled", template = null) {
    return {
      id: `sketch-${Date.now()}`,
      name,
      createdAt: Date.now(),
      nodes: template ? template.nodes.map((n) => ({ ...n })) : [],
      edges: template ? template.edges.map((e) => ({ ...e })) : [],
      annotations: ""
    };
  }
  function addNode(sketch, type, label, x, y) {
    if (!NODE_TYPES.includes(type)) throw new Error(`Invalid node type: ${type}`);
    const id = `node-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`;
    return {
      ...sketch,
      nodes: [...sketch.nodes, { id, type, label: label || type, x, y }]
    };
  }
  function moveNode(sketch, nodeId, x, y) {
    return {
      ...sketch,
      nodes: sketch.nodes.map((n) => n.id === nodeId ? { ...n, x, y } : n)
    };
  }
  function setAnnotations(sketch, annotations) {
    return { ...sketch, annotations };
  }
  function addEdge(sketch, fromId, toId, label = "") {
    return {
      ...sketch,
      edges: [...sketch.edges, { from: fromId, to: toId, label }]
    };
  }
  function compareSketches(a, b) {
    const typesA = new Set(a.nodes.map((n) => n.type));
    const typesB = new Set(b.nodes.map((n) => n.type));
    const missingInB = [...typesA].filter((t) => !typesB.has(t));
    const missingInA = [...typesB].filter((t) => !typesA.has(t));
    const nodeCountDiff = Math.abs(a.nodes.length - b.nodes.length);
    return {
      missingInB,
      missingInA,
      nodeCountDiff,
      edgeCountDiff: Math.abs(a.edges.length - b.edges.length),
      summary: missingInB.length || missingInA.length ? `Structural diff: missing types in B: [${missingInB.join(", ")}]; in A: [${missingInA.join(", ")}]` : "Sketches have matching node type coverage."
    };
  }

  // web/js/core/validators.js
  var MIN_TRADEOFFS = 3;
  var MIN_FAILURES = 5;
  function validateWizard(wizardData) {
    const errors = [];
    const warnings = [];
    if (!wizardData.scenario?.trim()) errors.push("Scenario is required");
    if (!wizardData.justify?.trim()) errors.push("Justify Choices is required");
    const tradeoffs = (wizardData.tradeoffs || []).filter((t) => t?.trim());
    if (tradeoffs.length < MIN_TRADEOFFS) {
      errors.push(`At least ${MIN_TRADEOFFS} tradeoffs required (have ${tradeoffs.length})`);
    }
    const failures = (wizardData.failures || []).filter((f) => f?.risk?.trim() && f?.mitigation?.trim());
    if (failures.length < MIN_FAILURES) {
      errors.push(`At least ${MIN_FAILURES} failure modes required (have ${failures.length})`);
    }
    if (!wizardData.costLatency?.trim()) warnings.push("Cost/Latency considerations recommended");
    const complete = errors.length === 0;
    return {
      complete,
      interviewReady: complete && wizardData.teachBackCompleted,
      errors,
      warnings,
      counts: { tradeoffs: tradeoffs.length, failures: failures.length }
    };
  }
  function validateSketch(sketch, wizardData) {
    const wizard = validateWizard(wizardData);
    const nodeErrors = [];
    if (!sketch.nodes.length) nodeErrors.push("Sketch must have at least one node");
    return {
      ...wizard,
      sketchValid: nodeErrors.length === 0,
      errors: [...wizard.errors, ...nodeErrors]
    };
  }

  // web/js/core/export.js
  function generateExport(sketch, wizardData) {
    const sections = [];
    sections.push(`# Architecture Export: ${sketch.name || "Untitled"}
`);
    sections.push(`## 1. ${WIZARD_STEPS[0]}
${wizardData.scenario || "(not provided)"}
`);
    sections.push(`## 2. ${WIZARD_STEPS[1]}
Nodes: ${sketch.nodes.length}, Edges: ${sketch.edges.length}
`);
    sketch.nodes.forEach((n) => sections.push(`- [${n.type}] ${n.label} @ (${n.x}, ${n.y})`));
    sketch.edges.forEach((e) => sections.push(`- ${e.from} \u2192 ${e.to}${e.label ? ` (${e.label})` : ""}`));
    if (sketch.annotations) sections.push(`
Annotations: ${sketch.annotations}`);
    sections.push(`
## 3. ${WIZARD_STEPS[2]}
${wizardData.justify || "(not provided)"}
`);
    sections.push(`## 4. ${WIZARD_STEPS[3]}`);
    (wizardData.tradeoffs || []).forEach((t, i) => t?.trim() && sections.push(`${i + 1}. ${t}`));
    sections.push(`
## 5. ${WIZARD_STEPS[4]}`);
    (wizardData.failures || []).forEach((f, i) => {
      if (f?.risk?.trim()) sections.push(`${i + 1}. **${f.risk}** \u2014 Mitigation: ${f.mitigation || "TBD"}`);
    });
    sections.push(`
## 6. ${WIZARD_STEPS[5]}
${wizardData.costLatency || "(not provided)"}
`);
    sections.push(`## 7. ${WIZARD_STEPS[6]}
Teach-back completed: ${wizardData.teachBackCompleted ? "Yes" : "No"}
`);
    return sections.join("\n");
  }
  function svgToDataUrl(svgString) {
    const encoded = encodeURIComponent(svgString).replace(/'/g, "%27").replace(/"/g, "%22");
    return `data:image/svg+xml,${encoded}`;
  }
  function rasterizeSvgToPng(svgString, width = 800, height = 400, env = globalThis) {
    const ImageCtor = env.Image;
    const doc = env.document;
    if (!ImageCtor || !doc) {
      throw new Error("DOM Image and document required for PNG rasterization");
    }
    return new Promise((resolve, reject) => {
      const img = new ImageCtor();
      img.onload = () => {
        const canvas = doc.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.fillStyle = "#0a0e14";
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(img, 0, 0, width, height);
        resolve(canvas.toDataURL("image/png"));
      };
      img.onerror = () => reject(new Error("Failed to load SVG for PNG rasterization"));
      img.src = svgToDataUrl(svgString);
    });
  }

  // web/js/core/progress.js
  var STORAGE_KEY = "aaa-progress-v1";
  var REVIEW_DAYS = [3, 7, 14];
  function createDefaultProgress() {
    return {
      startDate: Date.now(),
      moduleCompletion: {},
      checkpointAnswers: {},
      streak: { count: 0, lastDate: null },
      sketches: [],
      lastActivity: null
    };
  }
  function loadProgress() {
    if (typeof localStorage === "undefined") return createDefaultProgress();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return raw ? { ...createDefaultProgress(), ...JSON.parse(raw) } : createDefaultProgress();
    } catch {
      return createDefaultProgress();
    }
  }
  function saveProgress(progress) {
    if (typeof localStorage === "undefined") return progress;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    return progress;
  }
  function recordActivity(progress) {
    const today = (/* @__PURE__ */ new Date()).toDateString();
    const last = progress.streak.lastDate;
    let count = progress.streak.count;
    if (last !== today) {
      const yesterday = /* @__PURE__ */ new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      count = last === yesterday.toDateString() ? count + 1 : 1;
    }
    return saveProgress({
      ...progress,
      streak: { count, lastDate: today },
      lastActivity: Date.now()
    });
  }
  function markModuleComplete(progress, moduleId) {
    return saveProgress({
      ...progress,
      moduleCompletion: { ...progress.moduleCompletion, [moduleId]: true }
    });
  }
  function computeModuleRings(progress, totalModules = 9) {
    const completed = Object.values(progress.moduleCompletion).filter(Boolean).length;
    return { completed, total: totalModules, percent: Math.round(completed / totalModules * 100) };
  }
  function computeReviewItems(progress, now = Date.now()) {
    const daysSinceStart = Math.floor((now - progress.startDate) / (1e3 * 60 * 60 * 24));
    const dueDays = REVIEW_DAYS.filter((d) => daysSinceStart >= d);
    const items = [];
    if (dueDays.length) {
      const oldestCheckpoint = Object.entries(progress.checkpointAnswers).sort((a, b) => a[1].timestamp - b[1].timestamp)[0];
      if (oldestCheckpoint) {
        items.push({ type: "checkpoint", key: oldestCheckpoint[0], data: oldestCheckpoint[1], dueDay: dueDays[0] });
      }
      if (progress.sketches.length) {
        const oldest = [...progress.sketches].sort((a, b) => a.createdAt - b.createdAt)[0];
        items.push({ type: "sketch", data: oldest, dueDay: dueDays[dueDays.length - 1] });
      }
    }
    return { daysSinceStart, dueDays, items };
  }

  // web/js/core/checkpoints.js
  function evaluateCheckpoint(answer, checkpoint) {
    const normalized = (answer || "").toLowerCase();
    const matched = (checkpoint.keywords || []).filter((kw) => normalized.includes(kw.toLowerCase()));
    const pass = matched.length >= 2 || normalized.length >= 40;
    return {
      pass,
      matchedKeywords: matched,
      explanation: checkpoint.explanation,
      feedback: pass ? `Good reasoning. Key concepts detected: ${matched.join(", ") || "sufficient depth"}.` : `Consider addressing: governance, tradeoffs, enterprise constraints. ${checkpoint.explanation}`
    };
  }

  // web/js/app.js
  var state = {
    view: "dashboard",
    progress: loadProgress(),
    moduleId: 1,
    react: createReactState(false),
    topology: "supervisor",
    langgraph: { stepIndex: 0 },
    rag: { mode: "vector", failurePoint: null },
    timeline: createTimelineState(),
    hitl: createHitlState(),
    workspace: {
      sketch: createSketch("My Architecture"),
      wizard: {
        scenario: "",
        justify: "",
        tradeoffs: ["", "", ""],
        failures: Array(5).fill(null).map(() => ({ risk: "", mitigation: "" })),
        costLatency: "",
        teachBackCompleted: false
      },
      compareSketch: null,
      selectedNodeType: "Agent",
      edgeConnectFrom: null,
      drag: { nodeId: null, offsetX: 0, offsetY: 0 }
    }
  };
  var main = document.getElementById("main-content");
  var reviewNudges = document.getElementById("review-nudges");
  function init() {
    state.progress = recordActivity(state.progress);
    bindNav();
    render();
    document.addEventListener("keydown", handleGlobalKeys);
  }
  function bindNav() {
    document.querySelectorAll(".nav-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        if (state.view === "modules" && !state.moduleId) state.moduleId = 1;
        document.querySelectorAll(".nav-link").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
        render();
      });
    });
  }
  function handleGlobalKeys(e) {
    if (e.key === "s" && e.ctrlKey && state.view === "pattern-lab") {
      e.preventDefault();
      stepCurrentSimulator();
    }
  }
  function render() {
    updateProgressUI();
    switch (state.view) {
      case "dashboard":
        renderDashboard();
        break;
      case "modules":
        renderModule();
        break;
      case "pattern-lab":
        renderPatternLab();
        break;
      case "workspace":
        renderWorkspace();
        break;
      case "resources":
        renderResources();
        break;
      case "review":
        renderReview();
        break;
      default:
        renderDashboard();
    }
  }
  function updateProgressUI() {
    const rings = computeModuleRings(state.progress);
    document.getElementById("progress-ring").innerHTML = `
    <svg width="80" height="80" aria-hidden="true">
      <circle cx="40" cy="40" r="34" fill="none" stroke="#2d3a4f" stroke-width="6"/>
      <circle cx="40" cy="40" r="34" fill="none" stroke="#6366f1" stroke-width="6"
        stroke-dasharray="${rings.percent * 2.14} 214" stroke-linecap="round"/>
    </svg>
    <span class="label">${rings.completed}/${rings.total}</span>`;
    document.getElementById("streak-display").textContent = `\u{1F525} ${state.progress.streak.count} day streak`;
    const review = computeReviewItems(state.progress);
    reviewNudges.innerHTML = review.items.length ? `<div class="review-nudge" role="status"><strong>Review due</strong> (Day ${review.dueDays.join(", ")})</div>` : "";
    document.querySelectorAll('.nav-link[data-view="modules"]').forEach((btn) => {
      btn.classList.toggle("completed", rings.completed === rings.total);
    });
  }
  function renderDashboard() {
    main.innerHTML = `
    <h2>Dashboard</h2>
    <div class="glass-card">
      <h3>Your Learning Journey</h3>
      <p>14\u201322 hours over 7\u201314 days. Breadth-first interview prep for production enterprise AI agents.</p>
      <table class="timeline-table" aria-label="Suggested timeline">
        <thead><tr><th>Days</th><th>Focus</th><th>Hours</th></tr></thead>
        <tbody>${TIMELINE.map((t) => `<tr><td>${t.days}</td><td>${t.focus}</td><td>${t.hours}</td></tr>`).join("")}</tbody>
      </table>
    </div>
    <div class="glass-card">
      <h3>Quick Start</h3>
      <button class="btn" data-action="goto-modules">Start Module 1</button>
      <button class="btn btn-secondary" data-action="goto-lab">Open Pattern Lab</button>
      <button class="btn btn-secondary" data-action="goto-workspace">Architect Workspace</button>
    </div>`;
    main.querySelector('[data-action="goto-modules"]').onclick = () => {
      state.view = "modules";
      state.moduleId = 1;
      render();
    };
    main.querySelector('[data-action="goto-lab"]').onclick = () => {
      state.view = "pattern-lab";
      render();
    };
    main.querySelector('[data-action="goto-workspace"]').onclick = () => {
      state.view = "workspace";
      render();
    };
  }
  function renderModule() {
    const mod = MODULES.find((m) => m.id === state.moduleId);
    main.innerHTML = `
    <h2>Module ${mod.id}: ${mod.title}</h2>
    <div class="glass-card">
      <h3>Objectives</h3>
      <ul>${mod.objectives.map((o) => `<li>${o}</li>`).join("")}</ul>
      <h3>Key Topics</h3>
      <div>${mod.lingo.map((l) => `<span class="tag" title="${l}">${l}</span>`).join("")}</div>
      <h3>Active Practice</h3>
      <ul>${mod.practice.map((p) => `<li>${p}</li>`).join("")}</ul>
    </div>
    <div class="glass-card">
      <h3>Checkpoints</h3>
      ${mod.checkpoints.map((cp, i) => `
        <div class="wizard-step" data-cp="${i}">
          <label>${cp.question}</label>
          <textarea aria-label="Checkpoint answer ${i + 1}" data-cp-input="${i}"></textarea>
          <button class="btn" data-cp-submit="${i}">Submit</button>
          <div class="checkpoint-result" id="cp-result-${i}" aria-live="polite"></div>
        </div>`).join("")}
    </div>
    <div>
      <button class="btn btn-secondary" data-prev ${mod.id <= 1 ? "disabled" : ""}>\u2190 Previous</button>
      <button class="btn" data-next ${mod.id >= 9 ? "disabled" : ""}>Next Module \u2192</button>
      <button class="btn btn-secondary" data-goto-sim>Open Simulator</button>
    </div>`;
    mod.checkpoints.forEach((cp, i) => {
      main.querySelector(`[data-cp-submit="${i}"]`).onclick = () => {
        const answer = main.querySelector(`[data-cp-input="${i}"]`).value;
        const result = evaluateCheckpoint(answer, cp);
        const el = document.getElementById(`cp-result-${i}`);
        el.className = `checkpoint-result ${result.pass ? "pass" : "fail"}`;
        el.textContent = result.feedback;
        state.progress.checkpointAnswers[`m${mod.id}-cp${i}`] = { answer, result, timestamp: Date.now() };
        if (result.pass) {
          state.progress = markModuleComplete(state.progress, mod.id);
          saveProgress(state.progress);
        }
        updateProgressUI();
      };
    });
    main.querySelector("[data-prev]")?.addEventListener("click", () => {
      state.moduleId--;
      render();
    });
    main.querySelector("[data-next]")?.addEventListener("click", () => {
      state.moduleId++;
      render();
    });
    main.querySelector("[data-goto-sim]").onclick = () => {
      state.view = "pattern-lab";
      state.labSimulator = mod.simulator;
      render();
    };
  }
  function renderPatternLab() {
    const sim = state.labSimulator || "react";
    main.innerHTML = `
    <h2>Pattern Lab</h2>
    <div class="glass-card">
      <label for="sim-select">Simulator</label>
      <select id="sim-select" aria-label="Select simulator">
        <option value="react" ${sim === "react" ? "selected" : ""}>ReAct Stepper + Reflection</option>
        <option value="topology" ${sim === "topology" ? "selected" : ""}>Multi-Agent Topology Switcher</option>
        <option value="langgraph" ${sim === "langgraph" ? "selected" : ""}>LangGraph State Viewer</option>
        <option value="rag" ${sim === "rag" ? "selected" : ""}>RAG Failure Cascade</option>
        <option value="timeline" ${sim === "timeline" ? "selected" : ""}>Checkpoint Timeline</option>
        <option value="trace" ${sim === "trace" ? "selected" : ""}>Trace + Failure Explorer</option>
        <option value="hitl" ${sim === "hitl" ? "selected" : ""}>HITL / Guardrail Placement</option>
        <option value="integration" ${sim === "integration" ? "selected" : ""}>Integration Diff + 2026 Trends</option>
      </select>
    </div>
    <div id="sim-container"></div>`;
    main.querySelector("#sim-select").onchange = (e) => {
      state.labSimulator = e.target.value;
      renderPatternLab();
    };
    renderSimulator(sim);
  }
  function renderSimulator(sim) {
    const container = document.getElementById("sim-container");
    switch (sim) {
      case "react":
        renderReactSim(container);
        break;
      case "topology":
        renderTopologySim(container);
        break;
      case "langgraph":
        renderLangGraphSim(container);
        break;
      case "rag":
        renderRagSim(container);
        break;
      case "timeline":
        renderTimelineSim(container);
        break;
      case "trace":
        renderTraceSim(container);
        break;
      case "hitl":
        renderHitlSim(container);
        break;
      case "integration":
        renderIntegrationSim(container);
        break;
    }
  }
  function renderReactSim(el) {
    const last = state.react.steps[state.react.steps.length - 1];
    el.innerHTML = `
    <div class="glass-card">
      <h3>ReAct Loop Stepper</h3>
      <label><input type="checkbox" id="reflection-toggle" ${state.react.reflectionEnabled ? "checked" : ""} aria-label="Enable reflection critic"> Reflection critic</label>
      <div class="sim-display" id="react-display" aria-live="polite">${last ? last.text : "Press Step to begin the Thought \u2192 Action \u2192 Observation cycle."}</div>
      <div class="metrics-bar" id="react-metrics"></div>
      <button class="btn" id="react-step" aria-label="Step forward">Step Forward</button>
      <button class="btn btn-secondary" id="react-reset">Reset</button>
    </div>`;
    document.getElementById("reflection-toggle").onchange = (e) => {
      state.react = toggleReflection(state.react, e.target.checked);
      renderReactSim(el);
    };
    document.getElementById("react-step").onclick = () => {
      const { state: newState, display, metrics } = reactStep(state.react);
      state.react = newState;
      const displayEl = document.getElementById("react-display");
      displayEl.innerHTML = `<span class="pulse">${display}</span>`;
      if (metrics) {
        document.getElementById("react-metrics").innerHTML = `Latency: ${metrics.latency.toFixed(1)}s | Cost: $${metrics.cost.toFixed(2)} | Quality: ${(metrics.quality * 100).toFixed(0)}%`;
      }
      state.progress = recordActivity(state.progress);
    };
    document.getElementById("react-reset").onclick = () => {
      state.react = reactStep(state.react, "reset").state;
      renderReactSim(el);
    };
  }
  function renderTopologySim(el) {
    const result = switchTopology(state.topology);
    el.innerHTML = `
    <div class="glass-card">
      <h3>Topology Switcher</h3>
      <div role="group" aria-label="Topology mode">
        ${getTopologyModes().map((m) => `<button class="btn ${m === state.topology ? "" : "btn-secondary"}" data-topo="${m}">${m}</button>`).join("")}
      </div>
      <div class="tradeoff-panel" aria-label="Tradeoff panel">${result.tradeoffPanel}</div>
      <svg width="100%" height="200" aria-label="Topology graph" id="topo-svg">
        ${result.viz.nodes.map((n, i) => `<circle class="graph-node active" cx="${80 + i * 100}" cy="100" r="30" fill="#6366f1" stroke="#22d3ee"/><text x="${80 + i * 100}" y="105" text-anchor="middle" fill="white" font-size="10">${n.label.split(" ")[0]}</text>`).join("")}
        ${result.viz.edges.map((e, i) => `<line x1="110" y1="100" x2="180" y2="100" stroke="#22d3ee" stroke-width="2" class="flow-edge" style="animation: pulse 2s infinite"/>`).join("")}
      </svg>
      <p><strong>Flow:</strong> ${result.viz.flow.join(" \u2192 ")}</p>
    </div>`;
    el.querySelectorAll("[data-topo]").forEach((btn) => {
      btn.onclick = () => {
        state.topology = btn.dataset.topo;
        renderTopologySim(el);
      };
    });
  }
  function renderLangGraphSim(el) {
    const view = getLangGraphView();
    const step = stepLangGraph(state.langgraph);
    el.innerHTML = `
    <div class="glass-card">
      <h3>LangGraph State Viewer</h3>
      <p>${view.description}</p>
      <svg width="100%" height="120" aria-label="LangGraph">
        ${view.nodes.map((n, i) => `<g class="graph-node ${n.id === step.activeNode ? "active" : ""} ${n.type === "persistence" ? "persistence" : ""} ${n.type === "interrupt" ? "interrupt" : ""}">
          <rect x="${i * 90 + 10}" y="40" width="70" height="40" rx="6" fill="#1a2332" stroke="${n.highlight ? "#f59e0b" : "#6366f1"}"/>
          <text x="${i * 90 + 45}" y="65" text-anchor="middle" fill="white" font-size="9">${n.label}</text>
        </g>`).join("")}
      </svg>
      <div class="sim-display" aria-live="polite">${step.message || "Ready"}</div>
      <button class="btn" id="lg-step">Step Graph</button>
      <button class="btn btn-secondary" id="lg-reset">Reset</button>
    </div>`;
    document.getElementById("lg-step").onclick = () => {
      const r = stepLangGraph(state.langgraph);
      state.langgraph = r.state;
      renderLangGraphSim(el);
    };
    document.getElementById("lg-reset").onclick = () => {
      state.langgraph = { stepIndex: 0 };
      renderLangGraphSim(el);
    };
  }
  function renderRagSim(el) {
    const result = simulateRagCascade(state.rag.mode, state.rag.failurePoint);
    el.innerHTML = `
    <div class="glass-card">
      <h3>Retrieval Failure Cascade</h3>
      <select id="rag-mode" aria-label="RAG mode">
        ${getRagModes().map((m) => `<option value="${m}" ${state.rag.mode === m ? "selected" : ""}>${m}</option>`).join("")}
      </select>
      <select id="rag-fail" aria-label="Failure point">
        <option value="">No failure</option>
        <option value="vector_search">vector_search fail</option>
        <option value="graph_traverse">graph_traverse fail</option>
      </select>
      <div class="sim-display">${result.path.map((p) => `[${p.status.toUpperCase()}] ${p.step}: ${p.detail}`).join("\n")}</div>
      <p>${result.summary}</p>
    </div>`;
    document.getElementById("rag-mode").onchange = (e) => {
      state.rag.mode = e.target.value;
      renderRagSim(el);
    };
    document.getElementById("rag-fail").onchange = (e) => {
      state.rag.failurePoint = e.target.value || null;
      renderRagSim(el);
    };
  }
  function renderTimelineSim(el) {
    el.innerHTML = `
    <div class="glass-card">
      <h3>Checkpoint Timeline</h3>
      <div class="sim-display" id="tl-display">Phases: ${getPhases().map((p) => p.label).join(" \u2192 ")}</div>
      <button class="btn" id="tl-advance">Advance Phase</button>
      <button class="btn btn-secondary" id="tl-crash">Simulate Crash</button>
      <button class="btn" id="tl-resume">Resume from Checkpoint</button>
    </div>`;
    const update = (msg) => {
      document.getElementById("tl-display").textContent = msg;
    };
    document.getElementById("tl-advance").onclick = () => {
      const r = advanceTimeline(state.timeline);
      state.timeline = r.state;
      update(r.message);
    };
    document.getElementById("tl-crash").onclick = () => {
      const r = simulateCrash(state.timeline);
      state.timeline = r.state;
      update(r.message);
    };
    document.getElementById("tl-resume").onclick = () => {
      const r = simulateResume(state.timeline);
      state.timeline = r.state;
      update(r.message);
    };
  }
  function renderTraceSim(el) {
    const trace = getTrace();
    el.innerHTML = `
    <div class="glass-card">
      <h3>Trace Viewer</h3>
      <div class="sim-display">${trace.spans.map((s) => `${s.name} (${s.duration}ms) [${s.status}]`).join("\n")}</div>
      <h3>Failure Modes</h3>
      <ul>${getFailureModes().map((f) => `<li><strong>${f.risk}</strong> \u2014 ${f.mitigation}</li>`).join("")}</ul>
    </div>`;
  }
  function renderHitlSim(el) {
    const gates = getHitlGates();
    el.innerHTML = `
    <div class="glass-card">
      <h3>HITL / Guardrail Placement</h3>
      <div role="group" aria-label="HITL gates">
        ${gates.map((g) => `<button class="btn btn-secondary" data-gate="${g.id}" aria-label="Place ${g.label}">${g.label}</button>`).join("")}
      </div>
      <div id="hitl-checklist"></div>
    </div>`;
    el.querySelectorAll("[data-gate]").forEach((btn) => {
      btn.onclick = () => {
        const r = placeHitlGate(state.hitl, btn.dataset.gate);
        state.hitl = r.state;
        if (r.checklist) {
          document.getElementById("hitl-checklist").innerHTML = `<ul>${r.checklist.map((c) => `<li>${c.done ? "\u2713" : "\u25CB"} ${c.label}</li>`).join("")}</ul>`;
        }
      };
    });
  }
  function renderIntegrationSim(el) {
    const diff = getIntegrationDiff();
    el.innerHTML = `
    <div class="glass-card">
      <h3>Prototype \u2192 Enterprise Integration</h3>
      <table class="timeline-table"><thead><tr><th>Concern</th><th>Prototype</th><th>Enterprise</th></tr></thead>
        <tbody>${Object.keys(diff.prototype).map((k) => `<tr><td>${k}</td><td>${diff.prototype[k]}</td><td>${diff.enterprise[k]}</td></tr>`).join("")}</tbody>
      </table>
      <h3>2026 Trends</h3>
      ${diff.trends2026.map((t) => `<div class="tag">${t.title}: ${t.impact}</div>`).join("")}
    </div>`;
  }
  function stepCurrentSimulator() {
    if (state.labSimulator === "react" || !state.labSimulator) {
      const { state: newState } = reactStep(state.react);
      state.react = newState;
    }
  }
  function renderWorkspace() {
    const w = state.workspace;
    const validation = validateSketch(w.sketch, w.wizard);
    main.innerHTML = `
    <h2>Architect Workspace</h2>
    <div class="glass-card">
      <h3>Capstone Templates</h3>
      ${CAPSTONES.map((c) => `<button class="btn btn-secondary" data-capstone="${c.id}">${c.name}</button>`).join("")}
    </div>
    <div class="workspace-layout">
      <div>
        <div class="node-palette" role="group" aria-label="Node palette">
          ${NODE_TYPES.map((t) => `<button class="palette-btn ${w.selectedNodeType === t ? "selected" : ""}" data-node-type="${t}" aria-label="Add ${t}">${t}</button>`).join("")}
        </div>
        <p class="tag">Click canvas to place \xB7 Drag nodes to reposition \xB7 Select two nodes to connect</p>
        <div class="canvas-wrap" id="canvas-wrap" role="img" aria-label="Architecture canvas"></div>
        <button class="btn btn-secondary" id="connect-edge-btn">Connect Selected Nodes</button>
        <button class="btn btn-secondary" id="export-btn">Export Markdown + PNG</button>
      </div>
      <div class="glass-card">
        <h3>7-Step Wizard</h3>
        ${WIZARD_STEPS.map((step, i) => renderWizardField(step, i, w)).join("")}
        <div id="validation-status" class="${validation.complete ? "checkpoint-result pass" : "checkpoint-result fail"}" aria-live="polite">
          ${validation.complete ? "Interview-ready structure \u2713" : validation.errors.join("; ")}
        </div>
        <button class="btn" id="teach-back-btn">Start 8-min Teach-Back Timer</button>
        <span id="timer-display"></span>
      </div>
    </div>
    <div class="glass-card">
      <h3>Compare Sketches</h3>
      <button class="btn btn-secondary" id="save-compare">Save Current for Compare</button>
      <div class="compare-grid" id="compare-view"></div>
    </div>`;
    renderCanvas();
    main.querySelectorAll("[data-capstone]").forEach((btn) => {
      btn.onclick = () => {
        const cap = CAPSTONES.find((c) => c.id === btn.dataset.capstone);
        state.workspace.sketch = createSketch(cap.name, cap);
        state.workspace.wizard.scenario = cap.description;
        renderWorkspace();
      };
    });
    main.querySelectorAll("[data-node-type]").forEach((btn) => {
      btn.onclick = () => {
        state.workspace.selectedNodeType = btn.dataset.nodeType;
        renderWorkspace();
      };
    });
    document.getElementById("connect-edge-btn").onclick = () => {
      const { edgeConnectFrom } = state.workspace;
      const selected = document.querySelector(".canvas-node.selected");
      if (!edgeConnectFrom || !selected) return;
      const toId = selected.dataset.nodeId;
      if (edgeConnectFrom !== toId) {
        state.workspace.sketch = addEdge(state.workspace.sketch, edgeConnectFrom, toId, "flow");
        state.workspace.edgeConnectFrom = null;
        renderCanvas();
      }
    };
    document.getElementById("export-btn").onclick = () => exportWorkspace();
    document.getElementById("save-compare").onclick = () => {
      state.workspace.compareSketch = JSON.parse(JSON.stringify(state.workspace.sketch));
      const diff = compareSketches(state.workspace.compareSketch, state.workspace.sketch);
      document.getElementById("compare-view").innerHTML = `<div><pre>${diff.summary}</pre></div><div>${renderSketchSvg(state.workspace.sketch)}</div>`;
    };
    bindWizardInputs();
    document.getElementById("teach-back-btn").onclick = startTeachBackTimer;
  }
  function renderWizardField(step, i, w) {
    if (i === 0) return `<div class="wizard-step"><label>${step}</label><textarea data-wizard="scenario">${w.wizard.scenario}</textarea></div>`;
    if (i === 1) return `<div class="wizard-step"><label>${step}</label><p>${w.sketch.nodes.length} nodes, ${w.sketch.edges.length} edges</p><label>Annotations</label><textarea data-wizard="annotations" aria-label="Sketch annotations">${w.sketch.annotations || ""}</textarea></div>`;
    if (i === 2) return `<div class="wizard-step"><label>${step}</label><textarea data-wizard="justify">${w.wizard.justify}</textarea></div>`;
    if (i === 3) return `<div class="wizard-step"><label>${step}</label>${w.wizard.tradeoffs.map((t, j) => `<input type="text" data-wizard-tradeoff="${j}" value="${t}" placeholder="Tradeoff ${j + 1}">`).join("")}</div>`;
    if (i === 4) return `<div class="wizard-step"><label>${step}</label>${w.wizard.failures.map((f, j) => `<input type="text" data-wizard-fail-risk="${j}" value="${f.risk}" placeholder="Risk ${j + 1}"><input type="text" data-wizard-fail-mit="${j}" value="${f.mitigation}" placeholder="Mitigation">`).join("")}</div>`;
    if (i === 5) return `<div class="wizard-step"><label>${step}</label><textarea data-wizard="costLatency">${w.wizard.costLatency}</textarea></div>`;
    return `<div class="wizard-step"><label>${step}</label><p>Use the timer button below.</p></div>`;
  }
  function bindWizardInputs() {
    main.querySelector('[data-wizard="scenario"]')?.addEventListener("input", (e) => {
      state.workspace.wizard.scenario = e.target.value;
    });
    main.querySelector('[data-wizard="justify"]')?.addEventListener("input", (e) => {
      state.workspace.wizard.justify = e.target.value;
    });
    main.querySelector('[data-wizard="costLatency"]')?.addEventListener("input", (e) => {
      state.workspace.wizard.costLatency = e.target.value;
    });
    main.querySelector('[data-wizard="annotations"]')?.addEventListener("input", (e) => {
      state.workspace.sketch = setAnnotations(state.workspace.sketch, e.target.value);
    });
    main.querySelectorAll("[data-wizard-tradeoff]").forEach((el) => {
      el.addEventListener("input", (e) => {
        state.workspace.wizard.tradeoffs[+el.dataset.wizardTradeoff] = e.target.value;
      });
    });
    main.querySelectorAll("[data-wizard-fail-risk]").forEach((el) => {
      el.addEventListener("input", (e) => {
        state.workspace.wizard.failures[+el.dataset.wizardFailRisk].risk = e.target.value;
      });
    });
    main.querySelectorAll("[data-wizard-fail-mit]").forEach((el) => {
      el.addEventListener("input", (e) => {
        state.workspace.wizard.failures[+el.dataset.wizardFailMit].mitigation = e.target.value;
      });
    });
  }
  function renderCanvas() {
    const wrap = document.getElementById("canvas-wrap");
    if (wrap) {
      wrap.innerHTML = renderSketchSvg(state.workspace.sketch);
      bindCanvasInteractions();
    }
  }
  function renderSketchSvg(sketch) {
    const colors = { Agent: "#6366f1", Tool: "#22d3ee", Memory: "#a78bfa", HITL: "#f59e0b", Guardrail: "#f87171", Router: "#34d399" };
    const nodeEls = sketch.nodes.map((n) => `<g class="graph-node canvas-node" data-node-id="${n.id}" role="button" tabindex="0" aria-label="${n.type} ${n.label}">
      <rect class="node-rect" x="${n.x}" y="${n.y}" width="100" height="40" rx="8" fill="${colors[n.type] || "#6366f1"}" opacity="0.9"/>
      <text x="${n.x + 50}" y="${n.y + 25}" text-anchor="middle" fill="white" font-size="10" pointer-events="none">${n.label}</text>
    </g>`).join("");
    const edgeEls = sketch.edges.map((e) => {
      const from = sketch.nodes.find((n) => n.id === e.from);
      const to = sketch.nodes.find((n) => n.id === e.to);
      if (!from || !to) return "";
      return `<line x1="${from.x + 50}" y1="${from.y + 40}" x2="${to.x + 50}" y2="${to.y}" stroke="#22d3ee" stroke-width="2"/>`;
    }).join("");
    return `<svg class="workspace-svg" width="100%" height="400" viewBox="0 0 800 400" aria-label="Architecture sketch"><rect width="800" height="400" fill="#0a0e14" class="canvas-bg"/>${edgeEls}${nodeEls}</svg>`;
  }
  function bindCanvasInteractions() {
    const svg = document.querySelector(".workspace-svg");
    if (!svg) return;
    svg.querySelectorAll(".canvas-node").forEach((nodeEl) => {
      const nodeId = nodeEl.dataset.nodeId;
      nodeEl.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        const n = state.workspace.sketch.nodes.find((x) => x.id === nodeId);
        if (!n) return;
        if (state.workspace.edgeConnectFrom && state.workspace.edgeConnectFrom !== nodeId) {
          nodeEl.classList.add("selected");
          return;
        }
        state.workspace.edgeConnectFrom = nodeId;
        svg.querySelectorAll(".canvas-node").forEach((el) => el.classList.remove("selected"));
        nodeEl.classList.add("selected");
        const rect = svg.getBoundingClientRect();
        const scaleX = 800 / rect.width;
        const scaleY = 400 / rect.height;
        state.workspace.drag = {
          nodeId,
          offsetX: (e.clientX - rect.left) * scaleX - n.x,
          offsetY: (e.clientY - rect.top) * scaleY - n.y
        };
        nodeEl.setPointerCapture(e.pointerId);
      });
      nodeEl.addEventListener("pointermove", (e) => {
        if (state.workspace.drag.nodeId !== nodeId) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = 800 / rect.width;
        const scaleY = 400 / rect.height;
        const x = Math.max(0, Math.min(700, (e.clientX - rect.left) * scaleX - state.workspace.drag.offsetX));
        const y = Math.max(0, Math.min(360, (e.clientY - rect.top) * scaleY - state.workspace.drag.offsetY));
        state.workspace.sketch = moveNode(state.workspace.sketch, nodeId, x, y);
        const rectEl = nodeEl.querySelector(".node-rect");
        const textEl = nodeEl.querySelector("text");
        rectEl.setAttribute("x", x);
        rectEl.setAttribute("y", y);
        textEl.setAttribute("x", x + 50);
        textEl.setAttribute("y", y + 25);
        renderCanvasEdges(svg);
      });
      nodeEl.addEventListener("pointerup", () => {
        state.workspace.drag = { nodeId: null, offsetX: 0, offsetY: 0 };
      });
    });
    svg.querySelector(".canvas-bg")?.addEventListener("click", (e) => {
      const rect = svg.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 400 / rect.height;
      const x = (e.clientX - rect.left) * scaleX - 50;
      const y = (e.clientY - rect.top) * scaleY - 20;
      state.workspace.sketch = addNode(
        state.workspace.sketch,
        state.workspace.selectedNodeType,
        state.workspace.selectedNodeType,
        Math.max(0, Math.min(700, x)),
        Math.max(0, Math.min(360, y))
      );
      renderCanvas();
    });
  }
  function renderCanvasEdges(svg) {
    const sketch = state.workspace.sketch;
    svg.querySelectorAll("line").forEach((l) => l.remove());
    sketch.edges.forEach((e) => {
      const from = sketch.nodes.find((n) => n.id === e.from);
      const to = sketch.nodes.find((n) => n.id === e.to);
      if (!from || !to) return;
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", from.x + 50);
      line.setAttribute("y1", from.y + 40);
      line.setAttribute("x2", to.x + 50);
      line.setAttribute("y2", to.y);
      line.setAttribute("stroke", "#22d3ee");
      line.setAttribute("stroke-width", "2");
      svg.insertBefore(line, svg.querySelector(".canvas-node"));
    });
  }
  async function exportWorkspace() {
    const md = generateExport(state.workspace.sketch, state.workspace.wizard);
    const blob = new Blob([md], { type: "text/markdown" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${state.workspace.sketch.name || "architecture"}.md`;
    a.click();
    const svg = renderSketchSvg(state.workspace.sketch);
    const pngDataUrl = await rasterizeSvgToPng(svg, 800, 400);
    const img = document.createElement("a");
    img.href = pngDataUrl;
    img.download = `${state.workspace.sketch.name || "architecture"}.png`;
    img.click();
    state.progress.sketches.push({ ...state.workspace.sketch, exportedAt: Date.now() });
    saveProgress(state.progress);
  }
  function startTeachBackTimer() {
    let remaining = 8 * 60;
    const display = document.getElementById("timer-display");
    const interval = setInterval(() => {
      const m = Math.floor(remaining / 60);
      const s = remaining % 60;
      display.textContent = `${m}:${s.toString().padStart(2, "0")}`;
      if (--remaining < 0) {
        clearInterval(interval);
        state.workspace.wizard.teachBackCompleted = true;
        display.textContent = "Teach-back complete!";
      }
    }, 1e3);
  }
  function renderResources() {
    main.innerHTML = `
    <h2>Resources</h2>
    <div class="glass-card">
      <h3>Written Resources</h3>
      <ul>${RESOURCES.written.map((r) => `<li><strong>${r.title}</strong> \u2014 ${r.author}</li>`).join("")}</ul>
    </div>
    <div class="glass-card">
      <h3>Podcasts (Car Listening)</h3>
      ${RESOURCES.podcasts.map((p) => `
        <div class="wizard-step">
          <strong>${p.title}</strong> \u2014 ${p.host}
          <div>${p.conceptBookmarks.map((b) => `<span class="tag">${b.label} @ ${b.time}</span>`).join("")}</div>
          <audio controls aria-label="${p.title} audio player" style="width:100%;margin-top:0.5rem">
            <source src="" type="audio/mpeg">
            <p>Audio stub \u2014 link to podcast externally. Bookmarks show concept sync points.</p>
          </audio>
        </div>`).join("")}
    </div>`;
  }
  function renderReview() {
    const review = computeReviewItems(state.progress);
    main.innerHTML = `
    <h2>Review Mode</h2>
    <div class="glass-card">
      <p>Day ${review.daysSinceStart} of your journey. Spaced review on Days 3, 7, 14.</p>
      ${review.items.length ? review.items.map((item) => `
        <div class="review-nudge">
          <strong>${item.type === "checkpoint" ? "Checkpoint" : "Sketch"} review</strong>
          <p>Due since Day ${item.dueDay}</p>
        </div>`).join("") : "<p>No reviews due yet. Keep practicing!</p>"}
      <button class="btn" id="reshsketch">Re-sketch Challenge (Week 1)</button>
    </div>`;
    document.getElementById("reshsketch")?.addEventListener("click", () => {
      state.workspace.sketch = createSketch("Re-sketch Challenge");
      state.view = "workspace";
      render();
    });
  }
  init();
})();
