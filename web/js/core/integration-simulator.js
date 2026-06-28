export function getIntegrationDiff() {
  return {
    prototype: {
      auth: 'None',
      audit: 'Console logs',
      data: 'Local files',
      deploy: 'Manual script',
      ci: 'None',
    },
    enterprise: {
      auth: 'SSO / OIDC + RBAC',
      audit: 'Centralized audit log + lineage',
      data: 'Governed data lake + PII controls',
      deploy: 'CI/CD pipelines with approval gates',
      ci: 'Graph/prompt/model versioning',
    },
    trends2026: [
      { id: 'mcp', title: 'Model Context Protocol (MCP)', impact: 'Standardizes tool integration' },
      { id: 'clouds', title: 'Agent clouds / harnesses', impact: 'Managed hosting reduces ops burden' },
      { id: 'a2a', title: 'Agent-to-agent standards', impact: 'Interop between vendor agents' },
      { id: 'sandbox', title: 'Advanced sandboxes', impact: 'Safer tool execution environments' },
    ],
  };
}