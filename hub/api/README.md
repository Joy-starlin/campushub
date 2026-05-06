# Bugema Hub Public REST API

A comprehensive REST API for accessing Bugema Hub data, including events, clubs, universities, jobs, posts, and more.

## 🚀 Quick Start

### Prerequisites
- Node.js 16.0 or higher
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/bugema-hub/api.git
cd api
```

2. Install dependencies
```bash
npm install
```

3. Set up environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start the server
```bash
npm run dev
```

The API will be available at `http://localhost:3001`

## 🔑 Authentication

### Getting an API Key

Register for an API key by sending a POST request to:

```bash
POST /api/v1/developers/register
Content-Type: application/json

{
  "name": "Your Name",
  "organisation": "Your Organisation",
  "use_case": "Describe how you'll use the API"
}
```

You'll receive an API key in the response.

### Using the API Key

Include your API key in the `X-API-Key` header for protected endpoints:

```bash
GET /api/v1/members/count
X-API-Key: your-api-key-here
```

## 📚 API Endpoints

### Base URL
```
https://api.bugema.ac.ug/v1
```

### Public Endpoints (No Authentication Required)

#### Events
```bash
GET /api/v1/events                    # Get all events
GET /api/v1/events/:id               # Get event by ID
```

**Query Parameters:**
- `university` (string): Filter by university slug
- `limit` (number): Limit number of results (default: 10)
- `page` (number): Page number for pagination (default: 1)

**Example:**
```bash
GET /api/v1/events?university=bugema&limit=5&page=1
```

#### Clubs
```bash
GET /api/v1/clubs                     # Get all clubs
```

**Query Parameters:**
- `category` (string): Filter by category
- `limit` (number): Limit number of results (default: 10)

#### Universities
```bash
GET /api/v1/universities             # Get all universities
GET /api/v1/universities/:slug       # Get university by slug
```

#### Jobs
```bash
GET /api/v1/jobs                      # Get all jobs
```

**Query Parameters:**
- `type` (string): Filter by job type (internship, full-time, part-time)
- `country` (string): Filter by country code
- `limit` (number): Limit number of results

#### Posts
```bash
GET /api/v1/posts                     # Get all posts
```

**Query Parameters:**
- `category` (string): Filter by category
- `limit` (number): Limit number of results (default: 20)
- `page` (number): Page number for pagination (default: 1)

### Protected Endpoints (API Key Required)

#### Member Statistics
```bash
GET /api/v1/members/count            # Get member count statistics
```

#### Leaderboard
```bash
GET /api/v1/leaderboard              # Get leaderboard data
```

**Query Parameters:**
- `period` (string): Filter by period (monthly, weekly, all-time)

## 📝 Response Format

All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": [...],
  "meta": {
    "total": 150,
    "page": 1,
    "limit": 10,
    "university": "bugema"
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit: 100/hour.",
    "retry_after": 3600
  }
}
```

## 🚦 Rate Limiting

### Public Endpoints
- **Limit**: 100 requests per 15 minutes per IP
- **Headers**: `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`

### Protected Endpoints (API Key)
- **Limit**: 100 requests per hour per API key
- **Headers**: Same as public endpoints

When rate limits are exceeded, the API returns:
```json
{
  "success": false,
  "error": {
    "code": "RATE_LIMIT_EXCEEDED",
    "message": "Too many requests. Limit: 100/hour.",
    "retry_after": 3600
  }
}
```

## 💻 Code Examples

### JavaScript (Fetch API)
```javascript
const apiKey = 'your-api-key-here';

// Get events
fetch('/api/v1/events?university=bugema&limit=5', {
  headers: {
    'X-API-Key': apiKey
  }
})
.then(response => response.json())
.then(data => console.log(data))
.catch(error => console.error('Error:', error));
```

### Python (Requests)
```python
import requests

api_key = 'your-api-key-here'
headers = {'X-API-Key': api_key}

response = requests.get('/api/v1/events?university=bugema&limit=5', headers=headers)
data = response.json()
print(data)
```

### PHP (cURL)
```php
<?php
$apiKey = 'your-api-key-here';

$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, '/api/v1/events?university=bugema&limit=5');
curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
curl_setopt($ch, CURLOPT_HTTPHEADER, [
    'X-API-Key: ' . $apiKey
]);

$response = curl_exec($ch);
$data = json_decode($response, true);
print_r($data);
curl_close($ch);
?>
```

## 🛠️ Development

### Running Tests
```bash
npm test
```

### Linting
```bash
npm run lint
```

### Environment Variables
Create a `.env` file with the following variables:

```env
# Server Configuration
API_PORT=3001
NODE_ENV=development

# Security
JWT_SECRET=your-super-secret-jwt-key
ALLOWED_ORIGINS=http://localhost:3000,https://bugema.ac.ug

# Rate Limiting
PUBLIC_RATE_LIMIT_WINDOW_MS=900000
PUBLIC_RATE_LIMIT_MAX=100
API_KEY_RATE_LIMIT_WINDOW_MS=3600000
API_KEY_RATE_LIMIT_MAX=100
```

## 📊 Data Models

### Event
```json
{
  "id": "1",
  "title": "Career Fair 2024",
  "description": "Annual career fair with top companies",
  "date": "2024-05-15",
  "time": "10:00",
  "location": "Main Campus",
  "university": "bugema",
  "category": "career",
  "attendees": 250,
  "image": "https://example.com/career-fair.jpg"
}
```

### Club
```json
{
  "id": "1",
  "name": "Computer Science Club",
  "description": "For students interested in technology",
  "category": "academic",
  "members": 45,
  "university": "bugema",
  "founded": "2020",
  "logo": "https://example.com/cs-club.jpg"
}
```

### University
```json
{
  "id": "1",
  "name": "Bugema University",
  "slug": "bugema",
  "description": "A leading university in Uganda",
  "location": "Kampala, Uganda",
  "founded": "1997",
  "students": 5000,
  "website": "https://bugema.ac.ug",
  "logo": "https://example.com/bugema-logo.jpg",
  "type": "university"
}
```

## 🔧 API Documentation

Visit `/api/v1/docs` for interactive API documentation and testing.

## 🆘 Error Codes

| Code | Description |
|------|-------------|
| `INVALID_API_KEY` | Invalid or inactive API key |
| `MISSING_API_KEY` | API key required for this endpoint |
| `RATE_LIMIT_EXCEEDED` | Rate limit exceeded |
| `NOT_FOUND` | Resource not found |
| `MISSING_FIELDS` | Required fields missing |
| `INTERNAL_ERROR` | Internal server error |
| `VALIDATION_ERROR` | Validation error |

## 🔒 Security

- All requests are secured with Helmet.js
- CORS is configured for allowed origins
- Rate limiting prevents abuse
- API keys are validated for protected endpoints
- Input validation on all endpoints

## 📈 Monitoring

The API includes comprehensive logging and monitoring:

- Request/response logging
- Rate limit tracking
- Error tracking
- Performance metrics

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 📞 Support

- Email: api@bugema.ac.ug
- Phone: +256 123 456 789
- GitHub: https://github.com/bugema-hub/api

## 📋 Changelog

### v1.0.0 (2024-04-25)
- Initial release
- Public endpoints for events, clubs, universities, jobs, posts
- Protected endpoints for member statistics and leaderboard
- API key authentication system
- Rate limiting
- Comprehensive documentation

---

**Bugema Hub API** - Empowering developers with access to university data 🚀
