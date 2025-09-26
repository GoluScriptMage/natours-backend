const express = require('express');
const {
  getOverview,
  getTourPage,
  loginPage,
} = require('../controllers/viewController');

const { isLoggedIn } = require('../controllers/authControllers');

const router = express.Router();

router.use(isLoggedIn);

router.get('/', getOverview);
router.get('/login', loginPage);
router.get('/tour/:slug', getTourPage);

module.exports = router;
