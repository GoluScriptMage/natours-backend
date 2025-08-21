const express = require('express');
const {
  createReview,
  getReview,
  getAllReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');

const { protect } = require('../controllers/authControllers');

const router = express.Router();

router.route('/').post(protect, createReview).get(getAllReview);
router
  .route('/:id')
  .get(getReview)
  .patch(protect, updateReview)
  .delete(protect, deleteReview);

module.exports = router;
