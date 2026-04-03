import { useEffect, useMemo, useState } from "react";
import Header from "./components/Header";
import ReferralTable from "./components/ReferralTable";
import NewReferralForm from "./components/NewReferralForm";
import Modal from "./components/Modal";
import { ensureAuthenticated, load, save, setStatus } from "./services/supabase";

const OFFICES = ["MERIDIAN", "FOREST", "NEWTON", "JACKSON", "FLOWOOD", "SCHOOL"];
const INSURANCES = ["MEDICAID OF MS", "UHC", "UHC Comm", "MAGNOLIA", "MOLINA", "BCBSMS", "Aetna", "Tri Care", "CIGNA", "TruCARE", "Other"];
const STAFF = ["Zanteria", "Aerianna", "LaShannon", "Keiara", "Celia", "Other"];

const emptyForm = () => ({
  first_name: "", last_name: "", dob: "", caregiver: "", caregiver_phone: "", caregiver_email: "",
  office: "", insurance: "", secondary_insurance: "", date_received: new Date().toISOString().split("T")[0],
  contact1: "", contact2: "", contact3: "", referral_form: "", permission_assessment: "", vineland: "", srs2: "",
  attends_school: "", iep_report: "", insurance_verified: "", autism_diagnosis: "", intake_paperwork: "",
  intake_personnel: "", referral_source: "", referral_source_phone: "", referral_source_fax: "",
  provider_npi: "", point_of_contact: "", reason_for_referral: "", notes: "", status: "active",
});

export default function App() {
  const connectionStatusText = "System connected";
  const [tab, setTab] = useState(1);
  const [refs, setRefs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [office, setOffice] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState(emptyForm());

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      setRefs(await load());
    } catch (_e) {
      setError("Could not connect. Check internet and refresh.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      try {
        await ensureAuthenticated();
        await refresh();
      } catch (_e) {
        setError("Authentication is required.");
        setLoading(false);
      }
    })();
  }, []);

  const onSave = async () => {
    try {
      setSaving(true);
      const row = await save(form);
      setRefs((prev) => [row, ...prev]);
      setForm(emptyForm());
      setStep(0);
      setSaved(true);
      setTimeout(() => {
        setSaved(false);
        setTab(1);
      }, 1800);
    } catch (_e) {
      setError("Could not save. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const onSetStatus = async (status) => {
    if (!selected) return;
    try {
      await setStatus(selected.id, status);
      setRefs((prev) => prev.map((r) => (r.id === selected.id ? { ...r, status } : r)));
      setSelected(null);
    } catch (_e) {
      setError("Could not update.");
    }
  };

  const active = useMemo(() => refs.filter((r) => r.status === "active"), [refs]);
  const nonResponsive = useMemo(() => refs.filter((r) => r.status === "non-responsive" || r.status === "referred-out"), [refs]);

  if (loading) {
    return (
      <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100vh", gap: 20 }}>
        <div style={{ width: 36, height: 36, border: "3px solid #1e293b", borderTop: "3px solid #6366f1", borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
        <div style={{ color: "#475569", fontSize: 14 }}>Connecting to database...</div>
      </div>
    );
  }

  return (
    <>
      {saved && <div className="toast">✅ Referral saved to database!</div>}
      <Header activeCount={active.length} tab={tab} setTab={setTab} onRefresh={refresh} />
      <div style={{ maxWidth: 1200, margin: "0 auto", padding: "28px 32px" }}>
        <div style={{ marginTop: -12, marginBottom: 16, fontSize: 11, color: "#4a607a" }}>
          <span style={{ color: "#22c55e" }}>●</span> {connectionStatusText}
        </div>

        {error && (
          <div className="error-bar">
            ⚠️ {error}
            <button onClick={() => setError(null)} style={{ background: "none", border: "none", color: "#ef4444", cursor: "pointer", float: "right" }}>
              ✕
            </button>
          </div>
        )}

        {tab === 0 && (
          <NewReferralForm
            form={form}
            setForm={setForm}
            step={step}
            setStep={setStep}
            offices={OFFICES}
            insurances={INSURANCES}
            staff={STAFF}
            onSave={onSave}
            saving={saving}
          />
        )}

        {tab === 1 && (
          <ReferralTable
            referrals={active}
            search={search}
            setSearch={setSearch}
            office={office}
            setOffice={setOffice}
            offices={OFFICES}
            onSelect={setSelected}
          />
        )}

        {tab === 2 && (
          <div>
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontWeight: 700, fontSize: 18 }}>Non-Responsive / Referred Out</div>
              <div style={{ color: "#475569", fontSize: 13, marginTop: 4 }}>Clients who could not be reached or were referred elsewhere</div>
            </div>

            <div className="card" style={{ overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #1e293b" }}>
                    <th>Client</th><th>Caregiver</th><th>Phone</th><th>Office</th><th>Insurance</th><th>Coordinator</th><th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {nonResponsive.length === 0 ? (
                    <tr>
                      <td colSpan="7" style={{ padding: 48, textAlign: "center", color: "#334155" }}>
                        No non-responsive clients yet.
                      </td>
                    </tr>
                  ) : nonResponsive.map((r) => (
                    <tr key={r.id} style={{ borderBottom: "1px solid #0f172a" }}>
                      <td style={{ fontWeight: 700, color: "#e2e8f0" }}>{r.first_name} {r.last_name}</td>
                      <td style={{ color: "#94a3b8" }}>{r.caregiver || "—"}</td>
                      <td style={{ color: "#64748b", fontFamily: "monospace", fontSize: 12 }}>{r.caregiver_phone || "—"}</td>
                      <td>{r.office ? <span style={{ background: "#1e293b", borderRadius: 6, padding: "3px 8px", fontSize: 11, fontWeight: 700, color: "#94a3b8" }}>{r.office}</span> : "—"}</td>
                      <td style={{ color: "#64748b", fontSize: 12 }}>{r.insurance || "—"}</td>
                      <td style={{ color: "#64748b", fontSize: 12 }}>{r.intake_personnel || "—"}</td>
                      <td>
                        <span style={{
                          background: r.status === "referred-out" ? "#8b5cf622" : "#ef444422",
                          color: r.status === "referred-out" ? "#8b5cf6" : "#ef4444",
                          border: `1px solid ${r.status === "referred-out" ? "#8b5cf633" : "#ef444433"}`,
                          borderRadius: 6, padding: "2px 8px", fontSize: 11, fontWeight: 700
                        }}>
                          {r.status === "referred-out" ? "Referred Out" : "Non-Responsive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      <Modal referral={selected} onClose={() => setSelected(null)} onSetStatus={onSetStatus} />
    </>
  );
}