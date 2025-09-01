# 42 Heilbronn Table Tennis Championship

A full-stack web application for tracking table soccer and table football matches at 42 Heilbronn, featuring ELO-based rankings, match confirmation system, and comprehensive leaderboards.

## 🚀 Features

- **🔐 42 OAuth Authentication** - Only verified 42 Heilbronn students can participate
- **⚡ Match Submission System** - Submit match results with opponent confirmation
- **📊 ELO Ranking System** - Separate rankings for Table Soccer and Table Football
- **🏆 Live Leaderboards** - Real-time rankings with detailed statistics
- **📈 Match History** - Complete match records with ELO progression
- **✅ Confirmation Workflow** - Opponents must confirm matches before ELO impact

## 🏗️ Architecture

- **Frontend**: Next.js 15 with React 19, TypeScript, TailwindCSS
- **Backend**: Go with Gin framework, SQLite database, GORM ORM
- **Authentication**: NextAuth.js with 42 School OAuth
- **Database**: SQLite with automatic migrations
- **Deployment**: Docker Compose with Nginx reverse proxy
- **SSL**: Let's Encrypt integration

## 🎯 Quick Start

### Prerequisites
- Docker and Docker Compose
- 42 API application credentials (for OAuth)

### Environment Setup

1. **Get 42 API Credentials**
   - Create an application at https://profile.intra.42.fr/oauth/applications
   - Set redirect URI to: `https://yourdomain.com/api/auth/callback/42-school`

2. **Create Environment File**
   ```bash
   # Copy the example file
   cp .env.example .env
   
   # Edit .env and add your credentials
   AUTH_SECRET=your_generated_secret_here  # Generate with: openssl rand -base64 32
   AUTH_42_ID=u-s4t2ud-your_app_id_here
   AUTH_42_SECRET=s-s4t2ud-your_app_secret_here
   NEXTAUTH_URL=https://yourdomain.com
   ```

3. **For Local Development**
   ```bash
   # Copy the local example
   cp .env.local.example .env.local
   
   # Edit .env.local with your credentials and local URLs
   ```

3. **Start the Application**
   ```bash
   make up
   ```

### Development Commands

```bash
# Start all services
make up

# Build and start without cache
make up-no-cache

# Stop all services
make down

# View logs
make logs

# Clean up everything (containers, images, volumes)
make clean

# Check status
make status
```

## 📋 API Endpoints

### Authentication
- `GET /api/profile` - Get current user profile

### Matches
- `POST /api/matches/submit` - Submit new match
- `PUT /api/matches/:id/confirm` - Confirm/deny match
- `GET /api/matches/pending` - Get pending matches
- `GET /api/matches/history` - Get match history

### Leaderboard
- `GET /api/leaderboard?sport={table_soccer|table_football}` - Get rankings

### Players
- `GET /api/players/search?q={query}` - Search players
- `GET /api/players/:login/stats` - Get player statistics

## 🎮 How to Use

1. **Sign In** - Use your 42 School account (Heilbronn students only)
2. **Submit Match** - Record your match result and select opponent
3. **Wait for Confirmation** - Opponent receives notification to confirm/deny
4. **ELO Update** - Rankings update automatically on confirmation
5. **Check Leaderboards** - See your ranking and compete for the top spot!

## 🏆 ELO System

- **Starting ELO**: 1200 points for all players
- **K-Factor**: 32 (standard chess rating system)
- **Win vs Higher Rated**: Gain more points
- **Lose vs Lower Rated**: Lose more points
- **Separate Rankings**: Table Soccer and Table Football tracked independently

## 🛠️ Development

### Frontend Development
```bash
cd Frontend/
npm install
npm run dev  # http://localhost:3000
```

### Backend Development
```bash
cd Backend/
go mod download
go run main.go  # http://localhost:8081
```

### Project Structure
```
tabletennis/
├── Frontend/           # Next.js React application
│   ├── app/           # App router pages and components
│   ├── public/        # Static assets
│   └── Dockerfile     # Frontend container
├── Backend/           # Go API server
│   ├── models/        # Database models
│   ├── handlers/      # API handlers
│   ├── services/      # Business logic
│   ├── database/      # Database setup
│   └── Dockerfile     # Backend container
├── Nginx/             # Reverse proxy configuration
└── docker-compose.yml # Container orchestration
```

## 🚀 Deployment

1. **SSL Setup** - Configure SSL certificates for your domain
2. **Environment Variables** - Set production values in docker-compose.yml
3. **Domain Configuration** - Update NEXTAUTH_URL and Nginx config
4. **Deploy**: `make up-no-cache`

## 🔧 Configuration

### Required Environment Variables

**Frontend:**
- `AUTH_SECRET` - NextAuth.js secret key
- `AUTH_42_ID` - 42 OAuth application ID
- `AUTH_42_SECRET` - 42 OAuth application secret
- `NEXTAUTH_URL` - Your domain URL
- `NEXT_PUBLIC_API_URL` - Backend API URL

**Backend:**
- `GIN_MODE=release` - Production mode

## 📊 Features in Detail

### Match Submission Workflow
1. Player A submits match result
2. Player B receives notification
3. Player B can confirm or deny
4. Only confirmed matches affect ELO
5. Denied matches are logged but don't impact ratings

### Leaderboard Features
- Live rankings for both sports
- Win/loss records
- Win rate percentages
- ELO progression tracking
- Champion, runner-up, and third place highlights

### Match History
- Complete match records
- ELO changes for each match
- Filtering by sport
- Win/loss visualization
- Overall statistics

## 🏫 42 School Integration

- **Authentication**: Seamless 42 OAuth login
- **Campus Restriction**: Only Heilbronn students allowed
- **Profile Sync**: Automatic profile data from 42 API
- **Student Verification**: Real-time validation against 42 database

Built with ❤️ for 42 Heilbronn students