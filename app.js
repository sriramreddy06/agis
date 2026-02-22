/*
  Agis Fabric — HAI Single Pane Work Console (Static Demo)
  ------------------------------------------------------
  This is a client-side-only, static prototype (no backend). It is designed to
  demonstrate how Agis Fabric manages initiatives across 10 automation buckets
  and 4 operating frameworks (BidOps/BuildOps/RunOps/LifeOps) with an agent-first
  approach, while preserving transparency (explainability, evidence, policy gates).

  Note on “chain of thought”:
  - The UI shows a human-readable plan + execution trace + rationale, not private
    model tokens. This is deliberate for enterprise safety and auditability.
*/

(() => {
  const D = window.AGIS_DATA;
  if (!D) {
    console.error('AGIS_DATA not loaded.');
    return;
  }

  // ----------------------------
  // State
  // ----------------------------
  const state = {
    perspective: 'Portfolio', // Portfolio|BidOps|BuildOps|RunOps|LifeOps
    lens: 'Portfolio Map', // Portfolio Map|Initiative Workbench|Agent Factory|Governance & Audit
    mode: 'Plan', // Ask|Plan|Execute|Explain|Audit
    selectedInitiative: D.INITIATIVES[0].id,
    bucketFilter: 'All',
    portfolioFilter: 'All',
    bucketChips: new Set([...D.BUCKETS.map(b => b.id)]), // start with all enabled
    globalSearch: ''
  };

  const PERSPECTIVES = ['Portfolio', 'BidOps', 'BuildOps', 'RunOps', 'LifeOps'];
  const LENSES = ['Portfolio Map', 'Initiative Workbench', 'Agent Factory', 'Governance & Audit'];
  const MODES = ['Ask', 'Plan', 'Execute', 'Explain', 'Audit'];

  // ----------------------------
  // DOM helpers
  // ----------------------------
  const $ = (id) => document.getElementById(id);
  const el = (tag, attrs={}, children=[]) => {
    const n = document.createElement(tag);
    for (const [k,v] of Object.entries(attrs)) {
      if (k === 'class') n.className = v;
      else if (k.startsWith('on') && typeof v === 'function') n.addEventListener(k.substring(2), v);
      else if (k === 'html') n.innerHTML = v;
      else n.setAttribute(k, v);
    }
    (Array.isArray(children) ? children : [children]).filter(Boolean).forEach(c => {
      if (typeof c === 'string') n.appendChild(document.createTextNode(c));
      else n.appendChild(c);
    });
    return n;
  };

  const formatMaturity = (m) => `${m.BidOps} / ${m.BuildOps} / ${m.RunOps} / ${m.LifeOps}`;

  const bucketById = (id) => D.BUCKETS.find(b => b.id === id);
  const initiativeById = (id) => D.INITIATIVES.find(i => i.id === id);
  const autonomyById = (id) => D.AUTONOMY_LEVELS.find(a => a.id === id);

  const toast = (title, desc) => {
    const t = $('toast');
    $('toastTitle').textContent = title;
    $('toastDesc').textContent = desc;
    t.classList.remove('hidden');
    clearTimeout(toast._timer);
    toast._timer = setTimeout(() => t.classList.add('hidden'), 3600);
  };

  // ----------------------------
  // Menu (top-right)
  // ----------------------------
  function renderMenuChips() {
    // Perspective chips
    const pWrap = $('perspectiveChips');
    pWrap.innerHTML = '';
    PERSPECTIVES.forEach(p => {
      const c = el('div', {
        class: `chip ${state.perspective === p ? 'active' : ''}`,
        onclick: () => {
          state.perspective = p;
          // Auto-suggest a lens per perspective
          if (p === 'Portfolio') state.lens = 'Portfolio Map';
          if (p !== 'Portfolio' && state.lens === 'Portfolio Map') state.lens = 'Initiative Workbench';
          closeMenu();
          renderAll();
        }
      }, p);
      pWrap.appendChild(c);
    });

    // Lens chips
    const lWrap = $('lensChips');
    lWrap.innerHTML = '';
    LENSES.forEach(l => {
      const c = el('div', {
        class: `chip ${state.lens === l ? 'active' : ''}`,
        onclick: () => {
          state.lens = l;
          closeMenu();
          renderAll();
        }
      }, l);
      lWrap.appendChild(c);
    });

    // Bucket chips (multi)
    const bWrap = $('bucketChips');
    bWrap.innerHTML = '';
    D.BUCKETS.forEach(b => {
      const active = state.bucketChips.has(b.id);
      const c = el('div', {
        class: `chip ${active ? 'active' : ''}`,
        onclick: () => {
          if (state.bucketChips.has(b.id)) state.bucketChips.delete(b.id);
          else state.bucketChips.add(b.id);
          if (state.bucketChips.size === 0) state.bucketChips.add(b.id);
          renderInitiatives();
          renderHMI();
          renderBreadcrumbs();
          renderMenuChips();
        }
      }, b.id);
      c.title = b.name;
      bWrap.appendChild(c);
    });
  }

  function openMenu() { $('logoMenuPanel').classList.remove('hidden'); }
  function closeMenu() { $('logoMenuPanel').classList.add('hidden'); }

  $('logoMenuBtn').addEventListener('click', (e) => {
    e.stopPropagation();
    const isOpen = !$('logoMenuPanel').classList.contains('hidden');
    if (isOpen) closeMenu(); else openMenu();
  });

  document.addEventListener('click', (e) => {
    const panel = $('logoMenuPanel');
    const btn = $('logoMenuBtn');
    if (!panel.contains(e.target) && !btn.contains(e.target)) closeMenu();
  });

  // ----------------------------
  // Filters & list
  // ----------------------------
  function renderBucketFilterSelect() {
    const sel = $('bucketFilter');
    sel.innerHTML = '';
    sel.appendChild(el('option', { value: 'All' }, 'All buckets'));
    D.BUCKETS.forEach(b => sel.appendChild(el('option', { value: b.id }, `${b.id} · ${b.short}`)));
    sel.value = state.bucketFilter;
    sel.onchange = () => {
      state.bucketFilter = sel.value;
      // If a single bucket is chosen, narrow chips to that bucket for visual clarity
      if (state.bucketFilter !== 'All') {
        state.bucketChips = new Set([state.bucketFilter]);
      } else {
        state.bucketChips = new Set(D.BUCKETS.map(b => b.id));
      }
      renderMenuChips();
      renderInitiatives();
      renderHMI();
    };
  }

  $('portfolioFilter').addEventListener('change', () => {
    state.portfolioFilter = $('portfolioFilter').value;
    renderInitiatives();
    renderHMI();
  });

  $('globalSearch').addEventListener('input', () => {
    state.globalSearch = $('globalSearch').value.trim().toLowerCase();
    renderInitiatives();
    renderHMI();
  });

  function filteredInitiatives() {
    return D.INITIATIVES
      .filter(i => state.bucketChips.has(i.bucket))
      .filter(i => state.bucketFilter === 'All' || i.bucket === state.bucketFilter)
      .filter(i => state.portfolioFilter === 'All' || i.portfolio === state.portfolioFilter)
      .filter(i => {
        if (!state.globalSearch) return true;
        const hay = `${i.name} ${i.description} ${i.tags.join(' ')} ${i.portfolio} ${i.bucket}`.toLowerCase();
        return hay.includes(state.globalSearch);
      });
  }

  function renderInitiatives() {
    const list = $('initiativeList');
    list.innerHTML = '';
    const items = filteredInitiatives();

    // If current selection is filtered out, select first.
    if (!items.some(x => x.id === state.selectedInitiative) && items.length) {
      state.selectedInitiative = items[0].id;
    }

    items.forEach(i => {
      const isActive = i.id === state.selectedInitiative;
      const dots = el('div', { class: 'stage-dots' }, [
        el('span', { class: 'dot BidOps', title: `BidOps: ${i.maturity.BidOps}` }),
        el('span', { class: 'dot BuildOps', title: `BuildOps: ${i.maturity.BuildOps}` }),
        el('span', { class: 'dot RunOps', title: `RunOps: ${i.maturity.RunOps}` }),
        el('span', { class: 'dot LifeOps', title: `LifeOps: ${i.maturity.LifeOps}` }),
        el('span', { class: 'small' }, formatMaturity(i.maturity))
      ]);

      const row = el('div', {
        class: `item ${isActive ? 'active' : ''}`,
        onclick: () => {
          state.selectedInitiative = i.id;
          // If user selects an initiative, we assume they want to work on it.
          if (state.lens === 'Portfolio Map') state.lens = 'Initiative Workbench';
          renderAll();
        }
      }, [
        el('div', { class: 'name' }, i.name),
        el('div', { class: 'meta' }, [
          el('span', {}, `${i.bucket} · ${bucketById(i.bucket).short}`),
          el('span', {}, `Portfolio: ${i.portfolio}`),
          el('span', {}, `Autonomy: ${i.autonomy}`),
          el('span', {}, `Risk: ${i.risk}`)
        ]),
        el('div', { style: 'margin-top:8px' }, dots)
      ]);
      list.appendChild(row);
    });

    if (!items.length) {
      list.appendChild(el('div', { class: 'item' }, [
        el('div', { class: 'name' }, 'No initiatives match your filters'),
        el('div', { class: 'meta' }, 'Try changing bucket filter or search.')
      ]));
    }
  }

  // ----------------------------
  // HAI console (left)
  // ----------------------------
  function renderModeTabs() {
    const wrap = $('modeTabs');
    wrap.innerHTML = '';
    MODES.forEach(m => {
      wrap.appendChild(el('button', {
        class: `mode-btn ${state.mode === m ? 'active' : ''}`,
        onclick: () => {
          state.mode = m;
          $('haiModeBadge').textContent = m;
          renderChat(true);
          renderExplainability();
        }
      }, m));
    });
    $('haiModeBadge').textContent = state.mode;
  }

  function renderKpis() {
    const i = initiativeById(state.selectedInitiative);
    const wrap = $('kpiRow');
    wrap.innerHTML = '';

    const k1 = el('div', { class: 'kpi' }, [
      el('div', { class: 'k' }, 'Primary KPI'),
      el('div', { class: 'v' }, i.kpi.metric),
      el('div', { class: 's' }, `Baseline ${i.kpi.baseline} → Target ${i.kpi.target}`)
    ]);

    const k2 = el('div', { class: 'kpi' }, [
      el('div', { class: 'k' }, 'Autonomy & Risk'),
      el('div', { class: 'v' }, `${i.autonomy} · ${autonomyById(i.autonomy).name}`),
      el('div', { class: 's' }, `Risk: ${i.risk} · Commit points require concurrence`)
    ]);

    const k3 = el('div', { class: 'kpi' }, [
      el('div', { class: 'k' }, 'Lifecycle Coverage'),
      el('div', { class: 'v' }, 'BidOps · BuildOps · RunOps · LifeOps'),
      el('div', { class: 's' }, `${formatMaturity(i.maturity)} (current)`) 
    ]);

    wrap.appendChild(k1);
    wrap.appendChild(k2);
    wrap.appendChild(k3);
  }

  function renderContext() {
    const i = initiativeById(state.selectedInitiative);
    const wrap = $('contextChips');
    wrap.innerHTML = '';

    const bucket = bucketById(i.bucket);
    const contexts = [
      { t: `Portfolio: ${i.portfolio}`, v: 'Source-of-record: HMI' },
      { t: `Bucket: ${i.bucket}`, v: bucket.short },
      { t: `Data`, v: 'PII-safe demo, masked identifiers' },
      { t: `Controls`, v: 'Policy-as-code + evidence packs' },
      { t: `UX`, v: 'HMI→HAI with HHI-level experience' }
    ];

    contexts.forEach(c => {
      wrap.appendChild(el('div', { class: 'context', title: c.v }, [
        el('strong', {}, c.t)
      ]));
    });
  }

  const chatState = { messages: [] };

  function seedChat(force=false) {
    if (chatState.messages.length && !force) return;
    const i = initiativeById(state.selectedInitiative);
    chatState.messages = [
      {
        who: 'User',
        ts: '09:16',
        txt: `Focus initiative: “${i.name}”. Help me drive outcomes with minimal manual touches.`
      },
      {
        who: 'Agis HAI',
        ts: '09:16',
        txt: `Understood. I will operate in an agent-first mode: capture intent → plan → preview → concurrence → commit → evidence.\n\nI will show: (1) plan & rationale, (2) gated HMI actions, and (3) an auditable trace.\n\nWhat outcome do you want to optimize right now?` ,
        mini: 'Tip: choose a bucket (A1–A10) and a perspective (BidOps/BuildOps/RunOps/LifeOps) from the top-right menu.'
      }
    ];

    if (state.mode === 'Ask') {
      chatState.messages.push({
        who: 'Agis HAI',
        ts: '09:17',
        txt: `I can answer, search policies, or summarize the current state. I will not make system writes unless you request a commit and provide concurrence.`
      });
    }

    if (state.mode === 'Plan') {
      chatState.messages.push({
        who: 'Agis HAI',
        ts: '09:17',
        txt: `Draft plan for this initiative:\n1) Identify the highest-volume workflows and top exceptions\n2) Determine automation candidates by bucket and autonomy\n3) Propose workflow orchestration + approvals\n4) Define evidence pack requirements\n5) Roll out with canaries and monitor SLO impact`
      });
    }

    if (state.mode === 'Execute') {
      chatState.messages.push({
        who: 'Agis HAI',
        ts: '09:17',
        txt: `Execution is gated. I can run a dry-run simulation now, then request concurrence before committing any HMI transactions.`
      });
    }

    if (state.mode === 'Explain') {
      chatState.messages.push({
        who: 'Agis HAI',
        ts: '09:17',
        txt: `I will show the rationale in a human-friendly way: assumptions, constraints, policy checks, and evidence links. (No private token traces.)`
      });
    }

    if (state.mode === 'Audit') {
      chatState.messages.push({
        who: 'Agis HAI',
        ts: '09:17',
        txt: `Audit view: I will show who approved what, which policies were applied, and what evidence supports each action.`
      });
    }
  }

  function renderChat(force=false) {
    seedChat(force);
    const wrap = $('chat');
    wrap.innerHTML = '';
    chatState.messages.forEach(m => {
      const isUser = m.who === 'User';
      const av = el('div', { class: `avatar ${isUser ? 'user' : ''}` }, [
        el('div', { html: isUser ? 'U' : 'A' })
      ]);
      const bub = el('div', { class: 'bubble' }, [
        el('div', { class: 'hdr' }, [
          el('div', { class: 'who' }, m.who),
          el('div', { class: 'ts' }, m.ts)
        ]),
        el('div', { class: 'txt' }, m.txt),
        m.mini ? el('div', { class: 'mini' }, m.mini) : null
      ]);
      wrap.appendChild(el('div', { class: 'msg' }, [av, bub]));
    });
    wrap.scrollTop = wrap.scrollHeight;
  }

  function addUserMessage(text) {
    const t = text.trim();
    if (!t) return;
    chatState.messages.push({ who: 'User', ts: timeNow(), txt: t });
    chatState.messages.push({
      who: 'Agis HAI',
      ts: timeNow(),
      txt: respondToUser(t)
    });
    renderChat();
    renderExplainability();
  }

  function timeNow(){
    const d = new Date();
    return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`;
  }

  function respondToUser(t){
    const i = initiativeById(state.selectedInitiative);
    const lower = t.toLowerCase();

    if (lower.includes('roadmap') || lower.includes('3 year')) {
      state.lens = 'Portfolio Map';
      state.perspective = 'Portfolio';
      renderAll();
      return `Loaded a top-down portfolio roadmap view. You can drill into any bucket cell to see initiatives and their BidOps→BuildOps→RunOps→LifeOps coverage.`;
    }

    if (lower.includes('simulate') || lower.includes('plan')) {
      simulatePlan();
      return `Simulated a plan and mapped it into a strategy mind map. Next: run a dry execution (no writes), then request concurrence at commit points.`;
    }

    if (lower.includes('run') || lower.includes('execute')) {
      runDry();
      return `Dry-run executed. I have prepared a concurrence package for system writes (HMI commits) with policy checks and rollback plan.`;
    }

    if (lower.includes('audit') || lower.includes('evidence')) {
      createEvidencePack();
      return `Generated an evidence pack manifest with links to actions, policies, and approvals (demo).`;
    }

    return `Got it. For “${i.name}”, I recommend: (1) identify top exceptions, (2) move high-frequency steps to B3 guardrailed autonomy, and (3) enforce policy-as-code + evidence packs at every commit point. Use Simulate → Run (dry) → Request Concurrence.`;
  }

  $('sendBtn').addEventListener('click', () => {
    addUserMessage($('composerInput').value);
    $('composerInput').value = '';
  });

  $('composerInput').addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      $('sendBtn').click();
    }
  });

  // ----------------------------
  // Actions
  // ----------------------------
  const exec = {
    plan: null,
    trace: []
  };

  function simulatePlan(){
    const i = initiativeById(state.selectedInitiative);
    exec.plan = buildDefaultPlan(i);
    exec.trace.unshift({
      t: timeNow(),
      a: 'Simulate plan',
      r: `Planned ${exec.plan.nodes.length} steps. Commit points identified (concurrence required).`
    });
    toast('Plan simulated', 'Strategy map updated. Review commit points, policies, and evidence requirements.');
    renderExplainability();
  }

  function runDry(){
    if (!exec.plan) simulatePlan();
    exec.trace.unshift({ t: timeNow(), a: 'Dry-run tool calls', r: 'Validated data, retrieved policy, drafted amendment preview (no system writes).' });
    exec.trace.unshift({ t: timeNow(), a: 'Policy-as-code checks', r: 'PASS: PII handling, RBAC scope, schema validation. WARN: high-risk classification requires concurrence.' });
    toast('Dry-run completed', 'No HMI writes were executed. Concurrence package is ready.');
    renderExplainability();
  }

  function requestConcurrence(){
    if (!exec.plan) simulatePlan();
    openApprovalModal();
  }

  function createTicket(){
    exec.trace.unshift({ t: timeNow(), a: 'Create ticket', r: 'Opened ITSM ticket with evidence links and recommended remediation steps (demo).' });
    toast('Ticket created', 'An ITSM ticket has been drafted with evidence and next steps.');
    renderExplainability();
  }

  function createEvidencePack(){
    exec.trace.unshift({ t: timeNow(), a: 'Evidence Pack', r: 'Compiled evidence pack manifest: policies, approvals, data lineage, and action log.' });
    toast('Evidence pack generated', 'Evidence Pack manifest is now linked to this initiative (demo).');
    renderExplainability();
  }

  $('simulateBtn').addEventListener('click', simulatePlan);
  $('runBtn').addEventListener('click', runDry);
  $('approvalBtn').addEventListener('click', requestConcurrence);
  $('ticketBtn').addEventListener('click', createTicket);
  $('evidenceBtn').addEventListener('click', createEvidencePack);

  // Approvals inbox
  $('approvalsBtn').addEventListener('click', () => {
    openApprovalModal(true);
  });

  // ----------------------------
  // Approval modal
  // ----------------------------
  function openApprovalModal(inbox=false){
    const i = initiativeById(state.selectedInitiative);
    const overlay = $('modalOverlay');
    overlay.style.display = 'flex';
    overlay.setAttribute('aria-hidden', 'false');

    $('modalTitle').textContent = inbox ? 'Approvals Inbox (Demo)' : 'Concurrence Required (Commit Points)';

    const body = $('modalBody');
    body.innerHTML = '';

    const top = el('div', { class: 'card' }, [
      el('h3', {}, inbox ? 'Pending items' : 'Proposed HMI changes'),
      el('p', {}, inbox
        ? 'These items require human concurrence because they involve system-of-record writes, financial impact, or policy-sensitive actions.'
        : 'The agent prepared the following commits. Each has a preview, rollback approach, and evidence links.'
      ),
      el('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;' }, [
        statusPill('Policy checks', 'good', 'PASS (with 1 concurrence gate)'),
        statusPill('Evidence', 'good', 'Manifest ready'),
        statusPill('Risk', i.risk === 'High' ? 'warn' : 'good', i.risk),
        statusPill('Autonomy', 'warn', `${i.autonomy} (commit requires approval)`) 
      ])
    ]);

    const table = el('table', { class: 'table', style: 'margin-top:10px' });
    table.appendChild(el('thead', {}, el('tr', {}, [
      el('th', {}, 'Commit point'),
      el('th', {}, 'Change'),
      el('th', {}, 'Guardrail')
    ])));

    const rows = [
      ['Entry amendment draft', 'Prepare amendment payload + customer summary', 'User concurrence required'],
      ['System write', 'Submit amendment to entry system', 'RBAC, policy-as-code, rollback plan'],
      ['Evidence pack lock', 'Attach audit evidence & approvals', 'Immutable evidence pack hash']
    ];
    const tbody = el('tbody');
    rows.forEach(r => {
      tbody.appendChild(el('tr', {}, [
        el('td', {}, r[0]),
        el('td', {}, r[1]),
        el('td', {}, r[2])
      ]));
    });
    table.appendChild(tbody);

    body.appendChild(top);
    body.appendChild(table);

    $('modalApprove').onclick = () => {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      exec.trace.unshift({ t: timeNow(), a: 'Concurrence approved', r: 'Approved by: Expert (demo). System write authorized for this change set.' });
      exec.trace.unshift({ t: timeNow(), a: 'Commit to HMI', r: 'Submitted amendment + updated entry status (demo). Evidence pack locked.' });
      toast('Concurrence recorded', 'Committed to HMI (demo). Evidence pack locked with approvals.');
      renderExplainability();
    };
    $('modalReject').onclick = () => {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      exec.trace.unshift({ t: timeNow(), a: 'Concurrence rejected', r: 'Expert rejected: needs additional data + revised rationale.' });
      toast('Concurrence rejected', 'Agent routed to exception workspace and requested missing information.');
      renderExplainability();
    };
    $('modalRequestMore').onclick = () => {
      overlay.style.display = 'none';
      overlay.setAttribute('aria-hidden', 'true');
      exec.trace.unshift({ t: timeNow(), a: 'Request changes', r: 'Expert requested revisions. Agent will re-plan and re-submit for concurrence.' });
      toast('Changes requested', 'Agent will re-plan with updated constraints and resubmit for approval.');
      renderExplainability();
    };
  }

  function statusPill(label, tone, value){
    return el('span', { class: `status ${tone}` }, [
      el('span', { class: 'b' }),
      el('span', {}, `${label}: ${value}`)
    ]);
  }

  $('modalClose').addEventListener('click', () => {
    $('modalOverlay').style.display = 'none';
    $('modalOverlay').setAttribute('aria-hidden', 'true');
  });

  $('modalOverlay').addEventListener('click', (e) => {
    if (e.target === $('modalOverlay')) {
      $('modalClose').click();
    }
  });

  // ----------------------------
  // HMI console (top-right)
  // ----------------------------
  const HMI_TABS_BY_LENS = {
    'Portfolio Map': ['Portfolio Matrix', '3‑Year Roadmap', '5× Productivity Model'],
    'Initiative Workbench': ['Overview', 'Work Items', 'Gates & Evidence', 'Systems (HMI)'],
    'Agent Factory': ['Pipelines', 'Agents', 'Eval & RL', 'Safety'],
    'Governance & Audit': ['Policy', 'Approvals', 'Exceptions', 'Audit Trail']
  };

  function renderHMITabs(){
    const wrap = $('hmiTabs');
    wrap.innerHTML = '';
    const tabs = HMI_TABS_BY_LENS[state.lens];
    if (!tabs) return;

    if (!renderHMITabs.activeTab || !tabs.includes(renderHMITabs.activeTab)) {
      renderHMITabs.activeTab = tabs[0];
    }

    tabs.forEach(t => {
      wrap.appendChild(el('div', {
        class: `tab ${renderHMITabs.activeTab === t ? 'active' : ''}`,
        onclick: () => { renderHMITabs.activeTab = t; renderHMI(); }
      }, t));
    });
  }

  function renderHMI(){
    renderHMITabs();
    $('hmiMeta').textContent = `${state.perspective} perspective · ${state.lens} lens`;

    const tab = renderHMITabs.activeTab;
    const content = $('hmiContent');
    content.innerHTML = '';

    if (state.lens === 'Portfolio Map') {
      if (tab === 'Portfolio Matrix') content.appendChild(renderPortfolioMatrix());
      if (tab === '3‑Year Roadmap') content.appendChild(renderRoadmap());
      if (tab === '5× Productivity Model') content.appendChild(renderProductivityModel());
      return;
    }

    if (state.lens === 'Initiative Workbench') {
      const i = initiativeById(state.selectedInitiative);
      if (tab === 'Overview') content.appendChild(renderInitiativeOverview(i));
      if (tab === 'Work Items') content.appendChild(renderWorkItems(i));
      if (tab === 'Gates & Evidence') content.appendChild(renderGatesEvidence(i));
      if (tab === 'Systems (HMI)') content.appendChild(renderSystemsHMI(i));
      return;
    }

    if (state.lens === 'Agent Factory') {
      if (tab === 'Pipelines') content.appendChild(renderAgentPipeline());
      if (tab === 'Agents') content.appendChild(renderAgentCatalog());
      if (tab === 'Eval & RL') content.appendChild(renderRLEval());
      if (tab === 'Safety') content.appendChild(renderSafety());
      return;
    }

    if (state.lens === 'Governance & Audit') {
      if (tab === 'Policy') content.appendChild(renderPolicies());
      if (tab === 'Approvals') content.appendChild(renderApprovals());
      if (tab === 'Exceptions') content.appendChild(renderExceptions());
      if (tab === 'Audit Trail') content.appendChild(renderAuditTrail());
      return;
    }
  }

  // --- Portfolio map lens
  function renderPortfolioMatrix(){
    const wrap = el('div', { class: 'card' }, [
      el('h3', {}, 'Portfolio Matrix — 10 buckets × 4 frameworks'),
      el('p', {}, 'Click a cell to filter initiatives by bucket and framework maturity. This is the top‑down “dimensional projection” view.'),
      renderDimensionCube()
    ]);

    const m = el('div', { class: 'matrix', style: 'margin-top:10px' });
    m.appendChild(el('div', { class: 'head' }, 'Bucket'));
    D.FRAMEWORKS.forEach(f => m.appendChild(el('div', { class: 'head' }, f.id)));

    D.BUCKETS.forEach(b => {
      m.appendChild(el('div', { class: 'rowlabel' }, `${b.id} · ${b.short}`));
      D.FRAMEWORKS.forEach(f => {
        const items = filteredInitiatives().filter(i => i.bucket === b.id);
        const byStage = items.filter(i => i.maturity[f.id] === 'Live').length;
        const total = items.length;
        const pct = total ? Math.round((byStage/total)*100) : 0;
        const cell = el('div', {
          class: 'cell',
          onclick: () => {
            state.bucketFilter = b.id;
            state.bucketChips = new Set([b.id]);
            $('bucketFilter').value = b.id;
            renderMenuChips();
            renderInitiatives();
            toast('Filtered', `Bucket ${b.id} selected. Drill down via Initiative Workbench.`);
          }
        }, [
          el('div', { class: 'num' }, `${total}`),
          el('div', { class: 'lbl' }, `Live in ${f.id}: ${byStage} (${pct}%)`),
          el('div', { class: 'small', style: 'margin-top:6px' }, 'Tap to drill down')
        ]);
        const bar = el('div', { class: 'bar' });
        bar.style.width = `${Math.max(10, pct)}%`;
        bar.style.background = `linear-gradient(90deg, ${f.color}, rgba(167,139,250,0.9))`;
        cell.appendChild(bar);
        m.appendChild(cell);
      });
    });

    wrap.appendChild(m);
    return wrap;
  }

  function renderDimensionCube(){
    // Inline SVG to communicate “3D projection” of dimensions
    const svg = `
      <svg viewBox="0 0 340 140" width="100%" height="140" xmlns="http://www.w3.org/2000/svg">
        <defs>
          <linearGradient id="g1" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0" stop-color="rgba(96,165,250,0.85)"/>
            <stop offset="1" stop-color="rgba(167,139,250,0.85)"/>
          </linearGradient>
        </defs>
        <rect x="0" y="0" width="340" height="140" rx="14" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.10)"/>

        <!-- Isometric cube -->
        <path d="M110 35 L205 20 L270 55 L175 70 Z" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.12)"/>
        <path d="M110 35 L175 70 L175 120 L110 85 Z" fill="rgba(255,255,255,0.05)" stroke="rgba(255,255,255,0.12)"/>
        <path d="M175 70 L270 55 L270 105 L175 120 Z" fill="rgba(96,165,250,0.12)" stroke="rgba(255,255,255,0.12)"/>
        <path d="M110 35 L205 20 L205 70 L110 85 Z" fill="rgba(167,139,250,0.10)" stroke="rgba(255,255,255,0.12)"/>

        <path d="M205 20 L270 55" stroke="rgba(255,255,255,0.20)"/>
        <path d="M205 70 L270 105" stroke="rgba(255,255,255,0.20)"/>

        <text x="24" y="38" fill="rgba(255,255,255,0.78)" font-size="12" font-weight="800">Dimensional projection</text>
        <text x="24" y="58" fill="rgba(255,255,255,0.55)" font-size="11">X: Buckets (A1–A10)</text>
        <text x="24" y="74" fill="rgba(255,255,255,0.55)" font-size="11">Y: Framework stages (BidOps→LifeOps)</text>
        <text x="24" y="90" fill="rgba(255,255,255,0.55)" font-size="11">Z: Autonomy level (B1–B4)</text>

        <text x="190" y="34" fill="url(#g1)" font-size="11" font-weight="900">Portfolio view</text>
        <text x="125" y="112" fill="rgba(45,212,191,0.9)" font-size="11" font-weight="900">HAI control plane</text>
      </svg>`;
    return el('div', { style: 'margin-top:10px', html: svg });
  }

  function renderRoadmap(){
    const wrap = el('div', { class: 'card' }, [
      el('h3', {}, '3‑Year Roadmap — Copilot → Orchestrated → Guardrailed Autonomy'),
      el('p', {}, 'Illustrative sequencing: start with high-frequency, reversible workflows; expand to cross-system orchestration; then enable guardrailed autonomy with evidence and SLO controls.')
    ]);

    const rows = [
      ['Year 0–1', 'Foundation + Copilot', 'API/tool enablement, policy-as-code, semantic layer, copilot for docs/tests/runbooks.'],
      ['Year 1–2', 'Orchestrated agents + concurrence', 'End-to-end workflows with commit points; evidence packs; portfolio heatmap + initiative management.'],
      ['Year 2–3', 'Guardrailed autonomy + closed-loop (select)', 'Low-risk auto-remediation, canary analysis, drift monitoring, RL feedback loops.']
    ];

    const table = el('table', { class: 'table', style: 'margin-top:10px' });
    table.appendChild(el('thead', {}, el('tr', {}, [
      el('th', {}, 'Horizon'),
      el('th', {}, 'Operating model'),
      el('th', {}, 'What changes')
    ])));
    const tb = el('tbody');
    rows.forEach(r => tb.appendChild(el('tr', {}, [el('td', {}, r[0]), el('td', {}, r[1]), el('td', {}, r[2])])));
    table.appendChild(tb);

    wrap.appendChild(table);
    return wrap;
  }

  function renderProductivityModel(){
    const wrap = el('div', { class: 'card' }, [
      el('h3', {}, '5× Productivity (Target) — How it is achieved'),
      el('p', {}, 'A 5× outcome is a multi-lever effect: fewer manual touches, faster exception resolution, higher first-pass acceptance, and reduced rework via evidence + policy gates.')
    ]);

    const table = el('table', { class: 'table', style: 'margin-top:10px' });
    table.appendChild(el('thead', {}, el('tr', {}, [
      el('th', {}, 'Lever'),
      el('th', {}, 'Mechanism (agent-first)'),
      el('th', {}, 'Metric')
    ])));

    const rows = [
      ['Touch reduction', 'HAI auto-completes routine steps; humans handle exceptions', 'Touches/shipment'],
      ['Faster exceptions', 'Exception workspace + policy citations + suggested remediations', 'Time-to-resolve'],
      ['Quality uplift', 'Contract tests + evaluation + evidence packs', 'First-pass acceptance'],
      ['Ops efficiency', 'AIOps triage + safe runbook automation', 'MTTR / change failure rate'],
      ['Learning loop', 'Feedback → rewards → eval gating → improved playbooks', 'Regression rate / drift']
    ];

    const tb = el('tbody');
    rows.forEach(r => tb.appendChild(el('tr', {}, [el('td', {}, r[0]), el('td', {}, r[1]), el('td', {}, r[2])])));
    table.appendChild(tb);

    wrap.appendChild(table);
    wrap.appendChild(el('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap' }, [
      statusPill('Safety pass', 'good', D.AGENT_PIPELINE.metrics.safetyPassRate),
      statusPill('Regression', 'good', D.AGENT_PIPELINE.metrics.evalRegressionRate),
      statusPill('Concurrence time', 'warn', D.AGENT_PIPELINE.metrics.meanTimeToConcurrence),
      statusPill('Coverage', 'warn', D.AGENT_PIPELINE.metrics.automationCoverage)
    ]));
    return wrap;
  }

  // --- Initiative workbench lens
  function renderInitiativeOverview(i){
    const b = bucketById(i.bucket);
    const a = autonomyById(i.autonomy);
    return el('div', { class: 'grid2' }, [
      el('div', { class: 'card' }, [
        el('h3', {}, i.name),
        el('p', {}, i.description),
        el('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap' }, [
          statusPill('Portfolio', 'good', i.portfolio),
          statusPill('Bucket', 'good', `${i.bucket} · ${b.short}`),
          statusPill('Autonomy', 'warn', `${i.autonomy} · ${a.name}`),
          statusPill('Risk', i.risk === 'High' ? 'warn' : 'good', i.risk)
        ]),
        el('div', { style: 'margin-top:10px' }, el('div', { class: 'small' }, `Owner: ${i.owner} · Updated: ${i.lastUpdated}`))
      ]),
      el('div', { class: 'card' }, [
        el('h3', {}, 'Lifecycle Coverage'),
        el('p', {}, 'This shows how the initiative is managed across BidOps, BuildOps, RunOps, and LifeOps. The HAI console is the consistent interaction layer across all stages.'),
        el('table', { class: 'table', style: 'margin-top:10px' }, [
          el('thead', {}, el('tr', {}, [el('th', {}, 'Framework'), el('th', {}, 'Status'), el('th', {}, 'Primary Evidence') ])),
          el('tbody', {}, [
            tr3('BidOps', i.maturity.BidOps, 'RFP matrix, assumptions, SoW acceptance'),
            tr3('BuildOps', i.maturity.BuildOps, 'Backlog → PRs → tests → evidence packs'),
            tr3('RunOps', i.maturity.RunOps, 'ORR, dashboards, runbooks, incidents'),
            tr3('LifeOps', i.maturity.LifeOps, 'Vuln lifecycle, drift, deprecation, modernization')
          ])
        ])
      ])
    ]);
  }

  function tr3(a,b,c){
    return el('tr', {}, [el('td', {}, a), el('td', {}, b), el('td', {}, c)]);
  }

  function renderWorkItems(i){
    const rows = [
      ['Epic', `Deliver ${bucketById(i.bucket).short} capability for ${i.portfolio}`, 'In Progress', 'Trace: SoW → Epic → Stories'],
      ['Story', 'Define acceptance criteria and policy gates', 'In Progress', 'DoR/DoD + evidence'],
      ['Story', 'Implement tool calls with rollback strategy', 'Planned', 'Commit-point design'],
      ['Story', 'Add evaluation + safety regression suite', 'Planned', 'D6 (if applicable)'],
      ['Story', 'Operational readiness package (D2S)', 'Planned', 'Runbooks, dashboards, alerts']
    ];
    const table = el('table', { class: 'table' });
    table.appendChild(el('thead', {}, el('tr', {}, [
      el('th', {}, 'Type'), el('th', {}, 'Title'), el('th', {}, 'State'), el('th', {}, 'Notes')
    ])));
    const tb = el('tbody');
    rows.forEach(r => tb.appendChild(el('tr', {}, [el('td', {}, r[0]), el('td', {}, r[1]), el('td', {}, r[2]), el('td', {}, r[3])])))
    table.appendChild(tb);

    return el('div', { class: 'card' }, [
      el('h3', {}, 'Work items (demo)'),
      el('p', {}, 'In a real implementation, this would sync to Jira/Azure DevOps. Here we demonstrate the structure and traceability.'),
      el('div', { style: 'margin-top:10px' }, table)
    ]);
  }

  function renderGatesEvidence(i){
    const gates = [
      ['D0', 'Engineering Ready', 'PASS', 'Repo + CI baseline + policy checks'],
      ['D1', 'Design Authority', 'IN REVIEW', 'SAD + ADRs + threat model'],
      ['D2', 'PO Baseline', 'PLANNED', 'Backlog + traceability matrix'],
      ['D4', 'Merge Gate', 'PLANNED', 'Tests + scans + provenance'],
      ['D7', 'Release Readiness', 'PLANNED', 'UAT + rollout/rollback + ORR draft']
    ];
    const table = el('table', { class: 'table' });
    table.appendChild(el('thead', {}, el('tr', {}, [
      el('th', {}, 'Gate'), el('th', {}, 'Name'), el('th', {}, 'Status'), el('th', {}, 'Evidence Pack (demo)')
    ])));
    const tb = el('tbody');
    gates.forEach(g => {
      tb.appendChild(el('tr', {}, [
        el('td', {}, g[0]),
        el('td', {}, g[1]),
        el('td', {}, g[2]),
        el('td', {}, g[3])
      ]));
    });
    table.appendChild(tb);

    return el('div', { class: 'card' }, [
      el('h3', {}, 'Gates & Evidence (Agis BuildOps)'),
      el('p', {}, 'Agis Fabric enforces “prove before promote”: every gate is backed by an immutable evidence pack.'),
      el('div', { style: 'margin-top:10px' }, table),
      el('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap' }, [
        statusPill('Evidence packs', 'good', 'Immutable + hashed'),
        statusPill('Policies', 'good', 'Policy-as-code v3.2'),
        statusPill('Exceptions', 'warn', 'Time-bounded')
      ])
    ]);
  }

  function renderSystemsHMI(i){
    const systems = [
      ['Entry Management (Legacy)', 'Read/Write', 'API wrapper + HAI commit points'],
      ['Policy Repository', 'Read', 'Cited in explainability'],
      ['ITSM / Ticketing', 'Write', 'Auto-ticket with evidence'],
      ['Observability', 'Read/Write', 'Dashboards + alerts'],
      ['Artifact Registry', 'Write', 'SBOM + signed artifacts']
    ];

    const sysTable = buildTable(['System', 'Access', 'Guardrail'], systems);

    // A lightweight “system of record” mock for demo purposes.
    const hmiMock = renderHMIMock(i);

    return el('div', { class: 'grid2' }, [
      el('div', { class: 'card' }, [
        el('h3', {}, 'HMI Console (mock) — system-of-record view'),
        el('p', {}, 'A representative HMI screen: queues + record detail. Writes are intentionally gated via concurrence.'),
        hmiMock
      ]),
      el('div', { class: 'card' }, [
        el('h3', {}, 'Systems (integrations) — where the agent calls tools'),
        el('p', {}, 'Agis HAI operates above systems of record using tool calls governed by RBAC, policy-as-code, and evidence packs.'),
        el('div', { style: 'margin-top:10px' }, sysTable)
      ])
    ]);
  }

  function renderHMIMock(i){
    const queueRows = [
      ['SHP-88421', 'ENT-100982', 'HOLD', '3h 12m', 'Unassigned'],
      ['SHP-88429', 'ENT-100993', 'REVIEW', '6h 04m', 'Queue: Brokerage'],
      ['SHP-88433', 'ENT-100998', 'READY', '1h 22m', 'Queue: FastTrack']
    ];

    const queue = buildTable(['Shipment', 'Entry', 'Status', 'SLA', 'Owner'], queueRows);

    const detail = el('div', { class: 'card', style: 'margin-top:10px; background:rgba(0,0,0,0.14)' }, [
      el('h3', {}, 'Entry Detail (selected)'),
      el('p', {}, 'ENT-100982 · Status: HOLD · Reason: missing attribute + classification mismatch'),
      el('table', { class: 'table', style: 'margin-top:10px' }, [
        el('tbody', {}, [
          tr3('Importer', 'ACME Components LLC', 'Read-only'),
          tr3('Declared value', '$42,180', 'Validated'),
          tr3('HTS/Classification', 'Proposed: 8542.31 · Current: 8542.39', 'Needs concurrence (High risk)'),
          tr3('Missing data', 'Country of origin for line 2', 'Auto-request sent'),
          tr3('Attachments', 'Invoice.pdf · PackingList.pdf', 'Scanned / OCR ready')
        ])
      ]),
      el('div', { style: 'display:flex; gap:8px; flex-wrap:wrap; margin-top:10px' }, [
        el('span', { class: 'status warn' }, [el('span', { class: 'b' }), el('span', {}, 'Write disabled: awaiting concurrence')]),
        el('span', { class: 'status good' }, [el('span', { class: 'b' }), el('span', {}, 'Rollback plan: prepared')])
      ])
    ]);

    // Wrap into a neat mock layout
    return el('div', {}, [
      el('div', { class: 'small' }, `Portfolio: ${i.portfolio} · Guardrails: RBAC + policy-as-code + evidence packs`),
      el('div', { style: 'margin-top:10px' }, queue),
      detail
    ]);
  }

  // --- Agent factory lens
  function renderAgentPipeline(){
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Agentic Pipeline (bottom‑up control)'),
      el('p', {}, 'This view manages the agent pipeline: retrieval, planning, tool use, policy gates, evidence, deployment, observability, and learning loops.'),
      el('div', { style: 'margin-top:10px' , html: svgPipeline(D.AGENT_PIPELINE) }),
      el('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap' }, [
        statusPill('Safety pass', 'good', D.AGENT_PIPELINE.metrics.safetyPassRate),
        statusPill('Automation coverage', 'warn', D.AGENT_PIPELINE.metrics.automationCoverage),
        statusPill('3‑year productivity', 'warn', D.AGENT_PIPELINE.metrics.predictedProductivityGain3Y)
      ])
    ]);
  }

  function svgPipeline(p){
    const w = 820, h = 260;
    const nodes = p.nodes;
    const positions = {};
    const cols = 5;
    nodes.forEach((n, idx) => {
      const row = Math.floor(idx / cols);
      const col = idx % cols;
      positions[n.id] = { x: 60 + col * 150, y: 60 + row * 110 };
    });

    const nodeRect = (n) => {
      const {x,y} = positions[n.id];
      const fill = n.type === 'policy' ? 'rgba(251,191,36,0.14)'
        : n.type === 'evidence' ? 'rgba(45,212,191,0.13)'
        : n.type === 'orchestrator' ? 'rgba(167,139,250,0.14)'
        : 'rgba(96,165,250,0.12)';
      return `
        <g>
          <rect x="${x-64}" y="${y-28}" width="128" height="64" rx="14" fill="${fill}" stroke="rgba(255,255,255,0.12)"/>
          <text x="${x}" y="${y-6}" text-anchor="middle" fill="rgba(255,255,255,0.88)" font-size="11" font-weight="800">${escapeSvg(n.label.split('\n')[0])}</text>
          <text x="${x}" y="${y+12}" text-anchor="middle" fill="rgba(255,255,255,0.58)" font-size="10">${escapeSvg(n.label.split('\n')[1] || '')}</text>
        </g>`;
    };

    const edgeLine = (a,b) => {
      const A = positions[a], B = positions[b];
      return `<path d="M ${A.x} ${A.y+30} C ${A.x} ${A.y+60}, ${B.x} ${B.y-60}, ${B.x} ${B.y-30}" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>`;
    };

    const edges = p.edges.map(([a,b]) => edgeLine(a,b)).join('\n');
    const nodeSvg = nodes.map(nodeRect).join('\n');

    return `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="260" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${w}" height="${h}" rx="16" fill="rgba(0,0,0,0.18)" stroke="rgba(255,255,255,0.10)"/>
        ${edges}
        ${nodeSvg}
        <text x="18" y="26" fill="rgba(255,255,255,0.70)" font-size="12" font-weight="800">Tool-gated agent pipeline (demo)</text>
      </svg>`;
  }

  function escapeSvg(s){
    return (s||'').replace(/[&<>]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;'}[c]));
  }

  function renderAgentCatalog(){
    const rows = [
      ['Orchestrator Agent', 'Plans work, schedules dependencies, enforces commit points', 'All'],
      ['Policy/Compliance Agent', 'Evaluates policy-as-code, manages exceptions', 'All'],
      ['Evidence Pack Agent', 'Builds immutable evidence packs for gates', 'BuildOps/RunOps'],
      ['TestGen Agent', 'Generates unit/contract/e2e tests', 'BuildOps'],
      ['Observability Agent', 'Ensures SLO dashboards, alerts, and runbooks', 'RunOps'],
      ['Drift/Safety Agent', 'Monitors drift and safety regressions', 'LifeOps']
    ];
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Agent catalog (illustrative)'),
      el('p', {}, 'Agents are role-scoped and tool-restricted; actions are auditable and policy-checked.'),
      buildTable(['Agent', 'What it does', 'Primary framework'], rows)
    ]);
  }

  function renderRLEval(){
    const r = D.AGENT_PIPELINE.rl;
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Continuous learning (RL-style) — governed'),
      el('p', {}, 'Learning is bounded: reward signals are used to improve policies/playbooks and model selection, but promotions are blocked by evaluation and safety gates.'),
      el('div', { style: 'margin-top:10px' }, el('div', { class: 'small' }, 'Reward signals')),
      el('ul', { style: 'margin:8px 0 0 18px; color: rgba(255,255,255,0.80); font-size:12px; line-height:1.5' }, r.rewardSignals.map(x => el('li', {}, x))),
      el('div', { style: 'margin-top:12px' }, el('div', { class: 'small' }, 'Guardrails')),
      el('ul', { style: 'margin:8px 0 0 18px; color: rgba(255,255,255,0.80); font-size:12px; line-height:1.5' }, r.guardrails.map(x => el('li', {}, x))),
      el('div', { style: 'margin-top:10px; display:flex; gap:8px; flex-wrap:wrap' }, [
        statusPill('Eval regression', 'good', D.AGENT_PIPELINE.metrics.evalRegressionRate),
        statusPill('Safety', 'good', D.AGENT_PIPELINE.metrics.safetyPassRate)
      ])
    ]);
  }

  function renderSafety(){
    const rows = [
      ['Prompt injection', 'Scenario suite blocks tool hijacking attempts', 'PASS'],
      ['Data leakage', 'PII redaction + DLP policy checks', 'PASS'],
      ['Tool misuse', 'Allow-listed tools + scoped credentials', 'PASS'],
      ['Hallucination guard', 'Grounding requirements + citations where applicable', 'WARN (monitor)'],
      ['Model drift', 'Drift monitors + rollback to prior model', 'PASS']
    ];
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Safety suite (demo)'),
      el('p', {}, 'Before promoting autonomy, Agis Fabric runs safety suites and blocks release if severe failures occur.'),
      buildTable(['Risk', 'Control', 'Status'], rows)
    ]);
  }

  // --- Governance & audit lens
  function renderPolicies(){
    const rows = [
      ['P‑1', 'No system writes without concurrence', 'Enforced at commit points'],
      ['P‑2', 'PII handling and redaction', 'Enforced in retrieval and logging'],
      ['P‑3', 'SBOM + signed artifacts required', 'Enforced at merge and release'],
      ['P‑4', 'Exceptions expire and require compensating controls', 'Enforced in exception workflow']
    ];
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Policy-as-code (demo)'),
      el('p', {}, 'Policies are executable constraints evaluated automatically. Exceptions are time-bounded and fully auditable.'),
      buildTable(['Policy', 'Description', 'Enforcement'], rows)
    ]);
  }

  function renderApprovals(){
    const rows = [
      ['Architecture sign-off', 'Design Authority', 'Pending'],
      ['Concurrence for commit', 'Brokerage Expert', 'Ready'],
      ['Release readiness', 'Release Manager', 'Planned'],
      ['ORR (handover to SRE)', 'SRE Lead', 'Planned']
    ];
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Approval workflow (demo)'),
      el('p', {}, 'Approvals are the human-in-the-loop control points: concurrence, exceptions, strategy, and feedback.'),
      buildTable(['Approval', 'Owner', 'State'], rows)
    ]);
  }

  function renderExceptions(){
    const rows = [
      ['EX‑12', 'High-risk classification mismatch', 'Needs expert concurrence', 'Open'],
      ['EX‑19', 'Missing shipment attribute (source system)', 'Auto-ticket created', 'Open'],
      ['EX‑22', 'Policy conflict detected', 'Routed to compliance', 'In Review']
    ];
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Exceptions (demo)'),
      el('p', {}, 'Exception-first design: failures become guided resolution workspaces, not dead ends.'),
      buildTable(['Exception', 'Reason', 'Route', 'State'], rows)
    ]);
  }

  function renderAuditTrail(){
    const rows = exec.trace.length
      ? exec.trace.slice(0,8).map(x => [x.t, x.a, x.r])
      : [
        ['09:10', 'Policy checks', 'PASS (baseline)'],
        ['09:12', 'Evidence pack', 'Manifest created'],
        ['09:14', 'Approval', 'Pending concurrence']
      ];
    return el('div', { class: 'card' }, [
      el('h3', {}, 'Audit trail (demo)'),
      el('p', {}, 'Every material action is logged with policy version and evidence references.'),
      buildTable(['Time', 'Action', 'Outcome'], rows)
    ]);
  }

  function buildTable(headers, rows){
    const table = el('table', { class: 'table', style: 'margin-top:10px' });
    table.appendChild(el('thead', {}, el('tr', {}, headers.map(h => el('th', {}, h)))));
    table.appendChild(el('tbody', {}, rows.map(r => el('tr', {}, r.map(c => el('td', {}, c))))));
    return table;
  }

  // ----------------------------
  // Explainability panel (bottom-right)
  // ----------------------------
  function renderExplainability(){
    renderMindmap();
    renderTrustCard();
    renderRLCard();
    renderTrace();
  }

  function buildDefaultPlan(i){
    const bucket = bucketById(i.bucket);
    const nodes = [
      { id: 'g', label: 'Goal', sub: i.kpi.metric, status: 'focus' },
      { id: 'c', label: 'Clarify intent', sub: 'Ask 2–3 questions', status: 'todo' },
      { id: 'r', label: 'Retrieve context', sub: 'Policies + case data', status: 'todo' },
      { id: 'v', label: 'Validate', sub: 'Schema + rules + risk', status: 'todo' },
      { id: 'p', label: 'Plan actions', sub: `Bucket: ${bucket.short}`, status: 'todo' },
      { id: 'x', label: 'Preview changes', sub: 'No writes yet', status: 'todo' },
      { id: 'a', label: 'Concurrence', sub: 'Commit points', status: 'gate' },
      { id: 'm', label: 'Execute in HMI', sub: 'Write with RBAC', status: 'todo' },
      { id: 'e', label: 'Evidence pack', sub: 'Lock + hash', status: 'todo' },
      { id: 'o', label: 'Observe', sub: 'SLOs + drift', status: 'todo' },
      { id: 'l', label: 'Learn', sub: 'Feedback & rewards', status: 'todo' }
    ];
    const edges = [
      ['g','c'], ['c','r'], ['r','v'], ['v','p'], ['p','x'], ['x','a'], ['a','m'], ['m','e'], ['e','o'], ['o','l']
    ];
    return { nodes, edges };
  }

  function renderMindmap(){
    const wrap = $('mindmap');
    wrap.innerHTML = '';
    const i = initiativeById(state.selectedInitiative);
    const plan = exec.plan || buildDefaultPlan(i);

    // Layout nodes horizontally (simple, clean)
    const w = 520, h = 150;
    const paddingX = 22;
    const xStep = (w - 2*paddingX) / (plan.nodes.length-1);
    const pos = {};
    plan.nodes.forEach((n, idx) => {
      pos[n.id] = { x: paddingX + idx * xStep, y: 74 };
    });

    const edgeSvg = plan.edges.map(([a,b]) => {
      const A = pos[a], B = pos[b];
      return `<path d="M ${A.x} ${A.y} C ${(A.x+B.x)/2} ${A.y-36}, ${(A.x+B.x)/2} ${B.y+36}, ${B.x} ${B.y}" fill="none" stroke="rgba(255,255,255,0.18)" stroke-width="2"/>`;
    }).join('\n');

    const nodeSvg = plan.nodes.map(n => {
      const {x,y} = pos[n.id];
      const fill = n.status === 'gate' ? 'rgba(251,191,36,0.18)'
        : n.status === 'focus' ? 'rgba(45,212,191,0.18)'
        : 'rgba(255,255,255,0.06)';
      const stroke = n.status === 'gate' ? 'rgba(251,191,36,0.38)'
        : n.status === 'focus' ? 'rgba(45,212,191,0.32)'
        : 'rgba(255,255,255,0.12)';
      return `
        <g>
          <circle cx="${x}" cy="${y}" r="14" fill="${fill}" stroke="${stroke}"/>
          <text x="${x}" y="${y+4}" text-anchor="middle" fill="rgba(255,255,255,0.82)" font-size="10" font-weight="900">${escapeSvg(n.label[0])}</text>
        </g>`;
    }).join('\n');

    const labelsSvg = plan.nodes.map(n => {
      const {x,y} = pos[n.id];
      return `
        <g>
          <text x="${x}" y="${y+34}" text-anchor="middle" fill="rgba(255,255,255,0.86)" font-size="11" font-weight="800">${escapeSvg(n.label)}</text>
          <text x="${x}" y="${y+50}" text-anchor="middle" fill="rgba(255,255,255,0.55)" font-size="10">${escapeSvg(n.sub || '')}</text>
        </g>`;
    }).join('\n');

    const svg = `
      <svg viewBox="0 0 ${w} ${h}" width="100%" height="150" xmlns="http://www.w3.org/2000/svg">
        <rect x="0" y="0" width="${w}" height="${h}" rx="14" fill="rgba(0,0,0,0.10)" stroke="rgba(255,255,255,0.10)"/>
        ${edgeSvg}
        ${nodeSvg}
        ${labelsSvg}
      </svg>`;

    wrap.appendChild(el('div', { html: svg }));
  }

  function renderTrustCard(){
    const i = initiativeById(state.selectedInitiative);
    const b = bucketById(i.bucket);

    $('trustCard').innerHTML = `
      <h3>HHI-level experience, with enterprise transparency</h3>
      <p>
        The HAI console behaves like a capable colleague: it clarifies intent, proposes a plan, previews outcomes, requests concurrence at commit points, and produces evidence packs.
        The HMI console remains the system of record—writes are gated.
      </p>
      <div style="margin-top:10px; display:flex; gap:8px; flex-wrap:wrap;">
        ${pillHtml('Interaction contract', 'Intent → Plan → Preview → Concur → Commit → Prove')}
        ${pillHtml('Explainability', 'Rationale + citations + decision logs')}
        ${pillHtml('Guardrails', 'RBAC + policy-as-code + rollback')}
        ${pillHtml('Bucket', `${i.bucket} · ${b.short}`)}
      </div>
      <div class="small" style="margin-top:10px;">Note: this demo shows human-readable strategy and an execution trace (no private model tokens).</div>
    `;
  }

  function pillHtml(k, v){
    return `<span class="status good"><span class="b"></span><span>${escapeHtml(k)}: ${escapeHtml(v)}</span></span>`;
  }

  function escapeHtml(s){
    return String(s||'').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  function renderRLCard(){
    const m = D.AGENT_PIPELINE.metrics;
    const r = D.AGENT_PIPELINE.rl;

    $('rlCard').innerHTML = `
      <h3>Bottom-up: Agent Factory + Continuous Learning</h3>
      <p>
        Agis Fabric improves through governed learning loops: feedback becomes rewards, but promotion is gated by evaluation + safety suites.
      </p>
      <div style="margin-top:10px; display:grid; grid-template-columns:1fr 1fr; gap:8px;">
        <div class="kpi"><div class="k">Safety pass rate</div><div class="v">${m.safetyPassRate}</div><div class="s">Blocks promotion on severe failures</div></div>
        <div class="kpi"><div class="k">Regression rate</div><div class="v">${m.evalRegressionRate}</div><div class="s">Measured per release train</div></div>
        <div class="kpi"><div class="k">Automation coverage</div><div class="v">${m.automationCoverage}</div><div class="s">Across eligible workflows</div></div>
        <div class="kpi"><div class="k">3‑year target</div><div class="v">${m.predictedProductivityGain3Y}</div><div class="s">Directional target, validated by pilots</div></div>
      </div>
      <div class="small" style="margin-top:10px;"><b>Reward signals:</b> ${r.rewardSignals.slice(0,3).join(' · ')} …</div>
    `;
  }

  function renderTrace(){
    const wrap = $('trace');
    wrap.innerHTML = '';

    const rows = exec.trace.length
      ? exec.trace.slice(0, 9)
      : [
        { t: '09:10', a: 'Load initiative', r: 'Synced portfolio context; prepared gated tool access.' },
        { t: '09:12', a: 'Policy checks', r: 'PASS baseline: RBAC scope, PII handling, audit logging enabled.' },
        { t: '09:14', a: 'Await user intent', r: 'Ready to simulate plan or run dry execution.' }
      ];

    rows.forEach(r => {
      wrap.appendChild(el('div', { class: 'row' }, [
        el('div', { class: 't' }, r.t),
        el('div', { class: 'a' }, r.a),
        el('div', { class: 'r' }, r.r)
      ]));
    });
  }

  // ----------------------------
  // Breadcrumbs
  // ----------------------------
  function renderBreadcrumbs(){
    $('perspectiveLabel').textContent = state.perspective;
    $('lensLabel').textContent = state.lens;
    $('initiativeLabel').textContent = initiativeById(state.selectedInitiative).name;
  }

  // ----------------------------
  // Render all
  // ----------------------------
  function renderAll(){
    renderMenuChips();
    renderBucketFilterSelect();
    renderModeTabs();
    renderInitiatives();
    renderBreadcrumbs();
    renderKpis();
    renderContext();
    renderChat(true);
    renderHMI();
    renderExplainability();
  }

  // Initial render
  renderAll();

  // Extra: keep selection stable when changing bucketFilter dropdown manually.
  $('bucketFilter').value = state.bucketFilter;

})();
