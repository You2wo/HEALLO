#!/usr/bin/env node

/**
 * Setup script for new developers
 * Initialize database and generate Prisma client
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up development environment...\n');

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file with:');
  console.log('DATABASE_URL="file:./dev.db"');
  console.log('JWT_SECRET="your-super-secret-jwt-key-change-this-in-production-12345"');
  process.exit(1);
}

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate', {stdio: 'inherit'});

  // Push database schema (creates dev.db if it doesn't exist)
  console.log('🗄️  Setting up database...');
  execSync('npx prisma db push --force', {stdio: 'inherit'});

  console.log('\n✅ Setup complete! You can now run:');
  console.log('npm run dev');

} catch (error) {
  console.error('❌ Setup failed:', error.message);
  process.exit(1);
}
