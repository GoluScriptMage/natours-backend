# Natours API Practice Test

## Instructions

- Answer all 10 questions
- For code-based questions, write the complete solution
- For multiple-choice questions, select the best answer
- Explain your reasoning for each answer

## Question 1: Authentication Middleware

**Write the code for a middleware function that protects routes by verifying JWT tokens from the Authorization header.**

```javascript
// Your code here:
const protect = async (req, res, next) => {
  const { jwtToken } = req.params;
  if (!jwtToken) {
    return next(new Error('User not logged'));

    const jwt = await Promisify(jwt.verify()); // { iat, id, exp}
    const user = await User.findById(jwt.id);

    if (!user) {
      return next(new Error('No user found! Invalid JWT'));
    }

    // Also checked for the password expiry and password not chnaged
    // If all ok then return teh user in req
    req.user = user;
  }
};
```

## Question 2: MongoDB Geospatial Query

**Which of the following queries would find tours within a 10-mile radius of New York City?**

A)

```javascript
Tour.find({
  startLocation: {
    $near: {
      $geometry: { type: 'Point', coordinates: [-73.98, 40.76] },
      $maxDistance: 10 * 1609.34,
    },
  },
});
```

B)

```javascript
Tour.find({
  startLocation: {
    $geoWithin: { $centerSphere: [[-73.98, 40.76], 10 / 3963.2] },
  },
});
```

C)

```javascript
Tour.find({
  startLocation: { $within: { $center: [[-73.98, 40.76], 10] } },
});
```

D)

```javascript
Tour.find({
  startLocation: {
    $geoNear: {
      coordinates: [-73.98, 40.76],
      distanceField: 'distance',
      maxDistance: 10,
    },
  },
});

Ans- C because it is the within syntax
```

## Question 3: Error Handling

**Fix the error handling in this controller function:**

```javascript
const createTour = async (req, res) => {
  try {
    const newTour = await Tour.create(req.body);

    if (!newTour) {
      return next(new Error('Tour not created'));
    }

    res.status(201).json({
      status: 'success',
      data: {
        tour: newTour,
      },
    });
  } catch (error) {
    res.status(400).json({
      status: 'fail',
      message: error,
    });
  }
};

// Your improved code here:
```

## Question 4: Mongoose Middleware

**What would this Mongoose middleware function do? Select the best answer.**

```javascript
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, { lower: true });
  next();
});
```

A) Validate that the tour name can be converted to a slug before saving
B) Create a URL-friendly slug from the tour name before each save operation
C) Add a slug field to the schema and ensure it's always lowercase
D) Run the slugify function after the document is saved

Best answer is the B

## Question 5: Factory Functions

**Implement a factory function for deleting documents that:**

- Works with any model
- Returns a 204 status on success
- Uses proper error handling with AppError

```javascript
// Your code here:
const handleFactoryDelete = (model) => {
  async (req, res, next) => {
    const { id } = req.params;
    if (!id) {
      return next(new AppError('Id not found'));
    }
    await model.findByIdAndDelete(id);
    res.status(204).json({
      status: 'success',
    });
  };
};
```

## Question 6: Advanced Querying

**What will the following query string transform into when processed by the API Features class?**

```
/api/v1/tours?duration[gte]=5&difficulty=easy&sort=-price,ratingsAverage&fields=name,price,duration&page=2&limit=10
```

A) MongoDB Query:

```javascript
Tour.find({ duration: { $gte: 5 }, difficulty: 'easy' })
  .sort({ price: -1, ratingsAverage: 1 })
  .select('name price duration')
  .skip(10)
  .limit(10);
```

B) MongoDB Query:

```javascript
Tour.find({ duration: { $gte: '5' }, difficulty: 'easy' })
  .sort('-price ratingsAverage')
  .select('name price duration')
  .skip(10)
  .limit(10);
```

C) MongoDB Query:

```javascript
Tour.find({ duration: { $gte: 5 }, difficulty: 'easy' })
  .sort('-price ratingsAverage')
  .select('name price duration')
  .skip(10)
  .limit(10);
```

D) MongoDB Query:

```javascript
Tour.find({ duration: { $gte: 5 }, difficulty: 'easy' })
  .sort('-price ratingsAverage')
  .select('name price duration')
  .skip(20)
  .limit(10);
```

The answe will be D

## Question 7: Aggregation Pipeline

**Write an aggregation pipeline that calculates the average price and ratings for tours, grouped by difficulty level.**

```javascript
// Your code here:
const tourCalcs = async (req, res, next) => {
  const stats = Tour.aggregate([
    {
      $group: {
        _id: {
          $toUpper: '$difficulty',
        },
        avgPrice: {
          $avg: '$averagePrice',
        },
        avgRatings: {
          $avg: '$ratings',
        },
      },
    },
  ]);

  res.status(200).json({
    status: 'Success',
    results: stats.length,
    data: {
      stats,
    },
  });
};
```

## Question 8: Nested Routes

**Which Express route configuration correctly implements a nested route for reviews within tours?**

A)

```javascript
router.route('/tours/:tourId').post(reviewController.createReview);
```

B)

```javascript
router
  .route('/tours/:tourId/reviews')
  .post(
    authController.protect,
    authController.restrictTo('user'),
    reviewController.setTourUserIds,
    reviewController.createReview,
  );
```

C)

```javascript
router.route('/:tourId/reviews').post(reviewController.createReview);
```

D)

```javascript
router.route('/reviews').post(function (req, res, next) {
  req.body.tour = req.params.tourId;
  next();
}, reviewController.createReview);

I think the corret answer should be C i am just confuse about the two tours in the route './api/v1/tours/tours/:tourId/reviews'
I think the correct one will be c not the B
```

## Question 9: Security Implementation

**Implement a rate limiter middleware to prevent brute force attacks:**

```javascript
// Your code here:
const rateLimiter = require('express-rate-limiter');
express.use({});
// I kinda forget how we actually do it but i how does it implements not the code
```

## Question 10: Debugging Challenge

**The following code is meant to update a user's password but has bugs. Find and fix them:**

```javascript
exports.updatePassword = async (req, res, next) => {
  // 1) Get user from collection
  const user = User.findById(req.user.id);

  // 2) Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
};

// Your fixed code here:
exports.updatePassword = async (req, res, next) => {
  // 1) Get user from collection
  // User should only be able to update the password if he is logged in
  const { user } = req.user;

  // 2) Check if posted password is correct
  if (!(await user.correctPassword(req.body.currentPassword, user.password))) {
    return next(new AppError('Your current password is incorrect', 401));
  }

  // 3) Update password
  user.password = req.body.password;
  user.passwordConfirm = req.body.passwordConfirm;
  user.save();

  // 4) Log user in, send JWT
  createAndSendToken(user, 200, res);
};
```
