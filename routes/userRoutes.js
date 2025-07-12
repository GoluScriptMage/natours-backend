const express = require('express');
const {
  getAllUser,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  updateUserDetails,
  deleteCurrentuser,
} = require('../controllers/userController');

const {
  signup,
  login,
  forgotPassword,
  resetPassword,
  updatePassword,
  protect,
} = require('../controllers/authControllers');

const router = express.Router();

router.post('/signup', signup);
router.post('/login', login);

router.post('/forgotPassword', forgotPassword);
router.patch('/resetPassword/:token', resetPassword);

router.patch('/updatePassword', protect, updatePassword);
router.patch('/updateMe', protect, updateUserDetails);
router.delete('/deleteMe', protect, deleteCurrentuser);

router.route('/').get(getAllUser).post(createUser);
router.route('/:id').get(getUser).patch(updateUser).delete(deleteUser);

module.exports = router;
