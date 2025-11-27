# Shukuma Backend API

Node.js/Express REST API for the Shukuma fitness and wellness application.

## Features

- JWT-based authentication
- User profile management
- Workout tracking and exercise library
- Fitness journal with mood tracking
- Community challenges
- Nutrition logging
- Social features (friends, activity feed)
- Task management

## Tech Stack

- **Runtime:** Node.js 22+
- **Framework:** Express.js
- **Database:** MongoDB with Mongoose ODM
- **Authentication:** JWT (JSON Web Tokens)
- **Security:** Helmet, CORS, Rate Limiting
- **Validation:** Express Validator

## Prerequisites

- Node.js 22 or higher
- npm

## Installation

1. Clone the repository:
```bash
git clone https://github.com/Fortune101-ai/shukuma-exercise-app.git
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create environment file:
```bash
cp .env.example .env
```

4. Update `.env` with your configuration:
```env
MONGODB_URI=mongodb://localhost:27017/shukuma
JWT_SECRET=your-secret-key
PORT=5000
```

5. Start the server:
```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will be running at `http://localhost:5000`

## API Endpoints

### Authentication
- `POST /api/auth/signup` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token (protected)

### Users
- `GET /api/users/profile` - Get user profile (protected)
- `PUT /api/users/profile` - Update profile (protected)
- `GET /api/users/stats` - Get user statistics (protected)
- `GET /api/users/progress` - Get progress data (protected)

### Exercises
- `GET /api/exercises` - Get all exercises (with filters)
- `GET /api/exercises/random` - Get random exercise
- `GET /api/exercises/:id` - Get exercise by ID

### Workouts
- `POST /api/workouts/log` - Log workout completion (protected)
- `GET /api/workouts/history` - Get workout history (protected)
- `GET /api/workouts/stats` - Get workout statistics (protected)

### Tasks
- `GET /api/tasks` - Get all tasks (protected)
- `POST /api/tasks` - Create task (protected)
- `PUT /api/tasks/:taskId` - Update task (protected)
- `DELETE /api/tasks/:taskId` - Delete task (protected)

### Journal
- `GET /api/journals` - Get all journal entries (protected)
- `POST /api/journals` - Create journal entry (protected)
- `PUT /api/journals/:entryId` - Update entry (protected)
- `DELETE /api/journals/:entryId` - Delete entry (protected)

### Challenges
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/:id` - Get challenge by ID
- `POST /api/challenges/:id/join` - Join challenge (protected)
- `PUT /api/challenges/:id/progress` - Update progress (protected)

### Nutrition
- `GET /api/nutrition/logs` - Get food logs (protected)
- `POST /api/nutrition/logs` - Log meal (protected)
- `GET /api/nutrition/guides` - Get meal guides

### Social
- `GET /api/social/friends` - Get friends list (protected)
- `POST /api/social/friend-request/:friendId` - Send friend request (protected)
- `POST /api/social/accept-friend/:friendId` - Accept request (protected)
- `GET /api/social/feed` - Get activity feed (protected)

## Scripts
```bash
# Start server
npm start

# Development mode with auto-reload
npm run dev

# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment (development/production) | development |
| `PORT` | Server port | 5000 |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/shukuma |
| `JWT_SECRET` | Secret key for JWT signing | - |
| `JWT_EXPIRES_IN` | JWT token expiration | 7d |
| `FRONTEND_URL` | Frontend URL for CORS | http://localhost:5173 |
| `BCRYPT_ROUNDS` | Bcrypt hashing rounds | 10 |

## Security Features

- Helmet.js for security headers
- CORS configuration
- Rate limiting on all routes
- JWT token authentication
- Password hashing with bcrypt
- Input validation and sanitization
- MongoDB injection prevention

## Error Handling

All endpoints return consistent error responses:
```json
{
  "message": "Error message here",
  "errors": ["Detailed error 1", "Detailed error 2"]
}
```

## Deployment

1. Set `NODE_ENV=production` in environment
2. Use strong `JWT_SECRET`
3. Enable MongoDB authentication
4. Use environment variables for all secrets
5. Enable HTTPS
6. Set up proper logging
7. Configure rate limiting appropriately

