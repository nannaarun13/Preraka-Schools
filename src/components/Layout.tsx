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

  if (isAdminPage || isLoginPage) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Outlet />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col page-background">

      <Header />
      <Navigation />

      <main className="flex-1">
        <Outlet />
      </main>

      <Footer />

    </div>
  );
};

export default Layout;