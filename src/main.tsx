import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// ✅ NEW IMPORTS
import { AuthProvider } from '@/contexts/AuthContext'
import { SchoolProvider } from '@/contexts/SchoolContext'

const rootElement = document.getElementById("root");

if (rootElement) {
  createRoot(rootElement).render(
    <React.StrictMode>

      {/* ✅ NEW: AUTH + SCHOOL WRAPPER */}
      <AuthProvider>
        <SchoolProvider>

          <App />

        </SchoolProvider>
      </AuthProvider>

    </React.StrictMode>
  );
} else {
  console.error("Failed to find the root element. Check your index.html file.");
}
