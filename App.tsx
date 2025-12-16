
import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import ConsignmentMap from './pages/ConsignmentMap';
import Inventory from './pages/Inventory';
import AddVehicle from './pages/AddVehicle';
import Customers from './pages/Customers';
import AiAssistant from './pages/AiAssistant';
import { Lock, User, CarFront } from 'lucide-react';

// Login Component (Ayrıştırıldı)
const LoginView: React.FC = () => {
  const { login } = useAuth();
  const [email, setEmail] = useState('ferhat.cngz0@gmail.com');
  const [password, setPassword] = useState('123123');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    // Güvenli kodlama: Hardcoded credentials sadece demo içindir.
    if (email === 'ferhat.cngz0@gmail.com' && password === '123123') {
      login();
      setError('');
    } else {
      setError('E-posta veya şifre hatalı.');
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-slate-900 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-4 shadow-lg shadow-blue-500/30">
            <CarFront className="text-white w-8 h-8" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">OtoVizyon Pro</h1>
          <p className="text-gray-400 mt-2 text-sm">Yeni Nesil Galeri Yönetimi</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">E-Posta Adresi</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="ornek@galeri.com"
                />
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Şifre</label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  placeholder="••••••"
                />
              </div>
            </div>

            {error && (
              <div className="text-red-500 text-sm text-center bg-red-50 py-2 rounded-lg">
                {error}
              </div>
            )}

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.02]"
            >
              Giriş Yap
            </button>
          </form>
          
          <div className="mt-6 text-center text-xs text-gray-400">
            <p>Test Kullanıcısı: ferhat.cngz0@gmail.com / 123123</p>
          </div>
        </div>
      </div>
    </div>
  );
};

// Main App Component with Auth Check
const AppContent: React.FC = () => {
  const { isAuthenticated, userEmail, logout } = useAuth();

  if (!isAuthenticated) {
    return <LoginView />;
  }

  return (
    <Router>
      <Layout userEmail={userEmail} onLogout={logout}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/inventory" element={<Inventory />} />
          <Route path="/add-vehicle" element={<AddVehicle />} />
          <Route path="/consignment" element={<ConsignmentMap />} />
          <Route path="/customers" element={<Customers />} />
          <Route path="/ai-assistant" element={<AiAssistant />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </Router>
  );
};

const App: React.FC = () => {
  return (
    <Provider store={store}>
      <AuthProvider>
        <AppContent />
      </AuthProvider>
    </Provider>
  );
};

export default App;
