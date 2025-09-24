// create an export fn with two (type, msg) params
// type is either 'success' or 'error'

/* eslint-disable */

export const showAlert = (type, message) => {
  const html = `<div class="alert alert-${type}">${message}</div>`;
  document.querySelector('body').insertAdjacentHTML('afterbegin', html);
  window.setTimeout(() => {
    document.querySelector('.alert').remove();
  }, 4000);
};
