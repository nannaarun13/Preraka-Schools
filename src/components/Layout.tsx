import { Outlet, useLocation } from 'react-router-dom';
import { useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { useSchool } from '@/contexts/SchoolContext';
import SecurityHeadersEnhanced from '@/components/security/SecurityHeadersEnhanced';

const Layout = () => {
  const location = useLocation();
  const { dispatch } = useSchool();

  // ✅ FIX: Works correctly with HashRouter
  const fullPath = location.pathname + location.hash;

  const isAdminPage = fullPath.includes('/admin');
  const isLoginPage = fullPath.includes('/login');

  useEffect(() => {
    // Scroll to top on route change
    window.scrollTo(0, 0);

    // Increment visitors only for public pages
    if (!isAdminPage && !isLoginPage) {
      dispatch({ type: 'INCREMENT_VISITORS' });
    }
  }, [location.pathname, dispatch, isAdminPage, isLoginPage]);

  // ✅ Admin & Login layout (NO header/footer)
  if (isAdminPage || isLoginPage) {
    return (
      <>
        <SecurityHeadersEnhanced />
        <div className="min-h-screen bg-gray-50">
          <Outlet />
        </div>
      </>
    );
  }

  // ✅ Public website layout (Header + Navbar + Footer)
  return (
    <>
      <SecurityHeadersEnhanced />
      <div className="min-h-screen bg-white flex flex-col">

        {/* HEADER */}
        <Header />

        {/* NAVIGATION */}
        <Navigation />

        {/* MAIN CONTENT */}
        <main className="flex-1">
          <Outlet />
        </main>

        {/* FOOTER */}
        <Footer />

      </div>
    </>
  );
};

export default Layout;