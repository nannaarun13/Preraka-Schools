import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { useSchool } from '@/contexts/SchoolContext';

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

  // ✅ ADMIN PANEL
  if (isAdminPage) {
    return (
      <div className="min-h-screen bg-gray-50 py-6 px-4 md:px-8">
        <div className="max-w-7xl mx-auto">
          <Outlet />
        </div>
      </div>
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
