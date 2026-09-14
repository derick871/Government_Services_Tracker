import { useState, useRef, useEffect } from "react";
import { useLocation, useNavigate } from 'react-router-dom';
import api from "../components/Services/api";
import toast from "react-hot-toast";
import { Loader2, CheckCircle2 } from "lucide-react";

export default function PaymentPage() {
  const { state } = useLocation();
  const navigate = useNavigate();
  const tracking = state?.tracking_number || "";
  const initialAmount = state?.amount || 0;

  const [form, setForm] = useState({
    phone: "",
    amount: initialAmount,
  });

  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState(1);
  const [paymentId, setPaymentId] = useState(null);
  
  const pollIntervalRef = useRef(null);
  const timeoutRef = useRef(null);

  const validatePhone = (phone) => /^2547\d{8}$/.test(phone);

  useEffect(() => {
    return () => {
      if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, []);

  const handlePay = async (e) => {
    e.preventDefault();
    if (!validatePhone(form.phone)){
      toast.error("Enter Safaricom number as 2547XXXXXXXX");
      return;
    }
    if (!form.amount || form.amount <= 0){
      toast.error("Enter a valid amount");
      return;
    }

    setLoading(true);
    try {
      const res = await api.post("/payments/initiate/", {
        phone_number: form.phone,
        amount: Number(form.amount),
        tracking_number: tracking,
        application_id: state?.application_id,
      });

      toast.success("STK Push sent! Enter M-Pesa PIN on your phone.");
      setPaymentId(res.data.payment_id);

      pollIntervalRef.current = setInterval(async () => {
        try {
          const statusRes = await api.get(`/payments/${res.data.payment_id}/status/`);
          const status = statusRes.data.status;

          if (status === "SUCCESS" || status === "COMPLETED") {
            clearInterval(pollIntervalRef.current);
            clearTimeout(timeoutRef.current);
            setStep(2);
            toast.success("Payment Successful!");
            setLoading(false);
          }
          if (status === "FAILED" || status === "CANCELLED") {
            clearInterval(pollIntervalRef.current);
            clearTimeout(timeoutRef.current);
            toast.error(statusRes.data.reason || "Payment failed or cancelled by user");
            setLoading(false);
          }
        } catch (pollErr) {
          console.error("Polling error", pollErr);
        }
      }, 3000);

      timeoutRef.current = setTimeout(() => {
        clearInterval(pollIntervalRef.current);
        if(loading) {
          toast.error("Payment timeout. Please check M-Pesa or try again.");
          setLoading(false);
        }
      }, 120000);

    } catch (err) {
      toast.error(err.response?.data?.detail || "Payment initiation failed");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/payments/${paymentId}/receipt/`, { responseType: "blob" });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `eCitizen_Receipt_${tracking}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success("Receipt downloaded");
    } catch {
      toast.error("Failed to download receipt");
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center">
          <CheckCircle2 size={64} className="mx-auto text-green-500 mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Payment Successful</h2>
          <p className="text-gray-500 mt-2">Tracking: <span className="font-bold text-gray-800">{tracking}</span></p>
          <p className="text-gray-500">Amount: <span className="font-bold text-gray-800">KES {form.amount}</span></p>
          <div className="mt-6 flex flex-col gap-3">
            <button onClick={handleDownload} className="w-full bg-[#0A1931] text-white py-3 rounded-lg font-semibold hover:bg-black transition">Download Receipt (PDF)</button>
            <button onClick={() => navigate("/dashboard")} className="w-full border py-3 rounded-lg font-semibold hover:bg-gray-50 transition">Go to Dashboard</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] p-4">
      <form onSubmit={handlePay} className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border-t-4 border-[#0A1931]">
        <h1 className="text-2xl font-bold text-[#0A1931]">Lipa na M-Pesa</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">You will be prompted on your phone to enter PIN</p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between">
          <span className="text-gray-600 text-sm">Tracking No</span>
          <span className="font-bold text-sm">{tracking || "N/A"}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">M-Pesa Phone Number</label>
            <input
              type="tel"
              placeholder="2547XXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0A1931] outline-none text-slate-500"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Amount (KES)</label>
            <input
              type="number"
              min="1"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              className="mt-1 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0A1931] outline-none font-semibold text-slate-500"
              required
            />
          </div>

          <button disabled={loading} type="submit" className="w-full bg-[#0A1931] text-white py-3.5 rounded-lg font-bold mt-2 hover:bg-black disabled:bg-gray-400 inline-flex justify-center items-center gap-2 transition">
            {loading && <Loader2 size={18} className="animate-spin" />}
            {loading ? "Check your phone..." : `Pay KES ${form.amount}`}
          </button>
        </div>
        <p className="text-center text-xs text-gray-400 mt-6">STK Push will be sent to your phone. Do not enter M-Pesa PIN here.</p>
      </form>
    </div>
  );
}