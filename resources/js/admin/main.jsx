import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import '../../css/admin.css';

const container = document.getElementById('admin-root');
if (container) {
    const root = ReactDOM.createRoot(container);
    root.render(
        <React.StrictMode>
            <App />
        </React.StrictMode>
    );
}
