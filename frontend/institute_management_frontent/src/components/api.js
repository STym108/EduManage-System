import axios from 'axios';

const API = axios.create({
    // Replace with your actual Render Backend URL
    baseURL: 'https://edumanage-system.onrender.com' 
});

// You can also add your token logic here once so you don't repeat it!
API.interceptors.request.use((req) => {
    const token = localStorage.getItem('token');
    if (token) {
        req.headers.Authorization = `Bearer ${token}`;
    }
    return req;
});

export default API;