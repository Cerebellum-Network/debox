import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import { App } from './App';
import { reportWebVitals } from './reportWebVitals';
import { unwrap } from './lib/unwrap';
import { AppContextProvider } from './app-context';

const root = ReactDOM.createRoot(
  unwrap(document.getElementById('root')),
);
root.render(
  <React.StrictMode>
    <AppContextProvider>
      <App />
    </AppContextProvider>
  </React.StrictMode>,
);

reportWebVitals();
