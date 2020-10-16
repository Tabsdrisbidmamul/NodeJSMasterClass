import axios from 'axios';
import { showAlert, hideAlert } from './alerts';

// type is password | data
export const updateSettings = async (data, type) => {
  try {
    const url =
      type === 'password'
        ? 'http://127.0.0.1:3000/api/v1/users/update-password'
        : 'http://127.0.0.1:3000/api/v1/users/update-me';

    console.log(data);

    const res = await axios({
      method: 'PATCH',
      url,
      data,
    });

    if (res.data.status === 'success') {
      const msg =
        type === 'password'
          ? 'Your password has been updated.'
          : 'Your user data has been updated.';

      showAlert('success', msg);
      window.setTimeout(() => {
        location.reload();
      }, 1000);
    }
  } catch (e) {
    const { message } = e.response.data;
    showAlert('error', message);
  }
};
