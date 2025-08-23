const express = require('express');
const {
  createReview,
  getReview,
  getAllReview,
  updateReview,
  deleteReview,
  setTourUserIds,
} = require('../controllers/reviewController');

const { protect, restrictTo } = require('../controllers/authControllers');

const router = express.Router({ mergeParams: true });

router.use(protect);

router
  .route('/')
  .post(setTourUserIds, restrictTo('user'), createReview)
  .get(getAllReview);

router
  .route('/:id')
  .get(getReview)
  .patch(restrictTo('user', 'admin'), updateReview)
  .delete(restrictTo('user', 'admin'), deleteReview);

module.exports = router;
