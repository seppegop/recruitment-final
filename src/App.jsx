import React from 'react';
import ScreenerForm from './pages/ScreenerForm.jsx';
import AdminPage from './pages/AdminPage.jsx';

export default function App() {
  const path = window.location.pathname;

  if (path === '/admin') {
    return <AdminPage />;
  }

  return <ScreenerForm />;
}
