import { useState } from 'react';
import AccessGrantedPage from './pages/AccessGrantedPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  function logout() {
    setAuthenticatedUser(null);
  }

  if (authenticatedUser) {
    return <AccessGrantedPage onLogout={logout} />;
  }

  return <LoginPage onAuthenticated={setAuthenticatedUser} />;
}
// hola :3
// si 