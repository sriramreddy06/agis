// Static demo data for Agis Fabric HAI Work Console
// All names/data are illustrative for demonstration purposes.

const BUCKETS = [
  {
    id: 'A1',
    name: 'Experience & Interaction Modernization',
    short: 'HAI Front Door',
    description: 'Single pane of glass, role-based HAI UX, guided execution across systems.'
  },
  {
    id: 'A2',
    name: 'Legacy Modernization & Enablement',
    short: 'Legacy Enablement',
    description: 'API wrapping, strangler patterns, regression harness for legacy apps.'
  },
  {
    id: 'A3',
    name: 'Process Automation (Transactional)',
    short: 'Workflow Automation',
    description: 'Deterministic orchestration across ERP/CRM/ITSM with approvals and retries.'
  },
  {
    id: 'A4',
    name: 'Decision Automation (Policy + Scoring)',
    short: 'Decisioning',
    description: 'Explainable decisions using policy-as-code + contextual retrieval.'
  },
  {
    id: 'A5',
    name: 'Knowledge Work Automation (Docs)',
    short: 'DocOps',
    description: 'RFP, compliance, contracts, case notes, audit packs, and summaries.'
  },
  {
    id: 'A6',
    name: 'Integration & Interoperability Automation',
    short: 'Integration',
    description: 'Contract-first APIs/events, schema mapping, connector generation + contract tests.'
  },
  {
    id: 'A7',
    name: 'DataOps / AnalyticsOps (Decision Data Supply Chain)',
    short: 'DataOps',
    description: 'Data quality, lineage, semantic layer, features, and access governance.'
  },
  {
    id: 'A8',
    name: 'IT Ops & Reliability Automation (AIOps/SRE)',
    short: 'RunOps',
    description: 'Triage, correlation, runbook automation, canary analysis, rollback triggers.'
  },
  {
    id: 'A9',
    name: 'Security, Risk & Compliance Automation',
    short: 'GRC/SecOps',
    description: 'Policy-as-code, evidence packs, SBOM, vuln triage, access reviews.'
  },
  {
    id: 'A10',
    name: 'New Business Automation & Digital Workers',
    short: 'Digital Workers',
    description: 'Cross-system digital workers for revenue and customer experience.'
  }
];

const FRAMEWORKS = [
  { id: 'BidOps', name: 'Agis BidOps', color: 'var(--c-bid)' },
  { id: 'BuildOps', name: 'Agis BuildOps', color: 'var(--c-build)' },
  { id: 'RunOps', name: 'Agis RunOps', color: 'var(--c-run)' },
  { id: 'LifeOps', name: 'Agis LifeOps', color: 'var(--c-life)' }
];

const AUTONOMY_LEVELS = [
  { id: 'B1', name: 'Assist (Copilot)', desc: 'Draft/recommend. No system writes without user commit.' },
  { id: 'B2', name: 'Orchestrated + Concurrence', desc: 'Agent executes workflow with explicit approvals at commit points.' },
  { id: 'B3', name: 'Guardrailed Autonomy', desc: 'Auto-executes low-risk actions within policy budgets; escalates exceptions.' },
  { id: 'B4', name: 'Closed-loop Autonomy', desc: 'Detect→decide→act→verify→learn within strict guardrails and continuous evaluation.' }
];

const STAGE_STATUS = ['Planned', 'In Progress', 'Live', 'Optimizing'];

const now = () => new Date().toISOString().slice(0, 10);

// Demo initiatives across 10 buckets, mapped to UPS Brokerage and adjacent portfolios.
const INITIATIVES = [
  // A1
  {
    id: 'I-101',
    name: 'UPS Brokerage HAI Work Console (Single Pane)',
    portfolio: 'Brokerage',
    bucket: 'A1',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Brokerage Ops + UX',
    kpi: { metric: 'Cycle time per entry', baseline: '18 min', target: '6 min' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'A role-based HAI console that guides users through entry creation, exception resolution, and audit-proof evidence capture across systems of record.',
    lastUpdated: now(),
    tags: ['HAI', 'UX', 'Explainability', 'Evidence Packs']
  },
  {
    id: 'I-102',
    name: 'Guided Brokerage Exception Workspace (HHI-style)',
    portfolio: 'Brokerage',
    bucket: 'A1',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Brokerage Ops',
    kpi: { metric: 'Exception resolution time', baseline: '2.2 days', target: '4 hours' },
    maturity: { BidOps: 'Live', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Transforms error states into guided conversations with pre-filled remediation options, policy citations, and approval gates.',
    lastUpdated: now(),
    tags: ['Exceptions', 'Approvals', 'Policy-as-Code']
  },
  {
    id: 'I-103',
    name: 'Role-based Insights & Alerts Cockpit',
    portfolio: 'Trade Compliance',
    bucket: 'A1',
    autonomy: 'B1',
    risk: 'Low',
    owner: 'Compliance Analytics',
    kpi: { metric: 'SLA breach rate', baseline: '7.5%', target: '2.0%' },
    maturity: { BidOps: 'In Progress', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'A unified cockpit for compliance signals, workload, and recommendations—optimized for HHI-level experience.',
    lastUpdated: now(),
    tags: ['Cockpit', 'Insights']
  },
  // A2
  {
    id: 'I-201',
    name: 'Legacy Screen-to-API Wrapper for Entry Systems',
    portfolio: 'Brokerage',
    bucket: 'A2',
    autonomy: 'B3',
    risk: 'High',
    owner: 'App Modernization',
    kpi: { metric: 'Automation coverage', baseline: '0%', target: '60%' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Wraps legacy HMI screens behind secure APIs to make them agent-operable; includes contract tests and regression harness.',
    lastUpdated: now(),
    tags: ['Legacy', 'APIs', 'Strangler']
  },
  {
    id: 'I-202',
    name: 'Strangler Migration for Tariff Classification Service',
    portfolio: 'Trade Compliance',
    bucket: 'A2',
    autonomy: 'B2',
    risk: 'High',
    owner: 'Architecture',
    kpi: { metric: 'Defect escape rate', baseline: '1.9%', target: '0.5%' },
    maturity: { BidOps: 'In Progress', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Incrementally replaces legacy rules engine with modular services; agents generate tests and migration proofs.',
    lastUpdated: now(),
    tags: ['Modernization', 'Services', 'Regression']
  },
  {
    id: 'I-203',
    name: 'Automated Documentation & Spec Mining for Legacy Apps',
    portfolio: 'IT Portfolio',
    bucket: 'A2',
    autonomy: 'B1',
    risk: 'Low',
    owner: 'Engineering Excellence',
    kpi: { metric: 'Onboarding time', baseline: '6 weeks', target: '2 weeks' },
    maturity: { BidOps: 'Live', BuildOps: 'Live', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Agents extract domain models, user flows, and regression cases from code, tickets, and runbooks.',
    lastUpdated: now(),
    tags: ['Docs', 'Reverse Engineering']
  },
  // A3
  {
    id: 'I-301',
    name: 'Automated Entry Validation & Pre-check Orchestration',
    portfolio: 'Brokerage',
    bucket: 'A3',
    autonomy: 'B3',
    risk: 'Medium',
    owner: 'Brokerage Automation',
    kpi: { metric: 'First-pass acceptance', baseline: '82%', target: '95%' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Orchestrates pre-checks, rule validations, and data enrichment; escalates only hard exceptions to experts.',
    lastUpdated: now(),
    tags: ['Workflow', 'Validation', 'Retries']
  },
  {
    id: 'I-302',
    name: 'Post-Entry Amendment Automation (with approvals)',
    portfolio: 'Brokerage',
    bucket: 'A3',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Brokerage Ops',
    kpi: { metric: 'Amendment turnaround', baseline: '1.5 days', target: '3 hours' },
    maturity: { BidOps: 'In Progress', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Agents draft amendments, present a preview, and require concurrence before committing changes.',
    lastUpdated: now(),
    tags: ['Amendments', 'Concurrence']
  },
  {
    id: 'I-303',
    name: 'Automated Broker Billing Reconciliation',
    portfolio: 'Finance Ops',
    bucket: 'A3',
    autonomy: 'B3',
    risk: 'Low',
    owner: 'Finance Automation',
    kpi: { metric: 'Manual touches per invoice', baseline: '4.1', target: '0.8' },
    maturity: { BidOps: 'Live', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Reconciles invoices, flags anomalies, and auto-creates adjustment tickets with evidence.',
    lastUpdated: now(),
    tags: ['Reconciliation', 'Finance']
  },
  // A4
  {
    id: 'I-401',
    name: 'Policy-aware Classification Recommendation (Explainable)',
    portfolio: 'Trade Compliance',
    bucket: 'A4',
    autonomy: 'B2',
    risk: 'High',
    owner: 'Compliance COE',
    kpi: { metric: 'Classification accuracy', baseline: '88%', target: '96%' },
    maturity: { BidOps: 'In Progress', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Combines policy-as-code with retrieval to recommend codes; shows citations and requires expert concurrence on high risk cases.',
    lastUpdated: now(),
    tags: ['Decisioning', 'Explainability', 'Citations']
  },
  {
    id: 'I-402',
    name: 'Risk-based Routing for Holds & Exams',
    portfolio: 'Brokerage',
    bucket: 'A4',
    autonomy: 'B3',
    risk: 'High',
    owner: 'Brokerage Risk',
    kpi: { metric: 'Hold rate', baseline: '9.2%', target: '6.0%' },
    maturity: { BidOps: 'Planned', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Scores entry risk and routes to appropriate queues; creates auditable rationale and evidence links.',
    lastUpdated: now(),
    tags: ['Scoring', 'Routing', 'Audit']
  },
  {
    id: 'I-403',
    name: 'Discrepancy Resolution Decision Assistant',
    portfolio: 'Customer Ops',
    bucket: 'A4',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Customer Ops',
    kpi: { metric: 'Customer response SLA', baseline: '28 hrs', target: '6 hrs' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Suggests resolution options, drafts customer comms, and escalates exceptions.',
    lastUpdated: now(),
    tags: ['Customer', 'Decisioning']
  },
  // A5
  {
    id: 'I-501',
    name: 'RFI/RFP Response & SoW Drafting (BidOps automation)',
    portfolio: 'Commercial',
    bucket: 'A5',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Bid Management',
    kpi: { metric: 'Time-to-proposal', baseline: '15 days', target: '5 days' },
    maturity: { BidOps: 'Live', BuildOps: 'Live', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Agents draft response matrices, assumptions, and SoW clauses with traceability to delivery artifacts.',
    lastUpdated: now(),
    tags: ['BidOps', 'Traceability']
  },
  {
    id: 'I-502',
    name: 'Audit Evidence Pack Automation (Brokerage)',
    portfolio: 'Brokerage',
    bucket: 'A5',
    autonomy: 'B3',
    risk: 'High',
    owner: 'Audit & Compliance',
    kpi: { metric: 'Audit preparation effort', baseline: '120 hrs/qtr', target: '24 hrs/qtr' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Automatically compiles evidence packs for entries, approvals, and policy checks; supports audits with immutable provenance.',
    lastUpdated: now(),
    tags: ['Evidence', 'Audit', 'Provenance']
  },
  {
    id: 'I-503',
    name: 'Incident & Case Summarization with Actionable Next Steps',
    portfolio: 'IT Ops',
    bucket: 'A5',
    autonomy: 'B1',
    risk: 'Low',
    owner: 'NOC',
    kpi: { metric: 'MTTA', baseline: '18 min', target: '6 min' },
    maturity: { BidOps: 'Live', BuildOps: 'Live', RunOps: 'In Progress', LifeOps: 'Planned' },
    description: 'Summarizes incidents and proposes next steps with cited telemetry signals; no auto-exec in this stage.',
    lastUpdated: now(),
    tags: ['Ops', 'Summaries']
  },
  // A6
  {
    id: 'I-601',
    name: 'Contract-first Event Mesh for Brokerage Status',
    portfolio: 'Brokerage',
    bucket: 'A6',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Integration',
    kpi: { metric: 'Integration defects', baseline: '12/mo', target: '3/mo' },
    maturity: { BidOps: 'In Progress', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Defines canonical events and schemas; agents generate connectors and contract tests across systems.',
    lastUpdated: now(),
    tags: ['Events', 'Contracts', 'Tests']
  },
  {
    id: 'I-602',
    name: 'Connector Factory (ERP/CRM/ITSM) with policy guardrails',
    portfolio: 'Enterprise Platforms',
    bucket: 'A6',
    autonomy: 'B3',
    risk: 'Medium',
    owner: 'Platform Engineering',
    kpi: { metric: 'Connector delivery lead time', baseline: '6 weeks', target: '1 week' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Generates connectors, schema mappings, and monitors; uses policy-as-code for data access and logging.',
    lastUpdated: now(),
    tags: ['Connectors', 'Governance']
  },
  {
    id: 'I-603',
    name: 'Replay & Compensation Framework for Cross-system Workflows',
    portfolio: 'Brokerage',
    bucket: 'A6',
    autonomy: 'B2',
    risk: 'High',
    owner: 'Architecture',
    kpi: { metric: 'Recovery time from failures', baseline: '6 hrs', target: '30 min' },
    maturity: { BidOps: 'Planned', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Standardizes retries, compensation actions, and replay tooling; agent plans use these primitives by default.',
    lastUpdated: now(),
    tags: ['Resilience', 'Compensation']
  },
  // A7
  {
    id: 'I-701',
    name: 'Brokerage Semantic Layer (Customer/Shipment/Entry)',
    portfolio: 'Brokerage',
    bucket: 'A7',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Data Platform',
    kpi: { metric: 'Time-to-insight', baseline: '3 days', target: '30 min' },
    maturity: { BidOps: 'In Progress', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Creates a governed semantic layer powering BI and agent retrieval with lineage and access controls.',
    lastUpdated: now(),
    tags: ['Semantic', 'Lineage']
  },
  {
    id: 'I-702',
    name: 'Data Quality Agent (Anomaly detection + auto tickets)',
    portfolio: 'DataOps',
    bucket: 'A7',
    autonomy: 'B3',
    risk: 'Low',
    owner: 'DataOps',
    kpi: { metric: 'Data incidents', baseline: '22/mo', target: '8/mo' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'In Progress', LifeOps: 'Planned' },
    description: 'Monitors data pipelines, detects anomalies, opens tickets with evidence, and proposes safe fixes.',
    lastUpdated: now(),
    tags: ['Quality', 'Monitoring']
  },
  {
    id: 'I-703',
    name: 'Feature Pipeline for Risk Scoring (governed)',
    portfolio: 'Risk Analytics',
    bucket: 'A7',
    autonomy: 'B2',
    risk: 'High',
    owner: 'Risk + Data Science',
    kpi: { metric: 'Model drift incidents', baseline: '5/qtr', target: '1/qtr' },
    maturity: { BidOps: 'Planned', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Establishes versioned features, drift monitoring, and evaluation harness for risk models.',
    lastUpdated: now(),
    tags: ['Features', 'Drift']
  },
  // A8
  {
    id: 'I-801',
    name: 'AIOps Triage: Correlate Brokerage Release Incidents',
    portfolio: 'IT Ops',
    bucket: 'A8',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'SRE',
    kpi: { metric: 'MTTR', baseline: '3.8 hrs', target: '1.2 hrs' },
    maturity: { BidOps: 'Live', BuildOps: 'Live', RunOps: 'In Progress', LifeOps: 'Planned' },
    description: 'Correlates telemetry across services, suggests runbooks, and drafts comms; concurrence required before remediation.',
    lastUpdated: now(),
    tags: ['AIOps', 'Correlation']
  },
  {
    id: 'I-802',
    name: 'Guardrailed Auto-Remediation (Safe Runbooks)',
    portfolio: 'IT Ops',
    bucket: 'A8',
    autonomy: 'B3',
    risk: 'Medium',
    owner: 'SRE',
    kpi: { metric: 'Repeat incidents', baseline: '14/mo', target: '5/mo' },
    maturity: { BidOps: 'Planned', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Executes approved runbooks automatically for low-risk patterns (restarts, queue drains) with rollback triggers.',
    lastUpdated: now(),
    tags: ['Self-healing', 'Runbooks']
  },
  {
    id: 'I-803',
    name: 'Release Canary & Rollback Guard (SLO-based)',
    portfolio: 'Platform Engineering',
    bucket: 'A8',
    autonomy: 'B3',
    risk: 'Low',
    owner: 'Release Engineering',
    kpi: { metric: 'Change failure rate', baseline: '8%', target: '3%' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'In Progress', LifeOps: 'Planned' },
    description: 'Automatically evaluates canary metrics against SLOs and triggers rollback per policy.',
    lastUpdated: now(),
    tags: ['Canary', 'Rollback']
  },
  // A9
  {
    id: 'I-901',
    name: 'Policy-as-Code Gates + Evidence Packs (End-to-end)',
    portfolio: 'GRC',
    bucket: 'A9',
    autonomy: 'B3',
    risk: 'High',
    owner: 'Security & Compliance',
    kpi: { metric: 'Audit findings', baseline: '12/yr', target: '3/yr' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'In Progress' },
    description: 'Codifies controls, enforces gates, and produces immutable evidence packs from contract to production.',
    lastUpdated: now(),
    tags: ['Policy', 'Evidence', 'Audit']
  },
  {
    id: 'I-902',
    name: 'Vulnerability Triage & Patch Automation (SBOM-driven)',
    portfolio: 'SecOps',
    bucket: 'A9',
    autonomy: 'B3',
    risk: 'Medium',
    owner: 'SecOps',
    kpi: { metric: 'Time-to-patch critical', baseline: '21 days', target: '5 days' },
    maturity: { BidOps: 'Live', BuildOps: 'Live', RunOps: 'In Progress', LifeOps: 'In Progress' },
    description: 'Automates vulnerability intake, prioritization, patch PR creation, and compliance reporting.',
    lastUpdated: now(),
    tags: ['SBOM', 'Patch']
  },
  {
    id: 'I-903',
    name: 'Access Review & Least-Privilege Automation',
    portfolio: 'Security',
    bucket: 'A9',
    autonomy: 'B2',
    risk: 'High',
    owner: 'IAM',
    kpi: { metric: 'Access review effort', baseline: '400 hrs/qtr', target: '80 hrs/qtr' },
    maturity: { BidOps: 'Planned', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Agents propose access changes, justify with usage evidence, and require concurrence for removals.',
    lastUpdated: now(),
    tags: ['IAM', 'Governance']
  },
  // A10
  {
    id: 'I-1001',
    name: 'Brokerage Digital Worker: “Entry-to-Clearance” Assistant',
    portfolio: 'Brokerage',
    bucket: 'A10',
    autonomy: 'B2',
    risk: 'High',
    owner: 'Brokerage Transformation',
    kpi: { metric: 'Touches per shipment', baseline: '9.5', target: '2.0' },
    maturity: { BidOps: 'In Progress', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'A cross-system digital worker that composes actions across entry, compliance, billing, and customer comms with approvals.',
    lastUpdated: now(),
    tags: ['Digital Worker', 'End-to-end']
  },
  {
    id: 'I-1002',
    name: 'Customer Promise Automation (Proactive comms + exceptions)',
    portfolio: 'Customer Ops',
    bucket: 'A10',
    autonomy: 'B3',
    risk: 'Medium',
    owner: 'CX',
    kpi: { metric: 'Proactive notification coverage', baseline: '12%', target: '65%' },
    maturity: { BidOps: 'Live', BuildOps: 'In Progress', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Proactively communicates status changes and recommended actions; escalates edge cases to humans.',
    lastUpdated: now(),
    tags: ['CX', 'Automation']
  },
  {
    id: 'I-1003',
    name: 'Partner Onboarding Digital Worker (Docs + Compliance)',
    portfolio: 'Partner Ops',
    bucket: 'A10',
    autonomy: 'B2',
    risk: 'Medium',
    owner: 'Partner Management',
    kpi: { metric: 'Onboarding time', baseline: '30 days', target: '10 days' },
    maturity: { BidOps: 'Planned', BuildOps: 'Planned', RunOps: 'Planned', LifeOps: 'Planned' },
    description: 'Automates document collection, KYC/compliance checks, contract drafts, and provisioning tickets.',
    lastUpdated: now(),
    tags: ['Partners', 'Compliance']
  }
];

// Demo “agent factory” (bottom-up) pipeline model.
const AGENT_PIPELINE = {
  nodes: [
    { id: 'n1', label: 'Intent Capture\n(HAI UX)', type: 'input' },
    { id: 'n2', label: 'Context Retrieval\n(Policies, Data, Evidence)', type: 'retrieval' },
    { id: 'n3', label: 'Planner / Orchestrator\n(Constraints + Budgets)', type: 'orchestrator' },
    { id: 'n4', label: 'Tool Calls\n(HMI Systems of Record)', type: 'tools' },
    { id: 'n5', label: 'Policy-as-Code Gates\n(Security/Compliance)', type: 'policy' },
    { id: 'n6', label: 'Evidence Pack Builder\n(Provenance)', type: 'evidence' },
    { id: 'n7', label: 'Deploy / Execute\n(Commit Points)', type: 'execute' },
    { id: 'n8', label: 'Observe\n(SLO/Drift/Threats)', type: 'observe' },
    { id: 'n9', label: 'Feedback + Rewards\n(User & Ops signals)', type: 'feedback' },
    { id: 'n10', label: 'Continuous Learning\n(RL + Eval Harness)', type: 'learn' }
  ],
  edges: [
    ['n1', 'n2'], ['n2', 'n3'], ['n3', 'n4'], ['n4', 'n5'], ['n5', 'n6'], ['n6', 'n7'],
    ['n7', 'n8'], ['n8', 'n9'], ['n9', 'n10'], ['n10', 'n3']
  ],
  metrics: {
    safetyPassRate: '98.6%',
    evalRegressionRate: '0.9%/release',
    meanTimeToConcurrence: '4.2 min',
    automationCoverage: '43%',
    predictedProductivityGain3Y: '5.1× (target)'
  },
  rl: {
    rewardSignals: [
      'Cycle time reduction (per transaction)',
      'Exception rate reduction',
      'Policy violation avoidance (hard negative)',
      'Human approval latency',
      'Customer SLA adherence'
    ],
    guardrails: [
      'No autonomous commits above thresholds',
      'Safety regression blocks promotion',
      'All actions must emit audit events',
      'Policy exceptions are time-bounded'
    ]
  }
};

// Expose as a single global to keep the demo double-click runnable.
window.AGIS_DATA = {
  BUCKETS,
  FRAMEWORKS,
  AUTONOMY_LEVELS,
  STAGE_STATUS,
  INITIATIVES,
  AGENT_PIPELINE,
  DEFAULT_SCENARIO
};

// Default demo scenario:
const DEFAULT_SCENARIO = {
  title: 'Brokerage: resolve an entry exception and draft an amendment with evidence',
  prompt: 'An entry is on hold due to missing data and a classification mismatch. Resolve the exception, propose an amendment, and prepare an audit-ready evidence pack. Minimize manual touches; require concurrence before committing.'
};

window.AGIS_DATA.DEFAULT_SCENARIO = DEFAULT_SCENARIO;
