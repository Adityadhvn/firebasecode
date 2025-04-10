# Club Ticket Booking Platform

A dynamic club ticket booking platform with QR code technology for seamless event access and ticket management.

## Features

- User authentication (login/register)
- Event discovery and browsing
- Ticket booking with QR code generation
- QR code scanning for ticket validation
- Admin panel for user and event management
- Organizer privileges management
- Data export to CSV

## Prerequisites

Before running this application locally, make sure you have the following installed:

1. [Node.js](https://nodejs.org/) (version 18+ recommended)
2. [npm](https://www.npmjs.com/) (comes with Node.js)
3. [PostgreSQL](https://www.postgresql.org/download/) (version 14+ recommended)
4. [Git](https://git-scm.com/downloads) (for cloning the repository)

## Setup Instructions

### 1. Clone the repository

```bash
git clone [your-repository-url]
cd club-ticket-booking
```

### 2. Install dependencies

```bash
npm install
```

### 3. Set up the database and environment

#### Option 1: Interactive Shell Script (Recommended)

Run the included shell script which will guide you through the whole setup process:

```bash
# Make the script executable if needed
chmod +x setup-local.sh

# Run the setup script
./setup-local.sh
```

This script will:
- Check for required prerequisites (Node.js, npm, PostgreSQL)
- Set up the .env file with environment variables
- Install all dependencies
- Create the database and run migrations

#### Option 2: Node.js Script

Alternatively, you can use the Node.js setup script:

```bash
# Run the setup script
node scripts/setup-local-db.js
```

#### Option 3: Manual Setup

If you prefer to set up manually:

1. Create a PostgreSQL database:
   ```bash
   psql -U postgres -c "CREATE DATABASE club_ticket_booking"
   ```

2. Create a `.env` file in the root directory:
   ```
   DATABASE_URL=postgresql://postgres:your_password@localhost:5432/club_ticket_booking
   SESSION_SECRET=your_secret_key_here
   ```

3. Run the database migrations:
   ```bash
   npm run db:push
   ```

### 6. Start the development server

```bash
npm run dev
```

This will start both the backend server and frontend development server. The application should be available at http://localhost:5000.

## User Accounts

The application comes with pre-seeded user accounts for testing:

1. **Super Admin**
   - Username: adityadhawan
   - Password: Gokussj3@

2. **Event Organizer**
   - Username: eventorganizer
   - Password: password123

3. **Regular User**
   - Username: user1
   - Password: password

## Development Guide

### Project Structure

```
├── client/               # Frontend React application
│   ├── src/
│   │   ├── assets/       # Static assets
│   │   ├── components/   # React components
│   │   ├── hooks/        # Custom React hooks
│   │   ├── lib/          # Utility functions
│   │   ├── pages/        # Page components
│   │   ├── App.tsx       # Main App component
│   │   └── main.tsx      # Application entry point
├── server/               # Backend Express application
│   ├── auth.ts           # Authentication logic
│   ├── db.ts             # Database connection
│   ├── index.ts          # Server entry point
│   ├── routes.ts         # API routes
│   ├── storage.ts        # Data storage logic
│   └── vite.ts           # Vite server setup
├── shared/               # Shared code between frontend and backend
│   └── schema.ts         # Database schema and types
└── package.json          # Project dependencies and scripts
```

### Technology Stack

- **Frontend**: React, TypeScript, Tailwind CSS, Shadcn UI
- **Backend**: Express.js, TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: Passport.js with session-based auth
- **Bundler**: Vite

### Key NPM Scripts

- `npm run dev`: Start the development server
- `npm run db:push`: Push schema changes to the database
- `npm run build`: Build the application for production
- `npm run start`: Start the production server

## Troubleshooting

### Database Connection Issues

If you're having trouble connecting to the database:

1. Make sure PostgreSQL is running
2. Verify your DATABASE_URL in the `.env` file
3. Ensure your PostgreSQL user has proper permissions

### "Buffer is not defined" Error

If you encounter this error in the browser:

1. This is related to Node.js Buffer being used in browser environment
2. The application includes a polyfill to handle this, but if issues persist:
   - Check the client/src/lib/buffer-polyfill.ts file
   - Ensure it's imported in client/src/main.tsx before other imports

### Authentication Issues

If you can't log in:

1. Check the database connection
2. Try the pre-seeded user accounts listed above
3. Verify the SESSION_SECRET is properly set in your .env file

## Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request