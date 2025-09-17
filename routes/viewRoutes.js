const express = require('express');
const { getOverview, getTourPage } = require('../controllers/viewController');

const router = express.Router();

router.get('/', getOverview);
router.get('/tour/:id', getTourPage);

module.exports = router;
