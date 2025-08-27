# Gym Application Setup & Deployment Guide

## Prerequisites

- **Operating System**: Linux or Windows with WSL (Windows Subsystem for Linux)
- **Docker & Docker Compose**: Required for database containerization
- **Node.js**: Version 16+ for running the application
- **Git**: For version control

## Database Setup with Docker

### 1. Database Credentials Configuration

Before starting the database, ensure the `creds.sh` file exists in the root directory:

```bash
# Check if creds.sh exists
ls -la creds.sh
```

If `creds.sh` doesn't exist, create it with your database credentials:

```bash
# Create creds.sh with your database configuration
cat > creds.sh << EOF
export DATABASE_NAME=gym_app_db
export DATABASE_USER=gym_user
export DATABASE_PASSWORD=your_secure_password
export DATABASE_HOST=localhost
export DATABASE_PORT=5432
EOF
```

### 2. Start Database Services

Execute the following commands in sequence:

```bash
# Load database credentials
source ./creds.sh

# Build Docker containers
docker-compose build

# Start services in detached mode
docker-compose up -d
```

### 3. Database Management

To stop and reset the database:

```bash
# Stop all services and remove volumes (WARNING: This deletes all data)
docker-compose down -v
```

To view running containers:

```bash
# Check container status
docker-compose ps
```

---

## Application Deployment

### Server Setup

Navigate to the server directory and install dependencies:

```bash
cd server/

# Install Node.js dependencies
npm install

# Start development server with hot reload
nodemon index.js
```

**Server Configuration:**
- Default Port: `3001` (or as specified in `.env`)
- API Base URL: `http://localhost:3001/api`

### Client Setup

Navigate to the client directory and install dependencies:

```bash
cd client/

# Install React dependencies
npm install

# Start development server
npm start
```

**Client Configuration:**
- Default Port: `3000`
- Application URL: `http://localhost:3000`

---

## Environment Variables

Ensure the following environment variables are configured:

### Server (.env)
```env
NODE_ENV=development
PORT=3001
DATABASE_NAME=gym_app_db
DATABASE_USER=gym_user
DATABASE_PASSWORD=your_secure_password
DATABASE_HOST=localhost
DATABASE_PORT=5432
JWT_SECRET=your_jwt_secret_key
```

### Client (.env)
```env
REACT_APP_API_URL=http://localhost:3001/api
```

---

## Troubleshooting

### Common Issues

1. **Docker Permission Denied**:
   ```bash
   sudo usermod -aG docker $USER
   newgrp docker
   ```

2. **Port Already in Use**:
   ```bash
   # Kill process using port 3001
   sudo lsof -t -i tcp:3001 | xargs kill -9
   ```

3. **Database Connection Failed**:
   - Verify Docker containers are running: `docker-compose ps`
   - Check database credentials in `creds.sh`
   - Ensure PostgreSQL container is healthy

### Logs and Debugging

```bash
# View Docker container logs
docker-compose logs -f

# View specific service logs
docker-compose logs -f postgres

# Monitor server logs
tail -f server/logs/app.log
```

---

## Development Workflow

1. **Initial Setup** (One-time):
   ```bash
   source ./creds.sh
   docker-compose up -d
   ```

2. **Daily Development**:
   ```bash
   # Terminal 1: Server
   cd server && nodemon index.js
   
   # Terminal 2: Client
   cd client && npm start
   ```

3. **Shutdown**:
   ```bash
   # Keep database running
   Ctrl+C (in server/client terminals)
   
   # Stop everything including database
   docker-compose down
   ```

---

## Production Considerations

- Use `docker-compose.prod.yml` for production builds
- Configure reverse proxy (Nginx) for serving static files
- Set up SSL certificates for HTTPS
- Use environment-specific database credentials
- Enable logging and monitoring solutions