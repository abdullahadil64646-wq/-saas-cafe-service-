import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/Authcontext';
import { AlertProvider } from './context/Alertcontext';
import PrivateRoute from './components/Routing/privateroute';

// Layout Components
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/footer';
import Alert from './components/layout/Alert';

// Pages
import Home from './pages/Home';
import Register from './pages/Auth/register';
import Login from './pages/Auth/login';
import Dashboard from './pages/Dashboard';
import Pricing from './pages/pricing';
import About from './pages/About';
import Contact from './pages/Contact';

// Private Pages
import SocialMedia from './pages/Socialmedia';
import WebStore from './pages/Webstore';
import Profile from './pages/Profile';
import Billing from './pages/Billing';

import './App.css';

function App() {
  return (
    <AuthProvider>
      <AlertProvider>
        <Router>
          <div className="App">
            <Navbar />
            <Alert />
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/register" element={<Register />} />
                <Route path="/login" element={<Login />} />
                <Route path="/pricing" element={<Pricing />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
                
                {/* Private Routes */}
                <Route path="/dashboard" element={
                  <PrivateRoute>
                    <Dashboard />
                  </PrivateRoute>
                } />
                <Route path="/social-media" element={
                  <PrivateRoute>
                    <SocialMedia />
                  </PrivateRoute>
                } />
                <Route path="/web-store" element={
                  <PrivateRoute>
                    <WebStore />
                  </PrivateRoute>
                } />
                <Route path="/profile" element={
                  <PrivateRoute>
                    <Profile />
                  </PrivateRoute>
                } />
                <Route path="/billing" element={
                  <PrivateRoute>
                    <Billing />
                  </PrivateRoute>
                } />
              </Routes>
            </main>
            <Footer />
          </div>
        </Router>
      </AlertProvider>
    </AuthProvider>
  );
}

export default App;