const FAILURE_POINTS = {
  vector: ['vector_search', 'rerank', 'generate'],
  graphrag: ['graph_traverse', 'subgraph_build', 'generate'],
  hybrid: ['vector_search', 'graph_traverse', 'fusion', 'generate'],
};

export function getRagFailurePoints(mode) {
  return FAILURE_POINTS[mode] || FAILURE_POINTS.vector;
}

export function simulateRagCascade(mode, failurePoint = null) {
  const vectorPath = [
    { step: 'query', status: 'ok', detail: 'User query embedded' },
    { step: 'vector_search', status: failurePoint === 'vector_search' ? 'fail' : 'ok', detail: 'Top-5 chunks retrieved' },
    { step: 'rerank', status: failurePoint === 'rerank' ? 'fail' : failurePoint === 'vector_search' ? 'cascade' : 'ok', detail: 'Cross-encoder reranking' },
    { step: 'generate', status: ['vector_search', 'rerank'].includes(failurePoint) ? 'cascade' : 'ok', detail: 'LLM generates answer from chunks' },
    { step: 'downstream', status: ['vector_search', 'rerank'].includes(failurePoint) ? 'cascade' : 'ok', detail: 'Agent acts on potentially wrong context' },
  ];

  const graphPath = [
    { step: 'query', status: 'ok', detail: 'Entity extraction from query' },
    { step: 'graph_traverse', status: failurePoint === 'graph_traverse' ? 'fail' : 'ok', detail: 'Multi-hop graph traversal' },
    { step: 'subgraph_build', status: failurePoint === 'subgraph_build' ? 'fail' : failurePoint === 'graph_traverse' ? 'cascade' : 'ok', detail: 'Relevant subgraph assembled' },
    { step: 'generate', status: ['graph_traverse', 'subgraph_build'].includes(failurePoint) ? 'cascade' : 'ok', detail: 'LLM generates from structured context' },
    { step: 'downstream', status: ['graph_traverse', 'subgraph_build'].includes(failurePoint) ? 'cascade' : 'ok', detail: 'Relational errors propagate to tool calls' },
  ];

  const hybridPath = [
    { step: 'query', status: 'ok', detail: 'Query split into vector + graph intents' },
    { step: 'vector_search', status: failurePoint === 'vector_search' ? 'fail' : 'ok', detail: 'Dense retrieval branch' },
    { step: 'graph_traverse', status: failurePoint === 'graph_traverse' ? 'fail' : 'ok', detail: 'Graph traversal branch' },
    { step: 'fusion', status: failurePoint === 'fusion' ? 'fail' : ['vector_search', 'graph_traverse'].includes(failurePoint) ? 'cascade' : 'ok', detail: 'RRF fusion of both branches' },
    { step: 'generate', status: ['vector_search', 'graph_traverse', 'fusion'].includes(failurePoint) ? 'cascade' : 'ok', detail: 'LLM generates from fused context' },
    { step: 'downstream', status: ['vector_search', 'graph_traverse', 'fusion', 'generate'].includes(failurePoint) ? 'cascade' : 'ok', detail: 'Downstream agent consumes fused result' },
  ];

  const paths = { vector: vectorPath, graphrag: graphPath, hybrid: hybridPath };
  const path = paths[mode] || vectorPath;
  const failures = path.filter((p) => p.status === 'fail' || p.status === 'cascade');
  const firstFail = path.find((p) => p.status === 'fail');

  return {
    mode,
    path,
    failureCount: failures.length,
    failurePoint: firstFail?.step || null,
    recoveryHint: firstFail
      ? `Fallback: switch to ${mode === 'vector' ? 'hybrid' : 'vector'} retrieval or inject grounding check before generate.`
      : 'All retrieval stages healthy.',
    summary:
      mode === 'graphrag'
        ? 'GraphRAG handles relational queries but multi-hop failures cascade through subgraph and generation.'
        : mode === 'hybrid'
          ? 'Hybrid retrieval tolerates single-branch failure but fusion errors affect both paths.'
          : 'Vector RAG fails silently on wrong chunks; downstream agent acts on ungrounded context.',
  };
}

export function getRagModes() {
  return ['vector', 'graphrag', 'hybrid'];
}