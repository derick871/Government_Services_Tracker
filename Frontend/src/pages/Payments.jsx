import { useState } from "react";
import {useLocation, useNavigate} from 'react-router-dom';
import api from "../components/Services/api";
import toast from "react-hot-toast";

export default function PaymentPage() {
    const {state}= useLocation();
    const navigate= useNavigate();
    const tracking = state?.tracking_number || "";
    const initialAmount= state?.amount || 0;

    const [form,setForm]= useState({
        phone: "",
        pin: "",
        amount: initialAmount,
    });

    const [loading, setLoading]= useState(False);
    const [step, setStep]= useState(1);
    const [paymentId, setPaymentId]= useState(null);
    const validatePhone=(phone)=> /^2547\d{8}$/.test(phone);
    const handlePay = async (e) => {
        e.preventDefault();
        if (!validatePhone(form.phone)){
            toast.error("Enter safaricom number as 2547*******")
            return;
        }
        if (form.pin.length !==4){
            toast.error("Enter a 4 digit PIN")
            return;
        }

        setLoading(true);
    try {
      // 1. Initiate STK Push
      const res = await api.post("/payments/initiate/", {
        phone_number: form.phone,
        amount: form.amount,
        tracking_number: tracking,
        application_id: state?.application_id,
      });

      toast.success("STK Push sent! Check your phone to enter M-Pesa PIN.");
      setPaymentId(res.data.payment_id);

      // 2. Poll for status every 3 seconds
      const interval = setInterval(async () => {
        const statusRes = await api.get(`/payments/${res.data.payment_id}/status/`);
        if (statusRes.data.status === "SUCCESS") {
          clearInterval(interval);
          setStep(2);
          toast.success("Payment Successful!");
          setLoading(false);
        }
        if (statusRes.data.status === "FAILED") {
          clearInterval(interval);
          toast.error("Payment failed or cancelled");
          setLoading(false);
        }
      }, 3000);

      // Stop polling after 2 mins
      setTimeout(() => {
        clearInterval(interval);
        setLoading((prev) => (prev ? false : prev));
      }, 120000);

    } catch (err) {
      toast.error(err.response?.data?.detail || "Payment initiation failed");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await api.get(`/payments/${paymentId}/receipt/`, {
        responseType: "blob",
      });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", `eCitizen_Receipt_${tracking}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      toast.success("Receipt downloaded");
    } catch {
      toast.error("Failed to download receipt");
    }
  };

  if (step === 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
        <div className="bg-white max-w-md w-full p-8 rounded-2xl shadow-lg text-center">
          <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-3xl mb-4">
            ✓✓
          </div>
          <h2 className="text-2xl font-bold text-gray-900">Payment Successful</h2>
          <p className="text-gray-500 mt-2">Tracking No: <span className="font-bold">{tracking}</span></p>
          <p className="text-gray-500">Amount: <span className="font-bold">KES {form.amount}</span></p>

          <div className="mt-6 flex flex-col gap-3">
            <button 
              onClick={handleDownload} 
              className="w-full bg-[#0A1931] text-white py-3 rounded-lg font-semibold hover:bg-black transition"
            >
              Download Receipt (PDF)
            </button>
            <button 
              onClick={() => navigate("/dashboard")} 
              className="w-full border py-3 rounded-lg font-semibold hover:bg-gray-50 transition"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F4F6F9] p-4">
      <form onSubmit={handlePay} className="bg-white max-w-md w-full p-8 rounded-2xl shadow-xl border-t-4 border-[#0A1931]">
        <h1 className="text-2xl font-bold text-[#0A1931]">Secure Payment</h1>
        <p className="text-sm text-gray-500 mt-1 mb-6">Government of Kenya | eCitizen</p>

        <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-between">
          <span className="text-gray-600">Tracking No</span>
          <span className="font-bold">{tracking}</span>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-sm font-semibold text-gray-700">M-Pesa Phone Number</label>
            <input
              type="text"
              placeholder="2547XXXXXXXX"
              value={form.phone}
              onChange={(e) => setForm({ ...form, phone: e.target.value })}
              className="mt-1 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0A1931] outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">Amount (KES)</label>
            <input
              type="number"
              value={form.amount}
              readOnly
              className="mt-1 w-full border rounded-lg px-4 py-3 bg-gray-100 text-gray-600 font-semibold cursor-not-allowed"
            />
          </div>

          <div>
            <label className="text-sm font-semibold text-gray-700">eCitizen PIN (4-digit)</label>
            <input
              type="password"
              maxLength={4}
              placeholder="••••"
              value={form.pin}
              onChange={(e) => setForm({ ...form, pin: e.target.value.replace(/\D/g, "") })}
              className="mt-1 w-full border rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#0A1931] outline-none tracking-[0.5em] text-center font-bold"
              required
            />
            <p className="text-xs text-gray-400 mt-1">This PIN is for internal verification. Real M-Pesa prompt will appear on your phone.</p>
          </div>

          <button
            disabled={loading}
            type="submit"
            className="w-full bg-[#0A1931] text-white py-3.5 rounded-lg font-bold mt-2 hover:bg-black disabled:bg-gray-400 transition"
          >
            {loading ? "Waiting for M-Pesa..." : `Pay KES ${form.amount}`}
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 mt-6">Secured by Safaricom Daraja API • 256-bit SSL</p>
      </form>
    </div>
  );
}

