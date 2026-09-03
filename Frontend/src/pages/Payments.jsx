import { useState } from "react";
import {useLocation, useNavigate} from 'react-router-dom';
import api from "../components/Services/api";
import toast from "react-hot-toast;"

const PaymentPage= () => {
    const {state}= useLocation();
    const navigate= useNavigate();
    const tracking = state?.tracking_number;
    const initialAmaount= state.amount;

    const [form,setForm]= useState({
        phone: "",
        pin: "",
        amount: "initialAmount",
    });

    const [loading, setLoading]= useState(False);
    const [steps, setSteps]= useState(1);
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
      const res = await apiClient.post("/payments/initiate/", {
        phone_number: form.phone,
        amount: form.amount,
        tracking_number: tracking,
        application_id: state?.application_id,
      });

      toast.success("STK Push sent! Check your phone to enter M-Pesa PIN.");
      setPaymentId(res.data.payment_id);

      // 2. Poll for status every 3 seconds
      const interval = setInterval(async () => {
        const statusRes = await apiClient.get(`/payments/${res.data.payment_id}/status/`);
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
        if (loading) setLoading(false);
      }, 120000);

    } catch (err) {
      toast.error(err.response?.data?.detail || "Payment initiation failed");
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const res = await apiClient.get(`/payments/${paymentId}/receipt/`, {
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

}