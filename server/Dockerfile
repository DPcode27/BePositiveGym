# gym-app/server/Dockerfile
# Dockerfile for Node.js server of gym application
FROM node:22-alpine

# Set working directory
WORKDIR /usr/src/app

# Copy package.json and package-lock.json for dependency installation
COPY package*.json ./

# Install production dependencies
RUN npm ci --only=production

# Copy application code
COPY . .

# Expose application port
EXPOSE 8080

# Define healthcheck endpoint (assumes /health endpoint in app)
HEALTHCHECK --interval=30s --timeout=3s CMD curl -f http://localhost:8080/health || exit 1

# Start the application
CMD ["npm", "start"]