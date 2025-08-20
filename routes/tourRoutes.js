const express = require('express');
const {
  getAllTours,
  getTour,
  createTour,
  updateTour,
  deleteTour,
  aliasTopTours,
  getTourStats,
  getMonthlyPlan,
} = require('../controllers/tourController');

const { protect, restrictTo } = require('../controllers/authControllers');

//Define the routes
const router = express.Router();

//Route for top 5 cheap tours
router.route('/top-5-tours').get(aliasTopTours, getAllTours);
router
  .route('/monthly-plan/:year')
  .get(protect, restrictTo('admin', 'lead-guide'), getMonthlyPlan);
router.route('/tours-stats').get(getTourStats);

router.route('/').get(protect, getAllTours).post(createTour);
router
  .route('/:id')
  .get(getTour)
  .patch(updateTour)
  .delete(protect, restrictTo('admin', 'lead-guide'), deleteTour);

module.exports = router;
