import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Profile from "./pages/Profile";
import Bills from "./pages/Bills";
import CreateBill from "./pages/CreateBill";
import EditBill from "./pages/EditBill";
import Merchants from "./pages/Merchants";
import MerchantProfile from "./pages/MerchantProfile";
import Farmers from "./pages/Farmers";
import MerchantSummary from "./pages/MerchantSummary";
import AdhatiyaIncome from "./pages/AdhatiyaIncome";
import PrintBill from "./pages/PrintBill";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsAuthenticated(!!token);
  }, []);

  const PrivateRoute = ({ children }) => (isAuthenticated ? children : <Navigate to="/login" />);

  return (
    <Router>
      <Routes>
        <Route path="/login" element={<Login setAuth={setIsAuthenticated} />} />
        <Route path="/register" element={<Register setAuth={setIsAuthenticated} />} />

        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Profile /></PrivateRoute>} />
        <Route path="/bills" element={<PrivateRoute><Bills /></PrivateRoute>} />
        <Route path="/bills/create" element={<PrivateRoute><CreateBill /></PrivateRoute>} />
        <Route path="/bills/edit/:id" element={<PrivateRoute><EditBill /></PrivateRoute>} />
        <Route path="/bills/print/:id" element={<PrivateRoute><PrintBill /></PrivateRoute>} />
        <Route path="/merchants" element={<PrivateRoute><Merchants /></PrivateRoute>} />
        <Route path="/merchants/:id" element={<PrivateRoute><MerchantProfile /></PrivateRoute>} />
        <Route path="/farmers" element={<PrivateRoute><Farmers /></PrivateRoute>} />
        <Route path="/merchant-summary" element={<PrivateRoute><MerchantSummary /></PrivateRoute>} />
        <Route path="/adhatiya-income" element={<PrivateRoute><AdhatiyaIncome /></PrivateRoute>} />
      </Routes>
    </Router>
  );
}

export default App;
