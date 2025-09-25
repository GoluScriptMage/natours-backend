const express = require('express');
const {
  getAllUser,
  getUser,
  updateUser,
  deleteUser,
  updateUserDetails,
  deleteCurrentuser,
  getMe,
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
  restrictTo,
  logoutToken,
} = require('../controllers/authControllers');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);
router.get('/logout', logoutToken);
router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

// Protect all routes after this middleware
router.use(protect);

router.patch('/updatePassword', updatePassword);
router.patch('/updateMe', updateUserDetails);
router.delete('/deleteMe', deleteCurrentuser);

router.route('/').get(getAllUser);

// To get current user profile without giving id in the url
router.route('/me').get(getMe, getUser);
// .post(createUser);

router
  .route('/:id')
  .get(getUser)
  .patch(updateUser)
  .delete(restrictTo('admin'), deleteUser);

module.exports = router;
