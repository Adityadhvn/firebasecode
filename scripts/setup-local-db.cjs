/**
 * Local development database setup script
 * 
 * This script helps with setting up the local PostgreSQL database
 * and running the initial schema migration.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function prompt(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

function updateDatabaseUrl(dbUser, dbPassword, dbName, dbHost = 'localhost', dbPort = '5432') {
  const envPath = path.join(__dirname, '..', '.env');
  const envExamplePath = path.join(__dirname, '..', '.env.example');
  
  let envContent = '';
  
  // Check if .env file exists, otherwise use .env.example as a template
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf8');
    
    // Replace DATABASE_URL if it exists
    if (envContent.includes('DATABASE_URL=')) {
      envContent = envContent.replace(
        /DATABASE_URL=.*/,
        `DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
      );
    } else {
      // Add DATABASE_URL if it doesn't exist
      envContent += `\nDATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}\n`;
    }
  } else if (fs.existsSync(envExamplePath)) {
    // Copy from example and replace placeholders
    envContent = fs.readFileSync(envExamplePath, 'utf8');
    envContent = envContent.replace(
      /DATABASE_URL=.*/,
      `DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}`
    );
    
    // Generate a random SESSION_SECRET if it exists in the template
    if (envContent.includes('SESSION_SECRET=')) {
      const randomSecret = Math.random().toString(36).substring(2, 15) + 
                           Math.random().toString(36).substring(2, 15);
      envContent = envContent.replace(
        /SESSION_SECRET=.*/,
        `SESSION_SECRET=${randomSecret}`
      );
    }
  } else {
    // Create a basic .env file
    envContent = `DATABASE_URL=postgresql://${dbUser}:${dbPassword}@${dbHost}:${dbPort}/${dbName}\n`;
    envContent += `SESSION_SECRET=${Math.random().toString(36).substring(2, 15)}\n`;
    envContent += `PORT=5000\n`;
  }
  
  fs.writeFileSync(envPath, envContent);
  console.log('\x1b[32m%s\x1b[0m', `✅ Updated DATABASE_URL in .env file`);
}

async function setupDatabase() {
  console.log('\x1b[34m%s\x1b[0m', '==== Club Ticket Booking - Database Setup ====');
  
  try {
    // Check if PostgreSQL is available
    try {
      execSync('psql --version', { stdio: 'pipe' });
      console.log('\x1b[32m%s\x1b[0m', '✅ PostgreSQL is installed');
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m', '❌ PostgreSQL is not installed or not in PATH');
      console.log('Please install PostgreSQL and try again');
      process.exit(1);
    }
    
    // Ask for database credentials
    const dbUser = await prompt('Enter PostgreSQL username (default: postgres): ') || 'postgres';
    const dbPassword = await prompt('Enter PostgreSQL password: ');
    if (!dbPassword) {
      console.log('\x1b[31m%s\x1b[0m', '❌ Password cannot be empty');
      process.exit(1);
    }
    
    const dbName = await prompt('Enter database name (default: club_ticket_booking): ') || 'club_ticket_booking';
    const dbHost = await prompt('Enter database host (default: localhost): ') || 'localhost';
    const dbPort = await prompt('Enter database port (default: 5432): ') || '5432';
    
    // Update .env file with database credentials
    updateDatabaseUrl(dbUser, dbPassword, dbName, dbHost, dbPort);
    
    // Create database if it doesn't exist
    try {
      console.log(`Creating database '${dbName}'...`);
      
      // Set PGPASSWORD environment variable for password authentication
      const env = { ...process.env, PGPASSWORD: dbPassword };
      
      // Check if database exists
      const checkCmd = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -lqt | cut -d \\| -f 1 | grep -w ${dbName}`;
      try {
        execSync(checkCmd, { stdio: 'pipe', env });
        console.log('\x1b[33m%s\x1b[0m', `ℹ️ Database '${dbName}' already exists`);
      } catch (error) {
        // Database doesn't exist, create it
        const createCmd = `psql -h ${dbHost} -p ${dbPort} -U ${dbUser} -c "CREATE DATABASE ${dbName}"`;
        execSync(createCmd, { stdio: 'pipe', env });
        console.log('\x1b[32m%s\x1b[0m', `✅ Database '${dbName}' created successfully`);
      }
      
      // Run migrations
      console.log('Running database migrations...');
      execSync('npm run db:push', { stdio: 'inherit' });
      
      console.log('\x1b[32m%s\x1b[0m', '✅ Database setup completed successfully');
      console.log('\x1b[34m%s\x1b[0m', '\nYou can now start the development server with:');
      console.log('  npm run dev');
      
    } catch (error) {
      console.log('\x1b[31m%s\x1b[0m', `❌ Database setup failed: ${error.message}`);
      console.log('Please check your credentials and try again');
    }
    
  } catch (error) {
    console.log('\x1b[31m%s\x1b[0m', `❌ Error: ${error.message}`);
  } finally {
    rl.close();
  }
}

setupDatabase();