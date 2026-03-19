import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { useSchool } from '@/contexts/SchoolContext';

// ✅ NEW
import AdminLayout from '@/layouts/AdminLayout';

const Layout = () => {
  const location = useLocation();
  const { dispatch } = useSchool();

  const isAdminPage = location.pathname.includes('/admin');
  const isLoginPage = location.pathname.includes('/login');

  useEffect(() => {
    window.scrollTo(0, 0);

    if (!isAdminPage && !isLoginPage) {
      dispatch({ type: 'INCREMENT_VISITORS' });
    }
  }, [location.pathname]);

  // ✅ LOGIN PAGE (NO HEADER / FOOTER)
  if (isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    );
  }

  // ✅ ADMIN WITH SIDEBAR (NEW)
  if (isAdminPage) {
    return (
      <AdminLayout>
        <Outlet />
      </AdminLayout>
    );
  }

  // ✅ MAIN WEBSITE
  return (
    <div className="min-h-screen flex flex-col bg-white">

      {/* HEADER */}
      <Header />

      {/* NAVBAR */}
      <Navigation />

      {/* CONTENT */}
      <main className="flex-1 page-background">
        <Outlet />
      </main>

      {/* FOOTER */}
      <Footer />

    </div>
  );
};

export default Layout;
