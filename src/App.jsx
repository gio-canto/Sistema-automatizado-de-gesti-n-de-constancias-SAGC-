import { useState } from 'react';
import AccessGranted from './components/AccessGranted.jsx';
import LoginBackground from './components/LoginBackground.jsx';
import LoginForm from './components/LoginForm.jsx';

export default function App() {
  const [authenticatedUser, setAuthenticatedUser] = useState(null);

  function logout() {
    setAuthenticatedUser(null);
  }

  if (authenticatedUser) {
    return <AccessGranted onLogout={logout} />;
  }

  return (
    <main className="auth-container">
      <LoginBackground />
      <LoginForm onAuthenticated={setAuthenticatedUser} />
    </main>
  );
}
