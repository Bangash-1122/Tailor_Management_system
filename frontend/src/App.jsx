import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import LanguageDirection from './components/common/LanguageDirection';
import Layout from './components/layout/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Customers from './pages/Customers';
import Measurements from './pages/Measurements';
import Orders from './pages/Orders';
import Payments from './pages/Payments';
import Ledger from './pages/Ledger';
import Expenses from './pages/Expenses';
import Staff from './pages/Staff';
import Reports from './pages/Reports';
import Settings from './pages/Settings';

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <LanguageDirection />
        <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
          <Routes>
            {/* Public route */}
            <Route path="/login" element={<Login />} />

            {/* Protected routes wrapped in Layout */}
            <Route
              path="/"
              element={
                <Layout>
                  <Dashboard />
                </Layout>
              }
            />
            <Route
              path="/customers"
              element={
                <Layout>
                  <Customers />
                </Layout>
              }
            />
            <Route
              path="/measurements"
              element={
                <Layout>
                  <Measurements />
                </Layout>
              }
            />
            <Route
              path="/orders"
              element={
                <Layout>
                  <Orders />
                </Layout>
              }
            />
            <Route
              path="/payments"
              element={
                <Layout>
                  <Payments />
                </Layout>
              }
            />
            <Route
              path="/ledger"
              element={
                <Layout>
                  <Ledger />
                </Layout>
              }
            />
            <Route
              path="/expenses"
              element={
                <Layout>
                  <Expenses />
                </Layout>
              }
            />
            <Route
              path="/staff"
              element={
                <Layout>
                  <Staff />
                </Layout>
              }
            />
            <Route
              path="/reports"
              element={
                <Layout>
                  <Reports />
                </Layout>
              }
            />
            <Route
              path="/settings"
              element={
                <Layout>
                  <Settings />
                </Layout>
              }
            />

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </BrowserRouter>

        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'var(--bg-card-solid, #0f1629)',
              color: 'var(--text-primary, #e2e8f0)',
              border: '1px solid var(--border-subtle, rgba(255,255,255,0.1))',
              borderRadius: '12px',
              fontSize: '13px',
              boxShadow: 'var(--shadow-card)',
            },
            success: {
              iconTheme: { primary: '#10b981', secondary: 'var(--bg-card-solid, #0f1629)' },
            },
            error: {
              iconTheme: { primary: '#f43f5e', secondary: 'var(--bg-card-solid, #0f1629)' },
            },
          }}
        />
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
