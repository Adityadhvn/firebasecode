#!/bin/bash

# Club Ticket Booking Local Setup Script
# This script helps set up the local development environment

# Print section header
print_header() {
  echo -e "\n\033[1;34m==== $1 ====\033[0m"
}

# Success message
print_success() {
  echo -e "\033[0;32m$1\033[0m"
}

# Error message
print_error() {
  echo -e "\033[0;31m$1\033[0m"
}

# Warning message
print_warning() {
  echo -e "\033[0;33m$1\033[0m"
}

# Check if command exists
command_exists() {
  command -v "$1" >/dev/null 2>&1
}

print_header "Club Ticket Booking App - Local Setup"

# Check prerequisites
echo "Checking prerequisites..."

# Check Node.js
if command_exists node; then
  NODE_VERSION=$(node -v)
  echo "✅ Node.js is installed: $NODE_VERSION"
else
  print_error "❌ Node.js is not installed. Please install Node.js (v18+ recommended)."
  exit 1
fi

# Check npm
if command_exists npm; then
  NPM_VERSION=$(npm -v)
  echo "✅ npm is installed: $NPM_VERSION"
else
  print_error "❌ npm is not installed. Please install npm."
  exit 1
fi

# Check PostgreSQL
if command_exists psql; then
  PSQL_VERSION=$(psql --version | head -1)
  echo "✅ PostgreSQL is installed: $PSQL_VERSION"
else
  print_error "❌ PostgreSQL is not installed. Please install PostgreSQL (v14+ recommended)."
  exit 1
fi

# Create .env file if it doesn't exist
print_header "Environment Setup"
if [ ! -f .env ]; then
  if [ -f .env.example ]; then
    cp .env.example .env
    print_success "Created .env file from .env.example"
  else
    cat > .env << EOL
DATABASE_URL=postgresql://postgres:postgres@localhost:5432/club_ticket_booking
SESSION_SECRET=local_development_secret
EOL
    print_success "Created basic .env file"
  fi
  print_warning "Please make sure to update the DATABASE_URL in the .env file with your credentials"
else
  print_warning "An .env file already exists. Skipping..."
fi

# Install dependencies
print_header "Installing Dependencies"
echo "Installing npm packages..."
npm install

# Database setup prompt
print_header "Database Setup"
echo "Would you like to set up the database now? (y/n)"
read -r setup_db

if [ "$setup_db" = "y" ] || [ "$setup_db" = "Y" ]; then
  echo "Enter your PostgreSQL username (default: postgres):"
  read -r pg_user
  pg_user=${pg_user:-postgres}
  
  echo "Enter your PostgreSQL password:"
  read -r pg_password
  
  echo "Database name (default: club_ticket_booking):"
  read -r db_name
  db_name=${db_name:-club_ticket_booking}
  
  # Update DATABASE_URL in .env
  sed -i.bak "s|DATABASE_URL=.*|DATABASE_URL=postgresql://$pg_user:$pg_password@localhost:5432/$db_name|" .env
  rm -f .env.bak
  print_success "Updated DATABASE_URL in .env file"
  
  # Create database
  echo "Creating database..."
  if PGPASSWORD=$pg_password psql -U $pg_user -c "CREATE DATABASE $db_name" postgres 2>/dev/null; then
    print_success "Database '$db_name' created successfully"
  else
    print_warning "Database '$db_name' might already exist or there was an error creating it"
  fi
  
  # Run migrations
  echo "Running database migrations..."
  npm run db:push
  
  print_success "Database setup completed!"
else
  print_warning "Skipping database setup. You'll need to set up the database manually."
fi

print_header "Setup Complete!"
echo "You can now start the development server:"
echo "  npm run dev"
echo ""
echo "Access the application at: http://localhost:5000"