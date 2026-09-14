import axios from "axios";

const API_BASE_URL = 
  import.meta.env.VITE_API_URL || 
  import.meta.env.VITE_API_BASE_URL || 
  "https://government-services-tracker-23.onrender.com/api";

const client = axios.create({
  baseURL: API_BASE_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 15000,
  withCredentials: true, 
});

export default client;