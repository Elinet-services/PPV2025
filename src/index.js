import React from 'react';
import { HashRouter as Router } from 'react-router-dom';
//import { BrowserRouter as Router } from 'react-router-dom';
import ReactDOM from 'react-dom/client';
import './index.css';
import './App.css';
import 'react-phone-number-input/style.css';
import 'mdb-react-ui-kit/dist/css/mdb.min.css';
import reportWebVitals from './reportWebVitals';
import 'mdb-react-wysiwyg/dist/css/wysiwyg.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <Router>
      <App />
    </Router>
  </React.StrictMode>
);

// For performance monitoring (optional)
reportWebVitals();
