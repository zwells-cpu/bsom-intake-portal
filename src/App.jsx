import { useState, useMemo, useEffect } from "react";

const SUPABASE_URL = "https://qddxaetkparfwmidtuca.supabase.co";
const SUPABASE_KEY = "sb_publishable_qaLvnyrvBpgarc_zm_7jKg_xQQ3KmKN";

const sb = async (path, method = "GET", body = null) => {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    method,
    headers: {
      "apikey": SUPABASE_KEY,
      "Authorization": `Bearer ${SUPABASE_KEY}`,
      "Content-Type": "application/json",
      "Prefer": method === "POST" ? "return=representation" : method === "PATCH" ? "return=representation" : "",
    },
    body: body ? JSON.stringify(body) : null,
  });
  if (!res.ok) { const err = await res.text(); throw new Error(err); }
  const text = await res.text();
  return text ? JSON.parse(text) : null;
};

const OFFICES = ["MERIDIAN", "FOREST", "NEWTON", "JACKSON", "FLOWOOD", "SCHOOL"];
const INSURANCES = ["MEDICAID OF MS", "UHC", "UHC Comm", "MAGNOLIA", "MOLINA", "BCBSMS", "Aetna", "Tri Care", "CIGNA", "TruCARE", "Other"];
const BOOL_OPTIONS = ["YES", "NO", "AWAITING"];
const STATUS_OPTIONS = ["Completed", "Emailed", "Reminder Sent", "Awaiting", "N/A"];
const INTAKE_PERSONNEL = ["Zanteria", "Aerianna", "LaShannon", "Keiara", "Celia", "Other"];
const OVERALL_STATUSES = ["Active", "Non-Responsive", "Referred Out", "Completed Intake"];

const emptyForm = {
  first_name:"",last_name:"",dob:"",caregiver:"",caregiver_phone:"",caregiver_email:"",
  office:"",insurance:"",secondary_insurance:"",date_received:new Date().toISOString().split("T")[0],
  contact1:"",contact2:"",contact3:"",referral_form:"",permission_assessment:"",vineland:"",srs2:"",
  attends_school:"",iep_report:"",autism_diagnosis:"",intake_paperwork:"",insurance_verified:"",
  intake_personnel:"",overall_status:"Active",referral_source:"",referral_source_phone:"",
  referral_fax:"",provider_npi:"",point_of_contact:"",reason_for_referral:"",notes:""
};

const statusColor=(val)=>{
  if(!val||val==="N/A") return "#94a3b8";
  const v=val.toUpperCase();
  if(["COMPLETED","SIGNED","YES","RECEIVED","ACTIVE"].some(x=>v.includes(x))) return "#22c55e";
  if(["EMAILED","IN PROGRESS","AWAITING","REMINDER"].some(x=>v.includes(x))) return "#f59e0b";
  if(["NO","REQUESTED","NON-RESPONSIVE"].some(x=>v.includes(x))) return "#ef4444";
  if(["PLEASE SEND","REFERRED OUT"].some(x=>v.includes(x))) return "#8b5cf6";
  if(v==="COMPLETED INTAKE") return "#06b6d4";
  return "#64748b";
};

const Badge=({val})=>(
  <span style={{background:statusColor(val)+"22",color:statusColor(val),border:`1px solid ${statusColor(val)}44`,borderRadius:6,padding:"2px 8px",fontSize:11,fontWeight:700,whiteSpace:"nowrap",fontFamily:"monospace"}}>{val||"—"}</span>
);

const completionPct=(r)=>{
  const fields=["referral_form","permission_assessment","vineland","srs2","insurance_verified","autism_diagnosis","intake_paperwork","intake_personnel"];
  const done=fields.filter(f=>["YES","COMPLETED","SIGNED","RECEIVED"].some(x=>(r[f]||"").toUpperCase().includes(x)));
  return Math.round((done.length/fields.length)*100);
};

const ProgressRing=({pct})=>{
  const r=18,circ=2*Math.PI*r,color=pct>=80?"#22c55e":pct>=50?"#f59e0b":"#ef4444";
  return(<svg width={44} height={44} viewBox="0 0 44 44"><circle cx={22} cy={22} r={r} fill="none" stroke="#1e293b" strokeWidth={4}/><circle cx={22} cy={22} r={r} fill="none" stroke={color} strokeWidth={4} strokeDasharray={`${(pct/100)*circ} ${circ}`} strokeLinecap="round" transform="rotate(-90 22 22)" style={{transition:"stroke-dasharray 0.5s"}}/><text x={22} y={26} textAnchor="middle" fontSize={10} fontWeight={700} fill={color}>{pct}%</text></svg>);
};

const steps=[{label:"Client Info",icon:"👤"},{label:"Insurance",icon:"🏥"},{label:"Referral Source",icon:"📋"},{label:"Checklist",icon:"✅"}];

const SQL_SETUP=`CREATE TABLE referrals (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at timestamptz DEFAULT now(),
  first_name text, last_name text, dob text, caregiver text,
  caregiver_phone text, caregiver_email text, office text,
  insurance text, secondary_insurance text, date_received text,
  contact1 text, contact2 text, contact3 text,
  referral_form text, permission_assessment text, vineland text,
  srs2 text, attends_school text, iep_report text,
  autism_diagnosis text, intake_paperwork text, insurance_verified text,
  intake_personnel text, overall_status text DEFAULT 'Active',
  referral_source text, referral_source_phone text, referral_fax text,
  provider_npi text, point_of_contact text, reason_for_referral text, notes text
);
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;
CREATE POLICY "allow_all" ON referrals FOR ALL USING (true) WITH CHECK (true);`;

export default function App() {
  const [tab,setTab]=useState(0);
  const [referrals,setReferrals]=useState([]);
  const [loading,setLoading]=useState(true);
  const [dbReady,setDbReady]=useState(false);
  const [form,setForm]=useState(emptyForm);
  const [search,setSearch]=useState("");
  const [filterOffice,setFilterOffice]=useState("ALL");
  const [filterStatus,setFilterStatus]=useState("Active");
  const [selected,setSelected]=useState(null);
  const [formStep,setFormStep]=useState(0);
  const [saving,setSaving]=useState(false);
  const [saved,setSaved]=useState(false);
  const [editMode,setEditMode]=useState(false);
  const [editForm,setEditForm]=useState(null);

  useEffect(()=>{initDb();},[]);

  const initDb=async()=>{
    setLoading(true);
    try {
      const data=await sb("referrals?select=*&order=created_at.desc&limit=200");
      setReferrals(data||[]);
      setDbReady(true);
    } catch(e){ setDbReady(false); }
    setLoading(false);
  };

  const loadReferrals=async()=>{
    try{ const data=await sb("referrals?select=*&order=created_at.desc&limit=200"); setReferrals(data||[]); }catch(e){}
  };

  const setF=(k,v)=>setForm(p=>({...p,[k]:v}));
  const setEF=(k,v)=>setEditForm(p=>({...p,[k]:v}));

  const submitReferral=async()=>{
    setSaving(true);
    try{ await sb("referrals","POST",form); await loadReferrals(); setForm(emptyForm); setFormStep(0); setSaved(true); setTimeout(()=>{setSaved(false);setTab(1);},1600); }
    catch(e){alert("Error saving: "+e.message);}
    setSaving(false);
  };

  const updateReferral=async()=>{
    setSaving(true);
    try{ await sb(`referrals?id=eq.${editForm.id}`,"PATCH",editForm); await loadReferrals(); setSelected(editForm.id); setEditMode(false); }
    catch(e){alert("Error: "+e.message);}
    setSaving(false);
  };

  const deleteReferral=async(id)=>{
    if(!window.confirm("Delete this referral? This cannot be undone.")) return;
    try{ await sb(`referrals?id=eq.${id}`,"DELETE"); await loadReferrals(); setSelected(null); }catch(e){alert("Error: "+e.message);}
  };

  const filtered=useMemo(()=>referrals.filter(r=>{
    const name=`${r.first_name} ${r.last_name}`.toLowerCase();
    const ms=name.includes(search.toLowerCase())||(r.caregiver||"").toLowerCase().includes(search.toLowerCase());
    const mo=filterOffice==="ALL"||r.office===filterOffice;
    const mst=filterStatus==="ALL"||(r.overall_status||"Active")===filterStatus;
    return ms&&mo&&mst;
  }),[referrals,search,filterOffice,filterStatus]);

  const sel=selected?referrals.find(r=>r.id===selected):null;

  return(
    <div style={{minHeight:"100vh",background:"#0b1120",fontFamily:"'DM Sans',system-ui,sans-serif",color:"#e2e8f0"}}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        input,select,textarea{outline:none;font-family:inherit}
        input::placeholder,textarea::placeholder{color:#475569}
        ::-webkit-scrollbar{width:6px}::-webkit-scrollbar-track{background:#0f172a}::-webkit-scrollbar-thumb{background:#334155;border-radius:3px}
        .card{background:#0f172a;border:1px solid #1e293b;border-radius:14px}
        .input-field{background:#0b1120;border:1px solid #1e293b;border-radius:8px;padding:9px 12px;color:#e2e8f0;font-size:14px;width:100%;transition:border-color 0.2s}
        .input-field:focus{border-color:#6366f1}
        .btn-primary{background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;border:none;border-radius:9px;padding:10px 22px;font-weight:700;font-size:14px;cursor:pointer;transition:opacity 0.2s,transform 0.1s}
        .btn-primary:hover{opacity:0.9;transform:translateY(-1px)}
        .btn-ghost{background:transparent;border:1px solid #1e293b;border-radius:9px;padding:9px 18px;color:#94a3b8;font-size:14px;cursor:pointer;transition:all 0.2s}
        .btn-ghost:hover{border-color:#6366f1;color:#6366f1}
        .row-hover:hover{background:#1e293b44;cursor:pointer}
        .label{font-size:11px;font-weight:700;color:#64748b;text-transform:uppercase;letter-spacing:0.08em;margin-bottom:5px}
        .section-title{font-size:13px;font-weight:700;color:#6366f1;text-transform:uppercase;letter-spacing:0.1em;margin-bottom:14px;padding-bottom:8px;border-bottom:1px solid #1e293b}
        .stat-box{background:#0f172a;border:1px solid #1e293b;border-radius:12px;padding:16px 20px}
        .modal-overlay{position:fixed;inset:0;background:rgba(0,0,0,0.7);z-index:100;display:flex;align-items:center;justify-content:center;padding:20px;backdrop-filter:blur(4px)}
        .modal{background:#0f172a;border:1px solid #1e293b;border-radius:18px;max-width:820px;width:100%;max-height:90vh;overflow-y:auto}
        select option{background:#0f172a}
        .step-dot{width:28px;height:28px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:12px;font-weight:700;flex-shrink:0}
        .code-block{background:#0b1120;border:1px solid #334155;border-radius:10px;padding:16px;font-family:'DM Mono',monospace;font-size:11px;color:#a5b4fc;white-space:pre;overflow-x:auto;line-height:1.7}
      `}</style>

      <div style={{borderBottom:"1px solid #1e293b",padding:"0 32px"}}>
        <div style={{maxWidth:1200,margin:"0 auto",display:"flex",alignItems:"center",justifyContent:"space-between",height:64}}>
          <div style={{display:"flex",alignItems:"center",gap:12}}>
            <div style={{width:36,height:36,background:"linear-gradient(135deg,#6366f1,#8b5cf6)",borderRadius:10,display:"flex",alignItems:"center",justifyContent:"center",fontSize:18}}>⚡</div>
            <div><div style={{fontWeight:700,fontSize:15,letterSpacing:"-0.02em"}}>BSM Intake Tracker</div><div style={{fontSize:11,color:"#475569"}}>Behavioral Solutions of Mississippi</div></div>
          </div>
          <div style={{display:"flex",gap:4}}>
            {["New Referral","All Referrals","Non-Responsive / Referred Out"].map((t,i)=>(
              <button key={i} onClick={()=>setTab(i)} style={{background:tab===i?"#1e293b":"transparent",border:tab===i?"1px solid #334155":"1px solid transparent",borderRadius:8,padding:"7px 14px",color:tab===i?"#e2e8f0":"#64748b",fontSize:13,fontWeight:500,cursor:"pointer"}}>{t}</button>
            ))}
          </div>
          <div style={{display:"flex",gap:8,alignItems:"center"}}>
            {dbReady&&<div style={{background:"#22c55e22",color:"#22c55e",border:"1px solid #22c55e33",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700}}>🟢 {referrals.filter(r=>(r.overall_status||"Active")==="Active").length} Active</div>}
            {!dbReady&&!loading&&<div style={{background:"#ef444422",color:"#ef4444",border:"1px solid #ef444433",borderRadius:20,padding:"4px 12px",fontSize:12,fontWeight:700}}>⚠️ Setup Needed</div>}
          </div>
        </div>
      </div>

      <div style={{maxWidth:1200,margin:"0 auto",padding:"28px 32px"}}>

        {!dbReady&&!loading&&(
          <div style={{maxWidth:700,margin:"0 auto"}}>
            <div className="card" style={{padding:32}}>
              <div style={{fontSize:32,marginBottom:12}}>🛠️</div>
              <div style={{fontWeight:800,fontSize:22,marginBottom:8}}>One-Time Database Setup</div>
              <div style={{color:"#94a3b8",fontSize:14,lineHeight:1.7,marginBottom:24}}>Your Supabase is connected! Run this SQL once to create your referrals table, then click the button below.</div>
              <div className="section-title">Steps:</div>
              {["Go to supabase.com and open your project","Click SQL Editor in the left sidebar","Click New query","Copy ALL the code below and paste it in","Click the green Run button","Come back here and click Connect below!"].map((s,i)=>(
                <div key={i} style={{display:"flex",gap:12,alignItems:"flex-start",marginBottom:10}}>
                  <div style={{width:24,height:24,borderRadius:"50%",background:"linear-gradient(135deg,#6366f1,#8b5cf6)",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:700,color:"white",flexShrink:0,marginTop:1}}>{i+1}</div>
                  <div style={{fontSize:14,color:"#cbd5e1",lineHeight:1.5}}>{s}</div>
                </div>
              ))}
              <div style={{marginTop:20,marginBottom:24}}>
                <div className="label" style={{marginBottom:8}}>SQL to copy and run:</div>
                <div className="code-block">{SQL_SETUP}</div>
                <button onClick={()=>navigator.clipboard.writeText(SQL_SETUP)} style={{marginTop:8,background:"#1e293b",border:"1px solid #334155",borderRadius:7,padding:"6px 14px",color:"#a5b4fc",fontSize:12,fontWeight:600,cursor:"pointer"}}>📋 Copy SQL</button>
              </div>
              <button className="btn-primary" onClick={initDb} style={{width:"100%",padding:14,fontSize:15}}>✅ I ran it — connect me!</button>
            </div>
          </div>
        )}

        {loading&&<div style={{textAlign:"center",padding:80}}><div style={{fontSize:32,marginBottom:12}}>⚡</div><div style={{color:"#64748b"}}>Connecting to database...</div></div>}

        {dbReady&&(
          <>
            {tab===0&&(
              <div style={{maxWidth:720,margin:"0 auto"}}>
                {saved?(
                  <div style={{textAlign:"center",padding:60}}>
                    <div style={{fontSize:56,marginBottom:16}}>✅</div>
                    <div style={{fontSize:22,fontWeight:700,marginBottom:8}}>Referral Saved!</div>
                    <div style={{color:"#64748b"}}>Redirecting to All Referrals...</div>
                  </div>
                ):(
                  <>
                    <div style={{display:"flex",alignItems:"center",marginBottom:32,gap:0}}>
                      {steps.map((s,i)=>(
                        <div key={i} style={{display:"flex",alignItems:"center",flex:i<steps.length-1?1:0}}>
                          <button onClick={()=>setFormStep(i)} style={{display:"flex",flexDirection:"column",alignItems:"center",gap:6,background:"none",border:"none",cursor:"pointer"}}>
                            <div className="step-dot" style={{background:formStep===i?"linear-gradient(135deg,#6366f1,#8b5cf6)":formStep>i?"#22c55e":"#1e293b",color:formStep>i?"white":formStep===i?"white":"#475569",border:formStep===i?"none":"1px solid #334155"}}>{formStep>i?"✓":s.icon}</div>
                            <span style={{fontSize:11,fontWeight:600,color:formStep===i?"#a5b4fc":"#475569",whiteSpace:"nowrap"}}>{s.label}</span>
                          </button>
                          {i<steps.length-1&&<div style={{flex:1,height:1,background:formStep>i?"#22c55e":"#1e293b",margin:"0 8px",marginBottom:20}}/>}
                        </div>
                      ))}
                    </div>
                    <div className="card" style={{padding:28}}>
                      {formStep===0&&(
                        <>
                          <div className="section-title">👤 Client Information</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                            {[["First Name","first_name"],["Last Name","last_name"]].map(([label,key])=>(<div key={key}><div className="label">{label}</div><input className="input-field" value={form[key]} onChange={e=>setF(key,e.target.value)} placeholder={label}/></div>))}
                          </div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                            <div><div className="label">Date of Birth</div><input className="input-field" type="date" value={form.dob} onChange={e=>setF("dob",e.target.value)}/></div>
                            <div><div className="label">Date Received</div><input className="input-field" type="date" value={form.date_received} onChange={e=>setF("date_received",e.target.value)}/></div>
                          </div>
                          <div className="section-title" style={{marginTop:24}}>👨‍👩‍👦 Caregiver</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:16,marginBottom:16}}>
                            <div><div className="label">Name</div><input className="input-field" value={form.caregiver} onChange={e=>setF("caregiver",e.target.value)} placeholder="Full Name"/></div>
                            <div><div className="label">Phone</div><input className="input-field" value={form.caregiver_phone} onChange={e=>setF("caregiver_phone",e.target.value)} placeholder="601-000-0000"/></div>
                            <div><div className="label">Email</div><input className="input-field" value={form.caregiver_email} onChange={e=>setF("caregiver_email",e.target.value)} placeholder="email@example.com"/></div>
                          </div>
                          <div><div className="label">Office</div><select className="input-field" value={form.office} onChange={e=>setF("office",e.target.value)}><option value="">Select Office</option>{OFFICES.map(o=><option key={o}>{o}</option>)}</select></div>
                        </>
                      )}
                      {formStep===1&&(
                        <>
                          <div className="section-title">🏥 Insurance</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                            <div><div className="label">Primary</div><select className="input-field" value={form.insurance} onChange={e=>setF("insurance",e.target.value)}><option value="">Select</option>{INSURANCES.map(i=><option key={i}>{i}</option>)}</select></div>
                            <div><div className="label">Secondary</div><select className="input-field" value={form.secondary_insurance} onChange={e=>setF("secondary_insurance",e.target.value)}><option value="">None</option>{INSURANCES.map(i=><option key={i}>{i}</option>)}</select></div>
                          </div>
                          <div><div className="label">Insurance Docs Verified</div><div style={{display:"flex",gap:8}}>{BOOL_OPTIONS.map(o=>(<button key={o} onClick={()=>setF("insurance_verified",o)} style={{padding:"8px 18px",borderRadius:8,border:`1px solid ${form.insurance_verified===o?statusColor(o):"#1e293b"}`,background:form.insurance_verified===o?statusColor(o)+"22":"#0b1120",color:form.insurance_verified===o?statusColor(o):"#64748b",fontWeight:700,fontSize:13,cursor:"pointer"}}>{o}</button>))}</div></div>
                        </>
                      )}
                      {formStep===2&&(
                        <>
                          <div className="section-title">📋 Referral Source</div>
                          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:16,marginBottom:16}}>
                            <div><div className="label">Agency / Clinic</div><input className="input-field" value={form.referral_source} onChange={e=>setF("referral_source",e.target.value)} placeholder="Agency or Clinic Name"/></div>
                            <div><div className="label">Point of Contact</div><input className="input-field" value={form.point_of_contact} onChange={e=>setF("point_of_contact",e.target.value)} placeholder="Contact Person"/></div>
                            <div><div className="label">Phone</div><input className="input-field" value={form.referral_source_phone} onChange={e=>setF("referral_source_phone",e.target.value)} placeholder="601-000-0000"/></div>
                            <div><div className="label">Fax</div><input className="input-field" value={form.referral_fax} onChange={e=>setF("referral_fax",e.target.value)} placeholder="601-000-0000"/></div>
                          </div>
                          <div style={{marginBottom:16}}><div className="label">Provider Name / NPI #</div><input className="input-field" value={form.provider_npi} onChange={e=>setF("provider_npi",e.target.value)} placeholder="Provider Name and NPI Number"/></div>
                          <div><div className="label">Reason for Referral (include ICD-10)</div><textarea className="input-field" rows={4} value={form.reason_for_referral} onChange={e=>setF("reason_for_referral",e.target.value)} placeholder="e.g. Safety Risk, physical aggression, SIB. F84.0" style={{resize:"vertical"}}/></div>
                        </>
                      )}
                      {formStep===3&&(
                        <>
                          <div className="section-title">✅ Intake Checklist</div>
                          {[["Referral Form Received","referral_form",BOOL_OPTIONS],["Permission for Assessment","permission_assessment",STATUS_OPTIONS],["Vineland (Q-Global)","vineland",STATUS_OPTIONS],["SRS-2 (WPS)","srs2",STATUS_OPTIONS],["Attends School","attends_school",BOOL_OPTIONS],["IEP Report","iep_report",BOOL_OPTIONS],["Autism Diagnosis Docs","autism_diagnosis",["Received","Requested","Awaiting","N/A"]],["Intake Paperwork","intake_paperwork",["Signed","Emailed via Adobe","Awaiting","Please Send"]]].map(([label,key,opts])=>(
                            <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"10px 0",borderBottom:"1px solid #0f172a"}}>
                              <span style={{fontSize:14,color:"#cbd5e1"}}>{label}</span>
                              <div style={{display:"flex",gap:6,flexWrap:"wrap",justifyContent:"flex-end"}}>{opts.map(o=>(<button key={o} onClick={()=>setF(key,o)} style={{padding:"5px 12px",borderRadius:6,border:`1px solid ${form[key]===o?statusColor(o):"#1e293b"}`,background:form[key]===o?statusColor(o)+"22":"#0b1120",color:form[key]===o?statusColor(o):"#475569",fontWeight:600,fontSize:12,cursor:"pointer"}}>{o}</button>))}</div>
                            </div>
                          ))}
                          <div style={{marginTop:20,display:"grid",gridTemplateColumns:"1fr 1fr",gap:16}}>
                            <div><div className="label">Contact Attempts</div><div style={{display:"grid",gridTemplateColumns:"1fr 1fr 1fr",gap:8}}>{[["contact1","1st"],["contact2","2nd"],["contact3","3rd"]].map(([k,lbl])=>(<div key={k}><div style={{fontSize:11,color:"#475569",marginBottom:4}}>{lbl}</div><input type="date" className="input-field" value={form[k]} onChange={e=>setF(k,e.target.value)} style={{fontSize:12,padding:"7px 8px"}}/></div>))}</div></div>
                            <div><div className="label">Intake Personnel</div><select className="input-field" value={form.intake_personnel} onChange={e=>setF("intake_personnel",e.target.value)}><option value="">Select Staff</option>{INTAKE_PERSONNEL.map(p=><option key={p}>{p}</option>)}</select></div>
                          </div>
                          <div style={{marginTop:16}}><div className="label">Notes</div><textarea className="input-field" rows={3} value={form.notes} onChange={e=>setF("notes",e.target.value)} placeholder="Additional notes..." style={{resize:"vertical"}}/></div>
                        </>
                      )}
                      <div style={{display:"flex",justifyContent:"space-between",marginTop:28,paddingTop:20,borderTop:"1px solid #1e293b"}}>
                        <button className="btn-ghost" onClick={()=>setFormStep(f=>Math.max(0,f-1))} disabled={formStep===0} style={{opacity:formStep===0?0.3:1}}>← Back</button>
                        {formStep<3?<button className="btn-primary" onClick={()=>setFormStep(f=>f+1)}>Continue →</button>:<button className="btn-primary" onClick={submitReferral} disabled={saving} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>{saving?"Saving...":"✓ Save Referral"}</button>}
                      </div>
                    </div>
                  </>
                )}
              </div>
            )}

            {tab===1&&(
              <>
                <div style={{display:"grid",gridTemplateColumns:"repeat(4,1fr)",gap:14,marginBottom:24}}>
                  {[{label:"Total Active",val:referrals.filter(r=>(r.overall_status||"Active")==="Active").length,color:"#6366f1"},{label:"Fully Signed",val:referrals.filter(r=>(r.intake_paperwork||"").toLowerCase().includes("signed")).length,color:"#22c55e"},{label:"Pending Docs",val:referrals.filter(r=>!["signed","completed"].some(x=>(r.intake_paperwork||"").toLowerCase().includes(x))).length,color:"#f59e0b"},{label:"Non-Responsive",val:referrals.filter(r=>r.overall_status==="Non-Responsive").length,color:"#ef4444"}].map(s=>(
                    <div className="stat-box" key={s.label}><div style={{fontSize:28,fontWeight:800,color:s.color,fontFamily:"DM Mono,monospace"}}>{s.val}</div><div style={{fontSize:12,color:"#475569",marginTop:2,fontWeight:600}}>{s.label}</div></div>
                  ))}
                </div>
                <div style={{display:"flex",gap:12,marginBottom:18,alignItems:"center",flexWrap:"wrap"}}>
                  <input className="input-field" style={{maxWidth:240}} placeholder="🔍 Search name or caregiver..." value={search} onChange={e=>setSearch(e.target.value)}/>
                  <select className="input-field" style={{maxWidth:180}} value={filterStatus} onChange={e=>setFilterStatus(e.target.value)}><option value="ALL">All Statuses</option>{OVERALL_STATUSES.map(s=><option key={s}>{s}</option>)}</select>
                  <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>{["ALL",...OFFICES].map(o=>(<button key={o} onClick={()=>setFilterOffice(o)} style={{padding:"7px 13px",borderRadius:7,border:`1px solid ${filterOffice===o?"#6366f1":"#1e293b"}`,background:filterOffice===o?"#6366f122":"transparent",color:filterOffice===o?"#a5b4fc":"#64748b",fontSize:12,fontWeight:600,cursor:"pointer"}}>{o}</button>))}</div>
                </div>
                <div className="card" style={{overflow:"hidden"}}>
                  <div style={{overflowX:"auto"}}>
                    <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                      <thead><tr style={{borderBottom:"1px solid #1e293b"}}>{["Progress","Client","DOB","Caregiver","Office","Insurance","Ins. Verified","Autism Dx","Paperwork","Personnel","Status",""].map(h=>(<th key={h} style={{padding:"12px 14px",textAlign:"left",fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em",whiteSpace:"nowrap"}}>{h}</th>))}</tr></thead>
                      <tbody>
                        {filtered.map(r=>(<tr key={r.id} className="row-hover" style={{borderBottom:"1px solid #0f172a"}} onClick={()=>setSelected(r.id)}>
                          <td style={{padding:"10px 14px"}}><ProgressRing pct={completionPct(r)}/></td>
                          <td style={{padding:"10px 14px"}}><div style={{fontWeight:700,color:"#e2e8f0"}}>{r.first_name} {r.last_name}</div><div style={{fontSize:11,color:"#475569"}}>{r.date_received}</div></td>
                          <td style={{padding:"10px 14px",color:"#64748b",fontFamily:"DM Mono,monospace",fontSize:12}}>{r.dob||"—"}</td>
                          <td style={{padding:"10px 14px"}}><div style={{color:"#cbd5e1"}}>{r.caregiver}</div><div style={{fontSize:11,color:"#475569"}}>{r.caregiver_phone}</div></td>
                          <td style={{padding:"10px 14px"}}><span style={{background:"#1e293b",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,color:"#94a3b8"}}>{r.office}</span></td>
                          <td style={{padding:"10px 14px",color:"#94a3b8",fontSize:12}}>{r.insurance||"—"}</td>
                          <td style={{padding:"10px 14px"}}><Badge val={r.insurance_verified}/></td>
                          <td style={{padding:"10px 14px"}}><Badge val={r.autism_diagnosis}/></td>
                          <td style={{padding:"10px 14px"}}><Badge val={r.intake_paperwork}/></td>
                          <td style={{padding:"10px 14px",color:"#64748b",fontSize:12}}>{r.intake_personnel||"—"}</td>
                          <td style={{padding:"10px 14px"}}><Badge val={r.overall_status||"Active"}/></td>
                          <td style={{padding:"10px 14px"}}><span style={{color:"#6366f1",cursor:"pointer",fontWeight:700,fontSize:13}}>→</span></td>
                        </tr>))}
                        {filtered.length===0&&<tr><td colSpan={12} style={{padding:40,textAlign:"center",color:"#334155"}}>No referrals found.</td></tr>}
                      </tbody>
                    </table>
                  </div>
                </div>
              </>
            )}

            {tab===2&&(
              <>
                <div style={{marginBottom:20}}><div style={{fontWeight:700,fontSize:18}}>Non-Responsive / Referred Out</div><div style={{color:"#475569",fontSize:13,marginTop:4}}>Clients who could not be reached or were referred elsewhere. Open a record and change Overall Status to move them here.</div></div>
                <div className="card" style={{overflow:"hidden"}}>
                  <table style={{width:"100%",borderCollapse:"collapse",fontSize:13}}>
                    <thead><tr style={{borderBottom:"1px solid #1e293b"}}>{["Client","DOB","Caregiver","Phone","Office","Insurance","Coordinator","Status"].map(h=>(<th key={h} style={{padding:"12px 16px",textAlign:"left",fontSize:11,fontWeight:700,color:"#475569",textTransform:"uppercase",letterSpacing:"0.06em"}}>{h}</th>))}</tr></thead>
                    <tbody>
                      {referrals.filter(r=>["Non-Responsive","Referred Out"].includes(r.overall_status)).map(r=>(<tr key={r.id} className="row-hover" style={{borderBottom:"1px solid #0f172a"}} onClick={()=>setSelected(r.id)}>
                        <td style={{padding:"12px 16px",fontWeight:700,color:"#e2e8f0"}}>{r.first_name} {r.last_name}</td>
                        <td style={{padding:"12px 16px",color:"#64748b",fontFamily:"DM Mono,monospace",fontSize:12}}>{r.dob||"—"}</td>
                        <td style={{padding:"12px 16px",color:"#94a3b8"}}>{r.caregiver||"—"}</td>
                        <td style={{padding:"12px 16px",color:"#64748b",fontSize:12}}>{r.caregiver_phone||"—"}</td>
                        <td style={{padding:"12px 16px"}}>{r.office?<span style={{background:"#1e293b",borderRadius:6,padding:"3px 8px",fontSize:11,fontWeight:700,color:"#94a3b8"}}>{r.office}</span>:"—"}</td>
                        <td style={{padding:"12px 16px",color:"#64748b",fontSize:12}}>{r.insurance||"—"}</td>
                        <td style={{padding:"12px 16px",color:"#64748b",fontSize:12}}>{r.intake_personnel||"—"}</td>
                        <td style={{padding:"12px 16px"}}><Badge val={r.overall_status}/></td>
                      </tr>))}
                      {referrals.filter(r=>["Non-Responsive","Referred Out"].includes(r.overall_status)).length===0&&<tr><td colSpan={8} style={{padding:40,textAlign:"center",color:"#334155"}}>No non-responsive or referred out clients yet.</td></tr>}
                    </tbody>
                  </table>
                </div>
              </>
            )}
          </>
        )}
      </div>

      {sel&&(
        <div className="modal-overlay" onClick={()=>{setSelected(null);setEditMode(false);}}>
          <div className="modal" onClick={e=>e.stopPropagation()}>
            <div style={{padding:"24px 28px",borderBottom:"1px solid #1e293b",display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
              <div><div style={{fontWeight:800,fontSize:22,color:"#e2e8f0"}}>{sel.first_name} {sel.last_name}</div><div style={{color:"#475569",fontSize:13,marginTop:4}}>DOB: {sel.dob||"—"} · Received: {sel.date_received||"—"} · {sel.office}</div></div>
              <div style={{display:"flex",alignItems:"center",gap:10}}>
                <ProgressRing pct={completionPct(sel)}/>
                <button onClick={()=>{setEditMode(true);setEditForm({...sel});}} style={{background:"#1e293b",border:"none",color:"#a5b4fc",borderRadius:8,padding:"7px 14px",cursor:"pointer",fontSize:13,fontWeight:600}}>✏️ Edit</button>
                <button onClick={()=>{setSelected(null);setEditMode(false);}} style={{background:"#1e293b",border:"none",color:"#94a3b8",borderRadius:8,padding:"8px 14px",cursor:"pointer",fontSize:18,lineHeight:1}}>×</button>
              </div>
            </div>
            {!editMode?(
              <div style={{padding:"24px 28px",display:"grid",gridTemplateColumns:"1fr 1fr",gap:24}}>
                <div>
                  <div className="section-title">Caregiver</div>
                  {[["Name",sel.caregiver],["Phone",sel.caregiver_phone],["Email",sel.caregiver_email]].map(([l,v])=>(<div key={l} style={{marginBottom:12}}><div className="label">{l}</div><div style={{color:"#cbd5e1",fontSize:14}}>{v||"—"}</div></div>))}
                  <div className="section-title" style={{marginTop:20}}>Insurance</div>
                  {[["Primary",sel.insurance],["Secondary",sel.secondary_insurance]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span className="label" style={{marginBottom:0}}>{l}</span><span style={{color:"#94a3b8",fontSize:13}}>{v||"—"}</span></div>))}
                  <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}><span className="label" style={{marginBottom:0}}>Verified</span><Badge val={sel.insurance_verified}/></div>
                  <div className="section-title" style={{marginTop:20}}>Contact Log</div>
                  {[["1st",sel.contact1],["2nd",sel.contact2],["3rd",sel.contact3]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",padding:"6px 0",borderBottom:"1px solid #0f172a"}}><span style={{fontSize:13,color:"#64748b"}}>{l} Contact</span><span style={{fontSize:13,color:v?"#a5b4fc":"#334155",fontFamily:"DM Mono,monospace"}}>{v||"—"}</span></div>))}
                  {sel.reason_for_referral&&<div style={{marginTop:16,background:"#0b1120",border:"1px solid #1e293b",borderRadius:10,padding:14}}><div className="label" style={{marginBottom:6}}>Reason for Referral</div><div style={{color:"#94a3b8",fontSize:13,lineHeight:1.6}}>{sel.reason_for_referral}</div></div>}
                </div>
                <div>
                  <div className="section-title">Intake Checklist</div>
                  {[["Referral Form",sel.referral_form],["Permission for Assessment",sel.permission_assessment],["Vineland",sel.vineland],["SRS-2",sel.srs2],["Attends School",sel.attends_school],["IEP Report",sel.iep_report],["Autism Diagnosis",sel.autism_diagnosis],["Intake Paperwork",sel.intake_paperwork],["Insurance Verified",sel.insurance_verified]].map(([l,v])=>(<div key={l} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #0f172a"}}><span style={{fontSize:13,color:"#94a3b8"}}>{l}</span><Badge val={v}/></div>))}
                  <div style={{marginTop:16}}><div className="label">Intake Personnel</div><div style={{color:"#a5b4fc",fontWeight:700,fontSize:15,marginTop:4}}>{sel.intake_personnel||"—"}</div></div>
                  <div style={{marginTop:12}}><div className="label">Overall Status</div><div style={{marginTop:4}}><Badge val={sel.overall_status||"Active"}/></div></div>
                  {sel.notes&&<div style={{marginTop:16,background:"#0b1120",border:"1px solid #1e293b",borderRadius:10,padding:14}}><div className="label" style={{marginBottom:6}}>Notes</div><div style={{color:"#94a3b8",fontSize:13}}>{sel.notes}</div></div>}
                </div>
              </div>
            ):(
              <div style={{padding:"24px 28px"}}>
                <div className="section-title">Editing Record</div>
                <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:14,marginBottom:14}}>
                  {[["First Name","first_name"],["Last Name","last_name"],["DOB","dob"],["Date Received","date_received"],["Caregiver","caregiver"],["Caregiver Phone","caregiver_phone"],["Caregiver Email","caregiver_email"]].map(([l,k])=>(<div key={k}><div className="label">{l}</div><input className="input-field" type={k.includes("dob")||k.includes("date")?"date":"text"} value={editForm[k]||""} onChange={e=>setEF(k,e.target.value)}/></div>))}
                  <div><div className="label">Office</div><select className="input-field" value={editForm.office||""} onChange={e=>setEF("office",e.target.value)}><option value="">Select</option>{OFFICES.map(o=><option key={o}>{o}</option>)}</select></div>
                  <div><div className="label">Primary Insurance</div><select className="input-field" value={editForm.insurance||""} onChange={e=>setEF("insurance",e.target.value)}><option value="">Select</option>{INSURANCES.map(i=><option key={i}>{i}</option>)}</select></div>
                  <div><div className="label">Overall Status</div><select className="input-field" value={editForm.overall_status||"Active"} onChange={e=>setEF("overall_status",e.target.value)}>{OVERALL_STATUSES.map(s=><option key={s}>{s}</option>)}</select></div>
                  <div><div className="label">Intake Personnel</div><select className="input-field" value={editForm.intake_personnel||""} onChange={e=>setEF("intake_personnel",e.target.value)}><option value="">Select</option>{INTAKE_PERSONNEL.map(p=><option key={p}>{p}</option>)}</select></div>
                </div>
                <div className="section-title" style={{marginTop:8}}>Checklist</div>
                {[["Referral Form","referral_form",BOOL_OPTIONS],["Permission for Assessment","permission_assessment",STATUS_OPTIONS],["Vineland","vineland",STATUS_OPTIONS],["SRS-2","srs2",STATUS_OPTIONS],["Attends School","attends_school",BOOL_OPTIONS],["IEP Report","iep_report",BOOL_OPTIONS],["Autism Diagnosis","autism_diagnosis",["Received","Requested","Awaiting","N/A"]],["Intake Paperwork","intake_paperwork",["Signed","Emailed via Adobe","Awaiting","Please Send"]],["Insurance Verified","insurance_verified",BOOL_OPTIONS]].map(([label,key,opts])=>(
                  <div key={key} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"8px 0",borderBottom:"1px solid #0f172a"}}>
                    <span style={{fontSize:13,color:"#94a3b8"}}>{label}</span>
                    <div style={{display:"flex",gap:5,flexWrap:"wrap",justifyContent:"flex-end"}}>{opts.map(o=>(<button key={o} onClick={()=>setEF(key,o)} style={{padding:"4px 10px",borderRadius:6,border:`1px solid ${editForm[key]===o?statusColor(o):"#1e293b"}`,background:editForm[key]===o?statusColor(o)+"22":"#0b1120",color:editForm[key]===o?statusColor(o):"#475569",fontWeight:600,fontSize:11,cursor:"pointer"}}>{o}</button>))}</div>
                  </div>
                ))}
                <div style={{marginTop:14}}><div className="label">Notes</div><textarea className="input-field" rows={3} value={editForm.notes||""} onChange={e=>setEF("notes",e.target.value)} style={{resize:"vertical"}}/></div>
              </div>
            )}
            <div style={{padding:"16px 28px",borderTop:"1px solid #1e293b",display:"flex",justifyContent:"space-between",gap:10}}>
              <button onClick={()=>deleteReferral(sel.id)} style={{background:"transparent",border:"1px solid #ef444444",borderRadius:9,padding:"9px 18px",color:"#ef4444",fontSize:13,cursor:"pointer",fontWeight:600}}>🗑 Delete</button>
              <div style={{display:"flex",gap:10}}>
                {editMode&&<button className="btn-ghost" onClick={()=>setEditMode(false)}>Cancel</button>}
                {editMode?<button className="btn-primary" onClick={updateReferral} disabled={saving} style={{background:"linear-gradient(135deg,#22c55e,#16a34a)"}}>{saving?"Saving...":"✓ Save Changes"}</button>:<button className="btn-primary" onClick={()=>{setSelected(null);setEditMode(false);}}>Close</button>}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
