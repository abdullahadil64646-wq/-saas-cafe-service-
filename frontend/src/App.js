import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '.Authcontext/context/AuthContext';
import { AlertProvider } from './C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\context\AlertContext';
import PrivateRoute from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\components\Routing\privateroute.js';

// Layout Components
import Navbar from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\components\layout/Navbar';
import Footer from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src\components\layout\Footer';
import Alert from '.\components\layout\Alert';

// Pages
import Home from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/Home';
import Register from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/auth/Register';
import Login from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/auth/Login';
import Dashboard from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/Dashboard';
import Pricing from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/Pricing';
import About from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/About';
import Contact from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/Contact';

// Private Pages
import SocialMedia from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/SocialMedia';
import WebStore from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/WebStore';
import Profile from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/Profile';
import Billing from 'C:\Users\lenovo\Desktop\Abdullah\busnees\code\saas for cafes\-saas-cafe-service-\frontend\src/pages/Billing';

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