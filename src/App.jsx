import { useState } from 'react';
import SileoHost from './components/system/SileoHost.jsx';
import AccessGrantedPage from './pages/AccessGrantedPage.jsx';
import LoginPage from './pages/LoginPage.jsx';

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  function logout() {
    setAuthenticatedUser(null);
  }

  return (
    <>
      <SileoHost />
      {authenticatedUser ? (
        <AccessGrantedPage user={authenticatedUser} onLogout={logout} />
      ) : (
        <LoginPage onAuthenticated={setAuthenticatedUser} />
      )}
    </>
  );
}
