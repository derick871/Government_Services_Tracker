import axios from "axios";

const getCleanBaseUrl = () => {
  let url = 
    import.meta.env.VITE_API_URL || 
    'http://localhost:8000/api';

    // import.meta.env.VITE_API_BASE_URL || 
    // 'http://localhost:8000/api';

  
  // Clean up trailing slash if present so path concatenation is consistent
  url= url.replace(/\/$/, '');
  if (url.endsWith("/")) {
    url = url.slice(0, -1);
  }
  
  // Append /api if not already included in the env variable config
  if (!url.endsWith("/api")) {
    url = `${url}/api`;
  }
  
  return url;
};

const client = axios.create({
  baseURL: getCleanBaseUrl(),
  headers: { "Content-Type": "application/json" },
  timeout: 20000,
  withCredentials: true, // cookie-based auth token transmission
});

export default client;