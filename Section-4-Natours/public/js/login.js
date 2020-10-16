import axios from 'axios';
import { showAlert, hideAlert } from './alerts';

export const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/login',
      data: {
        email,
        password,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Logged in successfully!');
      window.setTimeout(() => {
        location.assign(document.referrer);
      }, 1000);
    }

    console.log(res);
  } catch (e) {
    const { message } = e.response.data;
    showAlert('error', message);
  }
};

export const logout = async () => {
  console.log('in the logout method');
  try {
    const res = await axios({
      method: 'GET',
      url: 'http://127.0.0.1:3000/api/v1/users/logout',
    });

    if (res.data.status === 'success') {
      showAlert('success', 'You have successfully logged out');
      location.reload(true);
      if (window.location.pathname === '/myAccount') {
        window.location.assign('/');
      }
    }
  } catch (e) {
    showAlert('error', 'Error logging out! Try again.');
  }
};
