# SHUKUMA FITNESS APP DOCUMENTATION

## Overview

**Shukuma** is a comprehensive full-stack fitness and wellness application that helps users track workouts, participate in challenges, monitor nutrition, journal their journey, and connect with a community of fitness enthusiasts.

### Tech Stack
- **Frontend**: React 19, React Router, Redux Toolkit, CSS3
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **State Management**: Redux with middleware
- **UI/UX**: Custom component library with coastal theme


## Core Features

### 1. Authentication System 
- **Signup/Login**: Secure user registration and authentication
- **Password Validation**: 
  - Minimum 8 characters
  - Must contain uppercase, lowercase, and numbers
  - Real-time password strength indicator
- **JWT Token Management**: Automatic token refresh and validation
- **Protected Routes**: Route guards for authenticated access
- **Session Persistence**: Auto-login on page refresh



### 2. Dashboard 
- **Personal Stats Display**:
  - Total workouts completed
  - Current streak (consecutive days)
  - Tasks completed/total
  - Weekly workout count
- **Today's Tasks**: Quick view of pending tasks
- **Quick Actions**: One-click navigation to key features
- **Responsive Cards**: Hover effects and gradient accents


### 3. Workouts Module

#### A. Card Deck Feature (Unique!)
- **Interactive Card Shuffler**: Gamified workout selection
- **3D Flip Animation**: Cards flip to reveal exercise details
- **Card Stack Visual**: Shows remaining exercises
- **Auto-Reset**: Deck resets when all cards are drawn
- **Progress Tracking**: Marks exercises as completed


#### B. Exercise Grid View
- **Filtering System**:
  - By category (Cardio, Strength, HIIT, etc.)
  - By difficulty (Beginner, Intermediate, Advanced)
- **Exercise Details**:
  - Name, description
  - Duration, calories burned
  - Muscle groups targeted
  - Animated GIF demonstrations
- **Start Workout**: One-click workout logging


### 4. Challenges
- **Challenge Types**:
  - Daily, weekly, monthly
  - Streak-based
  - Time-based
  - Group challenges
- **Features**:
  - Join/leave challenges
  - Progress tracking with visual bars
  - Leaderboard system
  - Difficulty levels (Easy, Medium, Hard)
  - Reward badges
- **Statistics**:
  - Active challenges count
  - User participation count
  - Completed challenges
  - Upcoming challenges


### 5. Journal
- **Mood Tracking**: 5 mood levels (Great, Good, Okay, Bad, Terrible)
- **Entry Features**:
  - Optional title
  - Rich text content (5000 char limit)
  - Mood emoji selection
  - Timestamp tracking
- **Statistics**:
  - Total entries
  - Entries this week/month
  - Most common mood
- **CRUD Operations**: Create, edit, delete entries


### 6. Tasks
- **Task Management**:
  - Create tasks quickly
  - Toggle completion status
  - Delete individual or bulk tasks
- **Filtering**: All, Pending, Completed
- **Bulk Actions**:
  - Complete all tasks
  - Delete all completed
- **Statistics**:
  - Total tasks
  - Completion rate percentage
  - Pending vs completed counts


### 7. Nutrition Tracking
- **Meal Logging**:
  - Multiple meals per day
  - Calorie tracking per meal
  - Meal timing (Breakfast, Lunch, Dinner)
  - Notes field for additional info
- **Meal Ideas**: Pre-defined meal guides
- **Statistics**:
  - Total logs
  - Weekly calorie intake
  - Average calories per day
- **Visual Displays**: Calorie totals per day with badges


### 8. Progress Analytics
- **Key Metrics**:
  - Total workouts
  - Current streak
  - Total hours exercised
  - Weekly activity
- **Visual Components**:
  - **Workout Calendar**: Heatmap-style calendar showing workout days
  - **Frequency Chart**: Bar chart of last 30 days activity
  - **Recent Workouts**: List of latest exercises
- **Achievements**: Badge display system


### 9. Social Features
- **Friend System**:
  - Search users by name/username
  - Send/receive friend requests
  - Accept/reject requests
  - Remove friends
- **Activity Feed**: See friends' workout completions
- **User Profiles**: Avatar with initial, name, username


### 10. Landing Page
- **Hero Section**: 
  - Gradient background with radial overlays
  - Animated floating stat cards
  - CTA buttons
- **Features Section**: 6 feature cards with icons
- **Testimonials**: User reviews with ratings
- **Final CTA**: Conversion-focused signup prompt


## Design System

### Color Palette (Coastal Energy Theme)
```css
--stormy-teal: #16697a      (Primary)
--pacific-blue: #489fb5     (Primary Light)
--sky-blue: #82c0cc         (Secondary)
--alabaster-grey: #ede7e3   (Tertiary)
--amber-glow: #ffa62b       (Accent)
```

### Typography
- **Font Family**: Inter, Roboto, System fonts
- **Weights**: 300 (Light), 400 (Regular), 500 (Medium), 600 (Semibold), 700 (Bold), 800 (Extrabold), 900 (Black)
- **Hierarchy**:
  - Page titles: 40-48px, 800 weight
  - Section titles: 24-32px, 700 weight
  - Body: 15-17px, 400 weight

### Component Library

#### Button (`Button.jsx`)
- **Variants**: Primary (teal gradient), Secondary (amber gradient), Ghost (outlined)
- **Sizes**: Small, Medium, Large
- **States**: Default, Hover, Loading, Disabled
- **Features**: Ripple effect on hover, spinner for loading state

#### Card (`Card.jsx`)
- **Variants**: Default, Elevated, Outlined, Teal-accent, Amber-accent
- **Sections**: Header, Body, Footer
- **Hover Effects**: Lift animation, shadow enhancement

#### Input (`Input.jsx`)
- **Features**: Label, error messages, helper text, required indicator
- **States**: Default, Focus, Error, Disabled
- **Validation**: Real-time error display

#### Spinner (`Spinner.jsx`)
- **Sizes**: Small (16px), Medium (32px), Large (48px)
- **Colors**: Primary, Secondary, White
- **Full Screen Mode**: Overlay with backdrop

#### Toast (`Toast.jsx`, `ToastProvider.jsx`)
- **Types**: Success, Error, Warning, Info
- **Features**: Auto-dismiss, manual close, slide-in animation
- **Position**: Top-right corner (responsive)


## API Endpoints

### Authentication
- `POST /api/auth/signup` - Create account
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `POST /api/auth/logout` - Logout

### Exercises
- `GET /api/exercises` - Get all exercises (with pagination & filters)
- `GET /api/exercises/random` - Get random exercise
- `GET /api/exercises/:id` - Get exercise by ID
- `GET /api/exercises/search?q=` - Search exercises

### Workouts
- `POST /api/workouts/log` - Log a workout
- `GET /api/workouts/history` - Get workout history
- `GET /api/workouts/stats` - Get workout statistics
- `GET /api/workouts/calendar` - Get calendar data

### Tasks
- `GET /api/tasks` - Get all tasks
- `POST /api/tasks` - Create task
- `PATCH /api/tasks/:id/toggle` - Toggle completion
- `DELETE /api/tasks/:id` - Delete task
- `DELETE /api/tasks/completed/all` - Delete all completed

### Challenges
- `GET /api/challenges` - Get all challenges
- `GET /api/challenges/active` - Get active challenges
- `POST /api/challenges/:id/join` - Join challenge
- `POST /api/challenges/:id/leave` - Leave challenge
- `PUT /api/challenges/:id/progress` - Update progress

### Journal
- `GET /api/journals` - Get all entries
- `POST /api/journals` - Create entry
- `PUT /api/journals/:id` - Update entry
- `DELETE /api/journals/:id` - Delete entry
- `GET /api/journals/stats` - Get journal stats

### Nutrition
- `GET /api/nutrition/logs` - Get food logs
- `POST /api/nutrition/logs` - Create food log
- `DELETE /api/nutrition/logs/:id` - Delete log
- `GET /api/nutrition/stats` - Get nutrition stats

### Social
- `GET /api/social/friends` - Get friends list
- `GET /api/social/friend-requests` - Get friend requests
- `POST /api/social/friend-request/:id` - Send friend request
- `POST /api/social/accept-friend/:id` - Accept request
- `GET /api/social/feed` - Get activity feed

---

## Future Scaling Recommendations

### 1. Performance Optimization
- **Code Splitting**: Implement React.lazy() for route-based code splitting
- **Image Optimization**: 
  - Use WebP format with fallbacks
  - Implement lazy loading for exercise images
  - Add CDN for static assets
- **API Caching**: 
  - Implement React Query or SWR for data fetching
  - Add service worker for offline support
- **Bundle Optimization**: 
  - Tree shaking unused code
  - Minimize CSS with PurgeCSS

### 2. Feature Enhancements

#### Workout Card Deck
- **Custom Decks**: Let users create custom workout decks
- **Timed Workouts**: Add countdown timers for each exercise
- **Video Integration**: Embed exercise demonstration videos
- **Workout Programs**: Pre-built 30/60/90 day programs
- **Difficulty Scaling**: Auto-adjust based on user progress

#### Social Features
- **Live Workouts**: Real-time workout sessions with friends
- **Group Challenges**: Team-based competitions
- **Direct Messaging**: In-app chat system
- **Content Sharing**: Share workout results to social media
- **Follow System**: Follow users without friend request

#### Analytics & Insights
- **AI Recommendations**: ML-based workout suggestions
- **Progress Predictions**: Forecast goal achievement
- **Comparative Analytics**: Compare with similar users
- **Body Metrics Tracking**: Weight, body fat %, measurements
- **Photo Progress**: Before/after photo comparisons

#### Gamification
- **XP System**: Earn experience points for workouts
- **Leveling**: User levels (Bronze, Silver, Gold, Platinum)
- **Badges & Achievements**: 50+ unlockable achievements
- **Leaderboards**: Global and friend leaderboards
- **Streak Rewards**: Special rewards for long streaks

### 3. Technical Infrastructure

#### Database
- **Sharding**: Partition data by user region
- **Indexing**: Optimize queries with compound indexes
- **Caching Layer**: Redis for frequently accessed data
- **Backup Strategy**: Automated daily backups with point-in-time recovery

#### Backend Architecture
- **Microservices**: Split into services (auth, workouts, social, etc.)
- **Message Queue**: Bull or RabbitMQ for async tasks
- **WebSockets**: Real-time updates for social features
- **Rate Limiting**: API rate limiting per user tier

#### Security
- **Two-Factor Authentication**: SMS or authenticator app 2FA
- **OAuth Integration**: Google, Facebook, Apple sign-in
- **Data Encryption**: Encrypt sensitive data at rest
- **GDPR Compliance**: Data export/deletion features
- **Session Management**: Multiple device support with session tracking

### 4. Mobile Strategy
- **React Native App**: Native iOS and Android apps
- **Progressive Web App**: Install as app on mobile devices
- **Push Notifications**: Workout reminders and friend activity
- **Offline Mode**: Download workouts for offline use
- **Wearable Integration**: Apple Watch, Fitbit sync

### 5. Monetization

#### Freemium Model
- **Free Tier**:
  - Basic workout deck
  - 3 challenges at a time
  - Limited journal entries
  
- **Premium Tier (R9.99/month)**:
  - Unlimited custom decks
  - All challenges
  - Advanced analytics
  - Priority support
  - Ad-free experience

#### Additional Revenue
- **In-App Purchases**: Custom workout programs ($4.99-$19.99)
- **Affiliate Links**: Fitness equipment, supplements
- **Corporate Wellness**: B2B enterprise plans
- **Personal Training**: Connect with certified trainers

### 6. DevOps & Deployment
- **CI/CD Pipeline**: GitHub Actions or GitLab CI
- **Containerization**: Docker for consistent environments
- **Orchestration**: Kubernetes for scaling
- **Monitoring**: 
  - Sentry for error tracking
  - Google Analytics for user behavior
  - Datadog for infrastructure monitoring
- **Load Balancing**: NGINX or AWS ELB
- **Auto-Scaling**: Dynamic scaling based on traffic

### 7. Testing Strategy
- **Unit Tests**: Jest + React Testing Library (80% coverage)
- **Integration Tests**: Cypress for E2E testing
- **Performance Testing**: Lighthouse CI in pipeline
- **Load Testing**: JMeter or Artillery for stress tests
- **A/B Testing**: Optimizely or Google Optimize

### 8. Accessibility (A11y)
- **WCAG 2.1 AA Compliance**: 
  - Keyboard navigation for all features
  - Screen reader support
  - Color contrast ratios
  - Focus indicators
- **i18n**: Multi-language support (English, Spanish, French, etc.)
- **Voice Control**: Voice commands for workouts

### 9. Content Management
- **Admin Dashboard**: 
  - Manage exercises, challenges
  - User moderation tools
  - Analytics dashboard
- **Content Pipeline**: 
  - Automated exercise import
  - AI-generated workout descriptions
  - Community-submitted exercises (moderated)

### 10. Legal & Compliance
- **Terms of Service**: Comprehensive legal agreements
- **Privacy Policy**: GDPR, CCPA compliant
- **Health Disclaimers**: Medical clearance notices
- **Content Licensing**: Proper attribution for exercise content
- **Insurance**: Liability insurance for fitness app

---

## Quick Start Guide

### Prerequisites
- Node.js 22+ and npm
- MongoDB
- Git

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/Fortune101-ai/shukuma-exercise-app
cd shukuma-exercise-app
```

2. **Install dependencies**
```bash
# Backend
cd backend
npm install

# Frontend
cd ../frontend
npm install
```

3. **Environment Setup**

Create `.env` file in backend:
```env
MONGODB_URI=mongodb://localhost:27017/shukuma
JWT_SECRET=your_jwt_secret_key_here
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:5173
BCRYPT_ROUNDS=10
```

4. **Start the application**
```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```
5. **Access the app**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000

---
