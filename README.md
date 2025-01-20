# Geospatial Dataset Application
Check out the live demo at https://geo-spatial.netlify.app/

# Features

- 🗺️ Interactive map visualization using Mapbox GL
- 🎨 Dark/Light theme support
- 🔐 User authentication and authorization
- 📊 GeoJSON data management
- 📏 Distance measurement tools
- 🎯 Custom shape drawing and editing
- 💾 Data persistence with MongoDB
- 🌐 Real-time data updates

## Tech Stack

### Frontend
- Vue 3 with TypeScript
- Vite for build tooling
- Pinia for state management
- Mapbox GL for map rendering
- TailwindCSS for styling
- Radix Vue for UI components

### Backend
- Node.js with Express
- TypeScript
- MongoDB with Mongoose
- JWT for authentication
- Passport.js for authorization

## Prerequisites

- Node.js v14 or higher
- npm v6 or higher
- MongoDB (local installation or Atlas URI)
- Mapbox API token


## Quick Start Guide

### Environment Variables

#### Frontend (.env)
env
VITE_API_URL=http://localhost:3000
VITE_MAPBOX_TOKEN=your_mapbox_token

#### Backend (.env)
env
PORT=3000
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key

### Installation & Running

#### Frontend (Vue.js)
```bash
# Navigate to frontend
cd front-end

# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

#### Backend (Node.js)
```bash
# Navigate to backend
cd geo-dataset-backend

# Install dependencies
npm install

# Run development server
npm start

# Build TypeScript
npm run build

# Run production server
npm run serve
```

# API Endpoints

### Authentication
- POST `/auth/register` - Create new user account
- POST `/auth/login` - User login

### Datasets
- GET `/datasets` - Retrieve all datasets
- POST `/datasets` - Create new dataset
- PUT `/datasets/:id` - Update dataset
- DELETE `/datasets/:id` - Delete dataset

## Development URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### Notes
- Ensure MongoDB is running before starting the backend
- Frontend and backend should be running simultaneously for full functionality
- Set up all environment variables before running either service
