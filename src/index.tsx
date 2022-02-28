import React from 'react';
import ReactDOM from 'react-dom';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';



/*
Scheme.createScheme("5HdpHDUpjNkFb7q4Y84wxDbiKRdxtxt7LqBF3p6MXQJVw1Zx").then(scheme => {
    scheme.sign(stringToU8a("hello")).then(signature => {
        console.log(signature)
    })
})
*/

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
