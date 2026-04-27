// ══════════════════════════════════════════════════════════════
// VetPlan — Shared App Logic  (app.js)
// ══════════════════════════════════════════════════════════════

const VetPlan = (() => {

  // ── SAMPLE DATA ─────────────────────────────────────────────
  const DEFAULT_PLANS = [
    {
      id: '1',
      petName: 'Mochi',
      petSpecies: 'Dog',
      petBreed: 'Shiba Inu',
      petAge: '4',
      ownerName: 'Jordan Lee',
      ownerEmail: 'jordan@email.com',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Anterior cruciate ligament (ACL) tear in the right hind leg, confirmed by physical examination and radiographic imaging.',
      treatment: 'Tibial Plateau Leveling Osteotomy (TPLO) surgery is recommended. This involves surgical correction of the tibial plateau angle to restore joint stability. Post-op physical therapy and restricted activity for 8–12 weeks.',
      cost: '3200.00',
      benefits: 'Full recovery expected in 3–4 months with proper rehabilitation. Permanent joint stabilization and return to full activity.',
      risks: 'Surgical complications (rare, <2%), infection, and implant failure.',
      notes: 'Pre-op bloodwork required. Fasting 12 hours before procedure.',
      status: 'pending',
      createdDate: '2026-04-24',
      updatedDate: '2026-04-24',
      revisionNote: null,
      priority: 'high',
      followUpDate: '2026-05-24',
    },
    {
      id: '2',
      petName: 'Biscuit',
      petSpecies: 'Cat',
      petBreed: 'Domestic Shorthair',
      petAge: '9',
      ownerName: 'Jordan Lee',
      ownerEmail: 'jordan@email.com',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Chronic kidney disease (CKD) Stage 2. Elevated BUN and creatinine levels detected in routine bloodwork.',
      treatment: 'Prescription renal diet (Hill\'s k/d), increased water intake via wet food, subcutaneous fluid therapy twice weekly, and bi-monthly bloodwork monitoring.',
      cost: '180.00',
      benefits: 'Disease progression slowed significantly. Quality of life maintained and extended life expectancy.',
      risks: 'Without treatment, CKD will progress rapidly. Minor risk of fluid overload with subcutaneous therapy.',
      notes: 'Schedule follow-up in 6 weeks for bloodwork recheck.',
      status: 'revision',
      createdDate: '2026-04-20',
      updatedDate: '2026-04-22',
      revisionNote: 'I am concerned about the monthly cost. Can we explore a less frequent fluid therapy schedule or a more affordable diet option?',
      priority: 'medium',
      followUpDate: '2026-06-01',
    },
    {
      id: '3',
      petName: 'Mochi',
      petSpecies: 'Dog',
      petBreed: 'Shiba Inu',
      petAge: '4',
      ownerName: 'Jordan Lee',
      ownerEmail: 'jordan@email.com',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Mild dental disease (Grade 2). Tartar buildup and early gingivitis affecting molars.',
      treatment: 'Professional dental cleaning under general anesthesia, dental radiographs, and possible extraction of compromised teeth. Home dental care regimen post-procedure.',
      cost: '650.00',
      benefits: 'Improved oral health, reduced infection risk, fresher breath.',
      risks: 'Low anesthetic risk given patient\'s age and health. Extractions may be needed if root damage is found on X-ray.',
      notes: '',
      status: 'approved',
      createdDate: '2026-04-15',
      updatedDate: '2026-04-17',
      revisionNote: null,
      priority: 'low',
      followUpDate: '2026-07-15',
    },
    {
      id: '4',
      petName: 'Luna',
      petSpecies: 'Rabbit',
      petBreed: 'Holland Lop',
      petAge: '2',
      ownerName: 'Jordan Lee',
      ownerEmail: 'jordan@email.com',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Gastrointestinal stasis (GI stasis). Reduced gut motility detected during examination.',
      treatment: 'Subcutaneous fluids, gut motility drugs (metoclopramide), pain management (meloxicam), and syringe feeding of Critical Care until normal GI function resumes.',
      cost: '420.00',
      benefits: 'Full recovery expected within 48-72 hours with prompt treatment. Prevented life-threatening complications.',
      risks: 'Untreated GI stasis can be fatal within 24-48 hours. Medication side effects are rare.',
      notes: 'Monitor droppings closely. Return immediately if condition worsens.',
      status: 'approved',
      createdDate: '2026-04-10',
      updatedDate: '2026-04-11',
      revisionNote: null,
      priority: 'high',
      followUpDate: null,
    },
  ];

  // ── STORAGE KEYS ─────────────────────────────────────────────
  const KEY_USER   = 'vetplan_user';
  const KEY_PLANS  = 'vetplan_plans';
  const KEY_THEME  = 'vetplan_theme';

  // ── PLANS INIT ───────────────────────────────────────────────
  function initPlans() {
    if (!localStorage.getItem(KEY_PLANS)) {
      localStorage.setItem(KEY_PLANS, JSON.stringify(DEFAULT_PLANS));
    }
  }

  // ── THEME ────────────────────────────────────────────────────
  function getTheme() { return localStorage.getItem(KEY_THEME) || 'light'; }
  function setTheme(t) {
    localStorage.setItem(KEY_THEME, t);
    document.documentElement.setAttribute('data-theme', t);
  }
  function toggleTheme() {
    const next = getTheme() === 'dark' ? 'light' : 'dark';
    setTheme(next);
    return next;
  }
  function applyTheme() {
    document.documentElement.setAttribute('data-theme', getTheme());
  }

  // ── USER ─────────────────────────────────────────────────────
  function setUser(role, name) {
    localStorage.setItem(KEY_USER, JSON.stringify({ role, name }));
  }
  function getUser() {
    const raw = localStorage.getItem(KEY_USER);
    return raw ? JSON.parse(raw) : null;
  }
  function logout() {
    localStorage.removeItem(KEY_USER);
    window.location.href = 'index.html';
  }
  function requireLogin(expectedRole) {
    initPlans();
    applyTheme();
    const user = getUser();
    if (!user) { window.location.href = 'index.html'; return null; }
    if (expectedRole && user.role !== expectedRole) {
      window.location.href = 'index.html'; return null;
    }
    return user;
  }

  // ── PLANS ────────────────────────────────────────────────────
  function getPlans() {
    initPlans();
    return JSON.parse(localStorage.getItem(KEY_PLANS) || '[]');
  }
  function getPlanById(id) {
    return getPlans().find(p => String(p.id) === String(id)) || null;
  }
  function addPlan(planData) {
    const plans = getPlans();
    const today = new Date().toISOString().split('T')[0];
    const newPlan = {
      ...planData,
      id: String(Date.now()),
      status: 'pending',
      createdDate: today,
      updatedDate: today,
      revisionNote: null,
      priority: planData.priority || 'medium',
    };
    plans.unshift(newPlan);
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
    return newPlan;
  }
  function updatePlanStatus(id, status, revisionNote) {
    const plans = getPlans();
    const idx = plans.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    plans[idx].status = status;
    plans[idx].updatedDate = new Date().toISOString().split('T')[0];
    if (revisionNote !== undefined) plans[idx].revisionNote = revisionNote;
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }
  function updatePlan(id, fields) {
    const plans = getPlans();
    const idx = plans.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    plans[idx] = { ...plans[idx], ...fields, updatedDate: new Date().toISOString().split('T')[0] };
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }
  function deletePlan(id) {
    const plans = getPlans().filter(p => String(p.id) !== String(id));
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }

  // ── HELPERS ──────────────────────────────────────────────────
  function petEmoji(species) {
    const map = { Dog:'🐕', Cat:'🐈', Bird:'🦜', Rabbit:'🐇', Fish:'🐠', Reptile:'🦎', Other:'🐾' };
    return map[species] || '🐾';
  }
  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }
  function formatDateLong(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }
  function statusBadge(status) {
    const map = {
      pending:  ['status-badge status-pending',  'Awaiting Approval'],
      approved: ['status-badge status-approved', 'Approved'],
      revision: ['status-badge status-revision', 'Revision Requested'],
      draft:    ['status-badge status-draft',    'Draft'],
    };
    const [cls, label] = map[status] || ['status-badge status-draft', status];
    return `<span class="${cls}">${label}</span>`;
  }
  function priorityBadge(priority) {
    const map = {
      high:   ['🔴', 'High'],
      medium: ['🟡', 'Medium'],
      low:    ['🟢', 'Low'],
    };
    const [icon, label] = map[priority] || ['⚪', priority || 'Normal'];
    return `<span style="font-size:0.72rem; color:var(--slate-light);">${icon} ${label} Priority</span>`;
  }

  // ── TOAST NOTIFICATIONS ──────────────────────────────────────
  function initToasts() {
    if (!document.getElementById('toastContainer')) {
      const el = document.createElement('div');
      el.id = 'toastContainer';
      document.body.appendChild(el);
    }
  }
  function toast(msg, type = 'default', duration = 3500) {
    initToasts();
    const container = document.getElementById('toastContainer');
    const icons = { success:'✅', error:'❌', warning:'⚠️', default:'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || icons.default}</span> ${msg}`;
    container.appendChild(el);
    setTimeout(() => {
      el.classList.add('out');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // ── MODAL ─────────────────────────────────────────────────────
  function confirm(title, body, onConfirm, confirmLabel = 'Confirm', danger = false) {
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.innerHTML = `
      <div class="modal">
        <div class="modal-title">${title}</div>
        <div class="modal-body">${body}</div>
        <div class="actions-row">
          <button class="btn ${danger ? 'btn-danger' : 'btn-primary'}" id="modalConfirm">${confirmLabel}</button>
          <button class="btn btn-secondary" id="modalCancel">Cancel</button>
        </div>
      </div>`;
    document.body.appendChild(overlay);
    overlay.querySelector('#modalConfirm').onclick = () => { overlay.remove(); onConfirm(); };
    overlay.querySelector('#modalCancel').onclick = () => overlay.remove();
    overlay.onclick = (e) => { if (e.target === overlay) overlay.remove(); };
  }

  // Public API
  return {
    setUser, getUser, logout, requireLogin,
    getPlans, getPlanById, addPlan, updatePlanStatus, updatePlan, deletePlan,
    petEmoji, formatDate, formatDateLong, statusBadge, priorityBadge,
    toggleTheme, getTheme, applyTheme,
    toast, confirm,
  };
})();
