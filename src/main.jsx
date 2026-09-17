import React from 'react';
import ReactDOM from 'react-dom/client';
import 'sileo/styles.css';
import App from './App.jsx';
import './styles/main.css';
import './styles/ui-system.css';
import './styles/workspace.css';
import './styles/admin-console.css';
import './styles/admin-suite.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);