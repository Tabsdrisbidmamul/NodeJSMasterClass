import axios from 'axios';
import { showAlert, hideAlert } from './alerts';

export const signup = async (name, email, password, passwordConfirm) => {
  try {
    console.log('In the signup form');
    const res = await axios({
      method: 'POST',
      url: 'http://127.0.0.1:3000/api/v1/users/sign-up',
      data: {
        name,
        email,
        password,
        passwordConfirm,
      },
    });

    if (res.data.status === 'success') {
      showAlert('success', 'Account Created!');
      window.setTimeout(() => {
        console.log('We made it');
        location.assign('/');
      }, 1000);
    }

    console.log(res);
  } catch (e) {
    console.log('error');
    const { message } = e.response.data;
    showAlert('error', message);
  }
};
