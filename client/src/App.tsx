import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { useAuthStore } from './store/authStore';
import RootLayout from './components/RootLayout';
import Landing from './pages/Landing';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Transactions from './pages/Transactions';
import InputPage from './pages/InputPage';
import Budgets from './pages/Budgets';
import Advisor from './pages/Advisor';
import Calendar from './pages/Calendar';
import Settings from './pages/Settings';
import Onboarding from './pages/Onboarding';
import { Toaster } from 'react-hot-toast';

const PrivateRoute = ({ children, accessToken }: { children: any; accessToken: string | null }) => {
  if (!accessToken) return <Navigate to="/login" />;
  return children;
};

function App() {
  const fetchConfig = useAuthStore(state => state.fetchConfig);
  const user = useAuthStore(state => state.user);
  const accessToken = useAuthStore(state => state.accessToken);

  useEffect(() => {
    if (accessToken && !user) {
      fetchConfig();
    }
  }, [accessToken, !!user, fetchConfig]);

  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ className: 'bg-surface text-text-primary border border-border' }} />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={accessToken ? <Navigate to="/app/dashboard" /> : <Login />} />
        <Route path="/register" element={accessToken ? <Navigate to="/app/dashboard" /> : <Register />} />

        <Route path="/app/*" element={<PrivateRoute accessToken={accessToken}><RootLayout /></PrivateRoute>}>
          <Route path="onboarding" element={<Onboarding />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="transactions" element={<Transactions />} />
          <Route path="input" element={<InputPage />} />
          <Route path="budgets" element={<Budgets />} />
          <Route path="advisor" element={<Advisor />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
