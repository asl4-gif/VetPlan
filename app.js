// ══════════════════════════════════════════════════════════════
// VetPlan — Shared App Logic (app.js)
// Enhanced version with notifications, search, and more features
// ══════════════════════════════════════════════════════════════

const VetPlan = (() => {

  // ── SAMPLE DATA ─────────────────────────────────────────────
  const DEFAULT_PLANS = [
    {
      id: '1',
      petName: 'Mochi',
      petSpecies: 'Dog',
      petBreed: 'Shiba Inu',
      ownerName: 'Jordan Lee',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Anterior cruciate ligament (ACL) tear in the right hind leg, confirmed by physical examination and radiographic imaging.',
      treatment: 'Tibial Plateau Leveling Osteotomy (TPLO) surgery is recommended. This involves surgical correction of the tibial plateau angle to restore joint stability. Post-op physical therapy and restricted activity for 8–12 weeks.',
      cost: '3200.00',
      benefits: 'Full recovery expected in 3–4 months with proper rehabilitation. Permanent joint stabilization and return to full activity.',
      risks: 'Surgical complications (rare, <2%), infection, and implant failure.',
      notes: 'Pre-op bloodwork required. Fasting 12 hours before procedure.',
      status: 'pending',
      priority: 'high',
      createdDate: '2026-04-24',
      revisionNote: null,
      history: [
        { date: '2026-04-24', event: 'Plan created', actor: 'Dr. Rivera' }
      ]
    },
    {
      id: '2',
      petName: 'Biscuit',
      petSpecies: 'Cat',
      petBreed: 'Domestic Shorthair',
      ownerName: 'Jordan Lee',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Chronic kidney disease (CKD) Stage 2. Elevated BUN and creatinine levels detected in routine bloodwork.',
      treatment: 'Prescription renal diet (Hill\'s k/d), increased water intake via wet food, subcutaneous fluid therapy twice weekly, and bi-monthly bloodwork monitoring.',
      cost: '180.00',
      benefits: 'Disease progression slowed significantly. Quality of life maintained and extended life expectancy.',
      risks: 'Without treatment, CKD will progress rapidly. Minor risk of fluid overload with subcutaneous therapy.',
      notes: 'Schedule follow-up in 6 weeks for bloodwork recheck.',
      status: 'revision',
      priority: 'medium',
      createdDate: '2026-04-20',
      revisionNote: 'I am concerned about the monthly cost. Can we explore a less frequent fluid therapy schedule or a more affordable diet option?',
      history: [
        { date: '2026-04-20', event: 'Plan created', actor: 'Dr. Rivera' },
        { date: '2026-04-22', event: 'Revision requested by owner', actor: 'Jordan Lee' }
      ]
    },
    {
      id: '3',
      petName: 'Mochi',
      petSpecies: 'Dog',
      petBreed: 'Shiba Inu',
      ownerName: 'Jordan Lee',
      ownerId: 'owner',
      vetName: 'Dr. Rivera',
      diagnosis: 'Mild dental disease (Grade 2). Tartar buildup and early gingivitis affecting molars.',
      treatment: 'Professional dental cleaning under general anesthesia, dental radiographs, and possible extraction of compromised teeth. Home dental care regimen post-procedure.',
      cost: '650.00',
      benefits: 'Improved oral health, reduced infection risk, fresher breath.',
      risks: 'Low anesthetic risk given patient\'s age and health. Extractions may be needed if root damage is found on X-ray.',
      notes: 'Annual dental cleanings recommended going forward.',
      status: 'approved',
      priority: 'low',
      createdDate: '2026-04-15',
      revisionNote: null,
      history: [
        { date: '2026-04-15', event: 'Plan created', actor: 'Dr. Rivera' },
        { date: '2026-04-17', event: 'Plan approved by owner', actor: 'Jordan Lee' }
      ]
    },
  ];

  // ── STORAGE KEYS ─────────────────────────────────────────────
  const KEY_USER  = 'vetplan_user';
  const KEY_PLANS = 'vetplan_plans';
  const KEY_NOTIFS = 'vetplan_notifs';

  // ── INITIALISE PLANS ─────────────────────────────────────────
  function initPlans() {
    if (!localStorage.getItem(KEY_PLANS)) {
      localStorage.setItem(KEY_PLANS, JSON.stringify(DEFAULT_PLANS));
    }
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
    const newPlan = {
      ...planData,
      id: String(Date.now()),
      status: 'pending',
      priority: planData.priority || 'medium',
      createdDate: new Date().toISOString().split('T')[0],
      revisionNote: null,
      notes: planData.notes || '',
      history: [
        { date: new Date().toISOString().split('T')[0], event: 'Plan created', actor: planData.vetName }
      ]
    };
    plans.unshift(newPlan);
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
    return newPlan;
  }

  function updatePlanStatus(id, status, revisionNote) {
    const plans = getPlans();
    const idx = plans.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    const user = getUser();
    plans[idx].status = status;
    if (revisionNote !== undefined) plans[idx].revisionNote = revisionNote;
    const histEntry = {
      date: new Date().toISOString().split('T')[0],
      event: status === 'approved' ? 'Plan approved by owner' : status === 'revision' ? 'Revision requested' : `Status changed to ${status}`,
      actor: user ? user.name : 'Unknown'
    };
    plans[idx].history = [...(plans[idx].history || []), histEntry];
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }

  function updatePlan(id, fields) {
    const plans = getPlans();
    const idx = plans.findIndex(p => String(p.id) === String(id));
    if (idx === -1) return;
    const user = getUser();
    plans[idx] = { ...plans[idx], ...fields };
    if (!fields.history) {
      const histEntry = {
        date: new Date().toISOString().split('T')[0],
        event: fields.status === 'pending' ? 'Plan revised & resubmitted' : 'Plan updated',
        actor: user ? user.name : 'Unknown'
      };
      plans[idx].history = [...(plans[idx].history || []), histEntry];
    }
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }

  function deletePlan(id) {
    const plans = getPlans().filter(p => String(p.id) !== String(id));
    localStorage.setItem(KEY_PLANS, JSON.stringify(plans));
  }

  // ── SEARCH & FILTER ──────────────────────────────────────────
  function searchPlans(query, status, sortBy) {
    let plans = getPlans();
    if (query) {
      const q = query.toLowerCase();
      plans = plans.filter(p =>
        p.petName.toLowerCase().includes(q) ||
        p.ownerName.toLowerCase().includes(q) ||
        p.diagnosis.toLowerCase().includes(q) ||
        p.petBreed.toLowerCase().includes(q)
      );
    }
    if (status && status !== 'all') {
      plans = plans.filter(p => p.status === status);
    }
    if (sortBy === 'name') {
      plans.sort((a, b) => a.petName.localeCompare(b.petName));
    } else if (sortBy === 'cost-high') {
      plans.sort((a, b) => parseFloat(b.cost) - parseFloat(a.cost));
    } else if (sortBy === 'cost-low') {
      plans.sort((a, b) => parseFloat(a.cost) - parseFloat(b.cost));
    } else {
      // default: newest first
      plans.sort((a, b) => new Date(b.createdDate) - new Date(a.createdDate));
    }
    return plans;
  }

  // ── TOAST NOTIFICATIONS ──────────────────────────────────────
  function toast(message, type = 'info', duration = 3500) {
    // Ensure container exists
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      document.body.appendChild(container);
    }

    const icons = { success: '✅', warning: '⚠️', error: '❌', info: 'ℹ️' };
    const el = document.createElement('div');
    el.className = `toast ${type}`;
    el.innerHTML = `<span>${icons[type] || 'ℹ️'}</span><span>${message}</span>`;
    container.appendChild(el);

    setTimeout(() => {
      el.classList.add('hiding');
      setTimeout(() => el.remove(), 300);
    }, duration);
  }

  // ── HELPERS ──────────────────────────────────────────────────
  function petEmoji(species) {
    const map = { Dog: '🐕', Cat: '🐈', Bird: '🦜', Rabbit: '🐇', Fish: '🐠', Other: '🐾' };
    return map[species] || '🐾';
  }

  function formatDate(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  }

  function formatDateShort(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T00:00:00');
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  }

  function statusBadge(status) {
    const map = {
      pending:  ['status-badge status-pending',  '⏳ Awaiting Approval'],
      approved: ['status-badge status-approved', '✓ Approved'],
      revision: ['status-badge status-revision', '✏️ Revision Requested'],
      draft:    ['status-badge status-draft',    'Draft'],
    };
    const [cls, label] = map[status] || ['status-badge status-draft', status];
    return `<span class="${cls}">${label}</span>`;
  }

  function priorityColor(priority) {
    return { high: 'priority-high', medium: 'priority-medium', low: 'priority-low' }[priority] || 'priority-low';
  }

  function greetingTime() {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  }

  // ── PRINT PLAN ───────────────────────────────────────────────
  function printPlan() {
    window.print();
  }

  // ── EXPORT PLAN AS TEXT ──────────────────────────────────────
  function exportPlan(plan) {
    const text = `VETPLAN — TREATMENT PLAN
========================
Pet: ${plan.petName} (${plan.petBreed})
Owner: ${plan.ownerName}
Veterinarian: ${plan.vetName}
Date: ${formatDate(plan.createdDate)}
Status: ${plan.status.toUpperCase()}

DIAGNOSIS
---------
${plan.diagnosis}

PROPOSED TREATMENT
------------------
${plan.treatment}

RISKS / SIDE EFFECTS
--------------------
${plan.risks}

EXPECTED BENEFITS
-----------------
${plan.benefits}

ESTIMATED COST
--------------
$${parseFloat(plan.cost).toFixed(2)}

NOTES
-----
${plan.notes || 'None'}
`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `vetplan-${plan.petName.toLowerCase()}-${plan.createdDate}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // Public API
  return {
    setUser, getUser, logout, requireLogin,
    getPlans, getPlanById, addPlan, updatePlanStatus, updatePlan, deletePlan,
    searchPlans,
    petEmoji, formatDate, formatDateShort, statusBadge, priorityColor, greetingTime,
    toast, printPlan, exportPlan,
  };
})();
