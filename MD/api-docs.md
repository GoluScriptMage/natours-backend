# Natours API Documentation

## Base URL
```
https://api.natours.com/api/v1
```

## Authentication
| Endpoint | Method | Description | Request Body | Response |
|----------|--------|-------------|-------------|----------|
| `/users/signup` | POST | Register new user | `{name, email, password, passwordConfirm}` | JWT token |
| `/users/login` | POST | Login user | `{email, password}` | JWT token |
| `/users/forgotPassword` | POST | Request password reset | `{email}` | Reset token sent to email |
| `/users/resetPassword/:token` | PATCH | Reset password | `{password, passwordConfirm}` | New JWT token |
| `/users/updateMyPassword` | PATCH | Update password | `{passwordCurrent, password, passwordConfirm}` | New JWT token |

**Authentication Header Format:**
```
Authorization: Bearer [token]
```

## Tours
| Endpoint | Method | Description | Query Parameters | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/tours` | GET | Get all tours | `sort, fields, page, limit, ...filters` | No |
| `/tours/:id` | GET | Get specific tour | - | No |
| `/tours` | POST | Create tour | Tour object | Yes (admin, lead-guide) |
| `/tours/:id` | PATCH | Update tour | Updated fields | Yes (admin, lead-guide) |
| `/tours/:id` | DELETE | Delete tour | - | Yes (admin, lead-guide) |
| `/tours/top-5-cheap` | GET | Top 5 cheap tours | - | No |
| `/tours/tours-within/:distance/center/:latlng/unit/:unit` | GET | Find tours within radius | - | No |
| `/tours/distances/:latlng/unit/:unit` | GET | Get distances to all tours | - | No |
| `/tours/monthly-plan/:year` | GET | Get tour stats by month | - | Yes (admin, lead-guide, guide) |
| `/tours/tour-stats` | GET | Get tour statistics | - | No |

## Users
| Endpoint | Method | Description | Query Parameters | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/users/me` | GET | Get current user | - | Yes |
| `/users` | GET | Get all users | `sort, fields, page, limit` | Yes (admin) |
| `/users/:id` | GET | Get specific user | - | Yes (admin) |
| `/users/updateMe` | PATCH | Update current user | Updated fields | Yes |
| `/users/deleteMe` | DELETE | Deactivate account | - | Yes |
| `/users/:id` | DELETE | Delete user | - | Yes (admin) |

## Reviews
| Endpoint | Method | Description | Query Parameters | Auth Required |
|----------|--------|-------------|-----------------|---------------|
| `/reviews` | GET | Get all reviews | `sort, fields, page, limit` | No |
| `/reviews/:id` | GET | Get specific review | - | No |
| `/reviews` | POST | Create review | Review object | Yes (user) |
| `/reviews/:id` | PATCH | Update review | Updated fields | Yes (user, admin) |
| `/reviews/:id` | DELETE | Delete review | - | Yes (user, admin) |
| `/tours/:tourId/reviews` | GET | Get reviews for tour | `sort, fields, page, limit` | No |
| `/tours/:tourId/reviews` | POST | Create review for tour | Review object | Yes (user) |

## Query Parameters

| Parameter | Format | Example | Description |
|-----------|--------|---------|-------------|
| `fields` | Comma-separated | `fields=name,price,duration` | Select specific fields |
| `sort` | Comma-separated | `sort=-price,ratingsAverage` | Sort results (prefix with - for descending) |
| `page` | Number | `page=2` | Page number for pagination |
| `limit` | Number | `limit=10` | Results per page |
| `[field]` | Value | `difficulty=easy` | Filter by exact match |
| `[field][operator]` | Value | `duration[gte]=5` | Filter with operators |

**Available operators:** `[gt]`, `[gte]`, `[lt]`, `[lte]`, `[ne]`

## Response Format

**Success Response:**
```json
{
  "status": "success",
  "results": 10,
  "data": {
    "tours": [...]  // or users, reviews, etc.
  }
}
```

**Error Response:**
```json
{
  "status": "fail",
  "message": "Error message"
}
```

## Rate Limiting
- 100 requests per hour
- Provides `X-RateLimit-Limit` and `X-RateLimit-Remaining` headers

## Sample Requests

**Get top 5 tours:**
```
GET /api/v1/tours/top-5-cheap
```

**Find tours near NYC (10 miles):**
```
GET /api/v1/tours/tours-within/10/center/40.7614,-73.9776/unit/mi
```

**Filter, sort and paginate tours:**
```
GET /api/v1/tours?duration[gte]=5&difficulty=easy&sort=-price,ratingsAverage&fields=name,price,duration&page=2&limit=10
```
