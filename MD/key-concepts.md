# Natours: Key Technical Concepts

## Authentication & Authorization

```
┌─────────────────────────┐          ┌──────────────────────┐         ┌─────────────────────┐
│                         │          │                      │         │                     │
│  CLIENT                 │  token   │ JWT VERIFICATION     │  user   │  PROTECTED RESOURCE │
│  Login credentials ────────────────> Check signature      ──────────> Controller actions  │
│  Store JWT in cookie    │          │ Verify expiration    │         │  • Update tours     │
│                         │          │ Check user exists    │         │  • Delete reviews   │
│                         │          │ Check password change│         │  • User actions     │
└─────────────────────────┘          └──────────────────────┘         └─────────────────────┘
```

| Concept | Description | Code Example |
|---------|-------------|--------------|
| **JWT Authentication** | Stateless authentication using JSON Web Tokens | `JWT.sign({ id }, process.env.JWT_SECRET, { expiresIn: '90d' })` |
| **Password Hashing** | One-way encryption using bcrypt with salt rounds | `await bcrypt.hash(password, 12)` |
| **Protected Routes** | Middleware that checks for valid JWT | `exports.protect = catchAsync(async (req, res, next) => {...})` |
| **Role-Based Access** | Restrict actions based on user roles | `exports.restrictTo = (...roles) => (req, res, next) => {...}` |

## MongoDB & Mongoose

```
┌───────────────────────┐         ┌─────────────────────────┐         ┌───────────────────┐
│                       │         │                         │         │                   │
│  SCHEMA DEFINITION    │         │  MIDDLEWARE HOOKS       │         │  DATABASE         │
│  • Field types        │         │  1. pre('save')         │         │  Collections:     │
│  • Validations        ├────────►│  2. pre('find')         ├────────►│  • tours          │
│  • Default values     │         │  3. post('find')        │         │  • users          │
│  • Virtual props      │         │  4. pre('aggregate')    │         │  • reviews        │
│  • Indexing           │         │                         │         │                   │
└───────────────────────┘         └─────────────────────────┘         └───────────────────┘
                                              ▲
                                              │
                                              │
                                              │
┌───────────────────────┐                     │
│                       │                     │
│  CONTROLLERS          │                     │
│  Model.create()       ├─────────────────────┘
│  Model.find()         │
│  Model.findById()     │
│  Model.aggregate()    │
└───────────────────────┘
```

| Concept | Description | Code Example |
|---------|-------------|--------------|
| **Schemas & Models** | Structure data and validate input | `const tourSchema = new mongoose.Schema({ name: { type: String, required: true } })` |
| **Query Middleware** | Hooks that run before/after queries | `tourSchema.pre(/^find/, function(next) { this.find({ secretTour: { $ne: true } }); next(); })` |
| **Document Middleware** | Hooks for document operations | `tourSchema.pre('save', function(next) { this.slug = slugify(this.name); next(); })` |
| **Virtuals** | Computed fields not stored in DB | `tourSchema.virtual('durationInWeeks').get(function() { return this.duration / 7; })` |
| **Indexes** | Optimize queries | `tourSchema.index({ price: 1, ratingsAverage: -1 })` |
| **Virtual Populate** | Reference data without storing IDs | `tourSchema.virtual('reviews', { ref: 'Review', foreignField: 'tour', localField: '_id' })` |

## Geospatial Features

```
                           ┌─────────────────────────────────────┐
                           │                                     │
                           │  GEOSPATIAL OPERATIONS              │
                           │                                     │
                           └──────────────────┬──────────────────┘
                                             │
                 ┌────────────────────────────┴───────────────────────┐
                 │                                                    │
                 ▼                                                    ▼
┌──────────────────────────────┐                       ┌──────────────────────────────┐
│                              │                       │                              │
│  FIND TOURS WITHIN RADIUS    │                       │  CALCULATE DISTANCES         │
│                              │                       │                              │
│  Tours.find({                │                       │  Tours.aggregate([           │
│    startLocation: {          │                       │    { $geoNear: {             │
│      $geoWithin: {           │                       │      near: {                 │
│        $centerSphere: [      │                       │        type: 'Point',        │
│          [lng, lat],         │                       │        coordinates: [lng,lat]│
│          radius              │                       │      },                      │
│        ]                     │                       │      distanceField:'distance'│
│      }                       │                       │    }}                        │
│    }                         │                       │  ])                          │
│  })                          │                       │                              │
└──────────────────────────────┘                       └──────────────────────────────┘
```

| Concept | Description | Code Example |
|---------|-------------|--------------|
| **GeoJSON** | Format for geographic data | `{ type: 'Point', coordinates: [lng, lat] }` |
| **Geospatial Index** | Optimize location-based queries | `tourSchema.index({ startLocation: '2dsphere' })` |
| **Proximity Search** | Find docs near a point | `Tours.find({ startLocation: { $geoWithin: { $centerSphere: [[lng, lat], radius] } } })` |
| **Distance Calculation** | Calculate distances between points | `$geoNear: { near: { type: 'Point', coordinates: [lng, lat] }, distanceField: 'distance' }` |

## Express Middleware & Error Handling

```
                  REQUEST
                     │
                     ▼
┌────────────────────────────────────────┐
│                                        │
│  GLOBAL MIDDLEWARE STACK               │
│  1. helmet() - Security headers        │
│  2. morgan() - Logging                 │
│  3. rateLimit() - Request limiting     │
│  4. express.json() - Body parsing      │
│  5. mongoSanitize() - NoSQL injection  │
│  6. xss() - Cross-site scripting       │
│  7. hpp() - Parameter pollution        │
│                                        │
└─────────────────────┬──────────────────┘
                      │
                      ▼
┌────────────────────────────────────────┐
│                                        │
│  ROUTE HANDLERS (CONTROLLERS)          │
│  • Protected by catchAsync wrapper     │
│  • Can throw errors or call next(err)  │
│                                        │
└─────────────────────┬──────────────────┘
                      │
                      ▼
                 Error? ────┐
                   │        │
                   No       Yes
                   │        │
                   ▼        ▼
               RESPONSE   ERROR HANDLER
                          • Development vs Production
                          • Operational vs Programming
                          • Formatted JSON response
```

| Concept | Description | Code Example |
|---------|-------------|--------------|
| **Security Middleware** | Protect against common attacks | `app.use(helmet())`, `app.use(xss())`, `app.use(mongoSanitize())` |
| **Rate Limiting** | Prevent brute force attacks | `app.use('/api', rateLimit({ max: 100, windowMs: 60*60*1000 }))` |
| **Error Classes** | Custom error handling | `class AppError extends Error { constructor(message, statusCode) {...} }` |
| **Async Error Wrapper** | Avoid try/catch blocks | `const catchAsync = fn => (req, res, next) => fn(req, res, next).catch(next)` |
| **Global Error Handler** | Centralize error processing | `app.use((err, req, res, next) => {...})` |

## API Features

```
┌───────────────────────┐           ┌───────────────────────┐
│  REQUEST              │           │  API FEATURES CLASS   │
│                       │           │                       │
│  GET /tours?          │           │  constructor(query,   │
│  duration[gte]=5&     │──────────►│    queryString)       │
│  sort=price,-ratings& │           │                       │
│  page=2&limit=10&     │           │  • filter()           │
│  fields=name,price    │           │  • sort()             │
│                       │           │  • limitFields()      │
│                       │           │  • paginate()         │
└───────────────────────┘           └──────────┬────────────┘
                                               │
                                               ▼
┌───────────────────────┐           ┌───────────────────────┐
│  RESPONSE             │           │  MONGOOSE QUERY       │
│  {                    │           │                       │
│    status: "success", │◄──────────┤  • find()             │
│    results: 10,       │           │  • select()           │
│    data: {            │           │  • skip()             │
│      tours: [...]     │           │  • limit()            │
│    }                  │           │  • await              │
│  }                    │           │                       │
└───────────────────────┘           └───────────────────────┘
```

| Concept | Description | Code Example |
|---------|-------------|--------------|
| **Advanced Filtering** | Parse query strings into MongoDB queries | `{ difficulty: 'easy', duration: { $gte: 5 } }` |
| **Sorting** | Order results by field(s) | `query.sort('price ratingsAverage')` |
| **Field Limiting** | Select specific fields | `query.select('name duration price')` |
| **Pagination** | Control result chunks | `query.skip(pageSize * (page - 1)).limit(pageSize)` |
| **Aliases** | Predefined popular queries | `exports.aliasTopTours = (req, res, next) => { req.query.limit = '5'; req.query.sort = '-ratingsAverage,price'; next(); }` |

## Factory Pattern

| Concept | Description | Code Example |
|---------|-------------|--------------|
| **CRUD Factory** | Reusable controller functions | `exports.createOne = Model => catchAsync(async (req, res, next) => {...})` |
| **Controller Factories** | DRY principle applied | `exports.createTour = createOne(Tour)` |

## Aggregation Pipeline

| Concept | Description | Code Example |
|---------|-------------|--------------|
| **$match** | Filter documents | `{ $match: { ratingsAverage: { $gte: 4.5 } } }` |
| **$group** | Group and calculate | `{ $group: { _id: '$difficulty', avgPrice: { $avg: '$price' } } }` |
| **$unwind** | Deconstruct arrays | `{ $unwind: '$startDates' }` |
| **$sort** | Order results | `{ $sort: { price: 1 } }` |
| **$geoNear** | Location-based aggregation | `{ $geoNear: { near: {/*...*/}, distanceField: 'distance' } }` |
