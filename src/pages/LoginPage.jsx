import LoginBackground from '../components/LoginBackground.jsx';
import LoginForm from '../components/LoginForm.jsx';

export default function LoginPage({ onAuthenticated }) {
  return (
    <main className="auth-container">
      <LoginBackground />
      <LoginForm onAuthenticated={onAuthenticated} />
    </main>
  );
}
