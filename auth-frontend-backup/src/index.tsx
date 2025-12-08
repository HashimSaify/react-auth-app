import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';

import './index.css';
import App from './App';

// Find the HTML element with id="root" in public/index.html
const rootElement = document.getElementById('root');

// Make sure the element exists and tell TypeScript it is an HTMLElement
const root = ReactDOM.createRoot(rootElement as HTMLElement);

// Render (draw) our React app inside the root element
root.render(
  <React.StrictMode>
    {/* BrowserRouter enables routing (different pages/URLs) in our app */}
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
