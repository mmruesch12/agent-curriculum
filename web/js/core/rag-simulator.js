export function simulateRagCascade(mode, failurePoint = null) {
  const vectorPath = [
    { step: 'query', status: 'ok', detail: 'User query embedded' },
    { step: 'vector_search', status: failurePoint === 'vector_search' ? 'fail' : 'ok', detail: 'Top-5 chunks retrieved' },
    { step: 'generate', status: failurePoint === 'vector_search' ? 'cascade' : 'ok', detail: 'LLM generates answer from chunks' },
    { step: 'downstream', status: failurePoint === 'vector_search' ? 'cascade' : 'ok', detail: 'Agent acts on potentially wrong context' },
  ];

  const graphPath = [
    { step: 'query', status: 'ok', detail: 'Entity extraction from query' },
    { step: 'graph_traverse', status: failurePoint === 'graph_traverse' ? 'fail' : 'ok', detail: 'Multi-hop graph traversal' },
    { step: 'subgraph_build', status: failurePoint === 'graph_traverse' ? 'cascade' : 'ok', detail: 'Relevant subgraph assembled' },
    { step: 'generate', status: failurePoint === 'subgraph_build' ? 'fail' : 'ok', detail: 'LLM generates from structured context' },
    { step: 'downstream', status: 'cascade', detail: 'Relational errors propagate to tool calls' },
  ];

  const path = mode === 'graphrag' ? graphPath : vectorPath;
  const failures = path.filter((p) => p.status === 'fail' || p.status === 'cascade');

  return {
    mode,
    path,
    failureCount: failures.length,
    summary:
      mode === 'graphrag'
        ? 'GraphRAG handles relational queries but multi-hop failures cascade through subgraph and generation.'
        : 'Vector RAG fails silently on wrong chunks; downstream agent acts on ungrounded context.',
  };
}

export function getRagModes() {
  return ['vector', 'graphrag'];
}