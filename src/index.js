import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import "./assets/locales/config";
import 'antd/dist/reset.css';
import '@/assets/styles/index.css';
import 'highlight.js/styles/vs.css';
import 'github-markdown-css/github-markdown-light.css';
import 'bytemd/dist/index.css';
import App from './App';
import Providers from "./Providers";

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <BrowserRouter>
    <Providers>
      <App />
    </Providers>
  </BrowserRouter>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
// reportWebVitals();
