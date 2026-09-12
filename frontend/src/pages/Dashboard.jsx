import { useEffect, useMemo, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FilePlus, ArrowRight, Search, Clock, CheckCircle, XCircle, FileText, ChevronRight, X, Sparkles } from "lucide-react";

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

// FIX: Single token source, fail fast on 401
const getAuthHeaders = () => {
  const token = localStorage.getItem("access");
  if (!token) {
    window.location.href = "/login";
    throw new Error("No token");
  }
  return { "Content-Type": "application/json", Authorization: `Bearer ${token}` };
};

export default function Dashboard() {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("ALL");
  const [selected, setSelected] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [recentRef, setRecentRef] = useState(null);

  const navigate = useNavigate();
  const location = useLocation();

  // FIX: Capture new tracking from ApplyService once
  useEffect(() => {
    if (location.state?.newApplication) {
      setRecentRef(location.state.newApplication);
      window.history.replaceState({}, document.title);
    }
  }, []); // run once, not on location change

  const fetchApplications = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const res = await fetch(`${API_BASE}/applications/`, { headers: getAuthHeaders() });

      if (res.status === 401) {
        localStorage.clear();
        window.location.href = "/login";
        return;
      }
      if (!res.ok) throw new Error(`Failed to load: ${res.status}`);

      const data = await res.json();
      const list = Array.isArray(data)? data : data.results || [];
      setApplications(list);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchApplications(); }, [fetchApplications]);

  // FIX: Auto-select newest application after submit
  useEffect(() => {
    if (recentRef && applications.length) {
      const match = applications.find(a => a.tracking_number === recentRef);
      if (match) handleViewDetails(match);
    }
  }, [applications, recentRef]);

  // FIX: Fetch full detail with logs when opening drawer
  const handleViewDetails = async (app) => {
    try {
      setDetailLoading(true);
      setSelected(app); // show drawer immediately with basic data
      const res = await fetch(`${API_BASE}/applications/${app.tracking_number}/`, {
        headers: getAuthHeaders(),
      });
      if (res.ok) {
        const full = await res.json();
        setSelected(full);
      }
    } catch {}
    finally { setDetailLoading(false); }
  };

  const metrics = useMemo(() => ({
    total: applications.length,
    pending: applications.filter(a => ["SUBMITTED","UNDER_REVIEW","ACTION_REQUIRED","VERIFIED"].includes(a.status)).length,
    approved: applications.filter(a => a.status === "APPROVED").length,
    rejected: applications.filter(a => a.status === "REJECTED").length,
  }), [applications]);

  const filtered = useMemo(() => {
    return applications.filter(a => {
      const q = searchQuery.toLowerCase();
      const matches = (a.tracking_number + a.service_type + a.county_id).toLowerCase().includes(q);
      if (!matches) return false;
      if (statusFilter === "ALL") return true;
      if (statusFilter === "PENDING") return ["SUBMITTED","UNDER_REVIEW","ACTION_REQUIRED","VERIFIED"].includes(a.status);
      return a.status === statusFilter;
    });
  }, [applications, searchQuery, statusFilter]);

  if (loading) return <main className="min-h-screen bg-slate-50 grid place-items-center"><div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" /></main>;
  if (error) return <main className="min-h-screen bg-slate-50 grid place-items-center p-6"><div className="bg-white p-6 rounded-xl border max-w-md"><p className="text-red-600">{error}</p><button onClick={fetchApplications} className="mt-4 bg-slate-900 text-white px-4 py-2 rounded-lg">Retry</button></div></main>;

  return (
    <main className="min-h-screen bg-[#F8FAFC] pb-16">
      <div className="mx-auto max-w-7xl px-6 space-y-6 pt-8">
        {/* Header */}
        <section className="rounded-2xl bg-slate-900 p-8 text-white flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Citizen Dashboard</h1>
            <p className="text-slate-300 text-sm mt-1">Track {metrics.total} application(s) in real-time</p>
          </div>
          <button onClick={() => navigate("/applyService")} className="bg-amber-500 text-black font-bold px-5 py-3 rounded-xl flex gap-2 items-center"><FilePlus size={18}/> Apply New <ArrowRight size={16}/></button>
        </section>

        {recentRef && (
          <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 flex justify-between items-center">
            <div className="flex gap-3 items-center"><Sparkles className="text-blue-600" size={18}/><p className="text-sm text-blue-900">New application <b className="font-mono">{recentRef}</b> submitted!</p></div>
            <button onClick={() => setRecentRef(null)}><X size={16}/></button>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Metric title="Total" value={metrics.total} />
          <Metric title="Pending" value={metrics.pending} color="amber" />
          <Metric title="Approved" value={metrics.approved} color="emerald" />
        </div>

        <section className="bg-white rounded-2xl border">
          <div className="p-5 flex justify-between gap-4 flex-col sm:flex-row border-b">
            <h2 className="font-bold">Application Track Records</h2>
            <div className="flex gap-3">
              <div className="relative"><Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"/><input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search tracking..." className="pl-9 pr-3 py-2 bg-slate-50 border rounded-xl text-sm"/></div>
              <select value={statusFilter} onChange={e=>setStatusFilter(e.target.value)} className="bg-slate-50 border rounded-xl text-sm px-3"><option value="ALL">All</option><option value="PENDING">Pending</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option></select>
            </div>
          </div>

          {filtered.length === 0? (
            <div className="py-16 text-center"><FileText className="mx-auto text-slate-300" size={32}/><p className="mt-2 text-sm text-slate-500">No applications found. Apply for a service.</p></div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase text-slate-500"><tr><th className="px-6 py-3 text-left">Tracking</th><th className="px-6 py-3 text-left">Service</th><th className="px-6 py-3 text-left">County</th><th className="px-6 py-3 text-left">Status</th><th className="px-6 py-3 text-right">Action</th></tr></thead>
                <tbody className="divide-y">
                  {filtered.map(app => (
                    <tr key={app.id} className={`hover:bg-slate-50 cursor-pointer ${app.tracking_number===recentRef?'bg-blue-50':''}`} onClick={()=>handleViewDetails(app)}>
                      <td className="px-6 py-4 font-mono font-bold">{app.tracking_number}{app.tracking_number===recentRef && <span className="ml-2 text-[10px] bg-blue-600 text-white px-2 py-0.5 rounded">NEW</span>}</td>
                      <td className="px-6 py-4">{(app.service_type||"").replaceAll("_"," ")}</td>
                      <td className="px-6 py-4 font-mono text-xs">{app.county_id}</td>
                      <td className="px-6 py-4"><Badge status={app.status}/></td>
                      <td className="px-6 py-4 text-right"><span className="text-blue-600 font-semibold text-xs">View <ChevronRight className="inline" size={12}/></span></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Drawer */}
      {selected && (
        <div className="fixed inset-0 z-50 bg-black/40 flex justify-end" onClick={()=>setSelected(null)}>
          <div className="w-full max-w-md bg-white h-full p-6 overflow-auto" onClick={e=>e.stopPropagation()}>
            <div className="flex justify-between border-b pb-4"><div><span className="font-mono text-xs bg-blue-50 text-blue-700 px-2 py-1 rounded">{selected.tracking_number}</span><h3 className="font-bold text-lg mt-2">{selected.service_type}</h3></div><button onClick={()=>setSelected(null)}><X/></button></div>

            <div className="mt-4 p-3 bg-slate-50 rounded-xl border flex justify-between"><div><p className="text-xs text-slate-500">Status</p><div className="mt-1"><Badge status={selected.status}/></div></div><div className="text-right"><p className="text-xs text-slate-500">Created</p><p className="text-sm font-medium">{selected.created_at?new Date(selected.created_at).toLocaleDateString():"--"}</p></div></div>

            {/* FIX: Show real payload_data */}
            <div className="mt-6 space-y-3">
              <h4 className="text-xs font-bold uppercase tracking-wider">Submitted Details</h4>
              {selected.payload_data? Object.entries(selected.payload_data).map(([k,v])=>(
                <div key={k} className="bg-slate-50 p-3 rounded-lg border"><p className="text-[11px] uppercase text-slate-400">{k.replaceAll("_"," ")}</p><p className="text-sm font-medium">{String(v)}</p></div>
              )) : <p className="text-sm text-slate-500">No extra data</p>}
            </div>

            {/* Timeline logs */}
            {selected.logs?.length>0 && (
              <div className="mt-6"><h4 className="text-xs font-bold uppercase">History</h4><div className="mt-3 space-y-2">{selected.logs.map(log=>(
                <div key={log.timestamp} className="text-xs border-l-2 pl-3 py-1 border-slate-200"><p className="font-bold">{log.from_state} → {log.to_state}</p><p className="text-slate-500">{log.comment} • {new Date(log.timestamp).toLocaleString()}</p></div>
              ))}</div></div>
            )}

            <div className="mt-8"><button onClick={()=>setSelected(null)} className="w-full bg-slate-900 text-white py-3 rounded-xl font-semibold">Close</button></div>
          </div>
        </div>
      )}
    </main>
  );
}

function Metric({title, value, color="blue"}){
  return <div className={`bg-white p-5 rounded-2xl border-l-4 border-${color}-500 border shadow-sm`}><p className="text-xs uppercase text-slate-500 font-semibold">{title}</p><p className="text-2xl font-extrabold mt-2">{value}</p></div>
}
function Badge({status}){
  const map={SUBMITTED:"bg-blue-50 text-blue-700",UNDER_REVIEW:"bg-amber-50 text-amber-700",ACTION_REQUIRED:"bg-orange-50 text-orange-700",APPROVED:"bg-emerald-50 text-emerald-700",REJECTED:"bg-red-50 text-red-700"};
  return <span className={`px-2.5 py-1 rounded-full text-xs font-bold border ${map[status]||"bg-slate-100"}`}>{status?.replaceAll("_"," ")}</span>
}