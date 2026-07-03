import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import logoUrl from './assets/logo-aeroinfo.png';
import './styles.css';

const favicon = document.createElement('link');
favicon.rel = 'icon';
favicon.type = 'image/png';
favicon.href = logoUrl;
document.head.appendChild(favicon);

ReactDOM.createRoot(document.getElementById('app')).render(<App />);
