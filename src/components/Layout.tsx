import { Outlet, useLocation, Link } from 'react-router-dom'; // ✅ added Link
import { useEffect } from 'react';
import Header from './Header';
import Navigation from './Navigation';
import Footer from './Footer';
import { useSchool } from '@/contexts/SchoolContext';

// ❌ REMOVED AdminLayout import (not needed)

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

  // ✅ ADMIN WITH SIDEBAR (FIXED INLINE — NO AdminLayout)
  if (isAdminPage) {

    const menu = [
      { name: "Dashboard", path: "/admin" },
      { name: "Content", path: "/admin/content" },
      { name: "Gallery", path: "/admin/gallery" },
      { name: "Admissions", path: "/admin/admissions" },
      { name: "Notices", path: "/admin/notices" },
      { name: "Contact", path: "/admin/contact" },
    ];

    return (
      <div className="flex min-h-screen bg-gray-100">

        {/* SIDEBAR */}
        <div className="w-64 bg-gradient-to-b from-blue-700 to-blue-900 text-white p-5">

          <h1 className="text-xl font-bold mb-8">
            Admin Panel
          </h1>

          <nav className="space-y-3">
            {menu.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-4 py-2 rounded-lg transition ${
                  location.pathname === item.path
                    ? "bg-white text-blue-700"
                    : "hover:bg-blue-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
          </nav>

        </div>

        {/* CONTENT */}
        <div className="flex-1 p-6">
          <Outlet />
        </div>

      </div>
    );
  }

  // ✅ MAIN WEBSITE (UNCHANGED)
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
