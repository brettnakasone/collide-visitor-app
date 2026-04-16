import './index.css';
import { useState, useEffect } from 'react';

// ─── CONFIG ──────────────────────────────────────────────────────────────────
const FORMSPREE_URL = 'https://formspree.io/f/xlgagqjo';
const ADMIN_PASSWORD = 'CollideHi';
const NOTION_DB_URL = 'https://www.notion.so/f727bf80465b4d1db688538649e3af73';

// PDF hosted via Google Drive direct links (view links converted to preview)
const VISITOR_POLICY_URL = 'https://drive.google.com/file/d/1vbdPBZNXQdpRPrqzdRcq6WIwC4dPIskQ/view?usp=drive_link';
const DRESS_CODE_URL = 'https://drive.google.com/file/d/1vbdPBZNXQdpRPrqzdRcq6WIwC4dPIskQ/view?usp=drive_link';

const STORAGE_KEY = 'collide_blocked_dates';

// ─── HOLIDAY THURSDAYS ────────────────────────────────────────────────────────
const HOLIDAY_THURSDAYS = [
  '2025-11-27', '2025-12-25',
  '2026-01-01', '2026-07-02', '2026-11-26', '2026-12-24', '2026-12-31',
  '2027-01-01',
];

// ─── DATE HELPERS ─────────────────────────────────────────────────────────────
function getAllThursdays() {
  const thursdays = [];
  const today = new Date(); today.setHours(0,0,0,0);
  const minDate = new Date(today); minDate.setDate(today.getDate() + 8);
  const maxDate = new Date(today); maxDate.setMonth(today.getMonth() + 12);
  let d = new Date(today);
  while (d.getDay() !== 4) d.setDate(d.getDate() + 1);
  while (d <= maxDate) {
    const ds = d.toISOString().split('T')[0];
    if (d >= minDate && !HOLIDAY_THURSDAYS.includes(ds)) thursdays.push(new Date(d));
    d = new Date(d); d.setDate(d.getDate() + 7);
  }
  return thursdays;
}

function fmt(date) {
  return date.toLocaleDateString('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric' });
}
function fmtShort(date) {
  return date.toLocaleDateString('en-US', { month:'short', day:'numeric', year:'numeric' });
}
function fmtISO(dateStr) {
  return new Date(dateStr + 'T12:00:00').toISOString().split('T')[0];
}

function groupByMonth(dates) {
  const groups = {};
  dates.forEach(d => {
    const key = `${d.getFullYear()}-${d.getMonth()}`;
    if (!groups[key]) groups[key] = { label: d.toLocaleDateString('en-US',{month:'long',year:'numeric'}), dates:[] };
    groups[key].dates.push(d);
  });
  return Object.values(groups);
}

// ─── STORAGE ──────────────────────────────────────────────────────────────────
function getBlocked() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { return []; } }
function saveBlocked(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

// ─── SUBMISSION ───────────────────────────────────────────────────────────────
async function submitForm({ name, phone, email, dates }) {
  const [d1, d2] = dates.sort();
  const visit1 = fmt(new Date(d1 + 'T12:00:00'));
  const visit2 = fmt(new Date(d2 + 'T12:00:00'));

  // 1. Formspree email
  await fetch(FORMSPREE_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({
      name, phone, email,
      visit_1: visit1,
      visit_2: visit2,
      message: `New Collide visitor signup!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nVisit 1: ${visit1}\nVisit 2: ${visit2}`,
    }),
  });

  // 2. Notion via API proxy (client-side Notion API calls require a backend;
  //    Formspree will deliver to Notion via webhook if configured, or use
  //    a Notion integration key server-side. For now Formspree email covers notification.)
  //    To add full Notion auto-logging, deploy a Netlify function (see README).

  return { visit1, visit2 };
}

// ─── STYLES ───────────────────────────────────────────────────────────────────
const s = {
  page: { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'0 16px 80px' },
  header: { width:'100%', maxWidth:580, paddingTop:52, paddingBottom:28, textAlign:'center' },
  badge: { display:'inline-block', background:'rgba(99,210,130,0.12)', border:'1px solid var(--green-border)', color:'var(--green)', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'5px 14px', borderRadius:100, marginBottom:18 },
  title: { fontFamily:'var(--font-display)', fontSize:'clamp(44px,10vw,80px)', lineHeight:0.95, margin:'0 0 14px', background:'linear-gradient(135deg,#fff 0%,#a3b4cc 100%)', WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', letterSpacing:'0.02em' },
  subtitle: { fontSize:15, color:'var(--muted)', lineHeight:1.65, maxWidth:400, margin:'0 auto' },
  card: { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:20, padding:'26px 22px', width:'100%', maxWidth:580, marginBottom:14, backdropFilter:'blur(12px)' },
  label: { display:'block', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 },
  input: { width:'100%', background:'rgba(255,255,255,0.06)', border:'1px solid rgba(255,255,255,0.1)', borderRadius:12, padding:'12px 16px', fontSize:15, color:'var(--text)', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' },
  err: { fontSize:12, color:'var(--error)', marginTop:6 },
  sectionTitle: { fontSize:12, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--green)', marginBottom:4 },
  dateGrid: { display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(155px,1fr))', gap:8, marginBottom:12 },
  btn: { width:'100%', padding:'15px 24px', borderRadius:14, border:'none', background:'linear-gradient(135deg,#63d282 0%,#3ab85c 100%)', color:'#071a0e', fontSize:15, fontWeight:800, letterSpacing:'0.04em', cursor:'pointer', transition:'opacity 0.2s,transform 0.1s', marginTop:8 },
  btnSm: { background:'transparent', border:'1px solid rgba(255,255,255,0.12)', color:'var(--muted)', fontSize:13, fontWeight:600, padding:'9px 18px', borderRadius:10, cursor:'pointer', transition:'all 0.15s' },
  divider: { height:1, background:'rgba(255,255,255,0.06)', margin:'18px 0' },
  adminBtn: { background:'transparent', border:'none', color:'#2a3445', fontSize:11, cursor:'pointer', marginTop:28, letterSpacing:'0.05em' },
};

function DateButton({ date, selected, maxed, blocked, onToggle }) {
  const ds = date.toISOString().split('T')[0];
  const disabled = maxed || blocked;
  return (
    <button
      onClick={() => !disabled && onToggle(ds)}
      style={{
        padding:'10px 13px', borderRadius:12, textAlign:'left', lineHeight:1.4, transition:'all 0.15s',
        border: blocked ? '1px solid rgba(255,255,255,0.05)' : selected ? '1.5px solid var(--green)' : '1px solid rgba(255,255,255,0.1)',
        background: blocked ? 'rgba(255,255,255,0.02)' : selected ? 'var(--green-dim)' : 'var(--surface)',
        color: blocked ? 'var(--subtle)' : selected ? 'var(--green)' : '#c8d5e8',
        cursor: disabled ? 'not-allowed' : 'pointer',
        opacity: blocked ? 0.4 : 1,
      }}
    >
      <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', marginBottom:3, color: selected ? 'var(--green)' : 'var(--muted)' }}>
        {blocked ? 'UNAVAILABLE' : selected ? '✓ SELECTED' : 'THURSDAY'}
      </div>
      <div style={{ fontSize:14, fontWeight:700 }}>{date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
      <div style={{ fontSize:11, color: selected ? 'rgba(99,210,130,0.6)' : 'var(--subtle)' }}>6:00 – 9:00 PM</div>
    </button>
  );
}

// ─── VIEWS ────────────────────────────────────────────────────────────────────

function ConfirmView({ name, visit1, visit2 }) {
  return (
    <div style={s.page}>
      <div style={{ ...s.header, paddingTop:80, textAlign:'center' }}>
        <div style={{ fontSize:52, marginBottom:16 }}>🎉</div>
        <div style={s.badge}>You're all set</div>
        <h1 style={{ ...s.title, fontSize:'clamp(36px,8vw,60px)' }}>SEE YOU{'\n'}THURSDAY!</h1>
        <p style={s.subtitle}>Hey {name.split(' ')[0]}! Pastor Brett will follow up with you soon. Here's what's locked in:</p>
      </div>

      <div style={s.card}>
        <div style={s.sectionTitle}>Your Two Visits</div>
        <p style={{ fontSize:13, color:'var(--muted)', margin:'4px 0 16px' }}>Show up at 6:00 PM — we do a quick team brief before students arrive.</p>
        {[visit1, visit2].map((v, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 0', borderBottom: i===0 ? '1px solid var(--border)' : 'none' }}>
            <div style={{ width:30, height:30, borderRadius:8, background:'var(--green-dim)', border:'1px solid var(--green-border)', display:'flex', alignItems:'center', justifyContent:'center', fontSize:13, color:'var(--green)', fontWeight:800, flexShrink:0 }}>{i+1}</div>
            <div style={{ fontSize:14, fontWeight:600 }}>{v}</div>
          </div>
        ))}
        <div style={{ marginTop:16, padding:'13px 15px', background:'rgba(99,210,130,0.05)', border:'1px solid var(--green-border)', borderRadius:12 }}>
          <div style={{ fontSize:12, color:'var(--green)', fontWeight:700, marginBottom:3 }}>📍 Collide Youth · C4 Church</div>
          <div style={{ fontSize:13, color:'var(--muted)' }}>Every Thursday · 6:00 PM – 9:00 PM · youth@c4.church</div>
        </div>
      </div>

      <div style={s.card}>
        <div style={s.sectionTitle}>Before You Come</div>
        <p style={{ fontSize:13, color:'var(--muted)', margin:'4px 0 16px', lineHeight:1.6 }}>
          Please take a moment to review our Visitor Policy and Dress Code so you know what to expect.
        </p>
        <div style={{ display:'grid', gap:10 }}>
          {[
            { label:'📋 Visitor Policy', url: VISITOR_POLICY_URL },
            { label:'👕 Dress Code', url: DRESS_CODE_URL },
          ].map(({ label, url }) => (
            <a key={label} href={url} target="_blank" rel="noreferrer"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'12px 15px', background:'var(--surface)', border:'1px solid var(--border)', borderRadius:12, color:'var(--text)', textDecoration:'none', fontSize:14, fontWeight:600 }}>
              {label}
              <span style={{ fontSize:11, color:'var(--muted)', fontWeight:500 }}>View PDF →</span>
            </a>
          ))}
        </div>
      </div>

      <div style={{ ...s.card, textAlign:'center', background:'rgba(99,210,130,0.04)' }}>
        <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.7 }}>
          Questions? Text or email Pastor Brett anytime.<br />
          <a href="mailto:brett@c4.church" style={{ color:'var(--green)', textDecoration:'none', fontWeight:600 }}>brett@c4.church</a>
        </div>
      </div>
    </div>
  );
}

function AdminLoginView({ onLogin, onBack }) {
  const [pw, setPw] = useState('');
  const [err, setErr] = useState('');
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.badge}>Admin Access</div>
        <h1 style={{ ...s.title, fontSize:48 }}>SCHEDULE MANAGER</h1>
      </div>
      <div style={s.card}>
        <label style={s.label}>Password</label>
        <input type="password" style={s.input} value={pw} onChange={e=>setPw(e.target.value)}
          onKeyDown={e=>{ if(e.key==='Enter'){ pw===ADMIN_PASSWORD ? onLogin() : setErr('Incorrect password.'); }}}
          placeholder="Enter admin password" />
        {err && <div style={s.err}>{err}</div>}
        <button style={{ ...s.btn, marginTop:16 }} onClick={()=>{ pw===ADMIN_PASSWORD ? onLogin() : setErr('Incorrect password.'); }}>Enter</button>
        <button style={{ ...s.btnSm, width:'100%', marginTop:10 }} onClick={onBack}>← Back to form</button>
      </div>
    </div>
  );
}

function AdminView({ allThursdays, blockedDates, onToggle, onBack }) {
  const [month, setMonth] = useState(0);
  const groups = groupByMonth(allThursdays);
  const group = groups[month];
  return (
    <div style={s.page}>
      <div style={s.header}>
        <div style={s.badge}>Admin Panel</div>
        <h1 style={{ ...s.title, fontSize:48 }}>MANAGE THURSDAYS</h1>
        <p style={s.subtitle}>Toggle dates to block or open them for visitor sign-ups. Changes save instantly.</p>
      </div>
      <div style={s.card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <button style={s.btnSm} onClick={()=>setMonth(m=>Math.max(0,m-1))} disabled={month===0}>← Prev</button>
          <div style={{ fontWeight:700, fontSize:15 }}>{group?.label}</div>
          <button style={s.btnSm} onClick={()=>setMonth(m=>Math.min(groups.length-1,m+1))} disabled={month===groups.length-1}>Next →</button>
        </div>
        <div style={s.dateGrid}>
          {group?.dates.map(d => {
            const ds = d.toISOString().split('T')[0];
            const isBlocked = blockedDates.includes(ds);
            return (
              <button key={ds} onClick={()=>onToggle(ds)} style={{
                padding:'10px 13px', borderRadius:12, textAlign:'left', lineHeight:1.4,
                border: isBlocked ? '1.5px solid var(--error)' : '1.5px solid var(--green-border)',
                background: isBlocked ? 'var(--red-dim)' : 'var(--green-dim)',
                color: isBlocked ? 'var(--error)' : 'var(--green)',
                cursor:'pointer',
              }}>
                <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.06em', marginBottom:3 }}>{isBlocked ? '🚫 BLOCKED' : '✅ OPEN'}</div>
                <div style={{ fontSize:14, fontWeight:700 }}>{fmtShort(d)}</div>
              </button>
            );
          })}
        </div>
        <div style={s.divider} />
        <div style={{ fontSize:12, color:'var(--muted)', marginBottom:14 }}>
          <strong style={{ color:'#c8d5e8' }}>Currently blocked: </strong>
          {blockedDates.length===0 ? 'None' : blockedDates.sort().map(ds=>fmtShort(new Date(ds+'T12:00:00'))).join(', ')}
        </div>
        <div style={{ fontSize:12, color:'var(--muted)', marginBottom:16 }}>
          <a href={NOTION_DB_URL} target="_blank" rel="noreferrer" style={{ color:'var(--green)', fontWeight:600, textDecoration:'none' }}>
            📊 View Notion Submissions Database →
          </a>
        </div>
        <button style={s.btnSm} onClick={onBack}>← Back to visitor form</button>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [view, setView] = useState('form'); // form | confirm | adminLogin | admin
  const [blockedDates, setBlockedDates] = useState([]);
  const [allThursdays] = useState(getAllThursdays);
  const [selectedDates, setSelectedDates] = useState([]);
  const [form, setForm] = useState({ name:'', phone:'', email:'' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(0);

  useEffect(() => { setBlockedDates(getBlocked()); }, []);

  const availableThursdays = allThursdays.filter(d => !blockedDates.includes(d.toISOString().split('T')[0]));
  const monthGroups = groupByMonth(availableThursdays);
  const visibleGroup = monthGroups[currentMonth];
  const sortedSelected = [...selectedDates].sort();

  function toggleDate(ds) {
    setSelectedDates(prev => prev.includes(ds) ? prev.filter(d=>d!==ds) : [...prev, ds]);
  }

  function toggleBlock(ds) {
    setBlockedDates(prev => {
      const updated = prev.includes(ds) ? prev.filter(d=>d!==ds) : [...prev, ds];
      saveBlocked(updated);
      return updated;
    });
  }

  function validate() {
    const e = {};
    if (!form.name.trim()) e.name = 'Name is required';
    if (!/^\+?[\d\s\-().]{10,}$/.test(form.phone)) e.phone = 'Valid phone number required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email = 'Valid email required';
    if (selectedDates.length !== 2) e.dates = 'Please select exactly 2 Thursdays';
    return e;
  }

  async function handleSubmit() {
    const e = validate();
    if (Object.keys(e).length > 0) { setErrors(e); return; }
    setErrors({});
    setSubmitting(true);
    try {
      const result = await submitForm({ ...form, dates: selectedDates });
      setConfirmed(result);
      setView('confirm');
    } catch(err) {
      setErrors({ submit: 'Something went wrong. Please try again or email youth@c4.church.' });
    }
    setSubmitting(false);
  }

  // ── Render views
  if (view === 'confirm' && confirmed) return <ConfirmView name={form.name} visit1={confirmed.visit1} visit2={confirmed.visit2} />;
  if (view === 'adminLogin') return <AdminLoginView onLogin={()=>setView('admin')} onBack={()=>setView('form')} />;
  if (view === 'admin') return <AdminView allThursdays={allThursdays} blockedDates={blockedDates} onToggle={toggleBlock} onBack={()=>setView('form')} />;

  // ── Main form
  return (
    <div style={s.page}>
      {/* Header */}
      <div style={s.header}>
        <div style={s.badge}>C4 Youth · Collide</div>
        <h1 style={s.title}>PICK YOUR TWO THURSDAYS</h1>
        <p style={s.subtitle}>Ready to check out Collide? Select two Thursday nights to visit. We meet 6–9 PM and we'd love to have you.</p>
      </div>

      {/* Contact fields */}
      <div style={s.card}>
        <div style={{ display:'grid', gap:16 }}>
          {[
            { key:'name', label:'Your Name', placeholder:'First & Last Name', type:'text' },
            { key:'phone', label:'Phone Number', placeholder:'(808) 555-0000', type:'tel' },
            { key:'email', label:'Email Address', placeholder:'you@email.com', type:'email' },
          ].map(({ key, label, placeholder, type }) => (
            <div key={key}>
              <label style={s.label}>{label}</label>
              <input type={type} style={{ ...s.input, borderColor: errors[key] ? 'var(--error)' : 'rgba(255,255,255,0.1)' }}
                placeholder={placeholder} value={form[key]}
                onChange={e => setForm(p=>({...p,[key]:e.target.value}))} />
              {errors[key] && <div style={s.err}>{errors[key]}</div>}
            </div>
          ))}
        </div>
      </div>

      {/* Date picker */}
      <div style={s.card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <div style={s.sectionTitle}>Choose 2 Thursdays</div>
          <div style={{ fontSize:13, fontWeight:700, color: selectedDates.length===2 ? 'var(--green)' : 'var(--muted)' }}>
            {selectedDates.length}/2 selected
          </div>
        </div>
        <p style={{ fontSize:13, color:'var(--muted)', margin:'4px 0 16px', lineHeight:1.55 }}>
          Each visit is Thursday, 6:00–9:00 PM. Pick any two that work for you.
        </p>

        {/* Month nav */}
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <button style={s.btnSm} onClick={()=>setCurrentMonth(m=>Math.max(0,m-1))} disabled={currentMonth===0}>← Prev</button>
          <div style={{ fontWeight:700, fontSize:14 }}>{visibleGroup?.label}</div>
          <button style={s.btnSm} onClick={()=>setCurrentMonth(m=>Math.min(monthGroups.length-1,m+1))} disabled={currentMonth===monthGroups.length-1}>Next →</button>
        </div>

        <div style={s.dateGrid}>
          {visibleGroup?.dates.map(d => (
            <DateButton key={d.toISOString()} date={d}
              selected={selectedDates.includes(d.toISOString().split('T')[0])}
              maxed={selectedDates.length===2 && !selectedDates.includes(d.toISOString().split('T')[0])}
              blocked={false}
              onToggle={toggleDate} />
          ))}
        </div>

        {errors.dates && <div style={s.err}>{errors.dates}</div>}

        {sortedSelected.length > 0 && (
          <div style={{ marginTop:12, padding:'12px 14px', background:'rgba(99,210,130,0.06)', border:'1px solid var(--green-border)', borderRadius:12 }}>
            <div style={{ fontSize:11, fontWeight:700, color:'var(--green)', marginBottom:6, letterSpacing:'0.08em', textTransform:'uppercase' }}>Your Visits</div>
            {sortedSelected.map((ds, i) => (
              <div key={ds} style={{ fontSize:13, color:'#c8d5e8', padding:'3px 0' }}>
                Visit {i+1}: {fmt(new Date(ds+'T12:00:00'))}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Submit */}
      <div style={{ width:'100%', maxWidth:580 }}>
        {errors.submit && <div style={{ ...s.err, marginBottom:10, textAlign:'center' }}>{errors.submit}</div>}
        <button style={{ ...s.btn, opacity: submitting ? 0.7 : 1 }} onClick={handleSubmit} disabled={submitting}>
          {submitting ? 'Submitting…' : "I'm In — Submit My Dates →"}
        </button>
      </div>

      <button style={s.adminBtn} onClick={()=>setView('adminLogin')}>admin</button>
    </div>
  );
}
