// ============================================================================
// Axios API Client Configuration
// ============================================================================
// This file initializes an Axios client instance with a global base URL and
// implements a request interceptor to automatically attach authorization tokens.

import axios from 'axios';

const API = axios.create({
    // Dynamic Base URL for Render deployments, falls back to local port 5001
    baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5001'
});

// Request Interceptor: Automatically runs before every request is sent.
// Injects the JWT bearer token stored in localStorage into headers to authorize actions.
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;