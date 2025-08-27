#!/bin/bash

# =============================================================================
# Gym Application Runner Script
# =============================================================================
# Quick commands for daily development workflow
# =============================================================================

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
RED='\033[0;31m'
NC='\033[0m'

print_success() { echo -e "${GREEN}✓ $1${NC}"; }
print_info() { echo -e "${BLUE}ℹ $1${NC}"; }
print_warning() { echo -e "${YELLOW}⚠ $1${NC}"; }
print_error() { echo -e "${RED}✗ $1${NC}"; }

# Quick database setup
db_up() {
    print_info "Starting database..."
    if [[ -f "creds.sh" ]]; then
        source ./creds.sh
        docker-compose up -d
        print_success "Database started"
    else
        print_error "creds.sh not found. Run ./setup.sh first"
        exit 1
    fi
}

# Quick database down
db_down() {
    print_info "Stopping database..."
    docker-compose down
    print_success "Database stopped"
}

# Start server only
server() {
    print_info "Starting server..."
    if [[ -d "server" ]]; then
        cd server
        npm install --silent
        nodemon index.js
    else
        print_error "Server directory not found"
        exit 1
    fi
}

# Start client only
client() {
    print_info "Starting client..."
    if [[ -d "client" ]]; then
        cd client
        npm install --silent
        npm start
    else
        print_error "Client directory not found"
        exit 1
    fi
}

# Development mode (all services)
dev() {
    print_info "Starting development mode..."
    
    # Start database
    db_up
    
    # Start server in background
    if [[ -d "server" ]]; then
        print_info "Starting backend server..."
        cd server
        npm install --silent
        nodemon index.js > ../server.log 2>&1 &
        SERVER_PID=$!
        echo $SERVER_PID > ../server.pid
        cd ..
        print_success "Backend server started (PID: $SERVER_PID)"
    fi
    
    # Start client in background
    if [[ -d "client" ]]; then
        print_info "Starting frontend client..."
        cd client
        npm install --silent
        npm start > ../client.log 2>&1 &
        CLIENT_PID=$!
        echo $CLIENT_PID > ../client.pid
        cd ..
        print_success "Frontend client started (PID: $CLIENT_PID)"
    fi
    
    print_success "Development environment started!"
    print_info "Backend: http://localhost:3001"
    print_info "Frontend: http://localhost:3000"
    print_info "Use './run.sh stop' to stop all services"
}

# Stop all services
stop() {
    print_info "Stopping all services..."
    
    # Stop server
    if [[ -f "server.pid" ]]; then
        SERVER_PID=$(cat server.pid)
        if kill -0 $SERVER_PID 2>/dev/null; then
            kill $SERVER_PID
            print_success "Server stopped"
        fi
        rm -f server.pid
    fi
    
    # Stop client
    if [[ -f "client.pid" ]]; then
        CLIENT_PID=$(cat client.pid)
        if kill -0 $CLIENT_PID 2>/dev/null; then
            kill $CLIENT_PID
            print_success "Client stopped"
        fi
        rm -f client.pid
    fi
    
    # Stop database
    db_down
    
    print_success "All services stopped"
}

# Show help
help() {
    echo "Gym Application Runner - Quick Development Commands"
    echo ""
    echo "Usage: ./run.sh [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  dev       - Start full development environment (database + server + client)"
    echo "  server    - Start server only (interactive)"
    echo "  client    - Start client only (interactive)"
    echo "  db-up     - Start database only"
    echo "  db-down   - Stop database only"
    echo "  stop      - Stop all services"
    echo "  help      - Show this help"
    echo ""
    echo "Examples:"
    echo "  ./run.sh dev          # Start everything for development"
    echo "  ./run.sh server       # Run server in current terminal"
    echo "  ./run.sh client       # Run client in current terminal"
    echo "  ./run.sh stop         # Stop all background services"
    echo ""
    echo "For initial setup, use: ./setup.sh"
}

# Main execution
case ${1:-help} in
    "dev"|"development")
        dev
        ;;
    "server"|"backend")
        server
        ;;
    "client"|"frontend")
        client
        ;;
    "db-up"|"database")
        db_up
        ;;
    "db-down")
        db_down
        ;;
    "stop")
        stop
        ;;
    "help"|"-h"|"--help")
        help
        ;;
    *)
        print_error "Unknown command: $1"
        help
        exit 1
        ;;
esac