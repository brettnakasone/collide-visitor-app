import './index.css';
import { useState, useEffect } from 'react';

const FORMSPREE_URL = 'https://formspree.io/f/xlgagqjo';
const ADMIN_PASSWORD = 'CollideHi';
const NOTION_DB_URL = 'https://www.notion.so/f727bf80465b4d1db688538649e3af73';
const VISITOR_POLICY_URL = 'https://drive.google.com/file/d/1uJbXufnGtKpwEfo1VfLyU_BO8DkIiF2j/view?usp=sharing';
const CULTURE_CARD_URL = 'https://drive.google.com/file/d/1wre8RlPbFTijUhBRjKTj7AqI3GkvTQjX/view?usp=sharing';
const STORAGE_KEY = 'collide_blocked_dates';

const HOLIDAY_THURSDAYS = [
  '2025-11-27','2025-12-25',
  '2026-01-01','2026-07-02','2026-11-26','2026-12-24','2026-12-31',
  '2027-01-01',
];

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
  return date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'});
}
function fmtShort(date) {
  return date.toLocaleDateString('en-US',{month:'short',day:'numeric',year:'numeric'});
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
function getBlocked() { try { return JSON.parse(localStorage.getItem(STORAGE_KEY)||'[]'); } catch { return []; } }
function saveBlocked(d) { try { localStorage.setItem(STORAGE_KEY, JSON.stringify(d)); } catch {} }

async function submitForm({ name, phone, email, dates }) {
  const [d1, d2] = dates.sort();
  const visit1 = fmt(new Date(d1+'T12:00:00'));
  const visit2 = fmt(new Date(d2+'T12:00:00'));
  await fetch(FORMSPREE_URL, {
    method:'POST',
    headers:{'Content-Type':'application/json','Accept':'application/json'},
    body: JSON.stringify({ name, phone, email, visit_1: visit1, visit_2: visit2,
      message:`New Collide visitor signup!\n\nName: ${name}\nPhone: ${phone}\nEmail: ${email}\nVisit 1: ${visit1}\nVisit 2: ${visit2}` }),
  });
  return { visit1, visit2 };
}

const GlobalStyle = () => (
  <style>{`
    @import url('https://fonts.googleapis.com/css2?family=Barlow+Condensed:wght@700;800;900&family=Barlow:wght@400;500;600;700&display=swap');
    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
    :root {
      --primary: #F9F3DC;
      --secondary: #667761;
      --secondary-dim: rgba(102,119,97,0.15);
      --secondary-border: rgba(102,119,97,0.35);
      --text: #18181A;
      --surface: rgba(24,24,26,0.06);
      --border: rgba(24,24,26,0.12);
      --muted: rgba(24,24,26,0.5);
      --subtle: rgba(24,24,26,0.25);
    }
    body {
      background: var(--primary);
      min-height: 100vh;
      color: var(--text);
      font-family: 'Barlow', sans-serif;
      -webkit-font-smoothing: antialiased;
    }
    input, button { font-family: 'Barlow', sans-serif; }
    button { cursor: pointer; border: none; background: none; }
    .display { font-family: 'Barlow Condensed', sans-serif; font-weight: 900; text-transform: uppercase; line-height: 0.92; }
    input:focus { outline: none; border-color: var(--secondary) !important; }

    .date-btn:hover:not([disabled]) { border-color: var(--secondary-border) !important; background: var(--secondary-dim) !important; }
    .pdf-link:hover { background: rgba(24,24,26,0.08) !important; }
  `}</style>
);



const page = { minHeight:'100vh', display:'flex', flexDirection:'column', alignItems:'center', padding:'0 16px 80px' };
const card = { background:'var(--surface)', border:'1px solid var(--border)', borderRadius:4, padding:'24px 20px', width:'100%', maxWidth:580, marginBottom:12 };
const secLabel = { fontSize:10, fontWeight:700, letterSpacing:'0.14em', textTransform:'uppercase', color:'var(--secondary)', marginBottom:6 };

function Badge({ c }) { return <span style={{ display:'inline-block', background:'var(--secondary-dim)', border:'1px solid var(--secondary-border)', color:'var(--secondary)', fontSize:11, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', padding:'4px 12px', borderRadius:2, marginBottom:16 }}>{c}</span>; }
function SL({ c }) { return <div style={secLabel}>{c}</div>; }
function Lbl({ c }) { return <label style={{ display:'block', fontSize:10, fontWeight:700, letterSpacing:'0.12em', textTransform:'uppercase', color:'var(--muted)', marginBottom:8 }}>{c}</label>; }

function Inp({ error, ...p }) {
  return <>
    <input style={{ width:'100%', background:'rgba(24,24,26,0.06)', border:`1px solid ${error?'var(--secondary)':'rgba(24,24,26,0.12)'}`, borderRadius:4, padding:'12px 14px', fontSize:15, color:'var(--text)', outline:'none', transition:'border-color 0.2s', boxSizing:'border-box' }} {...p} />
    {error && <div style={{ fontSize:12, color:'var(--secondary)', marginTop:6 }}>{error}</div>}
  </>;
}

function PBtn({ children, style, ...p }) {
  return <button style={{ width:'100%', padding:'15px 24px', borderRadius:4, border:'none', background:'var(--secondary)', color:'var(--primary)', fontSize:15, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', cursor:'pointer', transition:'opacity 0.2s', marginTop:8, fontFamily:'Barlow Condensed, sans-serif', ...style }} {...p}>{children}</button>;
}
function SBtn({ children, style, ...p }) {
  return <button style={{ background:'transparent', border:'1px solid rgba(24,24,26,0.15)', color:'var(--muted)', fontSize:11, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', padding:'9px 16px', borderRadius:4, cursor:'pointer', transition:'all 0.15s', ...style }} {...p}>{children}</button>;
}

function DateBtn({ date, selected, maxed, onToggle }) {
  const ds = date.toISOString().split('T')[0];
  return (
    <button className="date-btn" onClick={()=>!maxed&&onToggle(ds)} disabled={maxed}
      style={{ padding:'12px', borderRadius:4, textAlign:'left', lineHeight:1.4, transition:'all 0.15s', cursor:maxed?'not-allowed':'pointer',
        border: selected?'1.5px solid var(--secondary)':'1px solid rgba(24,24,26,0.1)',
        background: selected?'var(--secondary-dim)':'rgba(24,24,26,0.03)',
        color: selected?'var(--secondary)':'var(--text)', opacity:maxed?0.4:1 }}>
      <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4, color:selected?'var(--secondary)':'var(--muted)' }}>{selected?'✓ SELECTED':'THURSDAY'}</div>
      <div style={{ fontFamily:'Barlow Condensed, sans-serif', fontSize:20, fontWeight:800, textTransform:'uppercase' }}>{date.toLocaleDateString('en-US',{month:'short',day:'numeric'})}</div>
      <div style={{ fontSize:11, color:selected?'rgba(102,119,97,0.6)':'var(--subtle)', marginTop:2 }}>6:00 – 9:00 PM</div>
    </button>
  );
}

function ConfirmView({ name, visit1, visit2 }) {
  return (
    <div style={page}>
      <GlobalStyle />
      
      <div style={{ width:'100%', maxWidth:580, paddingTop:52, paddingBottom:32, textAlign:'center' }}>
        <img src="/logo-stamp.jpg" alt="Collide" style={{ width:110, height:'auto', marginBottom:20, opacity:0.85 }} />
        <div style={{ display:'block' }}>
          <Badge c="You're Confirmed!" />
        </div>
        <h1 className="display" style={{ fontSize:'clamp(52px,12vw,88px)', color:'var(--text)', marginBottom:8 }}>
          SEE YOU<br /><span style={{ color:'var(--secondary)' }}>THURSDAY</span>
        </h1>
        <p style={{ fontSize:15, color:'var(--muted)', lineHeight:1.65, maxWidth:380, margin:'12px auto 0' }}>
          Hey {name.split(' ')[0]}! Pastor Brett will follow up soon. Here's what you're locked in for:
        </p>
      </div>
      <div style={card}>
        <SL c="Your Two Visits" />
        <p style={{ fontSize:13, color:'var(--muted)', margin:'4px 0 16px', lineHeight:1.55 }}>Show up at 6:00 PM for the team brief before students arrive.</p>
        {[visit1, visit2].map((v, i) => (
          <div key={i} style={{ display:'flex', alignItems:'center', gap:14, padding:'14px 0', borderBottom:i===0?'1px solid rgba(24,24,26,0.08)':'none' }}>
            <div style={{ width:32, height:32, borderRadius:4, background:'var(--secondary-dim)', border:'1px solid var(--secondary-border)', display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'Barlow Condensed, sans-serif', fontSize:16, fontWeight:900, color:'var(--secondary)', flexShrink:0 }}>{i+1}</div>
            <div style={{ fontFamily:'Barlow Condensed, sans-serif', fontSize:18, fontWeight:800, textTransform:'uppercase', letterSpacing:'0.02em' }}>{v}</div>
          </div>
        ))}
        <div style={{ marginTop:16, padding:'12px 14px', background:'var(--secondary-dim)', border:'1px solid var(--secondary-border)', borderRadius:4 }}>
          <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--secondary)', marginBottom:3 }}>📍 C4 Church</div>
          <div style={{ fontSize:13, color:'var(--muted)' }}>Every Thursday · 6:00 PM – 9:00 PM</div>
        </div>
      </div>
      <div style={card}>
        <SL c="Before You Come" />
        <p style={{ fontSize:13, color:'var(--muted)', margin:'4px 0 16px', lineHeight:1.6 }}>Please read through these before your first visit.</p>
        <div style={{ display:'grid', gap:8 }}>
          {[
            { label:'Visitor Policy + Dress Code', url: VISITOR_POLICY_URL },
            { label:'Collide Culture Card', url: CULTURE_CARD_URL },
          ].map(({ label, url }) => (
            <a key={label} href={url} target="_blank" rel="noreferrer" className="pdf-link"
              style={{ display:'flex', alignItems:'center', justifyContent:'space-between', padding:'13px 15px', background:'rgba(24,24,26,0.04)', border:'1px solid rgba(24,24,26,0.1)', borderRadius:4, color:'var(--text)', textDecoration:'none', fontFamily:'Barlow Condensed, sans-serif', fontSize:16, fontWeight:700, textTransform:'uppercase', letterSpacing:'0.04em', transition:'background 0.15s' }}>
              📎 {label}
              <span style={{ fontSize:11, color:'var(--muted)', fontWeight:500, textTransform:'none', fontFamily:'Barlow, sans-serif' }}>View PDF →</span>
            </a>
          ))}
        </div>
      </div>
      <div style={{ ...card, textAlign:'center', borderColor:'transparent' }}>
        <div style={{ fontSize:13, color:'var(--muted)', lineHeight:1.8 }}>
          Questions? Reach out anytime.<br />
          <a href="mailto:brett@c4.church" style={{ color:'var(--secondary)', textDecoration:'none', fontWeight:700 }}>brett@c4.church</a>
        </div>
      </div>
    </div>
  );
}

function AdminLoginView({ onLogin, onBack }) {
  const [pw, setPw] = useState(''); const [err, setErr] = useState('');
  const attempt = () => pw === ADMIN_PASSWORD ? onLogin() : setErr('Incorrect password.');
  return (
    <div style={page}>
      <GlobalStyle />
      <div style={{ width:'100%', maxWidth:580, paddingTop:52, paddingBottom:32, textAlign:'center' }}>
        <Badge c="Admin Access" />
        <h1 className="display" style={{ fontSize:72, color:'var(--text)' }}>SCHEDULE<br /><span style={{ color:'var(--secondary)' }}>MANAGER</span></h1>
      </div>
      <div style={card}>
        <Lbl c="Password" />
        <Inp type="password" value={pw} onChange={e=>setPw(e.target.value)} onKeyDown={e=>e.key==='Enter'&&attempt()} placeholder="Enter admin password" error={err} />
        <PBtn style={{ marginTop:16 }} onClick={attempt}>Enter</PBtn>
        <SBtn style={{ width:'100%', marginTop:10 }} onClick={onBack}>← Back to Form</SBtn>
      </div>
    </div>
  );
}

function AdminView({ allThursdays, blockedDates, onToggle, onBack }) {
  const [month, setMonth] = useState(0);
  const groups = groupByMonth(allThursdays);
  const group = groups[month];
  return (
    <div style={page}>
      <GlobalStyle />
      <div style={{ width:'100%', maxWidth:580, paddingTop:52, paddingBottom:32, textAlign:'center' }}>
        <Badge c="Admin Panel" />
        <h1 className="display" style={{ fontSize:72, color:'var(--text)' }}>MANAGE<br /><span style={{ color:'var(--secondary)' }}>THURSDAYS</span></h1>
        <p style={{ fontSize:14, color:'var(--muted)', marginTop:12 }}>Toggle dates to block or open them. Changes save instantly.</p>
      </div>
      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:16 }}>
          <SBtn onClick={()=>setMonth(m=>Math.max(0,m-1))} disabled={month===0}>← Prev</SBtn>
          <div style={{ fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:18, textTransform:'uppercase', letterSpacing:'0.04em' }}>{group?.label}</div>
          <SBtn onClick={()=>setMonth(m=>Math.min(groups.length-1,m+1))} disabled={month===groups.length-1}>Next →</SBtn>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(135px,1fr))', gap:8, marginBottom:16 }}>
          {group?.dates.map(d => {
            const ds = d.toISOString().split('T')[0];
            const isBlocked = blockedDates.includes(ds);
            return (
              <button key={ds} onClick={()=>onToggle(ds)} style={{ padding:'12px', borderRadius:4, textAlign:'left', cursor:'pointer', border:isBlocked?'1.5px solid rgba(102,119,97,0.5)':'1.5px solid rgba(24,24,26,0.12)', background:isBlocked?'var(--secondary-dim)':'rgba(24,24,26,0.03)', color:isBlocked?'var(--secondary)':'var(--text)', transition:'all 0.15s' }}>
                <div style={{ fontSize:9, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', marginBottom:4 }}>{isBlocked?'🚫 BLOCKED':'✅ OPEN'}</div>
                <div style={{ fontFamily:'Barlow Condensed, sans-serif', fontSize:16, fontWeight:800, textTransform:'uppercase' }}>{fmtShort(d)}</div>
              </button>
            );
          })}
        </div>
        <div style={{ height:1, background:'rgba(24,24,26,0.07)', margin:'16px 0' }} />
        <div style={{ fontSize:12, color:'var(--muted)', marginBottom:14, lineHeight:1.7 }}>
          <strong style={{ color:'var(--text)' }}>Blocked: </strong>
          {blockedDates.length===0?'None':blockedDates.sort().map(ds=>fmtShort(new Date(ds+'T12:00:00'))).join(', ')}
        </div>
        <a href={NOTION_DB_URL} target="_blank" rel="noreferrer" style={{ display:'block', fontSize:11, color:'var(--secondary)', fontWeight:700, textDecoration:'none', marginBottom:16, letterSpacing:'0.08em', textTransform:'uppercase' }}>📊 View Notion Submissions →</a>
        <SBtn onClick={onBack}>← Back to Visitor Form</SBtn>
      </div>
    </div>
  );
}

export default function App() {
  const [view, setView] = useState('form');
  const [blockedDates, setBlockedDates] = useState([]);
  const [allThursdays] = useState(getAllThursdays);
  const [selectedDates, setSelectedDates] = useState([]);
  const [form, setForm] = useState({ name:'', phone:'', email:'' });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [confirmed, setConfirmed] = useState(null);
  const [currentMonth, setCurrentMonth] = useState(0);

  useEffect(()=>{ setBlockedDates(getBlocked()); },[]);

  const availableThursdays = allThursdays.filter(d=>!blockedDates.includes(d.toISOString().split('T')[0]));
  const monthGroups = groupByMonth(availableThursdays);
  const visibleGroup = monthGroups[currentMonth];
  const sortedSelected = [...selectedDates].sort();

  function toggleDate(ds) { setSelectedDates(prev=>prev.includes(ds)?prev.filter(d=>d!==ds):[...prev,ds]); }
  function toggleBlock(ds) { setBlockedDates(prev=>{ const u=prev.includes(ds)?prev.filter(d=>d!==ds):[...prev,ds]; saveBlocked(u); return u; }); }
  function validate() {
    const e={};
    if (!form.name.trim()) e.name='Name is required';
    if (!/^\+?[\d\s\-().]{10,}$/.test(form.phone)) e.phone='Valid phone number required';
    if (!/\S+@\S+\.\S+/.test(form.email)) e.email='Valid email required';
    if (selectedDates.length!==2) e.dates='Please select exactly 2 Thursdays';
    return e;
  }
  async function handleSubmit() {
    const e=validate();
    if (Object.keys(e).length>0){setErrors(e);return;}
    setErrors({}); setSubmitting(true);
    try { const r=await submitForm({...form,dates:selectedDates}); setConfirmed(r); setView('confirm'); }
    catch { setErrors({submit:'Something went wrong. Please email youth@c4.church.'}); }
    setSubmitting(false);
  }

  if (view==='confirm'&&confirmed) return <ConfirmView name={form.name} visit1={confirmed.visit1} visit2={confirmed.visit2}/>;
  if (view==='adminLogin') return <AdminLoginView onLogin={()=>setView('admin')} onBack={()=>setView('form')}/>;
  if (view==='admin') return <AdminView allThursdays={allThursdays} blockedDates={blockedDates} onToggle={toggleBlock} onBack={()=>setView('form')}/>;

  return (
    <div style={page}>
      <GlobalStyle />
      

      <div style={{ width:'100%', maxWidth:580, paddingTop:48, paddingBottom:28, textAlign:'center' }}>
        <img src="/logo-globe.jpg" alt="Collide" style={{ width:90, height:'auto', marginBottom:20, opacity:0.9 }} />
        <div style={{ display:'block' }}>
          <Badge c="Collide Student Ministries" />
        </div>
        <h1 className="display" style={{ fontSize:'clamp(52px,13vw,100px)', color:'var(--text)' }}>
          PICK YOUR<br /><span style={{ color:'var(--secondary)' }}>TWO THURSDAYS</span>
        </h1>
        <p style={{ fontSize:15, color:'var(--muted)', lineHeight:1.65, maxWidth:380, margin:'16px auto 0' }}>
          Ready to check out Collide? Select two Thursday nights to visit. We meet 6–9 PM and we can't wait to have you.
        </p>
      </div>

      <div style={card}>
        <SL c="Your Info" />
        <div style={{ display:'grid', gap:14, marginTop:10 }}>
          {[{key:'name',label:'Full Name',placeholder:'First & Last Name',type:'text'},{key:'phone',label:'Phone Number',placeholder:'(808) 555-0000',type:'tel'},{key:'email',label:'Email Address',placeholder:'you@email.com',type:'email'}].map(({key,label,placeholder,type})=>(
            <div key={key}>
              <Lbl c={label}/>
              <Inp type={type} placeholder={placeholder} value={form[key]} onChange={e=>setForm(p=>({...p,[key]:e.target.value}))} error={errors[key]}/>
            </div>
          ))}
        </div>
      </div>

      <div style={card}>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:4 }}>
          <SL c="Choose 2 Thursdays"/>
          <div style={{ fontSize:11, fontWeight:700, letterSpacing:'0.08em', color:selectedDates.length===2?'var(--secondary)':'var(--muted)' }}>{selectedDates.length}/2</div>
        </div>
        <p style={{ fontSize:13, color:'var(--muted)', margin:'4px 0 16px', lineHeight:1.55 }}>Each visit runs 6:00–9:00 PM. Pick any two Thursdays that work for you.</p>
        <div style={{ display:'flex', alignItems:'center', justifyContent:'space-between', marginBottom:14 }}>
          <SBtn onClick={()=>setCurrentMonth(m=>Math.max(0,m-1))} disabled={currentMonth===0}>← Prev</SBtn>
          <div style={{ fontFamily:'Barlow Condensed, sans-serif', fontWeight:800, fontSize:17, textTransform:'uppercase', letterSpacing:'0.04em' }}>{visibleGroup?.label}</div>
          <SBtn onClick={()=>setCurrentMonth(m=>Math.min(monthGroups.length-1,m+1))} disabled={currentMonth===monthGroups.length-1}>Next →</SBtn>
        </div>
        <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill,minmax(145px,1fr))', gap:8, marginBottom:12 }}>
          {visibleGroup?.dates.map(d=>(
            <DateBtn key={d.toISOString()} date={d}
              selected={selectedDates.includes(d.toISOString().split('T')[0])}
              maxed={selectedDates.length===2&&!selectedDates.includes(d.toISOString().split('T')[0])}
              onToggle={toggleDate}/>
          ))}
        </div>
        {errors.dates && <div style={{ fontSize:12, color:'var(--secondary)', marginTop:4 }}>{errors.dates}</div>}
        {sortedSelected.length>0&&(
          <div style={{ marginTop:12, padding:'13px 14px', background:'var(--secondary-dim)', border:'1px solid var(--secondary-border)', borderRadius:4 }}>
            <div style={{ fontSize:10, fontWeight:700, letterSpacing:'0.1em', textTransform:'uppercase', color:'var(--secondary)', marginBottom:8 }}>Your Visits</div>
            {sortedSelected.map((ds,i)=>(
              <div key={ds} style={{ fontFamily:'Barlow Condensed, sans-serif', fontSize:16, fontWeight:700, textTransform:'uppercase', color:'var(--text)', padding:'2px 0', letterSpacing:'0.02em' }}>
                {i+1}. {fmt(new Date(ds+'T12:00:00'))}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ width:'100%', maxWidth:580 }}>
        {errors.submit&&<div style={{ fontSize:12, color:'var(--secondary)', marginBottom:10, textAlign:'center' }}>{errors.submit}</div>}
        <PBtn onClick={handleSubmit} disabled={submitting} style={{ opacity:submitting?0.7:1, fontSize:16 }}>
          {submitting?'Submitting...': "I'm In — Submit My Dates →"}
        </PBtn>
      </div>

      <button onClick={()=>setView('adminLogin')} style={{ background:'transparent', border:'none', color:'rgba(24,24,26,0.08)', fontSize:11, cursor:'pointer', marginTop:28, letterSpacing:'0.06em' }}>admin</button>
    </div>
  );
}
