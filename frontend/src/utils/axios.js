   // src/utils/axios.js
   import axios from 'axios';

   const instance = axios.create({
     baseURL: 'http://localhost:5000', // Adjust based on your backend URL
   });

   // Add a request interceptor
   instance.interceptors.request.use(
     (config) => {
       const token = localStorage.getItem('token');
       if (token) {
         config.headers.Authorization = `Bearer ${token}`;
       }
       return config;
     },
     (error) => {
       return Promise.reject(error);
     }
   );

   export default instance;