# Agis Fabric — HAI Single Pane Work Console (Static Demo)

This is a **static, client-side HTML prototype** that demonstrates a "single pane of glass" **HAI (Human–AI Interaction)** console:

- **Left:** HAI Work Console (intent → plan → preview → concurrence → commit → evidence)
- **Top-right:** HMI Console (systems of record / operational views)
- **Bottom-right:** Explainability & Execution Trace (human-readable strategy + auditable action log)

It also demonstrates **portfolio management across 10 enterprise automation buckets** and the **four Agis frameworks**:
- **Agis BidOps** (RFI/RFP → proposal → SoW)
- **Agis BuildOps** (SDLC → gates/evidence → release)
- **Agis RunOps** (ORR, deploy, monitor, NOC/SRE ops)
- **Agis LifeOps** (vulns, drift, deprecation, modernization)

> Note: The "explainability" panel shows a **human-friendly plan + execution trace**, not private model tokens.

## Run

Option A — Open directly:
- Double-click `index.html`.

Option B — Local server (recommended):
```bash
cd agis-hai-prototype
python -m http.server 8000
```
Then open: http://localhost:8000

## Demo tips
- Use the **top-right menu** to switch **Perspective** (Portfolio/BidOps/BuildOps/RunOps/LifeOps) and **Lens** (Portfolio Map / Initiative Workbench / Agent Factory / Governance).
- Click cells in **Portfolio Matrix** to drill down.
- Use **Simulate → Run (dry) → Request Concurrence** to see the agent-first workflow with approvals.
