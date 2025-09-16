---

# Natours Backend

A secure, scalable Node.js backend for tour booking and management APIs with advanced geospatial features.

## Features

- JWT-based authentication & role-based authorization
- Secure password hashing with bcrypt
- Rate limiting, HTTP headers security, and sanitization (NoSQL injection/XSS)
- RESTful API for tours, users, and reviews with advanced filtering
- MongoDB aggregation pipelines for statistics and data analysis
- Geospatial queries for tours - find tours within distances and calculate distances
- Virtual populate for efficient data referencing
- Mongoose middleware for document/query pre and post processing
- Centralized error handling with custom error classes
- Modular architecture with Express routers and middleware

## Technologies

- Node.js, Express.js
- MongoDB & Mongoose (with geospatial features)
- JWT, bcrypt
- Helmet, express-rate-limit, xss-clean, express-mongo-sanitize
- Advanced MongoDB features: indexes, aggregation framework, geospatial operators
- Nodemailer (email utilities)

## Project Structure

```
natours-backend/
│
├── controllers/         # Route controllers for tours, users, auth, errors
├── models/              # Mongoose models (User, Tour, etc.)
├── routes/              # Express route modules
├── utils/               # Utility functions (error, email, etc.)
├── public/              # Static assets (CSS, HTML)
├── app.js               # Express app setup and middleware
├── server.js            # App entry point
└── README.md
```

## API Features

- **Advanced Filtering**: Filter tours by price, ratings, difficulty, etc.
- **Sorting**: Sort tours by any field in ascending or descending order
- **Field Limiting**: Choose which fields to include in the response
- **Pagination**: Control data chunks with page and limit parameters
- **Geospatial Queries**: Find tours within specific distances and locations
- **Aggregation Pipeline**: Get statistics about tours grouped by difficulty

## Data Modeling

- **Referencing (Normalization)**: Used for user-guide relationships
- **Child Referencing**: Used for reviews linked to tours
- **Virtual Populate**: Efficiently connects models without storing redundant data
- **Embedding**: Used for locations data within tours
- **Geospatial Indexing**: For efficient proximity searches

## Getting Started

1. Clone the repo:
   ```
   git clone https://github.com/GoluScriptMage/natours-backend.git
   ```
2. Install dependencies:
   ```
   npm install
   ```
3. Set environment variables in `config.env`:
   ```
   NODE_ENV=development
   PORT=3000
   DATABASE_CONNECTION=<your-mongodb-connection-string>
   DATABASE_PASSWORD=<your-password>
   JWT_SECRET=<your-secret-key>
   JWT_EXPIRES_IN=90d
   ```
4. Start the server:
   ```
   npm start
   ```
5. For development with debugging:
   ```
   npm run debug
   ```

## API Endpoints

### Tours
- `GET /api/v1/tours` - Get all tours
- `GET /api/v1/tours/:id` - Get specific tour
- `POST /api/v1/tours` - Create new tour
- `PATCH /api/v1/tours/:id` - Update tour
- `DELETE /api/v1/tours/:id` - Delete tour
- `GET /api/v1/tours/top-5-cheap` - Alias for top 5 affordable tours
- `GET /api/v1/tours/tour-stats` - Get tour statistics
- `GET /api/v1/tours/monthly-plan/:year` - Get monthly tour plan
- `GET /api/v1/tours/tours-within/:distance/center/:latlng/unit/:unit` - Get tours within distance
- `GET /api/v1/tours/distances/:latlng/unit/:unit` - Get distances to all tours

### Users
- `POST /api/v1/users/signup` - User registration
- `POST /api/v1/users/login` - User login
- `GET /api/v1/users/me` - Get current user profile
- `PATCH /api/v1/users/updateMe` - Update user data
- `DELETE /api/v1/users/deleteMe` - Deactivate account

### Reviews
- `GET /api/v1/reviews` - Get all reviews
- `POST /api/v1/tours/:tourId/reviews` - Create review for specific tour
- `GET /api/v1/tours/:tourId/reviews` - Get reviews for specific tour

## Documentation

See the following files for detailed technical documentation:
- `MD/technical-analysis.md` - In-depth code explanations
- `MD/data-modeling-concepts-short.md` - MongoDB data modeling concepts
- `MD/short-tricky.md` - Tricky code patterns explained

## License

MIT

---

The Natours backend project demonstrates advanced Node.js, Express, and MongoDB patterns including:

1. **Security & Authentication Flow**:
   - Request validation → Secure password hashing → JWT generation → Protected route access
   - Advanced role-based authorization with permission checks
   - Stateless authentication with secure HTTP-only cookies

2. **Data Flow Architecture**:
   - API Request → Security Middleware → Route Handlers → Controllers → Models → Database
   - Custom error handling at each layer for graceful failure handling

3. **MongoDB Data Management**:
   - Smart data modeling with references, embedding, and virtual population
   - Efficient geospatial queries using GeoJSON and $geoWithin/$geoNear operators
   - Performance optimization with targeted indexing strategies

4. **API Features**:
   - Factory pattern for CRUD operations with consistent error handling
   - Advanced filtering, sorting, and pagination through reusable API features
   - Aggregation pipelines for complex data analysis and statistics

5. **Code Organization**:
   - Separation of concerns with MVC architecture
   - Middleware for cross-cutting concerns like security and logging
   - Utility modules for error handling, async operations, and email services

## Learning Resources

This project demonstrates numerous advanced Node.js/Express/MongoDB patterns that are valuable for any backend developer to understand. Check out the MD/ directory for detailed explanations of key concepts.

AOP (Aspect-Oriented Programming)-like patterns appear mainly in the use of middleware for cross-cutting concerns (security, logging, error handling).

To update README.md:
- Summarize features: Secure authentication (JWT, bcrypt), robust error handling, security middleware (Helmet, rate limiting, XSS/NoSQL protection), RESTful routing, and role-based authorization.
- Outline the request flow: Incoming request → Middleware (security/logging/body parsing) → Route handlers (auth/tours/users) → Error handling.
- Highlight technical best practices: Use of environment variables, async/await, modular architecture, and extensible error handling.
- Link to technical-analysis.md and short-tricky.md for deeper code insights.

For a full file listing and details, view the repository on GitHub: https://github.com/GoluScriptMage/natours-backend
