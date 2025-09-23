/* eslint-disable */
// Remove the require statement - axios should be included via a script tag in your HTML

const login = async (email, password) => {
  try {
    const res = await axios({
      method: 'POST',
      url: '/api/v1/users/login',
      data: {
        email,
        password,
      },
    });
    console.log('Response', res.data);
    return res.data;
  } catch (err) {
    console.error(err.response);
  }
};

// Only add event listener if form exists
const loginForm = document.querySelector('.form');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const res = await login(email, password);
    console.log(res);
  });
}
