# Tricky Parts: Questions & Notes

## Authentication & Security

### Question 1: Why does the protect middleware use `promisify(JWT.verify)` instead of just `JWT.verify`?
**Answer:** The `JWT.verify` function uses callback style, not promises. Using Node's `util.promisify` converts it to return a promise, allowing us to use `async/await` syntax for cleaner code. Without this, we'd need to use callbacks or manually wrap it in a promise.

### Question 2: What's the difference between `next(new AppError())` and throwing an error?
**Answer:** Using `next(new AppError())` passes the error to Express's error handling middleware, which processes it based on the environment. Throwing an error would crash the application unless caught elsewhere. The `catchAsync` wrapper catches thrown errors and passes them to `next()` automatically.

### Question 3: Why check `currentuser.changedPasswordAfter(decoded.iat)` after verifying the JWT?
**Answer:** A valid JWT means authentication was successful at some point, but we need to verify if the password was changed *after* the token was issued. If true, the token is invalid even though its signature is valid, forcing the user to log in again.

## Mongoose & MongoDB

### Question 4: Why use `this.r = await this.clone().findOne()` in the reviewSchema middleware?
**Answer:** The `clone()` method is needed because Mongoose v6+ doesn't allow reusing the same query object twice. Without cloning, we get "Query was already executed" error. We store the document in `this.r` because in post middleware, we can't directly access the document that was modified.

### Question 5: What's the difference between `tourSchema.methods.x` and `tourSchema.statics.x`?
**Answer:** `methods` adds functions to document instances (`tourDoc.x()`), while `statics` adds functions to the model itself (`Tour.x()`). Static methods can operate on the entire collection, while instance methods operate on a specific document.

### Question 6: Why does `$geoNear` need to be the first stage in an aggregation pipeline?
**Answer:** `$geoNear` needs to operate on the collection before any other stages filter or transform documents. It uses the geospatial index directly. Other stages might change the document structure or filter out documents before `$geoNear` can use them.

## Express & Middleware

### Question 7: What's the difference between `app.use(fn)` and `router.use(fn)`?
**Answer:** `app.use(fn)` applies middleware to all routes in the application, while `router.use(fn)` only applies it to routes defined on that router. This allows for more targeted middleware application.

### Question 8: Why use `hpp({ whitelist: ['price'] })` in app.js?
**Answer:** HTTP Parameter Pollution (HPP) normally removes duplicate query parameters. The whitelist tells HPP to allow duplicate values for specific fields (like price), which might be needed for filtering (e.g., `?price=100&price=200` to set a price range).

### Question 9: When does the `restrictTo` middleware need to be used with `protect`?
**Answer:** Always use `protect` before `restrictTo`. The `restrictTo` middleware assumes `req.user` exists (set by `protect`). Without protecting first, `req.user` would be undefined, causing errors when checking roles.

## Geospatial Queries

### Question 10: Why use `[longitude, latitude]` order instead of `[latitude, longitude]`?
**Answer:** MongoDB follows the GeoJSON standard, which specifies coordinates as `[longitude, latitude]`, opposite of how we typically think about coordinates (latitude, longitude). This is a common source of bugs in geospatial queries.

### Question 11: What's the difference between `$geoWithin` and `$geoNear`?
**Answer:** `$geoWithin` just finds documents within a specified shape (circle, polygon) but doesn't calculate distances. `$geoNear` calculates distances from a point to each document and can sort by these distances. `$geoNear` is more computationally expensive.

### Question 12: Why convert distance using a multiplier in `getDistances` instead of after the query?
**Answer:** Converting in the aggregation pipeline is more efficient because MongoDB does the calculation for all documents at once. Converting after would require iterating through the results in JavaScript, which is less efficient for large result sets.

## API Features & Factory Pattern

### Question 13: Why use `const features = new APIFeatures().filter().sort()` chaining instead of separate functions?
**Answer:** Method chaining creates a fluent interface that's easier to read and allows optional steps. Each method returns `this`, enabling chaining. It also keeps query building state encapsulated within the APIFeatures instance.

### Question 14: How does the factory pattern help with code reuse?
**Answer:** Instead of writing similar CRUD functions for each model, the factory pattern creates generic functions that accept any model as input. This significantly reduces code duplication while maintaining flexibility for model-specific customizations.

## Common Gotchas

### Gotcha 1: Forgetting to use `await` with Mongoose queries
Mongoose queries are "thenables" but not true Promises. They only execute when you `await` them, chain `.then()`, or explicitly call `.exec()`. Without these, queries may not run when expected.

### Gotcha 2: Using arrow functions for Mongoose methods/middleware
Arrow functions don't have their own `this` binding, so `this` inside an arrow function middleware won't refer to the document/query. Always use regular functions for Mongoose middleware.

### Gotcha 3: Forgetting to add indexes for commonly queried fields
Without proper indexes, queries slow down dramatically as collections grow. Always add indexes for fields frequently used in filtering, sorting, or joining.

### Gotcha 4: Using `findById` without checking for null results
If no document matches the ID, `findById` returns null (not an error). Always check if the result exists before accessing its properties.

### Gotcha 5: Trying to modify immutable fields
Fields marked as immutable in schemas can only be set during document creation. Attempting to modify them later silently fails without errors.
