const express = require('express');
const {
  createReview,
  getReview,
  getAllReview,
} = require('../controllers/reviewController');

const router = express.Router();

router.route('/').post(createReview).get(getAllReview);
router.route('/:id').get(getReview);

module.exports = router;
