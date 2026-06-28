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
  var SCENARIOS = {
    compliance: {
      label: "Compliance policy lookup",
      steps: [
        { phase: "thought", thought: "I need to find the latest compliance policy for data retention." },
        { phase: "action", action: 'search_knowledge_base(query="data retention policy")' },
        { phase: "observation", observation: "Found 3 documents: Policy v2.1 (2025), GDPR Addendum, Internal Audit Guide." },
        { phase: "thought", thought: "The policy requires 7-year retention for financial records. I can now answer." },
        { phase: "action", action: 'respond(answer="Financial records must be retained for 7 years per Policy v2.1.")' },
        { phase: "observation", observation: "Response delivered to user." }
      ]
    },
    incident: {
      label: "Incident triage",
      steps: [
        { phase: "thought", thought: "User reports API latency spike in production region us-east-1." },
        { phase: "action", action: 'query_metrics(service="payments-api", region="us-east-1", window="15m")' },
        { phase: "observation", observation: "p99 latency 4.2s (baseline 180ms). Error rate 12%." },
        { phase: "thought", thought: "Correlate with recent deploys and dependency health." },
        { phase: "action", action: 'check_deployments(service="payments-api", hours=2)' },
        { phase: "observation", observation: "Deploy v3.14.2 rolled out 22m ago. Auth service dependency degraded." }
      ]
    },
    code_review: {
      label: "Code review assistant",
      steps: [
        { phase: "thought", thought: "Review PR #482 for security and correctness in auth middleware." },
        { phase: "action", action: 'fetch_diff(pr=482, paths=["src/auth/*"])' },
        { phase: "observation", observation: "Diff shows new JWT validation but missing rate limiting on token refresh." },
        { phase: "thought", thought: "Flag missing rate limit and suggest test coverage." },
        { phase: "action", action: 'post_review(comment="Add rate limit on refresh endpoint; include negative test for expired tokens")' },
        { phase: "observation", observation: "Review comment posted. CI triggered." }
      ]
    }
  };
  var REFLECTION_ADDENDUM = {
    phase: "reflection",
    thought: "Critic: Verify the answer cites the correct policy version and mentions exceptions.",
    action: 'revise_response(add_caveat="Exceptions apply for litigation holds.")',
    observation: "Revised response with governance caveat appended."
  };
  function getReactScenarios() {
    return Object.entries(SCENARIOS).map(([id, s]) => ({ id, label: s.label, stepCount: s.steps.length }));
  }
  function createReactState(reflectionEnabled = false, scenarioId = "compliance") {
    return {
      stepIndex: 0,
      scenarioId: SCENARIOS[scenarioId] ? scenarioId : "compliance",
      reflectionEnabled,
      reflectionApplied: false,
      complete: false,
      steps: []
    };
  }
  function reactStep(currentState, action = "advance", payload = null) {
    if (action === "reset") {
      return {
        state: createReactState(currentState.reflectionEnabled, currentState.scenarioId),
        entry: null,
        display: "Simulation reset.",
        metrics: null
      };
    }
    if (action === "setScenario" && payload && SCENARIOS[payload]) {
      return {
        state: createReactState(currentState.reflectionEnabled, payload),
        entry: null,
        display: `Scenario: ${SCENARIOS[payload].label}`,
        metrics: null
      };
    }
    const state2 = {
      stepIndex: currentState.stepIndex,
      scenarioId: currentState.scenarioId,
      reflectionEnabled: currentState.reflectionEnabled,
      reflectionApplied: currentState.reflectionApplied,
      complete: currentState.complete,
      steps: [...currentState.steps]
    };
    const scenario = SCENARIOS[state2.scenarioId] || SCENARIOS.compliance;
    const steps = [...scenario.steps];
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
          metrics: { latency: 1.4, cost: 0.08, quality: 0.92, phase: "reflection", scenario: state2.scenarioId }
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
      quality: state2.reflectionEnabled ? 0.85 + state2.stepIndex * 0.02 : 0.7 + state2.stepIndex * 0.03,
      phase: raw.phase,
      scenario: state2.scenarioId
    };
    return { state: newState, entry, display: entry.text, metrics };
  }
  function toggleReflection(state2, enabled) {
    return {
      ...createReactState(enabled, state2.scenarioId),
      reflectionEnabled: enabled
    };
  }
  function formatReactEntry(raw) {
    let text = "";
    if (raw.phase === "thought" && raw.thought) text = `Thought: ${raw.thought}`;
    else if (raw.phase === "action" && raw.action) text = `Action: ${raw.action}`;
    else if (raw.phase === "observation" && raw.observation) text = `Observation: ${raw.observation}`;
    else if (raw.phase === "reflection") {
      const parts = [`Reflection: ${raw.thought}`];
      if (raw.action) parts.push(`Action: ${raw.action}`);
      if (raw.observation) parts.push(`Observation: ${raw.observation}`);
      text = parts.join("\n");
    }
    return { phase: raw.phase, text, parts: raw };
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
  function computeTopologyLayout(topology) {
    const nodes = topology.nodes || [];
    const edges = topology.edges || [];
    const width = 520;
    const height = 220;
    const positions = {};
    if (nodes.length === 1) {
      positions[nodes[0].id] = { x: width / 2, y: height / 2, label: nodes[0].label };
    } else if (topology.skills?.length) {
      positions[nodes[0].id] = { x: width / 2, y: height / 2 - 20, label: nodes[0].label };
    } else {
      const cols = Math.ceil(Math.sqrt(nodes.length));
      nodes.forEach((n, i) => {
        const col = i % cols;
        const row = Math.floor(i / cols);
        positions[n.id] = {
          x: 70 + col * (width - 140) / Math.max(cols - 1, 1),
          y: 50 + row * ((height - 100) / Math.max(Math.ceil(nodes.length / cols) - 1, 1)),
          label: n.label
        };
      });
    }
    const edgePaths = edges.map((e) => {
      const from = positions[e.from];
      const to = positions[e.to];
      if (!from || !to) return null;
      return {
        from: e.from,
        to: e.to,
        parallel: e.parallel,
        x1: from.x,
        y1: from.y,
        x2: to.x,
        y2: to.y
      };
    }).filter(Boolean);
    return { positions, edgePaths, skills: topology.skills || [], width, height };
  }
  function switchTopology(mode) {
    const topology = TOPOLOGIES[mode];
    if (!topology) throw new Error(`Unknown topology: ${mode}`);
    const layout = computeTopologyLayout(topology);
    return {
      mode,
      topology,
      tradeoffPanel: formatTradeoffPanel(topology.tradeoffs),
      metrics: {
        nodeCount: topology.nodes.length,
        edgeCount: (topology.edges || []).length,
        parallelEdges: (topology.edges || []).filter((e) => e.parallel).length
      },
      viz: {
        nodes: topology.nodes,
        edges: topology.edges || [],
        skills: topology.skills || [],
        flow: topology.flow,
        layout
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
  var GRAPH = {
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
      { from: "plan", to: "execute", conditional: true, label: "tools needed", branch: "tools" },
      { from: "plan", to: "reflect", conditional: true, label: "no tools", branch: "direct" },
      { from: "execute", to: "checkpoint", conditional: false },
      { from: "checkpoint", to: "hitl", conditional: true, label: "high risk", branch: "risk" },
      { from: "checkpoint", to: "reflect", conditional: true, label: "low risk", branch: "skip_hitl" },
      { from: "hitl", to: "reflect", conditional: false },
      { from: "reflect", to: "end", conditional: true, label: "done" }
    ]
  };
  function getLangGraphView() {
    return {
      nodes: GRAPH.nodes,
      edges: GRAPH.edges,
      highlights: {
        persistence: ["checkpoint"],
        interrupts: ["hitl"]
      },
      description: "Stateful graph with conditional routing. Checkpoint node persists state; HITL interrupt pauses for human approval before continuing."
    };
  }
  function getLangGraphBranches(nodeId) {
    return GRAPH.edges.filter((e) => e.from === nodeId && e.conditional).map((e) => ({ branch: e.branch, label: e.label, to: e.to }));
  }
  function stepLangGraph(state2, branchChoice = null) {
    const view = getLangGraphView();
    const current = state2.currentNode || "start";
    const node = view.nodes.find((n) => n.id === current);
    if (state2.complete) {
      return { state: state2, activeNode: "end", message: "Graph execution complete.", path: state2.path || [] };
    }
    const outgoing = GRAPH.edges.filter((e) => e.from === current);
    let nextEdge = outgoing.find((e) => !e.conditional);
    if (!nextEdge && branchChoice) {
      nextEdge = outgoing.find((e) => e.branch === branchChoice) || outgoing[0];
    } else if (!nextEdge && outgoing.length === 1) {
      nextEdge = outgoing[0];
    }
    const path = [...state2.path || [], current];
    const branches = getLangGraphBranches(current);
    if (branches.length > 0 && !branchChoice) {
      return {
        state: { ...state2, currentNode: current, awaitingBranch: true, path },
        activeNode: current,
        message: `At ${node.label}: choose branch \u2014 ${branches.map((b) => b.label).join(" or ")}`,
        branches,
        isPersistence: node.type === "persistence",
        isInterrupt: node.type === "interrupt"
      };
    }
    const nextNode = nextEdge?.to || "end";
    const nextNodeDef = view.nodes.find((n) => n.id === nextNode);
    const complete = nextNode === "end";
    return {
      state: {
        currentNode: nextNode,
        stepIndex: (state2.stepIndex ?? 0) + 1,
        complete,
        awaitingBranch: false,
        path: [...path, nextNode],
        lastBranch: branchChoice
      },
      activeNode: nextNode,
      message: `Transitioned to ${nextNodeDef?.label || nextNode}${nextNodeDef?.highlight ? " [highlighted]" : ""}`,
      branches: getLangGraphBranches(nextNode),
      isPersistence: nextNodeDef?.type === "persistence",
      isInterrupt: nextNodeDef?.type === "interrupt"
    };
  }
  function resetLangGraph() {
    return { stepIndex: 0, currentNode: "start", complete: false, awaitingBranch: false, path: [] };
  }
  function getLangGraphDisplay(state2) {
    const view = getLangGraphView();
    if (state2.complete) {
      return { activeNode: "end", message: "Graph execution complete.", branches: [] };
    }
    const current = state2.currentNode || "start";
    const node = view.nodes.find((n) => n.id === current);
    const branches = getLangGraphBranches(current);
    if (state2.awaitingBranch && branches.length > 0) {
      return {
        activeNode: current,
        message: `At ${node.label}: choose branch \u2014 ${branches.map((b) => b.label).join(" or ")}`,
        branches,
        isPersistence: node?.type === "persistence",
        isInterrupt: node?.type === "interrupt"
      };
    }
    if (current === "start" && !state2.path?.length) {
      return {
        activeNode: "start",
        message: "Ready \u2014 press Step Graph to begin at START",
        branches: [],
        isPersistence: false,
        isInterrupt: false
      };
    }
    return {
      activeNode: current,
      message: `At ${node.label}${node.highlight ? " [highlighted]" : ""}`,
      branches,
      isPersistence: node?.type === "persistence",
      isInterrupt: node?.type === "interrupt"
    };
  }

  // web/js/core/rag-simulator.js
  var FAILURE_POINTS = {
    vector: ["vector_search", "rerank", "generate"],
    graphrag: ["graph_traverse", "subgraph_build", "generate"],
    hybrid: ["vector_search", "graph_traverse", "fusion", "generate"]
  };
  function getRagFailurePoints(mode) {
    return FAILURE_POINTS[mode] || FAILURE_POINTS.vector;
  }
  function simulateRagCascade(mode, failurePoint = null) {
    const vectorPath = [
      { step: "query", status: "ok", detail: "User query embedded" },
      { step: "vector_search", status: failurePoint === "vector_search" ? "fail" : "ok", detail: "Top-5 chunks retrieved" },
      { step: "rerank", status: failurePoint === "rerank" ? "fail" : failurePoint === "vector_search" ? "cascade" : "ok", detail: "Cross-encoder reranking" },
      { step: "generate", status: ["vector_search", "rerank"].includes(failurePoint) ? "cascade" : "ok", detail: "LLM generates answer from chunks" },
      { step: "downstream", status: ["vector_search", "rerank"].includes(failurePoint) ? "cascade" : "ok", detail: "Agent acts on potentially wrong context" }
    ];
    const graphPath = [
      { step: "query", status: "ok", detail: "Entity extraction from query" },
      { step: "graph_traverse", status: failurePoint === "graph_traverse" ? "fail" : "ok", detail: "Multi-hop graph traversal" },
      { step: "subgraph_build", status: failurePoint === "subgraph_build" ? "fail" : failurePoint === "graph_traverse" ? "cascade" : "ok", detail: "Relevant subgraph assembled" },
      { step: "generate", status: ["graph_traverse", "subgraph_build"].includes(failurePoint) ? "cascade" : "ok", detail: "LLM generates from structured context" },
      { step: "downstream", status: ["graph_traverse", "subgraph_build"].includes(failurePoint) ? "cascade" : "ok", detail: "Relational errors propagate to tool calls" }
    ];
    const hybridPath = [
      { step: "query", status: "ok", detail: "Query split into vector + graph intents" },
      { step: "vector_search", status: failurePoint === "vector_search" ? "fail" : "ok", detail: "Dense retrieval branch" },
      { step: "graph_traverse", status: failurePoint === "graph_traverse" ? "fail" : "ok", detail: "Graph traversal branch" },
      { step: "fusion", status: failurePoint === "fusion" ? "fail" : ["vector_search", "graph_traverse"].includes(failurePoint) ? "cascade" : "ok", detail: "RRF fusion of both branches" },
      { step: "generate", status: ["vector_search", "graph_traverse", "fusion"].includes(failurePoint) ? "cascade" : "ok", detail: "LLM generates from fused context" },
      { step: "downstream", status: ["vector_search", "graph_traverse", "fusion", "generate"].includes(failurePoint) ? "cascade" : "ok", detail: "Downstream agent consumes fused result" }
    ];
    const paths = { vector: vectorPath, graphrag: graphPath, hybrid: hybridPath };
    const path = paths[mode] || vectorPath;
    const failures = path.filter((p) => p.status === "fail" || p.status === "cascade");
    const firstFail = path.find((p) => p.status === "fail");
    return {
      mode,
      path,
      failureCount: failures.length,
      failurePoint: firstFail?.step || null,
      recoveryHint: firstFail ? `Fallback: switch to ${mode === "vector" ? "hybrid" : "vector"} retrieval or inject grounding check before generate.` : "All retrieval stages healthy.",
      summary: mode === "graphrag" ? "GraphRAG handles relational queries but multi-hop failures cascade through subgraph and generation." : mode === "hybrid" ? "Hybrid retrieval tolerates single-branch failure but fusion errors affect both paths." : "Vector RAG fails silently on wrong chunks; downstream agent acts on ungrounded context."
    };
  }
  function getRagModes() {
    return ["vector", "graphrag", "hybrid"];
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
  function expandSpan(spanId) {
    const span = TRACE.spans.find((s) => s.id === spanId);
    if (!span) return null;
    const children = TRACE.spans.filter((s) => s.parent === spanId);
    const ancestors = [];
    let current = span;
    while (current?.parent) {
      const parent = TRACE.spans.find((s) => s.id === current.parent);
      if (parent) ancestors.unshift(parent);
      current = parent;
    }
    return {
      span,
      children,
      ancestors,
      totalDuration: span.duration + children.reduce((sum, c) => sum + c.duration, 0),
      hasError: span.status === "error" || children.some((c) => c.status === "error")
    };
  }
  function selectSpan(state2, spanId) {
    const expanded = expandSpan(spanId);
    if (!expanded) return { state: state2, expanded: null, message: "Span not found" };
    return {
      state: { ...state2, selectedSpanId: spanId },
      expanded,
      message: `${expanded.span.name}: ${expanded.span.duration}ms [${expanded.span.status}] \u2014 ${expanded.children.length} children`
    };
  }
  function injectFailureMode(state2, failureId) {
    const mode = TRACE.failureModes.find((f) => f.id === failureId);
    if (!mode) return { state: state2, injected: null, message: "Unknown failure mode" };
    const injected = [...state2.injectedFailures || []];
    if (!injected.includes(failureId)) injected.push(failureId);
    const mitigations = injected.map((id) => TRACE.failureModes.find((f) => f.id === id)?.mitigation).filter(Boolean);
    return {
      state: { ...state2, injectedFailures: injected },
      injected: mode,
      mitigations,
      message: `Injected: ${mode.risk}. Active mitigations: ${mitigations.join("; ")}`
    };
  }
  function createTraceState() {
    return { selectedSpanId: null, injectedFailures: [] };
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
  function removeNode(sketch, nodeId) {
    return {
      ...sketch,
      nodes: sketch.nodes.filter((n) => n.id !== nodeId),
      edges: sketch.edges.filter((e) => e.from !== nodeId && e.to !== nodeId)
    };
  }
  function removeEdge(sketch, fromId, toId) {
    return {
      ...sketch,
      edges: sketch.edges.filter((e) => !(e.from === fromId && e.to === toId))
    };
  }
  function clearSketch(sketch, name = sketch.name) {
    return { ...sketch, name, nodes: [], edges: [], annotations: "" };
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

  // web/js/core/sketch-render.js
  var NODE_COLORS = {
    Agent: "#6366f1",
    Tool: "#22d3ee",
    Memory: "#a78bfa",
    HITL: "#f59e0b",
    Guardrail: "#f87171",
    Router: "#34d399"
  };
  function edgeMidpoint(from, to) {
    return {
      x: (from.x + 50 + to.x + 50) / 2,
      y: (from.y + 40 + to.y) / 2
    };
  }
  function renderSketchSvg(sketch, selectedNodeId = null) {
    const nodeEls = sketch.nodes.map((n) => {
      const selected = selectedNodeId === n.id ? " selected-first" : "";
      return `<g class="graph-node canvas-node${selected}" data-node-id="${n.id}" role="button" tabindex="0" aria-label="${n.type} ${n.label}">
      <rect class="node-rect" x="${n.x}" y="${n.y}" width="100" height="40" rx="8" fill="${NODE_COLORS[n.type] || "#6366f1"}" opacity="0.9"/>
      <text x="${n.x + 50}" y="${n.y + 18}" text-anchor="middle" fill="white" font-size="8" pointer-events="none" opacity="0.8">${n.type}</text>
      <text x="${n.x + 50}" y="${n.y + 32}" text-anchor="middle" fill="white" font-size="10" pointer-events="none">${n.label}</text>
    </g>`;
    }).join("");
    const edgeEls = sketch.edges.map((e) => {
      const from = sketch.nodes.find((n) => n.id === e.from);
      const to = sketch.nodes.find((n) => n.id === e.to);
      if (!from || !to) return "";
      const mid = edgeMidpoint(from, to);
      const labelEl = e.label ? `<text x="${mid.x}" y="${mid.y - 4}" text-anchor="middle" fill="#8b9cb3" font-size="9" pointer-events="none">${e.label}</text>` : "";
      return `<g class="edge-group" data-edge-from="${e.from}" data-edge-to="${e.to}">
      <line x1="${from.x + 50}" y1="${from.y + 40}" x2="${to.x + 50}" y2="${to.y}" stroke="#22d3ee" stroke-width="2" marker-end="url(#arrow)"/>
      ${labelEl}
    </g>`;
    }).join("");
    const defs = `<defs><marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee"/></marker></defs>`;
    return `<svg xmlns="http://www.w3.org/2000/svg" class="workspace-svg" width="800" height="400" viewBox="0 0 800 400" aria-label="Architecture sketch">${defs}<rect width="800" height="400" fill="#0a0e14" class="canvas-bg"/>${edgeEls}${nodeEls}</svg>`;
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
    const errors = [...wizard.errors, ...nodeErrors];
    return {
      ...wizard,
      complete: wizard.complete && nodeErrors.length === 0,
      sketchValid: nodeErrors.length === 0,
      errors
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

  // web/js/core/workspace-controller.js
  function createDefaultWorkspace() {
    return {
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
      selectedNodeId: null,
      edgeSelection: { first: null },
      drag: { nodeId: null, offsetX: 0, offsetY: 0 }
    };
  }
  function cloneSketch(sketch) {
    return {
      ...sketch,
      nodes: sketch.nodes.map((n) => ({ ...n })),
      edges: sketch.edges.map((e) => ({ ...e })),
      annotations: sketch.annotations ?? ""
    };
  }
  function cloneWorkspace(ws) {
    return {
      ...ws,
      sketch: cloneSketch(ws.sketch),
      wizard: {
        ...ws.wizard,
        tradeoffs: [...ws.wizard.tradeoffs],
        failures: ws.wizard.failures.map((f) => ({ ...f }))
      },
      edgeSelection: { ...ws.edgeSelection },
      drag: { ...ws.drag }
    };
  }
  function clearEdgeSelection(ws) {
    return { ...ws, edgeSelection: { first: null } };
  }
  function nodeExists(sketch, nodeId) {
    return sketch.nodes.some((n) => n.id === nodeId);
  }
  function addValidatedEdge(sketch, fromId, toId, label = "") {
    if (!nodeExists(sketch, fromId) || !nodeExists(sketch, toId)) {
      return sketch;
    }
    if (fromId === toId) return sketch;
    const duplicate = sketch.edges.some((e) => e.from === fromId && e.to === toId);
    if (duplicate) return sketch;
    return {
      ...sketch,
      edges: [...sketch.edges, { from: fromId, to: toId, label: label || "flow" }]
    };
  }
  function loadCapstone(workspace, capstone) {
    const ws = cloneWorkspace(workspace);
    ws.sketch = createSketch(capstone.name, capstone);
    ws.wizard = { ...ws.wizard, scenario: capstone.description };
    ws.edgeSelection = { first: null };
    ws.selectedNodeId = null;
    return ws;
  }
  function resetSketch(workspace, name = "Re-sketch Challenge") {
    const ws = cloneWorkspace(workspace);
    ws.sketch = createSketch(name);
    ws.edgeSelection = { first: null };
    ws.selectedNodeId = null;
    return ws;
  }
  function clearCanvas(workspace) {
    const ws = cloneWorkspace(workspace);
    ws.sketch = clearSketch(ws.sketch);
    ws.edgeSelection = { first: null };
    ws.selectedNodeId = null;
    return ws;
  }
  function deleteSelectedNode(workspace) {
    const ws = cloneWorkspace(workspace);
    if (!ws.selectedNodeId) return ws;
    ws.sketch = removeNode(ws.sketch, ws.selectedNodeId);
    ws.selectedNodeId = null;
    ws.edgeSelection = { first: null };
    return ws;
  }
  function deleteLastEdge(workspace) {
    const ws = cloneWorkspace(workspace);
    if (!ws.sketch.edges.length) return ws;
    const last = ws.sketch.edges[ws.sketch.edges.length - 1];
    ws.sketch = removeEdge(ws.sketch, last.from, last.to);
    return ws;
  }
  function setSelectedNodeType(workspace, nodeType) {
    return { ...cloneWorkspace(workspace), selectedNodeType: nodeType };
  }
  function selectCanvasNode(workspace, nodeId) {
    const ws = cloneWorkspace(workspace);
    if (!nodeExists(ws.sketch, nodeId)) {
      return { ...ws, selectedNodeId: null };
    }
    return { ...ws, selectedNodeId: nodeId };
  }
  function setWizardField(workspace, key, value) {
    const ws = cloneWorkspace(workspace);
    if (key === "scenario" || key === "justify" || key === "costLatency") {
      ws.wizard[key] = value;
    } else if (key === "annotations") {
      ws.sketch = setAnnotations(ws.sketch, value);
    } else if (key.startsWith("tradeoff:")) {
      const idx = Number(key.split(":")[1]);
      ws.wizard.tradeoffs[idx] = value;
    } else if (key.startsWith("fail-risk:")) {
      const idx = Number(key.split(":")[1]);
      ws.wizard.failures[idx] = { ...ws.wizard.failures[idx], risk: value };
    } else if (key.startsWith("fail-mit:")) {
      const idx = Number(key.split(":")[1]);
      ws.wizard.failures[idx] = { ...ws.wizard.failures[idx], mitigation: value };
    } else if (key === "teachBackCompleted") {
      ws.wizard.teachBackCompleted = Boolean(value);
    }
    return ws;
  }
  function placeNode(workspace, type, x, y, label = type) {
    const ws = clearEdgeSelection(cloneWorkspace(workspace));
    ws.sketch = addNode(ws.sketch, type, label, x, y);
    return ws;
  }
  function moveNodeOnCanvas(workspace, nodeId, x, y) {
    const ws = cloneWorkspace(workspace);
    if (!nodeExists(ws.sketch, nodeId)) return clearEdgeSelection(ws);
    ws.sketch = moveNode(ws.sketch, nodeId, x, y);
    return ws;
  }
  function selectNodeForEdge(workspace, nodeId) {
    const ws = cloneWorkspace(workspace);
    if (!nodeExists(ws.sketch, nodeId)) {
      return clearEdgeSelection({ ...ws, selectedNodeId: null });
    }
    ws.selectedNodeId = nodeId;
    const first = ws.edgeSelection.first;
    if (!first) {
      return { ...ws, edgeSelection: { first: nodeId } };
    }
    if (first === nodeId) {
      return clearEdgeSelection(ws);
    }
    const fromNode = ws.sketch.nodes.find((n) => n.id === first);
    const toNode = ws.sketch.nodes.find((n) => n.id === nodeId);
    const label = `${fromNode?.type || "node"}\u2192${toNode?.type || "node"}`.toLowerCase();
    const updatedSketch = addValidatedEdge(ws.sketch, first, nodeId, label);
    return {
      ...ws,
      sketch: updatedSketch,
      edgeSelection: { first: null }
    };
  }
  function setDragState(workspace, drag) {
    return { ...cloneWorkspace(workspace), drag: { ...drag } };
  }
  function saveCompareSketch(workspace) {
    const ws = cloneWorkspace(workspace);
    ws.compareSketch = JSON.parse(JSON.stringify(ws.sketch));
    return ws;
  }

  // web/js/core/workspace-shell.js
  function applyWizardInput(workspace, key, value) {
    return setWizardField(workspace, key, value);
  }
  function getWorkspaceChromeState(workspace) {
    const validation = validateSketch(workspace.sketch, workspace.wizard);
    return {
      countLabel: `${workspace.sketch.nodes.length} nodes, ${workspace.sketch.edges.length} edges`,
      statusText: validation.complete ? "Interview-ready structure \u2713" : validation.errors.join("; "),
      complete: validation.complete,
      errors: validation.errors
    };
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
  var MIN_KEYWORDS = 3;
  var MIN_CHARS = 60;
  var MIN_WORDS = 12;
  function evaluateCheckpoint(answer, checkpoint) {
    const raw = (answer || "").trim();
    const normalized = raw.toLowerCase();
    const keywords = checkpoint.keywords || [];
    const matched = keywords.filter((kw) => normalized.includes(kw.toLowerCase()));
    const words = raw.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const reasons = [];
    if (!raw) reasons.push("Answer is empty");
    if (matched.length < MIN_KEYWORDS) {
      reasons.push(`Need at least ${MIN_KEYWORDS} key concepts (found ${matched.length}: ${matched.join(", ") || "none"})`);
    }
    if (raw.length < MIN_CHARS) {
      reasons.push(`Need at least ${MIN_CHARS} characters of substantive reasoning (have ${raw.length})`);
    }
    if (wordCount < MIN_WORDS) {
      reasons.push(`Need at least ${MIN_WORDS} words (have ${wordCount})`);
    }
    const missing = keywords.filter((kw) => !normalized.includes(kw.toLowerCase())).slice(0, 5);
    const pass = reasons.length === 0;
    return {
      pass,
      matchedKeywords: matched,
      missingKeywords: missing,
      metrics: { wordCount, charCount: raw.length, keywordHits: matched.length },
      explanation: checkpoint.explanation,
      feedback: pass ? `Strong answer \u2014 ${matched.length} concepts detected (${matched.join(", ")}). ${wordCount} words of reasoning.` : `${reasons.join(". ")}. Missing concepts to consider: ${missing.join(", ")}. Hint: ${checkpoint.explanation}`
    };
  }

  // web/js/core/dom-utils.js
  function escapeHtml(str) {
    return String(str ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
  }
  function showToast(message, type = "info", durationMs = 3200) {
    if (typeof document === "undefined") return;
    let container = document.getElementById("toast-container");
    if (!container) {
      container = document.createElement("div");
      container.id = "toast-container";
      container.setAttribute("role", "status");
      container.setAttribute("aria-live", "polite");
      document.body.appendChild(container);
    }
    const toast = document.createElement("div");
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add("visible"));
    setTimeout(() => {
      toast.classList.remove("visible");
      setTimeout(() => toast.remove(), 300);
    }, durationMs);
  }

  // web/js/app.js
  var state = {
    view: "dashboard",
    progress: loadProgress(),
    moduleId: 1,
    react: createReactState(false),
    topology: "supervisor",
    langgraph: resetLangGraph(),
    rag: { mode: "vector", failurePoint: null },
    timeline: createTimelineState(),
    trace: createTraceState(),
    hitl: createHitlState(),
    workspace: createDefaultWorkspace(),
    resourceSearch: "",
    sidebarCollapsed: false
  };
  var main = document.getElementById("main-content");
  var reviewNudges = document.getElementById("review-nudges");
  function init() {
    state.progress = recordActivity(state.progress);
    bindNav();
    bindSidebarToggle();
    render();
    document.addEventListener("keydown", handleGlobalKeys);
  }
  function bindSidebarToggle() {
    const btn = document.getElementById("sidebar-toggle");
    const sidebar = document.getElementById("sidebar");
    if (!btn || !sidebar) return;
    btn.addEventListener("click", () => {
      state.sidebarCollapsed = !state.sidebarCollapsed;
      sidebar.classList.toggle("collapsed", state.sidebarCollapsed);
      btn.setAttribute("aria-expanded", String(!state.sidebarCollapsed));
    });
  }
  function bindNav() {
    document.querySelectorAll(".nav-link").forEach((btn) => {
      btn.addEventListener("click", () => {
        state.view = btn.dataset.view;
        if (state.view === "modules" && !state.moduleId) state.moduleId = 1;
        document.querySelectorAll(".nav-link").forEach((b) => b.classList.toggle("active", b.dataset.view === state.view));
        render();
        main.focus();
      });
    });
  }
  function handleGlobalKeys(e) {
    if (e.key === "s" && e.ctrlKey && state.view === "pattern-lab") {
      e.preventDefault();
      stepCurrentSimulator();
    }
    if (e.key === "Delete" && state.view === "workspace" && state.workspace.selectedNodeId) {
      e.preventDefault();
      state.workspace = deleteSelectedNode(state.workspace);
      syncWorkspaceChrome();
      showToast("Node deleted", "info");
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
    const rings = computeModuleRings(state.progress);
    const review = computeReviewItems(state.progress);
    main.innerHTML = `
    <div class="page-header"><h2>Dashboard</h2><span class="badge">Day ${review.daysSinceStart || 1}</span></div>
    <div class="dashboard-stats">
      <div class="stat-card"><div class="stat-value">${rings.completed}</div><div class="stat-label">Modules complete</div></div>
      <div class="stat-card"><div class="stat-value">${rings.percent}%</div><div class="stat-label">Progress</div></div>
      <div class="stat-card"><div class="stat-value">${state.progress.streak.count}</div><div class="stat-label">Day streak</div></div>
      <div class="stat-card"><div class="stat-value">${review.items.length}</div><div class="stat-label">Reviews due</div></div>
    </div>
    <div class="glass-card">
      <h3>Your Learning Journey</h3>
      <p>14\u201322 hours over 7\u201314 days. Breadth-first interview prep for production enterprise AI agents.</p>
      <table class="timeline-table" aria-label="Suggested timeline">
        <thead><tr><th>Days</th><th>Focus</th><th>Hours</th></tr></thead>
        <tbody>${TIMELINE.map((t) => `<tr><td>${escapeHtml(t.days)}</td><td>${escapeHtml(t.focus)}</td><td>${escapeHtml(t.hours)}</td></tr>`).join("")}</tbody>
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
    const completed = state.progress.moduleCompletion?.[mod.id];
    main.innerHTML = `
    <div class="page-header">
      <h2>Module ${mod.id}: ${escapeHtml(mod.title)}</h2>
      ${completed ? '<span class="badge tag success">Complete</span>' : '<span class="badge">In progress</span>'}
    </div>
    <div class="module-grid" role="navigation" aria-label="Module navigation">
      ${MODULES.map((m) => {
      const done = state.progress.moduleCompletion?.[m.id];
      return `<button class="module-card ${m.id === mod.id ? "active" : ""} ${done ? "done" : ""}" data-mod="${m.id}" aria-label="Module ${m.id}">
          <div class="mod-num">Module ${m.id}</div>
          <div class="mod-title">${escapeHtml(m.title)}</div>
        </button>`;
    }).join("")}
    </div>
    <div class="glass-card">
      <h3>Objectives</h3>
      <ul>${mod.objectives.map((o) => `<li>${escapeHtml(o)}</li>`).join("")}</ul>
      <h3>Key Topics</h3>
      <div>${mod.lingo.map((l) => `<span class="tag" title="${escapeHtml(l)}">${escapeHtml(l)}</span>`).join("")}</div>
      <h3>Active Practice</h3>
      <ul>${mod.practice.map((p) => `<li>${escapeHtml(p)}</li>`).join("")}</ul>
    </div>
    <div class="glass-card">
      <h3>Checkpoints</h3>
      <p class="tag hint">Answers need 3+ key concepts, 60+ characters, and 12+ words of reasoning.</p>
      ${mod.checkpoints.map((cp, i) => {
      const saved = state.progress.checkpointAnswers?.[`m${mod.id}-cp${i}`];
      return `
        <div class="wizard-step" data-cp="${i}">
          <label>${escapeHtml(cp.question)}</label>
          <p class="tag hint">Key concepts: ${cp.keywords.slice(0, 5).join(", ")}\u2026</p>
          <textarea aria-label="Checkpoint answer ${i + 1}" data-cp-input="${i}" placeholder="Explain your reasoning with enterprise context\u2026">${saved?.answer || ""}</textarea>
          <button class="btn" data-cp-submit="${i}">Submit</button>
          <div class="checkpoint-result ${saved?.result?.pass ? "pass" : saved?.result ? "fail" : ""}" id="cp-result-${i}" aria-live="polite">${saved?.result?.feedback || ""}</div>
        </div>`;
    }).join("")}
    </div>
    <div>
      <button class="btn btn-secondary" data-prev ${mod.id <= 1 ? "disabled" : ""}>\u2190 Previous</button>
      <button class="btn" data-next ${mod.id >= 9 ? "disabled" : ""}>Next Module \u2192</button>
      <button class="btn btn-secondary" data-goto-sim>Open Simulator</button>
    </div>`;
    main.querySelectorAll("[data-mod]").forEach((btn) => {
      btn.onclick = () => {
        state.moduleId = Number(btn.dataset.mod);
        render();
      };
    });
    mod.checkpoints.forEach((cp, i) => {
      const textarea = main.querySelector(`[data-cp-input="${i}"]`);
      textarea?.addEventListener("input", () => {
        const words = textarea.value.trim().split(/\s+/).filter(Boolean).length;
        const chars = textarea.value.trim().length;
        textarea.setAttribute("aria-describedby", `cp-metrics-${i}`);
        let metrics = main.querySelector(`#cp-metrics-${i}`);
        if (!metrics) {
          metrics = document.createElement("div");
          metrics.id = `cp-metrics-${i}`;
          metrics.className = "checkpoint-metrics";
          textarea.parentElement.appendChild(metrics);
        }
        metrics.innerHTML = `<span class="tag">${words} words</span><span class="tag">${chars} chars</span>`;
      });
      textarea?.dispatchEvent(new Event("input"));
      main.querySelector(`[data-cp-submit="${i}"]`).onclick = () => {
        const answer = textarea.value;
        const result = evaluateCheckpoint(answer, cp);
        const el = document.getElementById(`cp-result-${i}`);
        el.className = `checkpoint-result ${result.pass ? "pass" : "fail"}`;
        el.textContent = result.feedback;
        state.progress.checkpointAnswers[`m${mod.id}-cp${i}`] = { answer, result, timestamp: Date.now() };
        if (result.pass) {
          state.progress = markModuleComplete(state.progress, mod.id);
          saveProgress(state.progress);
          showToast(`Module ${mod.id} checkpoint passed`, "success");
        } else {
          showToast("Add more depth and key concepts", "error");
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
      <p class="tag hint">Tip: Ctrl+S steps ReAct forward</p>
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
    const scenarios = getReactScenarios();
    el.innerHTML = `
    <div class="glass-card">
      <h3>ReAct Loop Stepper</h3>
      <label for="react-scenario">Scenario</label>
      <select id="react-scenario" aria-label="ReAct scenario">
        ${scenarios.map((s) => `<option value="${s.id}" ${state.react.scenarioId === s.id ? "selected" : ""}>${escapeHtml(s.label)} (${s.stepCount} steps)</option>`).join("")}
      </select>
      <label><input type="checkbox" id="reflection-toggle" ${state.react.reflectionEnabled ? "checked" : ""} aria-label="Enable reflection critic"> Reflection critic</label>
      <div class="sim-display" id="react-display" aria-live="polite">${last ? escapeHtml(last.text) : "Press Step to begin the Thought \u2192 Action \u2192 Observation cycle."}</div>
      <div class="metrics-bar" id="react-metrics"></div>
      <button class="btn" id="react-step" aria-label="Step forward">Step Forward</button>
      <button class="btn btn-secondary" id="react-reset">Reset</button>
    </div>`;
    document.getElementById("react-scenario").onchange = (e) => {
      const r = reactStep(state.react, "setScenario", e.target.value);
      state.react = r.state;
      renderReactSim(el);
      showToast(r.display, "info");
    };
    document.getElementById("reflection-toggle").onchange = (e) => {
      state.react = toggleReflection(state.react, e.target.checked);
      renderReactSim(el);
    };
    document.getElementById("react-step").onclick = () => {
      const { state: newState, display, metrics } = reactStep(state.react);
      state.react = newState;
      const displayEl = document.getElementById("react-display");
      displayEl.innerHTML = `<span class="pulse">${escapeHtml(display)}</span>`;
      if (metrics) {
        document.getElementById("react-metrics").innerHTML = `
        <span class="metric-chip">Phase: ${metrics.phase}</span>
        <span class="metric-chip">Latency: ${metrics.latency.toFixed(1)}s</span>
        <span class="metric-chip">Cost: $${metrics.cost.toFixed(2)}</span>
        <span class="metric-chip">Quality: ${(metrics.quality * 100).toFixed(0)}%</span>`;
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
    const { layout } = result.viz;
    const nodeEls = Object.entries(layout.positions).map(
      ([id, pos]) => `<circle class="graph-node active" cx="${pos.x}" cy="${pos.y}" r="22" fill="#6366f1" stroke="#22d3ee" stroke-width="2"/>
     <text x="${pos.x}" y="${pos.y + 4}" text-anchor="middle" fill="white" font-size="8">${escapeHtml(pos.label.split(" ")[0])}</text>`
    ).join("");
    const edgeEls = layout.edgePaths.map(
      (e) => `<line x1="${e.x1}" y1="${e.y1}" x2="${e.x2}" y2="${e.y2}" stroke="${e.parallel ? "#f59e0b" : "#22d3ee"}" stroke-width="${e.parallel ? 3 : 2}" stroke-dasharray="${e.parallel ? "6 3" : "none"}"/>`
    ).join("");
    el.innerHTML = `
    <div class="glass-card">
      <h3>${escapeHtml(result.topology.name)}</h3>
      <div role="group" aria-label="Topology mode">
        ${getTopologyModes().map((m) => `<button class="btn btn-sm ${m === state.topology ? "" : "btn-secondary"}" data-topo="${m}">${m}</button>`).join("")}
      </div>
      <div class="metrics-bar">
        <span class="metric-chip">${result.metrics.nodeCount} nodes</span>
        <span class="metric-chip">${result.metrics.edgeCount} edges</span>
        <span class="metric-chip">${result.metrics.parallelEdges} parallel</span>
      </div>
      <div class="tradeoff-panel" aria-label="Tradeoff panel">${escapeHtml(result.tradeoffPanel)}</div>
      <svg class="topo-svg" viewBox="0 0 ${layout.width} ${layout.height}" aria-label="Topology graph" id="topo-svg">${edgeEls}${nodeEls}</svg>
      ${layout.skills.length ? `<p><strong>Skills:</strong> ${layout.skills.map((s) => `<span class="tag">${s}</span>`).join("")}</p>` : ""}
      <p><strong>Flow:</strong> ${result.viz.flow.map(escapeHtml).join(" \u2192 ")}</p>
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
    const display = getLangGraphDisplay(state.langgraph);
    el.innerHTML = `
    <div class="glass-card">
      <h3>LangGraph State Viewer</h3>
      <p>${escapeHtml(view.description)}</p>
      <svg width="100%" height="120" aria-label="LangGraph">
        ${view.nodes.map((n, i) => `<g class="graph-node ${n.id === display.activeNode ? "active" : ""} ${n.type === "persistence" ? "persistence" : ""} ${n.type === "interrupt" ? "interrupt" : ""}">
          <rect x="${i * 90 + 10}" y="40" width="70" height="40" rx="6" fill="#1a2332" stroke="${n.highlight ? "#f59e0b" : "#6366f1"}"/>
          <text x="${i * 90 + 45}" y="65" text-anchor="middle" fill="white" font-size="9">${escapeHtml(n.label)}</text>
        </g>`).join("")}
      </svg>
      <div class="sim-display" id="lg-display" aria-live="polite">${escapeHtml(display.message || "Ready")}</div>
      ${display.branches?.length ? `<div class="branch-group" role="group" aria-label="Branch choices">
        ${display.branches.map((b) => `<button class="btn btn-sm btn-secondary" data-branch="${b.branch}">${escapeHtml(b.label)}</button>`).join("")}
      </div>` : ""}
      <button class="btn" id="lg-step">Step Graph</button>
      <button class="btn btn-secondary" id="lg-reset">Reset</button>
    </div>`;
    el.querySelectorAll("[data-branch]").forEach((btn) => {
      btn.onclick = () => {
        const r = stepLangGraph(state.langgraph, btn.dataset.branch);
        state.langgraph = r.state;
        renderLangGraphSim(el);
      };
    });
    document.getElementById("lg-step").onclick = () => {
      const r = stepLangGraph(state.langgraph);
      state.langgraph = r.state;
      renderLangGraphSim(el);
    };
    document.getElementById("lg-reset").onclick = () => {
      state.langgraph = resetLangGraph();
      renderLangGraphSim(el);
    };
  }
  function renderRagSim(el) {
    const result = simulateRagCascade(state.rag.mode, state.rag.failurePoint);
    const failPoints = getRagFailurePoints(state.rag.mode);
    el.innerHTML = `
    <div class="glass-card">
      <h3>Retrieval Failure Cascade</h3>
      <select id="rag-mode" aria-label="RAG mode">
        ${getRagModes().map((m) => `<option value="${m}" ${state.rag.mode === m ? "selected" : ""}>${m}</option>`).join("")}
      </select>
      <select id="rag-fail" aria-label="Failure point">
        <option value="">No failure (healthy)</option>
        ${failPoints.map((fp) => `<option value="${fp}" ${state.rag.failurePoint === fp ? "selected" : ""}>${fp} fail</option>`).join("")}
      </select>
      <div class="metrics-bar">
        <span class="metric-chip">${result.failureCount} failures/cascades</span>
        ${result.failurePoint ? `<span class="metric-chip warn">Root: ${result.failurePoint}</span>` : ""}
      </div>
      <div class="sim-display">${result.path.map((p) => `[${p.status.toUpperCase()}] ${p.step}: ${p.detail}`).join("\n")}</div>
      <p class="tag hint">${escapeHtml(result.recoveryHint)}</p>
      <p>${escapeHtml(result.summary)}</p>
    </div>`;
    document.getElementById("rag-mode").onchange = (e) => {
      state.rag.mode = e.target.value;
      state.rag.failurePoint = null;
      renderRagSim(el);
    };
    document.getElementById("rag-fail").onchange = (e) => {
      state.rag.failurePoint = e.target.value || null;
      renderRagSim(el);
    };
  }
  function renderTimelineSim(el) {
    const tl = state.timeline;
    el.innerHTML = `
    <div class="glass-card">
      <h3>Checkpoint Timeline</h3>
      <div class="sim-display" id="tl-display">
Phases: ${getPhases().map((p) => p.label).join(" \u2192 ")}
Checkpoints saved: ${tl.checkpoints.length}
Status: ${tl.crashed ? "CRASHED" : tl.resumed ? "RESUMED" : "Running"}
      </div>
      <button class="btn" id="tl-advance">Advance Phase</button>
      <button class="btn btn-secondary" id="tl-crash">Simulate Crash</button>
      <button class="btn" id="tl-resume">Resume from Checkpoint</button>
      <button class="btn btn-secondary" id="tl-reset">Reset Timeline</button>
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
      showToast("Crash simulated", "error");
    };
    document.getElementById("tl-resume").onclick = () => {
      const r = simulateResume(state.timeline);
      state.timeline = r.state;
      update(r.message);
      showToast(r.resumed ? "Resumed from checkpoint" : "No checkpoint", r.resumed ? "success" : "error");
    };
    document.getElementById("tl-reset").onclick = () => {
      state.timeline = createTimelineState();
      renderTimelineSim(el);
    };
  }
  function renderTraceSim(el) {
    const trace = getTrace();
    const selected = state.trace.selectedSpanId;
    const expanded = selected ? selectSpan(state.trace, selected).expanded : null;
    el.innerHTML = `
    <div class="glass-card">
      <h3>Trace Viewer</h3>
      <ul class="span-list" role="listbox" aria-label="Trace spans">
        ${trace.spans.map((s) => `<li class="${s.status === "error" ? "error" : ""} ${selected === s.id ? "selected" : ""}" data-span="${s.id}" role="option">${s.name} (${s.duration}ms) [${s.status}]</li>`).join("")}
      </ul>
      <div class="sim-display" id="span-detail" aria-live="polite">${expanded ? `${expanded.span.name}: ${expanded.totalDuration}ms total, ${expanded.children.length} children, error=${expanded.hasError}` : "Click a span to expand"}</div>
      <h3>Failure Modes (inject)</h3>
      <div role="group" aria-label="Failure injection">
        ${getFailureModes().map((f) => `<button class="btn btn-sm btn-secondary" data-fail="${f.id}">${escapeHtml(f.risk)}</button>`).join("")}
      </div>
      <div id="fail-detail" class="tag hint"></div>
    </div>`;
    el.querySelectorAll("[data-span]").forEach((li) => {
      li.onclick = () => {
        const r = selectSpan(state.trace, li.dataset.span);
        state.trace = r.state;
        renderTraceSim(el);
      };
    });
    el.querySelectorAll("[data-fail]").forEach((btn) => {
      btn.onclick = () => {
        const r = injectFailureMode(state.trace, btn.dataset.fail);
        state.trace = r.state;
        document.getElementById("fail-detail").textContent = r.message;
        showToast(r.injected ? `Injected: ${r.injected.risk}` : "Unknown failure", "info");
      };
    });
  }
  function renderHitlSim(el) {
    const gates = getHitlGates();
    const placed = state.hitl.placed || [];
    el.innerHTML = `
    <div class="glass-card">
      <h3>HITL / Guardrail Placement</h3>
      <p class="tag">${placed.length} gates placed \xB7 ${placed.filter((id) => gates.find((g) => g.id === id)?.leverage === "high").length} high-leverage</p>
      <div role="group" aria-label="HITL gates">
        ${gates.map((g) => `<button class="btn btn-sm ${placed.includes(g.id) ? "btn-success" : "btn-secondary"}" data-gate="${g.id}" aria-label="Place ${g.label}">${escapeHtml(g.label)}</button>`).join("")}
      </div>
      <div id="hitl-checklist"></div>
      <button class="btn btn-secondary" id="hitl-reset">Reset Gates</button>
    </div>`;
    if (placed.length) {
      const r = placeHitlGate(state.hitl, placed[placed.length - 1]);
      if (r.checklist) {
        document.getElementById("hitl-checklist").innerHTML = `<ul>${r.checklist.map((c) => `<li>${c.done ? "\u2713" : "\u25CB"} ${escapeHtml(c.label)}</li>`).join("")}</ul>`;
      }
    }
    el.querySelectorAll("[data-gate]").forEach((btn) => {
      btn.onclick = () => {
        const r = placeHitlGate(state.hitl, btn.dataset.gate);
        if (r.error) {
          showToast(r.error, "error");
          return;
        }
        state.hitl = r.state;
        renderHitlSim(el);
        showToast(`Placed: ${r.gate.label}`, "success");
      };
    });
    document.getElementById("hitl-reset").onclick = () => {
      state.hitl = createHitlState();
      renderHitlSim(el);
    };
  }
  function renderIntegrationSim(el) {
    const diff = getIntegrationDiff();
    el.innerHTML = `
    <div class="glass-card">
      <h3>Prototype \u2192 Enterprise Integration</h3>
      <table class="timeline-table"><thead><tr><th>Concern</th><th>Prototype</th><th>Enterprise</th></tr></thead>
        <tbody>${Object.keys(diff.prototype).map((k) => `<tr><td>${escapeHtml(k)}</td><td>${escapeHtml(diff.prototype[k])}</td><td>${escapeHtml(diff.enterprise[k])}</td></tr>`).join("")}</tbody>
      </table>
      <h3>2026 Trends</h3>
      ${diff.trends2026.map((t) => `<div class="tag">${escapeHtml(t.title)}: ${escapeHtml(t.impact)}</div>`).join("")}
    </div>`;
  }
  function stepCurrentSimulator() {
    if (state.labSimulator === "react" || !state.labSimulator) {
      const { state: newState } = reactStep(state.react);
      state.react = newState;
      renderPatternLab();
    }
  }
  function renderWorkspace() {
    const w = state.workspace;
    const validation = validateSketch(w.sketch, w.wizard);
    main.innerHTML = `
    <h2>Architect Workspace</h2>
    <div class="glass-card">
      <h3>Capstone Templates</h3>
      ${CAPSTONES.map((c) => `<button class="btn btn-secondary" data-capstone="${c.id}">${escapeHtml(c.name)}</button>`).join("")}
    </div>
    <div class="workspace-layout">
      <div>
        <div class="node-palette" role="group" aria-label="Node palette">
          ${NODE_TYPES.map((t) => `<button class="palette-btn ${w.selectedNodeType === t ? "selected" : ""}" data-node-type="${t}" aria-label="Add ${t}">${t}</button>`).join("")}
        </div>
        <div class="canvas-toolbar">
          <span class="tag hint">Click canvas to place \xB7 Drag to move \xB7 Click two nodes to connect \xB7 Del to delete selected</span>
          <button class="btn btn-sm btn-danger" id="delete-node" ${!w.selectedNodeId ? "disabled" : ""}>Delete Node</button>
          <button class="btn btn-sm btn-secondary" id="delete-edge" ${!w.sketch.edges.length ? "disabled" : ""}>Undo Last Edge</button>
          <button class="btn btn-sm btn-secondary" id="clear-canvas">Clear Canvas</button>
        </div>
        <p id="edge-hint" class="tag" aria-live="polite"></p>
        <div class="canvas-wrap" id="canvas-wrap" role="img" aria-label="Architecture canvas 800 by 400"></div>
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
        state.workspace = loadCapstone(state.workspace, cap);
        renderWorkspace();
        showToast(`Loaded: ${cap.name}`, "success");
      };
    });
    main.querySelectorAll("[data-node-type]").forEach((btn) => {
      btn.onclick = () => {
        state.workspace = setSelectedNodeType(state.workspace, btn.dataset.nodeType);
        renderWorkspace();
      };
    });
    document.getElementById("delete-node").onclick = () => {
      state.workspace = deleteSelectedNode(state.workspace);
      syncWorkspaceChrome();
      showToast("Node deleted", "info");
    };
    document.getElementById("delete-edge").onclick = () => {
      state.workspace = deleteLastEdge(state.workspace);
      syncWorkspaceChrome();
      showToast("Last edge removed", "info");
    };
    document.getElementById("clear-canvas").onclick = () => {
      state.workspace = clearCanvas(state.workspace);
      syncWorkspaceChrome();
      showToast("Canvas cleared", "info");
    };
    document.getElementById("export-btn").onclick = () => exportWorkspace();
    updateEdgeHint();
    document.getElementById("save-compare").onclick = () => {
      state.workspace = saveCompareSketch(state.workspace);
      const diff = compareSketches(state.workspace.compareSketch, state.workspace.sketch);
      document.getElementById("compare-view").innerHTML = `<div><pre>${escapeHtml(diff.summary)}</pre></div><div>${renderSketchSvg(state.workspace.sketch)}</div>`;
      showToast("Sketch saved for compare", "success");
    };
    bindWizardInputs();
    document.getElementById("teach-back-btn").onclick = startTeachBackTimer;
  }
  function renderWizardField(step, i, w) {
    if (i === 0) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><textarea data-wizard="scenario">${escapeHtml(w.wizard.scenario)}</textarea></div>`;
    if (i === 1) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><p data-sketch-count>${w.sketch.nodes.length} nodes, ${w.sketch.edges.length} edges</p><label>Annotations</label><textarea data-wizard="annotations" aria-label="Sketch annotations">${escapeHtml(w.sketch.annotations || "")}</textarea></div>`;
    if (i === 2) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><textarea data-wizard="justify">${escapeHtml(w.wizard.justify)}</textarea></div>`;
    if (i === 3) return `<div class="wizard-step"><label>${escapeHtml(step)}</label>${w.wizard.tradeoffs.map((t, j) => `<input type="text" data-wizard-tradeoff="${j}" value="${escapeHtml(t)}" placeholder="Tradeoff ${j + 1}">`).join("")}</div>`;
    if (i === 4) return `<div class="wizard-step"><label>${escapeHtml(step)}</label>${w.wizard.failures.map((f, j) => `<input type="text" data-wizard-fail-risk="${j}" value="${escapeHtml(f.risk)}" placeholder="Risk ${j + 1}"><input type="text" data-wizard-fail-mit="${j}" value="${escapeHtml(f.mitigation)}" placeholder="Mitigation">`).join("")}</div>`;
    if (i === 5) return `<div class="wizard-step"><label>${escapeHtml(step)}</label><textarea data-wizard="costLatency">${escapeHtml(w.wizard.costLatency)}</textarea></div>`;
    return `<div class="wizard-step"><label>${escapeHtml(step)}</label><p>Use the timer button below.</p></div>`;
  }
  function bindWizardInputs() {
    main.querySelector('[data-wizard="scenario"]')?.addEventListener("input", (e) => {
      state.workspace = applyWizardInput(state.workspace, "scenario", e.target.value);
      syncWorkspaceChrome();
    });
    main.querySelector('[data-wizard="justify"]')?.addEventListener("input", (e) => {
      state.workspace = applyWizardInput(state.workspace, "justify", e.target.value);
      syncWorkspaceChrome();
    });
    main.querySelector('[data-wizard="costLatency"]')?.addEventListener("input", (e) => {
      state.workspace = applyWizardInput(state.workspace, "costLatency", e.target.value);
      syncWorkspaceChrome();
    });
    main.querySelector('[data-wizard="annotations"]')?.addEventListener("input", (e) => {
      state.workspace = applyWizardInput(state.workspace, "annotations", e.target.value);
      syncWorkspaceChrome();
    });
    main.querySelectorAll("[data-wizard-tradeoff]").forEach((el) => {
      el.addEventListener("input", () => {
        state.workspace = applyWizardInput(state.workspace, `tradeoff:${el.dataset.wizardTradeoff}`, el.value);
        syncWorkspaceChrome();
      });
    });
    main.querySelectorAll("[data-wizard-fail-risk]").forEach((el) => {
      el.addEventListener("input", () => {
        state.workspace = applyWizardInput(state.workspace, `fail-risk:${el.dataset.wizardFailRisk}`, el.value);
        syncWorkspaceChrome();
      });
    });
    main.querySelectorAll("[data-wizard-fail-mit]").forEach((el) => {
      el.addEventListener("input", () => {
        state.workspace = applyWizardInput(state.workspace, `fail-mit:${el.dataset.wizardFailMit}`, el.value);
        syncWorkspaceChrome();
      });
    });
  }
  function updateWorkspaceSidebar() {
    const chrome = getWorkspaceChromeState(state.workspace);
    const countEl = main.querySelector("[data-sketch-count]");
    if (countEl) countEl.textContent = chrome.countLabel;
    const status = document.getElementById("validation-status");
    if (status) {
      status.className = chrome.complete ? "checkpoint-result pass" : "checkpoint-result fail";
      status.textContent = chrome.statusText;
    }
    const delBtn = document.getElementById("delete-node");
    if (delBtn) delBtn.disabled = !state.workspace.selectedNodeId;
    const edgeBtn = document.getElementById("delete-edge");
    if (edgeBtn) edgeBtn.disabled = !state.workspace.sketch.edges.length;
    updateEdgeHint();
  }
  function updateEdgeHint() {
    const hint = document.getElementById("edge-hint");
    if (!hint) return;
    const first = state.workspace.edgeSelection.first;
    const sel = state.workspace.selectedNodeId;
    if (first) {
      hint.textContent = "First node selected \u2014 click a second node to connect";
      hint.className = "tag warn";
    } else if (sel) {
      const node = state.workspace.sketch.nodes.find((n) => n.id === sel);
      hint.textContent = node ? `Selected: ${node.label} (${node.type}) \u2014 press Delete or use toolbar` : "";
      hint.className = "tag";
    } else {
      hint.textContent = "";
    }
  }
  function syncWorkspaceChrome() {
    renderCanvas();
    updateWorkspaceSidebar();
  }
  function renderCanvas() {
    const wrap = document.getElementById("canvas-wrap");
    if (wrap) {
      const highlightId = state.workspace.edgeSelection.first || state.workspace.selectedNodeId;
      wrap.innerHTML = renderSketchSvg(state.workspace.sketch, highlightId);
      if (state.workspace.selectedNodeId && !state.workspace.edgeSelection.first) {
        const sel = wrap.querySelector(`[data-node-id="${state.workspace.selectedNodeId}"]`);
        sel?.classList.add("selected-node");
      }
      bindCanvasInteractions();
    }
  }
  function bindCanvasInteractions() {
    const svg = document.querySelector(".workspace-svg");
    if (!svg) return;
    const DRAG_THRESHOLD = 5;
    svg.querySelectorAll(".canvas-node").forEach((nodeEl) => {
      const nodeId = nodeEl.dataset.nodeId;
      const pointer = { down: false, moved: false, startX: 0, startY: 0 };
      nodeEl.addEventListener("pointerdown", (e) => {
        e.stopPropagation();
        pointer.down = true;
        pointer.moved = false;
        pointer.startX = e.clientX;
        pointer.startY = e.clientY;
        const n = state.workspace.sketch.nodes.find((x) => x.id === nodeId);
        if (!n) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = 800 / rect.width;
        const scaleY = 400 / rect.height;
        state.workspace = setDragState(state.workspace, {
          nodeId,
          offsetX: (e.clientX - rect.left) * scaleX - n.x,
          offsetY: (e.clientY - rect.top) * scaleY - n.y
        });
        nodeEl.setPointerCapture(e.pointerId);
      });
      nodeEl.addEventListener("pointermove", (e) => {
        if (!pointer.down) return;
        if (Math.hypot(e.clientX - pointer.startX, e.clientY - pointer.startY) > DRAG_THRESHOLD) {
          pointer.moved = true;
        }
        if (!pointer.moved || state.workspace.drag.nodeId !== nodeId) return;
        const rect = svg.getBoundingClientRect();
        const scaleX = 800 / rect.width;
        const scaleY = 400 / rect.height;
        const x = Math.max(0, Math.min(700, (e.clientX - rect.left) * scaleX - state.workspace.drag.offsetX));
        const y = Math.max(0, Math.min(360, (e.clientY - rect.top) * scaleY - state.workspace.drag.offsetY));
        state.workspace = moveNodeOnCanvas(state.workspace, nodeId, x, y);
        const moved = state.workspace.sketch.nodes.find((n) => n.id === nodeId);
        if (!moved) return;
        const rectEl = nodeEl.querySelector(".node-rect");
        const texts = nodeEl.querySelectorAll("text");
        rectEl.setAttribute("x", moved.x);
        rectEl.setAttribute("y", moved.y);
        if (texts[0]) {
          texts[0].setAttribute("x", moved.x + 50);
          texts[0].setAttribute("y", moved.y + 18);
        }
        if (texts[1]) {
          texts[1].setAttribute("x", moved.x + 50);
          texts[1].setAttribute("y", moved.y + 32);
        }
        renderCanvasEdges(svg);
      });
      nodeEl.addEventListener("pointerup", () => {
        if (pointer.down && !pointer.moved) {
          state.workspace = selectNodeForEdge(state.workspace, nodeId);
          state.workspace = selectCanvasNode(state.workspace, nodeId);
          syncWorkspaceChrome();
        }
        pointer.down = false;
        pointer.moved = false;
        state.workspace = setDragState(state.workspace, { nodeId: null, offsetX: 0, offsetY: 0 });
      });
    });
    svg.querySelector(".canvas-bg")?.addEventListener("click", (e) => {
      if (e.target !== svg.querySelector(".canvas-bg")) return;
      const rect = svg.getBoundingClientRect();
      const scaleX = 800 / rect.width;
      const scaleY = 400 / rect.height;
      const x = (e.clientX - rect.left) * scaleX - 50;
      const y = (e.clientY - rect.top) * scaleY - 20;
      state.workspace = placeNode(
        state.workspace,
        state.workspace.selectedNodeType,
        Math.max(0, Math.min(700, x)),
        Math.max(0, Math.min(360, y))
      );
      syncWorkspaceChrome();
      showToast(`Placed ${state.workspace.selectedNodeType}`, "info");
    });
  }
  function renderCanvasEdges(svg) {
    const sketch = state.workspace.sketch;
    svg.querySelectorAll(".edge-group, line").forEach((l) => l.remove());
    const defs = svg.querySelector("defs") || (() => {
      const d = document.createElementNS("http://www.w3.org/2000/svg", "defs");
      d.innerHTML = '<marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#22d3ee"/></marker>';
      svg.insertBefore(d, svg.firstChild);
      return d;
    })();
    void defs;
    sketch.edges.forEach((e) => {
      const from = sketch.nodes.find((n) => n.id === e.from);
      const to = sketch.nodes.find((n) => n.id === e.to);
      if (!from || !to) return;
      const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
      g.setAttribute("class", "edge-group");
      const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
      line.setAttribute("x1", from.x + 50);
      line.setAttribute("y1", from.y + 40);
      line.setAttribute("x2", to.x + 50);
      line.setAttribute("y2", to.y);
      line.setAttribute("stroke", "#22d3ee");
      line.setAttribute("stroke-width", "2");
      line.setAttribute("marker-end", "url(#arrow)");
      g.appendChild(line);
      if (e.label) {
        const midX = (from.x + 50 + to.x + 50) / 2;
        const midY = (from.y + 40 + to.y) / 2;
        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.setAttribute("x", midX);
        text.setAttribute("y", midY - 4);
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("fill", "#8b9cb3");
        text.setAttribute("font-size", "9");
        text.textContent = e.label;
        g.appendChild(text);
      }
      const firstNode = svg.querySelector(".canvas-node");
      svg.insertBefore(g, firstNode);
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
    showToast("Exported Markdown + PNG", "success");
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
        state.workspace = applyWizardInput(state.workspace, "teachBackCompleted", true);
        syncWorkspaceChrome();
        display.textContent = "Teach-back complete!";
        showToast("Teach-back complete", "success");
      }
    }, 1e3);
  }
  function renderResources() {
    const q = state.resourceSearch.toLowerCase();
    main.innerHTML = `
    <h2>Resources</h2>
    <div class="search-bar">
      <input type="text" id="resource-search" placeholder="Search resources\u2026" aria-label="Search resources" value="${escapeHtml(state.resourceSearch)}">
    </div>
    <div class="glass-card">
      <h3>Written Resources</h3>
      <ul id="written-list">${RESOURCES.written.map((r) => {
      const text = `${r.title} ${r.author}`.toLowerCase();
      const hidden = q && !text.includes(q);
      return `<li class="resource-item ${hidden ? "hidden-by-search" : ""}"><strong>${escapeHtml(r.title)}</strong> \u2014 ${escapeHtml(r.author)}</li>`;
    }).join("")}</ul>
    </div>
    <div class="glass-card">
      <h3>Podcasts (Car Listening)</h3>
      ${RESOURCES.podcasts.map((p) => {
      const text = `${p.title} ${p.host}`.toLowerCase();
      const hidden = q && !text.includes(q);
      return `
        <div class="resource-item ${hidden ? "hidden-by-search" : ""}">
          <strong>${escapeHtml(p.title)}</strong> \u2014 ${escapeHtml(p.host)}
          <div>${p.conceptBookmarks.map((b) => `<span class="tag">${escapeHtml(b.label)} @ ${escapeHtml(b.time)}</span>`).join("")}</div>
          <audio controls aria-label="${escapeHtml(p.title)} audio player" style="width:100%;margin-top:0.5rem">
            <source src="" type="audio/mpeg">
            <p>Audio stub \u2014 link to podcast externally. Bookmarks show concept sync points.</p>
          </audio>
        </div>`;
    }).join("")}
    </div>`;
    document.getElementById("resource-search").addEventListener("input", (e) => {
      state.resourceSearch = e.target.value;
      renderResources();
    });
  }
  function renderReview() {
    const review = computeReviewItems(state.progress);
    const checkpointCount = Object.keys(state.progress.checkpointAnswers || {}).length;
    main.innerHTML = `
    <h2>Review Mode</h2>
    <div class="glass-card">
      <div class="dashboard-stats">
        <div class="stat-card"><div class="stat-value">${review.daysSinceStart}</div><div class="stat-label">Days active</div></div>
        <div class="stat-card"><div class="stat-value">${checkpointCount}</div><div class="stat-label">Checkpoints answered</div></div>
        <div class="stat-card"><div class="stat-value">${review.items.length}</div><div class="stat-label">Due now</div></div>
      </div>
      <p>Spaced review on Days 3, 7, 14.</p>
      ${review.items.length ? review.items.map((item) => `
        <div class="review-card review-nudge">
          <strong>${item.type === "checkpoint" ? "Checkpoint" : "Sketch"} review</strong>
          <p>Due since Day ${item.dueDay}</p>
          ${item.type === "checkpoint" ? '<button class="btn btn-sm" data-goto-modules>Review modules</button>' : '<button class="btn btn-sm" data-goto-workspace>Open workspace</button>'}
        </div>`).join("") : "<p>No reviews due yet. Keep practicing!</p>"}
      <button class="btn" id="reshsketch">Re-sketch Challenge (Week 1)</button>
      <button class="btn btn-secondary" id="reset-progress">Reset Progress</button>
    </div>`;
    document.getElementById("reshsketch")?.addEventListener("click", () => {
      state.workspace = resetSketch(state.workspace, "Re-sketch Challenge");
      state.view = "workspace";
      render();
      showToast("Re-sketch challenge loaded", "info");
    });
    document.getElementById("reset-progress")?.addEventListener("click", () => {
      if (confirm("Reset all progress? This cannot be undone.")) {
        localStorage.removeItem("aaa-progress");
        state.progress = loadProgress();
        render();
        showToast("Progress reset", "info");
      }
    });
    main.querySelector("[data-goto-modules]")?.addEventListener("click", () => {
      state.view = "modules";
      render();
    });
    main.querySelector("[data-goto-workspace]")?.addEventListener("click", () => {
      state.view = "workspace";
      render();
    });
  }
  window.__AAA = {
    generateMd: () => generateExport(state.workspace.sketch, state.workspace.wizard),
    runExport: async () => {
      const svg = renderSketchSvg(state.workspace.sketch);
      const png = await rasterizeSvgToPng(svg, 800, 400);
      const md = generateExport(state.workspace.sketch, state.workspace.wizard);
      return {
        pngPrefix: png.slice(0, 22),
        mdSections: (md.match(/^## \d/gm) || []).length,
        nodes: state.workspace.sketch.nodes.length,
        edges: state.workspace.sketch.edges.length,
        hasAnnotations: Boolean(state.workspace.sketch.annotations),
        md
      };
    }
  };
  init();
})();
