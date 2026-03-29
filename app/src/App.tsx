import { useState, useCallback, useEffect } from 'react';
import { Preloader } from './components/Preloader';
import { ModernLanding } from './components/ModernLanding';
import { ServicesPage } from './components/ServicesPage';
import { PlansPage } from './components/PlansPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { AdminDashboard } from './components/AdminDashboard';
import { SuperAdminDashboard } from './components/SuperAdminDashboard';
import { HelpCenterPage } from './components/HelpCenterPage';
import { EmployeeDashboard } from './components/EmployeeDashboard';
import { TermsPage } from './components/TermsPage';
import { PrivacyPage } from './components/PrivacyPage';

const getStoredUserRole = () => {
  try {
    const rawUser = localStorage.getItem('user');
    if (!rawUser) return null;
    const parsedUser = JSON.parse(rawUser) as { role?: string };
    return parsedUser?.role || null;
  } catch {
    return null;
  }
};

function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('landing');

  const handlePreloaderComplete = useCallback(() => {
    setIsLoading(false);
  }, []);

  // Check for auth token on mount and when it changes
  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('token');

      const role = getStoredUserRole();

      // If we have a token and we are in public pages, redirect by role
      if (token && (currentPage === 'landing' || currentPage === 'login')) {
        setCurrentPage(role === 'SUPERADMIN' ? 'superadmin' : role === 'EMPLOYEE' ? 'employee' : 'admin');
        return;
      }

      // If there is no token, prevent access to admin pages
        if (!token && ['admin', 'employee', 'superadmin', 'admin-plans'].includes(currentPage)) {
            setCurrentPage('login');
            return;
        }

      if (token && role === 'EMPLOYEE' && ['admin', 'superadmin', 'admin-plans'].includes(currentPage)) {
        setCurrentPage('employee');
        return;
      }

      if (token && role === 'ADMIN' && ['employee', 'superadmin'].includes(currentPage)) {
        setCurrentPage('admin');
        return;
      }

      if (token && role === 'SUPERADMIN' && ['employee', 'admin', 'admin-plans'].includes(currentPage)) {
        setCurrentPage('superadmin');
      }
    };

    checkAuth();

    // Listen to storage changes to keep tabs in sync
    window.addEventListener('storage', checkAuth);

    return () => {
      window.removeEventListener('storage', checkAuth);
    };
  }, [currentPage]);

  const handleNavigate = (page: string) => {
    setCurrentPage(page);
    window.scrollTo(0, 0);
  };

  return (
    <>
      {isLoading && <Preloader onComplete={handlePreloaderComplete} />}

      <div className={`min-h-screen bg-[#141414] ${isLoading ? 'overflow-hidden max-h-screen' : ''}`}>
        {currentPage === 'landing' && <ModernLanding onNavigate={handleNavigate} />}
        {currentPage === 'services' && <ServicesPage onNavigate={handleNavigate} />}
        {currentPage === 'plans' && <PlansPage onNavigate={handleNavigate} />}
        {currentPage === 'login' && <LoginPage onNavigate={handleNavigate} />}
        {currentPage === 'register' && <RegisterPage onNavigate={handleNavigate} />}
        {currentPage === 'admin' && <AdminDashboard onNavigate={handleNavigate} initialView="dashboard" />}
        {currentPage === 'admin-plans' && <AdminDashboard onNavigate={handleNavigate} initialView="plans" />}
        {currentPage === 'superadmin' && <SuperAdminDashboard onNavigate={handleNavigate} />}
        {currentPage === 'employee' && <EmployeeDashboard onNavigate={handleNavigate} />}
        {currentPage === 'admin-help' && <HelpCenterPage onNavigate={handleNavigate} />}
        {currentPage === 'terms' && <TermsPage onNavigate={handleNavigate} />}
        {currentPage === 'privacy' && <PrivacyPage onNavigate={handleNavigate} />}
      </div>
    </>
  );
}

export default App;
