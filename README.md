# Geospatial Dataset Application

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

### Development URLs
- Frontend: http://localhost:5173
- Backend API: http://localhost:3000

### System Requirements
- Node.js v14 or higher
- npm v6 or higher
- MongoDB (local or Atlas)

### Notes
- Ensure MongoDB is running before starting the backend
- Frontend and backend should be running simultaneously for full functionality
- Set up all environment variables before running either service