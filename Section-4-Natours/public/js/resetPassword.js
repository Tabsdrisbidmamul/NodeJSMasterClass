import axios from 'axios';
import { showAlert, hideAlert } from './alerts';

export const forgotPasswordTool = async (email) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/forgot-password',
      data: {
        email,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Password Reset was sent to your email!');
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

export const resetPassword = async (password, passwordConfirm) => {
  try {
    const resetToken = window.location.pathname.split('/')[2];
    const res = await axios({
      method: 'PATCH',
      url: `/api/v1/users/reset-password/${resetToken}`,
      data: {
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Your password was reset!');
      window.setTimeout(() => {
        location.assign('/login');
      }, 1000);
    }

    console.log(res);
  } catch (e) {
    console.log(e.response);
    const { message } = e.response.data;
    showAlert('error', message);
  }
};
