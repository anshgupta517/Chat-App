   // src/utils/axios.js
   import axios from 'axios';

   const instance = axios.create({
     baseURL: 'http://localhost:5000', // Adjust based on your backend URL
   });

   export default instance;