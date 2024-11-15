// App.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Login from './Components/Auth/Login';
import SignUp from './Components/Auth/SignUp';
import Dashboard from './Components/Dashboard';



const App = () => {
  return (
    <Routes>
      <Route path="/Sign-up" element={<SignUp />} />
      <Route path="/" element={<Login />} />
      <Route path="/dashboard" element={<Dashboard />} />
    </Routes>
  );
};

export default App;
