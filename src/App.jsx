<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<title>BSM Intake Tracker</title>
<link href="https://fonts.googleapis.com/css2?family=DM+Sans:wght@300;400;500;700&family=DM+Mono:wght@400;500&display=swap" rel="stylesheet">
<style>
  * { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #0b1120; color: #e2e8f0; font-family: 'DM Sans', system-ui, sans-serif; min-height: 100vh; }
  input, select, textarea { outline: none; font-family: inherit; }
  input::placeholder, textarea::placeholder { color: #475569; }
  ::-webkit-scrollbar { width: 6px; } ::-webkit-scrollbar-track { background: #0f172a; } ::-webkit-scrollbar-thumb { background: #334155; border-radius: 3px; }
  .card { background: #0f172a; border: 1px solid #1e293b; border-radius: 14px; }
  .input-field { background: #0b1120; border: 1px solid #1e293b; border-radius: 8px; padding: 9px 12px; color: #e2e8f0; font-size: 14px; width: 100%; transition: border-color 0.2s; }
  .input-field:focus { border-color: #6366f1; }
  .btn-primary { background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; border: none; border-radius: 9px; padding: 10px 22px; font-weight: 700; font-size: 14px; cursor: pointer; font-family: inherit; }
  .btn-primary:disabled { opacity: 0.5; cursor: not-allowed; }
  .btn-ghost { background: transparent; border: 1px solid #1e293b; border-radius: 9px; padding: 9px 18px; color: #94a3b8; font-size: 14px; cursor: pointer; font-family: inherit; }
  .label { font-size: 11px; font-weight: 700; color: #64748b; text-transform: uppercase; letter-spacing: 0.08em; margin-bottom: 5px; display: block; }
  .section-title { font-size: 13px; font-weight: 700; color: #6366f1; text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 14px; padding-bottom: 8px; border-bottom: 1px solid #1e293b; }
  .stat-box { background: #0f172a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px 20px; }
  .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 100; display: flex; align-items: center; justify-content: center; padding: 20px; backdrop-filter: blur(4px); }
  .modal { background: #0f172a; border: 1px solid #1e293b; border-radius: 18px; max-width: 800px; width: 100%; max-height: 88vh; overflow-y: auto; }
  .row-hover:hover { background: #1e293b44; cursor: pointer; }
  .toast { position: fixed; bottom: 28px; right: 28px; background: #22c55e; color: white; border-radius: 12px; padding: 14px 22px; font-weight: 700; font-size: 14px; z-index: 200; box-shadow: 0 8px 32px rgba(34,197,94,0.3); animation: slideUp 0.3s ease; }
  .error-bar { background: #ef444422; border: 1px solid #ef444444; color: #ef4444; border-radius: 10px; padding: 12px 16px; margin-bottom: 16px; font-size: 13px; }
  @keyframes spin { to { transform: rotate(360deg); } }
  @keyframes slideUp { from { transform: translateY(20px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  .tab-btn { background: transparent; border: 1px solid transparent; border-radius: 8px; padding: 7px 14px; color: #64748b; font-size: 13px; font-weight: 500; cursor: pointer; font-family: inherit; }
  .tab-btn.active { background: #1e293b; border-color: #334155; color: #e2e8f0; }
  .filter-btn { padding: 7px 13px; border-radius: 7px; border: 1px solid #1e293b; background: transparent; color: #64748b; font-size: 12px; font-weight: 600; cursor: pointer; font-family: inherit; }
  .filter-btn.active { border-color: #6366f1; background: #6366f122; color: #a5b4fc; }
  .checklist-row { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #0f172a; flex-wrap: wrap; gap: 8px; }
  .opt-btn { padding: 5px 12px; border-radius: 6px; border: 1px solid #1e293b; background: #0b1120; color: #475569; font-weight: 600; font-size: 12px; cursor: pointer; font-family: inherit; }
  th { padding: 12px 14px; text-align: left; font-size: 11px; font-weight: 700; color: #475569; text-transform: uppercase; letter-spacing: 0.06em; white-space: nowrap; }
  td { padding: 10px 14px; border-bottom: 1px solid #0f172a; vertical-align: middle; }
  select option { background: #0f172a; }
</style>
</head>
<body>
<div id="app"></div>
<script>
const SB_URL = "https://qddxaetkparfwmidtuca.supabase.co";
const SB_KEY = "sb_publishable_qaLvnyrvBpgarc_zm_7jKg_xQQ3KmKN";

const SEED = [
  {first_name:"Kasey",last_name:"Johnson",dob:"2022-02-13",caregiver:"Kaysie Douglas",caregiver_phone:"601-938-0932",caregiver_email:"kaysied95@yahoo.com",office:"MERIDIAN",insurance:"MAGNOLIA",date_received:"2025-12-08",contact1:"2025-12-11",contact2:"2025-12-17",contact3:"2026-02-05",referral_form:"YES",permission_assessment:"Completed",vineland:"Reminder Email Sent",srs2:"Completed",attends_school:"NO",iep_report:"NO",insurance_verified:"YES",autism_diagnosis:"Received",intake_paperwork:"Signed",intake_personnel:"Zanteria",status:"active"},
  {first_name:"William",last_name:"Beckham",dob:"2011-02-02",caregiver:"Shannon Hurst",caregiver_phone:"601-286-0299",caregiver_email:"blacklyon2@aol.com",office:"MERIDIAN",insurance:"TruCARE",date_received:"2025-12-17",contact1:"2025-12-19",contact2:"2025-12-22",contact3:"2026-02-23",referral_form:"YES",permission_assessment:"Completed",vineland:"Reminder Email Sent",srs2:"Completed",attends_school:"YES",iep_report:"YES",insurance_verified:"YES",autism_diagnosis:"Received",intake_paperwork:"Signed",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Jaxton",last_name:"Green",dob:"2018-03-28",caregiver:"Kelli Barrett",caregiver_phone:"601-562-4706",caregiver_email:"kjb1021m3@gmail.com",office:"MERIDIAN",insurance:"MEDICAID OF MS",date_received:"2026-01-07",contact1:"2026-01-07",contact2:"2026-01-20",contact3:"",referral_form:"YES",permission_assessment:"Completed",vineland:"Completed",srs2:"Completed",attends_school:"YES",iep_report:"AWAITING",insurance_verified:"NO",autism_diagnosis:"Received",intake_paperwork:"Signed",intake_personnel:"LaShannon",status:"active"},
  {first_name:"Braelyn",last_name:"Young",dob:"2023-06-19",caregiver:"Alicha Latham",caregiver_phone:"601-701-4883",caregiver_email:"alichalatham@icloud.com",office:"MERIDIAN",insurance:"MEDICAID OF MS",date_received:"2025-12-23",contact1:"2026-01-08",contact2:"2026-01-20",contact3:"2026-02-05",referral_form:"YES",permission_assessment:"Completed",vineland:"Emailed",srs2:"Emailed",attends_school:"NO",iep_report:"NO",insurance_verified:"NO",autism_diagnosis:"Requested",intake_paperwork:"Emailed via Adobe",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Elijah",last_name:"McClendon",dob:"2023-01-24",caregiver:"Zakariah Mcclendon",caregiver_phone:"601-253-5167",caregiver_email:"zakariah.mcclendon00@gmail.com",office:"FOREST",insurance:"MOLINA",date_received:"2026-02-04",contact1:"2026-02-05",contact2:"2026-02-09",contact3:"",referral_form:"YES",permission_assessment:"Emailed",vineland:"Emailed",srs2:"Emailed",attends_school:"NO",iep_report:"NO",insurance_verified:"NO",autism_diagnosis:"Received",intake_paperwork:"Signed",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Wilmer",last_name:"Giron",dob:"2020-03-15",caregiver:"Ana Garcia",caregiver_phone:"601-686-2456",caregiver_email:"anaruth797@icloud.com",office:"MERIDIAN",insurance:"MEDICAID OF MS",date_received:"2026-01-30",contact1:"2026-01-30",contact2:"2026-02-23",contact3:"",referral_form:"YES",permission_assessment:"Completed",vineland:"Completed",srs2:"Completed",attends_school:"YES",iep_report:"YES",insurance_verified:"NO",autism_diagnosis:"Received",intake_paperwork:"Signed",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Carson",last_name:"Hicks",dob:"2022-10-03",caregiver:"Porsha Hicks",caregiver_phone:"601-274-6645",caregiver_email:"hicksporsha@icloud.com",office:"MERIDIAN",insurance:"MEDICAID OF MS",date_received:"2026-02-26",contact1:"2026-02-26",contact2:"",contact3:"",referral_form:"YES",permission_assessment:"Emailed",vineland:"Emailed",srs2:"Emailed",attends_school:"AWAITING",iep_report:"AWAITING",insurance_verified:"AWAITING",autism_diagnosis:"Requested",intake_paperwork:"Emailed via Adobe",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Justin",last_name:"Stewart",dob:"2023-03-25",caregiver:"Sarena Stewart",caregiver_phone:"601-323-3349",caregiver_email:"sjs4au2@yahoo.com",office:"MERIDIAN",insurance:"MOLINA",date_received:"2026-03-03",contact1:"2026-03-04",contact2:"",contact3:"",referral_form:"YES",permission_assessment:"Completed",vineland:"Completed",srs2:"Completed",attends_school:"YES",iep_report:"AWAITING",insurance_verified:"AWAITING",autism_diagnosis:"Requested",intake_paperwork:"Signed",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Timothy",last_name:"House",dob:"2021-06-17",caregiver:"Shonna House",caregiver_phone:"601-627-9027",caregiver_email:"shona.dykstra@gmail.com",office:"FOREST",insurance:"BCBSMS",date_received:"2026-03-04",contact1:"2026-03-04",contact2:"",contact3:"",referral_form:"YES",permission_assessment:"Emailed",vineland:"Emailed",srs2:"Emailed",attends_school:"YES",iep_report:"AWAITING",insurance_verified:"AWAITING",autism_diagnosis:"Requested",intake_paperwork:"Emailed via Adobe",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Amahje",last_name:"Magee",dob:"2023-09-27",caregiver:"Fredriana Rivers",caregiver_phone:"",caregiver_email:"riversfredriana15@yahoo.com",office:"FLOWOOD",insurance:"BCBSMS",date_received:"2026-03-12",contact1:"",contact2:"",contact3:"",referral_form:"YES",permission_assessment:"Completed",vineland:"Emailed",srs2:"Too Young",attends_school:"NO",iep_report:"NO",insurance_verified:"AWAITING",autism_diagnosis:"Requested",intake_paperwork:"Signed",intake_personnel:"Aerianna",status:"active"},
  {first_name:"Malakhi",last_name:"Whittington",dob:"2021-02-07",caregiver:"Barbara Gilbert",caregiver_phone:"601-954-7764",caregiver_email:"barbaragilbert08@gmail.com",office:"FOREST",insurance:"MAGNOLIA",date_received:"2026-03-16",contact1:"",contact2:"",contact3:"",referral_form:"NO",permission_assessment:"Completed",vineland:"Completed",srs2:"Emailed",attends_school:"NO",iep_report:"NO",insurance_verified:"AWAITING",autism_diagnosis:"Requested",intake_paperwork:"Signed",intake_personnel:"Aerianna",status:"active"},
  {first_name:"Silas",last_name:"Reddin",dob:"2017-10-02",caregiver:"Corinna Reddin",caregiver_phone:"601-507-5373",caregiver_email:"ladyreddin@gmail.com",office:"FOREST",insurance:"UHC Comm",date_received:"2025-05-03",contact1:"2026-02-23",contact2:"",contact3:"",referral_form:"YES",permission_assessment:"Completed",vineland:"Emailed",srs2:"Completed",attends_school:"YES",iep_report:"YES",insurance_verified:"NO",autism_diagnosis:"Received",intake_paperwork:"Signed",intake_personnel:"Zanteria",status:"active"},
  {first_name:"Wesley",last_name:"Boswell",dob:"2018-04-26",caregiver:"Rebecca Boswell",caregiver_phone:"205-285-4028",caregiver_email:"beccaboswell17@gmail.com",office:"FOREST",insurance:"Aetna",date_received:"2026-03-30",contact1:"2026-03-31",contact2:"",contact3:"",referral_form:"NO",permission_assessment:"Please Send",vineland:"Please Send",srs2:"Please Send",attends_school:"YES",iep_report:"YES",insurance_verified:"NO",autism_diagnosis:"Received",intake_paperwork:"Please Send",intake_personnel:"Aerianna",status:"active"}
];

const OFFICES=["MERIDIAN","FOREST","NEWTON","JACKSON","FLOWOOD","SCHOOL"];
const INSURANCES=["MEDICAID OF MS","UHC","UHC Comm","MAGNOLIA","MOLINA","BCBSMS","Aetna","Tri Care","CIGNA","TruCARE","Other"];
const BOOL=["YES","NO","AWAITING"];
const STAT=["Completed","Emailed","Awaiting","Please Send","N/A"];
const STAFF=["Zanteria","Aerianna","LaShannon","Keiara","Celia","Other"];

let S={tab:1,refs:[],loading:true,seeding:false,saving:false,saved:false,error:null,search:"",office:"ALL",sel:null,step:0,form:ef()};

function ef(){return{first_name:"",last_name:"",dob:"",caregiver:"",caregiver_phone:"",caregiver_email:"",office:"",insurance:"",secondary_insurance:"",date_received:new Date().toISOString().split("T")[0],contact1:"",contact2:"",contact3:"",referral_form:"",permission_assessment:"",vineland:"",srs2:"",attends_school:"",iep_report:"",insurance_verified:"",autism_diagnosis:"",intake_paperwork:"",intake_personnel:"",referral_source:"",referral_source_phone:"",referral_source_fax:"",provider_npi:"",point_of_contact:"",reason_for_referral:"",notes:"",status:"active"};}

async function db(method,path,body){
  const r=await fetch(SB_URL+"/rest/v1/"+path,{method,headers:{"apikey":SB_KEY,"Authorization":"Bearer "+SB_KEY,"Content-Type":"application/json","Prefer":"return=representation"},body:body?JSON.stringify(body):undefined});
  const t=await r.text();if(!r.ok)throw new Error(t);return t?JSON.parse(t):[];
}

async function load(){
  try{S.loading=true;go();
    const d=await db("GET","referrals?order=created_at.desc");
    if(d.length===0){S.seeding=true;go();for(const r of SEED)await db("POST","referrals",r);S.refs=await db("GET","referrals?order=created_at.desc");S.seeding=false;}
    else S.refs=d;S.error=null;
  }catch(e){S.error="Could not connect. Check internet and refresh.";}
  finally{S.loading=false;go();}
}

async function save(){
  S.saving=true;go();
  try{const r=await db("POST","referrals",S.form);S.refs=[r[0],...S.refs];S.form=ef();S.step=0;S.saving=false;S.saved=true;go();setTimeout(()=>{S.saved=false;S.tab=1;go();},1800);}
  catch(e){S.error="Could not save. Try again.";S.saving=false;go();}
}

async function setStatus(id,status){
  try{await db("PATCH","referrals?id=eq."+id,{status});S.refs=S.refs.map(r=>r.id===id?{...r,status}:r);S.sel=null;go();}
  catch(e){S.error="Could not update.";go();}
}

function sc(v){
  if(!v||v==="N/A")return"#94a3b8";
  const u=v.toUpperCase();
  if(["COMPLETED","SIGNED","YES","RECEIVED"].some(x=>u.includes(x)))return"#22c55e";
  if(["EMAILED","REMINDER","TOO YOUNG"].some(x=>u.includes(x)))return"#f59e0b";
  if(["AWAITING","REQUESTED"].some(x=>u.includes(x)))return"#fb923c";
  if(u==="NO"||u.includes("PLEASE"))return"#ef4444";
  return"#64748b";
}

function bdg(v){const c=sc(v);return`<span style="background:${c}22;color:${c};border:1px solid ${c}44;border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700;white-space:nowrap;font-family:monospace">${v||"—"}</span>`;}

function pct(r){const fs=["referral_form","permission_assessment","vineland","srs2","insurance_verified","autism_diagnosis","intake_paperwork","intake_personnel"];const d=fs.filter(f=>{const v=(r[f]||"").toUpperCase();return["YES","COMPLETED","SIGNED","RECEIVED"].some(x=>v.includes(x));});return Math.round(d.length/fs.length*100);}

function ring(p){const r=18,c=2*Math.PI*r,col=p>=80?"#22c55e":p>=50?"#f59e0b":"#ef4444";return`<svg width="44" height="44" viewBox="0 0 44 44"><circle cx="22" cy="22" r="${r}" fill="none" stroke="#1e293b" stroke-width="4"/><circle cx="22" cy="22" r="${r}" fill="none" stroke="${col}" stroke-width="4" stroke-dasharray="${p/100*c} ${c}" stroke-linecap="round" transform="rotate(-90 22 22)"/><text x="22" y="26" text-anchor="middle" font-size="10" font-weight="700" fill="${col}">${p}%</text></svg>`;}

function go(){document.getElementById("app").innerHTML=html();}

function html(){
  const active=S.refs.filter(r=>r.status==="active");
  const nr=S.refs.filter(r=>r.status==="non-responsive"||r.status==="referred-out");
  const fl=active.filter(r=>{const n=`${r.first_name} ${r.last_name}`.toLowerCase();return(n.includes(S.search.toLowerCase())||(r.caregiver||"").toLowerCase().includes(S.search.toLowerCase()))&&(S.office==="ALL"||r.office===S.office);});

  if(S.loading||S.seeding)return`<div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100vh;gap:20px"><div style="width:36px;height:36px;border:3px solid #1e293b;border-top:3px solid #6366f1;border-radius:50%;animation:spin 0.8s linear infinite"></div><div style="color:#475569;font-size:14px">${S.seeding?"Loading your 13 referrals into the database...":"Connecting to database..."}</div></div><style>@keyframes spin{to{transform:rotate(360deg)}}</style>`;

  return`
  ${S.saved?'<div class="toast">✅ Referral saved to database!</div>':""}
  <div style="border-bottom:1px solid #1e293b;padding:0 32px">
    <div style="max-width:1200px;margin:0 auto;display:flex;align-items:center;justify-content:space-between;height:64px">
      <div style="display:flex;align-items:center;gap:12px">
        <div style="width:36px;height:36px;background:linear-gradient(135deg,#6366f1,#8b5cf6);border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px">⚡</div>
        <div><div style="font-weight:700;font-size:15px">BSM Intake Tracker</div><div style="font-size:11px;color:#475569">Behavioral Solutions of Mississippi</div></div>
      </div>
      <div style="display:flex;gap:4px">
        ${["New Referral","All Referrals","Non-Responsive / Referred Out"].map((t,i)=>`<button class="tab-btn ${S.tab===i?'active':''}" onclick="S.tab=${i};go()">${t}</button>`).join("")}
      </div>
      <div style="display:flex;gap:8px;align-items:center">
        <div style="background:#22c55e22;color:#22c55e;border:1px solid #22c55e33;border-radius:20px;padding:4px 12px;font-size:12px;font-weight:700">${active.length} Active</div>
        <button class="btn-ghost" onclick="load()" style="padding:6px 12px;font-size:12px">↻ Refresh</button>
      </div>
    </div>
  </div>
  <div style="max-width:1200px;margin:0 auto;padding:28px 32px">
    ${S.error?`<div class="error-bar">⚠️ ${S.error} <button onclick="S.error=null;go()" style="background:none;border:none;color:#ef4444;cursor:pointer;float:right">✕</button></div>`:""}
    ${S.tab===0?tab0():""}
    ${S.tab===1?tab1(active,fl):""}
    ${S.tab===2?tab2(nr):""}
  </div>
  ${S.sel?modal():""}`;
}

function tab0(){
  if(S.saved)return`<div style="text-align:center;padding:60px"><div style="font-size:56px;margin-bottom:16px">✅</div><div style="font-size:22px;font-weight:700">Referral Saved!</div></div>`;
  const steps=[["👤","Client Info"],["🏥","Insurance"],["📋","Referral Source"],["✅","Checklist"]];
  const f=S.form;
  const cl=[["Referral Form Received","referral_form",BOOL],["Permission for Assessment","permission_assessment",STAT],["Vineland (Q-Global)","vineland",STAT],["SRS-2 (WPS)","srs2",STAT],["Attends School","attends_school",BOOL],["IEP Report","iep_report",BOOL],["Autism Diagnosis Docs","autism_diagnosis",["Received","Requested","Awaiting","N/A"]],["Intake Paperwork","intake_paperwork",["Signed","Emailed via Adobe","Awaiting","N/A"]]];

  const stepContent=[
    `<div class="section-title">👤 Client Information</div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
       <div><label class="label">First Name</label><input class="input-field" value="${f.first_name}" oninput="S.form.first_name=this.value" placeholder="First Name"></div>
       <div><label class="label">Last Name</label><input class="input-field" value="${f.last_name}" oninput="S.form.last_name=this.value" placeholder="Last Name"></div>
     </div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
       <div><label class="label">Date of Birth</label><input class="input-field" type="date" value="${f.dob}" oninput="S.form.dob=this.value"></div>
       <div><label class="label">Date Received</label><input class="input-field" type="date" value="${f.date_received}" oninput="S.form.date_received=this.value"></div>
     </div>
     <div class="section-title" style="margin-top:20px">👨‍👩‍👦 Caregiver</div>
     <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:16px;margin-bottom:16px">
       <div><label class="label">Name</label><input class="input-field" value="${f.caregiver}" oninput="S.form.caregiver=this.value" placeholder="Full Name"></div>
       <div><label class="label">Phone</label><input class="input-field" value="${f.caregiver_phone}" oninput="S.form.caregiver_phone=this.value" placeholder="601-000-0000"></div>
       <div><label class="label">Email</label><input class="input-field" value="${f.caregiver_email}" oninput="S.form.caregiver_email=this.value" placeholder="email@example.com"></div>
     </div>
     <div><label class="label">Office</label><select class="input-field" onchange="S.form.office=this.value"><option value="">Select Office</option>${OFFICES.map(o=>`<option ${f.office===o?"selected":""}>${o}</option>`).join("")}</select></div>`,

    `<div class="section-title">🏥 Insurance</div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:20px">
       <div><label class="label">Primary</label><select class="input-field" onchange="S.form.insurance=this.value"><option value="">Select</option>${INSURANCES.map(i=>`<option ${f.insurance===i?"selected":""}>${i}</option>`).join("")}</select></div>
       <div><label class="label">Secondary</label><select class="input-field" onchange="S.form.secondary_insurance=this.value"><option value="">None</option>${INSURANCES.map(i=>`<option ${f.secondary_insurance===i?"selected":""}>${i}</option>`).join("")}</select></div>
     </div>
     <div><label class="label">Insurance Docs Verified</label><div style="display:flex;gap:8px;margin-top:6px">${BOOL.map(o=>{const c=sc(o);const a=f.insurance_verified===o;return`<button onclick="S.form.insurance_verified='${o}';go()" style="padding:8px 18px;border-radius:8px;border:1px solid ${a?c:"#1e293b"};background:${a?c+"22":"#0b1120"};color:${a?c:"#64748b"};font-weight:700;font-size:13px;cursor:pointer;font-family:inherit">${o}</button>`;}).join("")}</div></div>`,

    `<div class="section-title">📋 Referral Source</div>
     <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:16px">
       <div><label class="label">Agency/Clinic</label><input class="input-field" value="${f.referral_source}" oninput="S.form.referral_source=this.value" placeholder="Agency Name"></div>
       <div><label class="label">Point of Contact</label><input class="input-field" value="${f.point_of_contact}" oninput="S.form.point_of_contact=this.value" placeholder="Contact Person"></div>
       <div><label class="label">Phone</label><input class="input-field" value="${f.referral_source_phone}" oninput="S.form.referral_source_phone=this.value" placeholder="601-000-0000"></div>
       <div><label class="label">Fax</label><input class="input-field" value="${f.referral_source_fax}" oninput="S.form.referral_source_fax=this.value" placeholder="601-000-0000"></div>
     </div>
     <div style="margin-bottom:16px"><label class="label">Provider / NPI #</label><input class="input-field" value="${f.provider_npi}" oninput="S.form.provider_npi=this.value" placeholder="Provider Name and NPI"></div>
     <div><label class="label">Reason for Referral (ICD-10)</label><textarea class="input-field" rows="4" oninput="S.form.reason_for_referral=this.value" style="resize:vertical" placeholder="e.g. Safety Risk, SIB, elopement. F84.0">${f.reason_for_referral}</textarea></div>`,

    `<div class="section-title">✅ Intake Checklist</div>
     ${cl.map(([label,key,opts])=>`<div class="checklist-row"><span style="font-size:14px;color:#cbd5e1">${label}</span><div style="display:flex;gap:6px;flex-wrap:wrap">${opts.map(o=>{const c=sc(o);const a=f[key]===o;return`<button class="opt-btn" onclick="S.form['${key}']='${o}';go()" style="border-color:${a?c:"#1e293b"};background:${a?c+"22":"#0b1120"};color:${a?c:"#475569"}">${o}</button>`;}).join("")}</div></div>`).join("")}
     <div style="margin-top:20px;display:grid;grid-template-columns:1fr 1fr;gap:16px">
       <div><label class="label">Contact Attempts</label><div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:8px">${[["contact1","1st"],["contact2","2nd"],["contact3","3rd"]].map(([k,l])=>`<div><div style="font-size:11px;color:#475569;margin-bottom:4px">${l}</div><input type="date" class="input-field" value="${f[k]}" oninput="S.form['${k}']=this.value" style="font-size:12px;padding:7px 8px"></div>`).join("")}</div></div>
       <div><label class="label">Intake Personnel</label><select class="input-field" onchange="S.form.intake_personnel=this.value"><option value="">Select Staff</option>${STAFF.map(p=>`<option ${f.intake_personnel===p?"selected":""}>${p}</option>`).join("")}</select></div>
     </div>
     <div style="margin-top:16px"><label class="label">Notes</label><textarea class="input-field" rows="3" oninput="S.form.notes=this.value" style="resize:vertical" placeholder="Additional notes...">${f.notes}</textarea></div>`
  ];

  return`<div style="max-width:720px;margin:0 auto">
    <div style="display:flex;align-items:center;margin-bottom:32px">
      ${steps.map((s,i)=>`<div style="display:flex;align-items:center;${i<steps.length-1?"flex:1":""}"><div style="display:flex;flex-direction:column;align-items:center;gap:6px"><button onclick="if(${i}<=S.step){S.step=${i};go()}" style="width:28px;height:28px;border-radius:50%;background:${S.step===i?"linear-gradient(135deg,#6366f1,#8b5cf6)":S.step>i?"#22c55e":"#1e293b"};color:white;border:none;cursor:pointer;font-size:12px;font-weight:700;font-family:inherit">${S.step>i?"✓":s[0]}</button><span style="font-size:11px;font-weight:600;color:${S.step===i?"#a5b4fc":"#475569"};white-space:nowrap">${s[1]}</span></div>${i<steps.length-1?`<div style="flex:1;height:1px;background:${S.step>i?"#22c55e":"#1e293b"};margin:0 8px;margin-bottom:20px"></div>`:""}</div>`).join("")}
    </div>
    <div class="card" style="padding:28px">
      ${stepContent[S.step]}
      <div style="display:flex;justify-content:space-between;margin-top:28px;padding-top:20px;border-top:1px solid #1e293b">
        <button class="btn-ghost" onclick="if(S.step>0){S.step--;go()}" ${S.step===0?'style="opacity:0.3"':""}>← Back</button>
        ${S.step<3?`<button class="btn-primary" onclick="S.step++;go()">Continue →</button>`:`<button class="btn-primary" onclick="save()" ${S.saving?"disabled":""} style="background:linear-gradient(135deg,#22c55e,#16a34a)">${S.saving?"Saving...":"✓ Save Referral"}</button>`}
      </div>
    </div>
  </div>`;}

function tab1(active,fl){
  const stats=[{l:"Total Active",v:active.length,c:"#6366f1"},{l:"Fully Signed",v:active.filter(r=>(r.intake_paperwork||"").toLowerCase().includes("signed")).length,c:"#22c55e"},{l:"Pending Docs",v:active.filter(r=>!["signed","completed"].includes((r.intake_paperwork||"").toLowerCase())).length,c:"#f59e0b"},{l:"Non-Responsive",v:S.refs.filter(r=>r.status==="non-responsive"||r.status==="referred-out").length,c:"#ef4444"}];
  return`
  <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:14px;margin-bottom:24px">${stats.map(s=>`<div class="stat-box"><div style="font-size:28px;font-weight:800;color:${s.c};font-family:monospace">${s.v}</div><div style="font-size:12px;color:#475569;margin-top:2px;font-weight:600">${s.l}</div></div>`).join("")}</div>
  <div style="display:flex;gap:12px;margin-bottom:18px;align-items:center;flex-wrap:wrap">
    <input class="input-field" style="max-width:260px" placeholder="🔍 Search by name or caregiver..." value="${S.search}" oninput="S.search=this.value;go()">
    <div style="display:flex;gap:6px;flex-wrap:wrap">${["ALL",...OFFICES].map(o=>`<button class="filter-btn ${S.office===o?"active":""}" onclick="S.office='${o}';go()">${o}</button>`).join("")}</div>
  </div>
  <div class="card" style="overflow:hidden"><div style="overflow-x:auto">
    <table style="width:100%;border-collapse:collapse;font-size:13px">
      <thead><tr style="border-bottom:1px solid #1e293b"><th>Progress</th><th>Client</th><th>DOB</th><th>Caregiver</th><th>Office</th><th>Insurance</th><th>Ins. Verified</th><th>Autism Dx</th><th>Paperwork</th><th>Personnel</th><th></th></tr></thead>
      <tbody>${fl.length===0?`<tr><td colspan="11" style="padding:48px;text-align:center;color:#334155">No referrals found. Add one using New Referral!</td></tr>`:fl.map(r=>`
        <tr class="row-hover" style="border-bottom:1px solid #0f172a" onclick="S.sel='${r.id}';go()">
          <td>${ring(pct(r))}</td>
          <td><div style="font-weight:700;color:#e2e8f0">${r.first_name} ${r.last_name}</div><div style="font-size:11px;color:#475569">${r.date_received||""}</div></td>
          <td style="color:#64748b;font-family:monospace;font-size:12px">${r.dob||"—"}</td>
          <td><div style="color:#cbd5e1">${r.caregiver||""}</div><div style="font-size:11px;color:#475569">${r.caregiver_phone||""}</div></td>
          <td><span style="background:#1e293b;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;color:#94a3b8">${r.office||""}</span></td>
          <td style="color:#94a3b8;font-size:12px">${r.insurance||"—"}</td>
          <td>${bdg(r.insurance_verified)}</td>
          <td>${bdg(r.autism_diagnosis)}</td>
          <td>${bdg(r.intake_paperwork)}</td>
          <td style="color:#64748b;font-size:12px">${r.intake_personnel||"—"}</td>
          <td style="color:#6366f1;font-weight:700">→</td>
        </tr>`).join("")}
      </tbody>
    </table>
  </div></div>`;}

function tab2(nr){return`
  <div style="margin-bottom:20px"><div style="font-weight:700;font-size:18px">Non-Responsive / Referred Out</div><div style="color:#475569;font-size:13px;margin-top:4px">Clients who could not be reached or were referred elsewhere</div></div>
  <div class="card" style="overflow:hidden"><table style="width:100%;border-collapse:collapse;font-size:13px">
    <thead><tr style="border-bottom:1px solid #1e293b"><th>Client</th><th>Caregiver</th><th>Phone</th><th>Office</th><th>Insurance</th><th>Coordinator</th><th>Status</th></tr></thead>
    <tbody>${nr.length===0?`<tr><td colspan="7" style="padding:48px;text-align:center;color:#334155">No non-responsive clients yet.</td></tr>`:nr.map(r=>`
      <tr style="border-bottom:1px solid #0f172a">
        <td style="font-weight:700;color:#e2e8f0">${r.first_name} ${r.last_name}</td>
        <td style="color:#94a3b8">${r.caregiver||"—"}</td>
        <td style="color:#64748b;font-family:monospace;font-size:12px">${r.caregiver_phone||"—"}</td>
        <td>${r.office?`<span style="background:#1e293b;border-radius:6px;padding:3px 8px;font-size:11px;font-weight:700;color:#94a3b8">${r.office}</span>`:"—"}</td>
        <td style="color:#64748b;font-size:12px">${r.insurance||"—"}</td>
        <td style="color:#64748b;font-size:12px">${r.intake_personnel||"—"}</td>
        <td><span style="background:${r.status==="referred-out"?"#8b5cf622":"#ef444422"};color:${r.status==="referred-out"?"#8b5cf6":"#ef4444"};border:1px solid ${r.status==="referred-out"?"#8b5cf633":"#ef444433"};border-radius:6px;padding:2px 8px;font-size:11px;font-weight:700">${r.status==="referred-out"?"Referred Out":"Non-Responsive"}</span></td>
      </tr>`).join("")}
    </tbody>
  </table></div>`;}

function modal(){
  const r=S.refs.find(x=>x.id===S.sel);if(!r)return"";
  const ck=[["Referral Form",r.referral_form],["Permission for Assessment",r.permission_assessment],["Vineland",r.vineland],["SRS-2",r.srs2],["Attends School",r.attends_school],["IEP Report",r.iep_report],["Autism Diagnosis",r.autism_diagnosis],["Intake Paperwork",r.intake_paperwork]];
  return`<div class="modal-overlay" onclick="S.sel=null;go()"><div class="modal" onclick="event.stopPropagation()">
    <div style="padding:24px 28px;border-bottom:1px solid #1e293b;display:flex;justify-content:space-between;align-items:flex-start">
      <div><div style="font-weight:800;font-size:22px;color:#e2e8f0">${r.first_name} ${r.last_name}</div><div style="color:#475569;font-size:13px;margin-top:4px">DOB: ${r.dob||"—"} · Received: ${r.date_received||"—"} · ${r.office||""}</div></div>
      <div style="display:flex;align-items:center;gap:12px">${ring(pct(r))}<button onclick="S.sel=null;go()" style="background:#1e293b;border:none;color:#94a3b8;border-radius:8px;padding:8px 14px;cursor:pointer;font-size:18px">×</button></div>
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:24px;padding:24px 28px">
      <div>
        <div class="section-title">Caregiver</div>
        ${[["Name",r.caregiver],["Phone",r.caregiver_phone],["Email",r.caregiver_email]].map(([l,v])=>`<div style="margin-bottom:12px"><div class="label">${l}</div><div style="color:#cbd5e1;font-size:14px">${v||"—"}</div></div>`).join("")}
        <div class="section-title" style="margin-top:20px">Insurance</div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="label" style="margin-bottom:0">Primary</span><span style="color:#94a3b8;font-size:13px">${r.insurance||"—"}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="label" style="margin-bottom:0">Secondary</span><span style="color:#94a3b8;font-size:13px">${r.secondary_insurance||"—"}</span></div>
        <div style="display:flex;justify-content:space-between;margin-bottom:8px"><span class="label" style="margin-bottom:0">Verified</span>${bdg(r.insurance_verified)}</div>
        <div class="section-title" style="margin-top:20px">Contact Log</div>
        ${[["1st",r.contact1],["2nd",r.contact2],["3rd",r.contact3]].map(([l,v])=>`<div style="display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #0f172a"><span style="font-size:13px;color:#64748b">${l} Contact</span><span style="font-size:13px;color:${v?"#a5b4fc":"#334155"};font-family:monospace">${v||"—"}</span></div>`).join("")}
      </div>
      <div>
        <div class="section-title">Intake Checklist</div>
        ${ck.map(([l,v])=>`<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid #0f172a"><span style="font-size:13px;color:#94a3b8">${l}</span>${bdg(v)}</div>`).join("")}
        <div style="margin-top:16px"><div class="label">Intake Personnel</div><div style="color:#a5b4fc;font-weight:700;font-size:15px;margin-top:4px">${r.intake_personnel||"—"}</div></div>
        ${r.reason_for_referral?`<div style="margin-top:16px;background:#0b1120;border:1px solid #1e293b;border-radius:10px;padding:14px"><div class="label" style="margin-bottom:6px">Reason for Referral</div><div style="color:#94a3b8;font-size:13px;line-height:1.6">${r.reason_for_referral}</div></div>`:""}
        ${r.notes?`<div style="margin-top:12px;background:#0b1120;border:1px solid #1e293b;border-radius:10px;padding:14px"><div class="label" style="margin-bottom:6px">Notes</div><div style="color:#94a3b8;font-size:13px">${r.notes}</div></div>`:""}
      </div>
    </div>
    <div style="padding:16px 28px;border-top:1px solid #1e293b;display:flex;justify-content:space-between;align-items:center">
      <div style="display:flex;gap:8px">
        <button class="btn-ghost" onclick="setStatus('${r.id}','non-responsive')" style="color:#ef4444;border-color:#ef444444;font-size:13px">Mark Non-Responsive</button>
        <button class="btn-ghost" onclick="setStatus('${r.id}','referred-out')" style="color:#8b5cf6;border-color:#8b5cf644;font-size:13px">Referred Out</button>
      </div>
      <button class="btn-primary" onclick="S.sel=null;go()">Close</button>
    </div>
  </div></div>`;}

load();
</script>
</body>
</html>
