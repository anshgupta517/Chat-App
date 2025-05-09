   
   import React, { useState } from 'react';
   import axios from '../utils/axios';

   const Login = () => {
     const [email, setEmail] = useState('');
     const [password, setPassword] = useState('');

     const handleSubmit = async (e) => {
       e.preventDefault();
       try {
         const { data } = await axios.post('/api/user/login', { email, password });
         localStorage.setItem('token', data.token); 
         
       } catch (error) {
         console.error(error);
       }
     };

     return (
       <form onSubmit={handleSubmit}>
         <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" required />
         <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" required />
         <button type="submit">Login</button>
       </form>
     );
   };

   export default Login;