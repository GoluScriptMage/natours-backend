/* eslint-disable */
import { displayMap } from './mapbox.js';
import { login, logout } from './login.js';

const logoutBtn = document.querySelector('.nav__el--logout');

// Get locations from HTML
const mapBox = document.getElementById('map');
if (mapBox) {
  const locations = JSON.parse(mapBox.dataset.locations);
  displayMap(locations);
}

// Only add event listener if form exists
const loginForm = document.querySelector('.form');
if (loginForm) {
  loginForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    login(email, password);
  });
}

if (logoutBtn) logoutBtn.addEventListener('click', logout);
