const mongoose = require('mongoose');
// eslint-disable-next-line import/no-extraneous-dependencies
const slugify = require('slugify');

const tourSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'A tour name is required'],
      unique: true,
      trim: true,
      minlength: [10, 'A tour name must have 10 or more characters'],
      maxlength: [40, 'A tour name must have 40 or less characters'],
    },
    slug: String,
    secretTour: {
      type: Boolean,
      default: false,
    },
    maxGroupSize: {
      type: Number,
      required: [true, 'A tour must have a group size'],
    },
    difficulty: {
      type: String,
      required: [true, 'A tour must have a difficulty level'],
      enum: {
        values: ['easy', 'medium', 'difficult'],
        message: 'Difficulty is either: easy, medium, or difficult',
      },
    },
    ratingsAverage: {
      type: Number,
      default: 4.2,
    },
    ratingsQuantity: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, 'A tour must have a price'],
    },
    priceDiscount: {
      type: Number,
      validate: {
        validator: function (val) {
          // this only point to current doc in new document creation
          return val < this.price;
        },
        message:
          'Discount price ({VALUE}) should be less than the regular price',
      },
    },
    summary: {
      type: String,
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    imageCover: {
      type: String,
      required: [true, 'A tour must have a cover image'],
    },
    images: [String],
    createdAt: {
      type: Date,
      default: Date.now(),
      select: false, // Exclude from query results by default
    },
    startLocation: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
    locations: {
      type: {
        type: String,
        default: 'Point',
        enum: ['Point'],
      },
      coordinates: [Number],
      address: String,
      description: String,
      day: Number,
    },
    guides: [
      {
        type: mongoose.Schema.ObjectId,
        ref: 'users',
      },
    ],
    startDates: [Date],
    duration: {
      type: Number,
      required: [true, 'A tour must have a duration'],
    },
    rating: {
      type: Number,
      default: 4.5,
      min: [1, 'Rarting must be above 1.0'],
      max: [5, 'Rating must be below 5.0'],
    },
  },
  {
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

tourSchema.virtual('durationInWeeks').get(function () {
  return (this.duration / 7).toFixed(2);
});

tourSchema.index({ price: 1, ratingsAverage: 1 });

//Document MiddleWares pre and post

// pre is before giving the data to the db and it only works on create() and save() method not in get or update
tourSchema.pre('save', function (next) {
  this.slug = slugify(this.name, {
    lower: true,
  });
  next();
});

// post is after the data set in the db and we cany only get the completed doc
// tourSchema.post('save', function (doc, next) {
//   console.log(this.doc, doc);
//   next();
// });

// Query MiddleWares
tourSchema.pre(/^find/, function (next) {
  this.find({ secretTour: { $ne: true } });
  next();
});

tourSchema.pre(/^find/, function (next) {
  this.populate({
    path: 'guides',
  });

  next();
});

// tourSchema.post(/^find/, function (docs, next) {
//   console.log(docs);
//   next();
// });

//////////////////////////////////////////////////////
// Aggreation MiddleWares
tourSchema.pre('aggregate', function (next) {
  this.pipeline().unshift({
    $match: {
      secretTour: {
        $ne: true,
      },
    },
  });
  next();
});

const Tours = mongoose.model('Tours', tourSchema);

module.exports = Tours;
