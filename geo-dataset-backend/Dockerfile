# Use an official Node.js runtime as the base image
FROM node:18-alpine

# Set the working directory in the container
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package*.json ./

# Install app dependencies
RUN npm install --production

# Copy the rest of your application code
COPY . .

# The port Cloud Run will use (set by the PORT environment variable)
EXPOSE 3000

# Start your Node.js application
CMD [ "npm", "run", "serve" ]
