import axios from 'axios';

const isServer = typeof window === 'undefined';

const client = axios.create({
  baseURL: isServer
    ? process.env.INTERNAL_API_URL || 'http://localhost:8000/api/v1' 
    : process.env.NEXT_PUBLIC_API_URL || '/api/v1',                   
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
  withCredentials: true, 
});

client.interceptors.request.use(
  (config) => {
    if (isServer && config.ssrContext?.req?.headers?.cookie) {
      config.headers.Cookie = config.ssrContext.req.headers.cookie;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: 
client.interceptors.response.use(
  (response) => response.data,
  async (error) => {
    const status = error.response?.status || 500;

    // Client-only redirect on auth failure
    if (status === 401 && !isServer) {
      // Redirect to login on expired browser session
      window.location.href = `/login?expired=true`;
    }

    const formattedError = {
      status,
      message: error.response?.data?.message || 'An unexpected error occurred.',
      errors: error.response?.data?.errors || null,
    };

    return Promise.reject(formattedError);
  }
);

export default client;