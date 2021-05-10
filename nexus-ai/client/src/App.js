import React from 'react';
import { Routes, Route } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Tools from './pages/Tools';
import ToolPage from './pages/ToolPage';
import Dashboard from './pages/Dashboard';
import NotFound from './pages/NotFound';

const App = () => (
  <div className="flex min-h-screen flex-col">
    <Navbar />

    <main className="flex-1">
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        {/* Browsing the hub is public; running a tool requires auth (the
            stream endpoint is protected server-side regardless). */}
        <Route path="/tools" element={<Tools />} />
        <Route
          path="/tools/:tool"
          element={
            <ProtectedRoute>
              <ToolPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>

    <Footer />

    <ToastContainer position="bottom-right" autoClose={2500} hideProgressBar newestOnTop />
  </div>
);

export default App;
