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
        
    }
}