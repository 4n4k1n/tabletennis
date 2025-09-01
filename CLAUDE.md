# Table Tennis Championship - Claude.md

This file provides guidance to Claude Code when working with the 42 Heilbronn Table Tennis Championship application.

## Project Overview

A full-stack web application for tracking table soccer and table football matches at 42 Heilbronn, featuring:
- ELO-based ranking system with separate leaderboards
- Match confirmation workflow (submit → confirm → ELO update)
- 42 School OAuth authentication (Heilbronn students only)
- Real-time leaderboards and match history
- Responsive design with modern UI

## Architecture

### Technology Stack
- **Frontend**: Next.js 15, React 19, TypeScript, TailwindCSS, NextAuth.js
- **Backend**: Go 1.23, Gin framework, GORM, SQLite database
- **Infrastructure**: Docker Compose, Nginx reverse proxy, SSL/TLS
- **Authentication**: 42 School OAuth with campus verification

### Project Structure
```
tabletennis/
├── Frontend/              # Next.js application
│   ├── app/              # App router (Next.js 13+)
│   │   ├── api/auth/     # NextAuth.js routes
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/         # Utilities and API client
│   │   └── providers/    # Context providers
├── Backend/              # Go API server
│   ├── models/          # Database models
│   ├── handlers/        # HTTP handlers
│   ├── services/        # Business logic
│   └── database/        # Database setup
├── Nginx/               # Reverse proxy config
└── Docker configs
```

## Common Commands

### Development
```bash
# Start all services
make up

# Build and start fresh
make up-no-cache

# Stop services
make down

# View logs
make logs
make logs-backend    # Backend only
make logs-frontend   # Frontend only

# Clean everything
make clean
```

### Frontend Development
```bash
cd Frontend/
npm install
npm run dev          # Development server (http://localhost:3000)
npm run build        # Production build
npm run lint         # ESLint check
```

### Backend Development
```bash
cd Backend/
go mod download      # Install dependencies
go run main.go       # Development server (http://localhost:8081)
go mod tidy         # Clean up dependencies
```

## Key Implementation Details

### Database Models
- **Player**: User profiles with separate ELO ratings for each sport
- **Match**: Match records with confirmation status and ELO changes
- **SportType**: Enum for 'table_soccer' and 'table_football'
- **MatchStatus**: Enum for 'pending', 'confirmed', 'denied'

### ELO Calculation
- Starting ELO: 1200 points
- K-Factor: 32 (standard rating system)
- Formula: `newRating = oldRating + K * (actualScore - expectedScore)`
- Separate rankings maintained for each sport

### Match Workflow
1. Player A submits match result
2. Player B receives notification/sees in pending matches
3. Player B confirms or denies the match
4. If confirmed: ELO ratings update for both players
5. If denied: Match logged but no ELO impact

### Authentication Flow
1. User clicks login → NextAuth redirects to 42 OAuth
2. 42 returns with access token and user data
3. Backend validates token with 42 API
4. Campus verification (must be Heilbronn)
5. User created/updated in database
6. Session established with access token

### API Endpoints

#### Authentication
- `GET /api/profile` - Get current user profile

#### Matches
- `POST /api/matches/submit` - Submit new match
- `PUT /api/matches/:id/confirm` - Confirm/deny match
- `GET /api/matches/pending` - Get pending matches for user
- `GET /api/matches/history` - Get user's match history

#### Leaderboard
- `GET /api/leaderboard?sport=table_soccer` - Get soccer rankings
- `GET /api/leaderboard?sport=table_football` - Get football rankings

#### Players
- `GET /api/players/search?q=query` - Search players by name/login
- `GET /api/players/:login/stats` - Get detailed player statistics

## Environment Configuration

### Required Environment Variables (docker-compose.yml)
```yaml
# Frontend
AUTH_SECRET=generate_with_openssl_rand_base64_32
AUTH_42_ID=u-s4t2ud-your_42_app_id
AUTH_42_SECRET=s-s4t2ud-your_42_app_secret
NEXTAUTH_URL=https://yourdomain.com
AUTH_TRUST_HOST=true
NEXT_PUBLIC_API_URL=https://yourdomain.com/api

# Backend
GIN_MODE=release  # For production
```

### 42 OAuth Setup
1. Create application at https://profile.intra.42.fr/oauth/applications
2. Set redirect URI: `https://yourdomain.com/api/auth/callback/42-school`
3. Note the application ID and secret for environment variables

## Deployment

### Production Setup
1. **Domain & SSL**: Configure domain and SSL certificates
2. **Environment**: Update docker-compose.yml with production values
3. **OAuth**: Configure 42 app with production redirect URI
4. **Deploy**: Run `make up-no-cache`

### SSL Configuration
- Nginx handles SSL termination
- Certificates expected at `/etc/letsencrypt/live/yourdomain/`
- HTTP automatically redirects to HTTPS

### CORS Configuration
Backend allows requests from:
- `http://localhost:3000` (development)
- `https://tabletennis.42heilbronn.de` (production)
- Custom domains as configured

## Development Patterns

### Frontend Conventions
- **App Router**: Uses Next.js 13+ app directory structure
- **Client Components**: Mark with "use client" for interactivity
- **TypeScript**: Full type safety with interfaces for API responses
- **TailwindCSS**: Utility-first styling with responsive design
- **Custom Hooks**: Centralized logic (useAuth, API calls)

### Backend Conventions
- **RESTful Design**: Clear resource-based URLs
- **Middleware**: CORS, authentication verification
- **Error Handling**: Consistent JSON error responses
- **GORM**: Database ORM with automatic migrations
- **Gin Framework**: HTTP routing and middleware

### State Management
- **NextAuth**: Session and authentication state
- **React State**: Component-level state with useState
- **API State**: Direct API calls with loading states
- **No Global Store**: Simple architecture without Redux/Zustand

## Testing

### Manual Testing Checklist
- [ ] Login with 42 account (Heilbronn students only)
- [ ] Submit match for both sports
- [ ] Confirm/deny matches as opponent
- [ ] Verify ELO calculations
- [ ] Check leaderboard updates
- [ ] Test match history filtering
- [ ] Verify responsive design
- [ ] Test error handling (invalid opponents, etc.)

### API Testing
- Use backend directly at `http://localhost:8081`
- Postman/curl with Authorization header
- Test validation and error responses

## Troubleshooting

### Common Issues
- **Authentication Failed**: Check 42 OAuth credentials and campus
- **CORS Errors**: Verify allowed origins in backend
- **Database Issues**: Check SQLite file permissions
- **Build Failures**: Run `go mod tidy` and `npm install`

### Debugging
- **Frontend**: Browser DevTools, Next.js console
- **Backend**: Go server logs, database queries
- **Container**: `make logs` for all services

## Security Considerations

- **Authentication**: Only 42 Heilbronn students allowed
- **Token Validation**: Real-time verification with 42 API
- **CORS**: Restricted to specific domains
- **HTTPS**: SSL/TLS in production
- **Input Validation**: Server-side validation for all inputs
- **SQL Injection**: GORM provides protection

## Performance Notes

- **Database**: SQLite suitable for school-scale usage
- **Caching**: No additional caching (42 API has rate limits)
- **Images**: User avatars from 42 CDN
- **Build**: Next.js standalone output for optimal Docker images
- **ELO Calculation**: In-memory calculation, minimal database impact

Built for 42 Heilbronn students to compete and track their table tennis prowess! 🏓