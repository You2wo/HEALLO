#!/usr/bin/env node

/**
 * Setup script for new developers
 * Initialize database and generate Prisma client
 */

const { execSync } = require('child_process');
const fs = require('fs');

console.log('🚀 Setting up development environment...\n');

// Check Node version
const nodeVersion = process.version;
console.log(`📋 Node.js version: ${nodeVersion}`);
if (!nodeVersion.startsWith('v18') && !nodeVersion.startsWith('v19') && !nodeVersion.startsWith('v20')) {
  console.log('⚠️  Warning: This project requires Node.js 18+');
}

// Check if package.json exists
if (!fs.existsSync('package.json')) {
  console.error('❌ package.json not found! Make sure you\'re in the project root directory.');
  process.exit(1);
}

// Check if .env exists
if (!fs.existsSync('.env')) {
  console.log('❌ .env file not found!');
  console.log('Please create a .env file with these contents:');
  console.log('');
  console.log('# Database');
  console.log('DATABASE_URL="file:./dev.db"');
  console.log('');
  console.log('# JWT Secret (change this to a random string in production)');
  console.log('JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"');
  console.log('');

  // Try to create .env with default values
  console.log('🔧 Creating default .env file...');
  fs.writeFileSync('.env', '# Database\nDATABASE_URL="file:./dev.db"\n\n# JWT Secret (change this to a random string in production)\nJWT_SECRET="your-super-secret-jwt-key-change-this-in-production"\n');
  console.log('✅ Created .env file with default values.');
}

// Verify Prisma installation
console.log('🔍 Checking Prisma installation...');
try {
  execSync('npx prisma --version', { stdio: 'pipe' });
  console.log('✅ Prisma CLI is available');
} catch (error) {
  console.error('❌ Prisma CLI not found. Installing...');
  try {
    execSync('npm install prisma --save-dev', { stdio: 'inherit' });
    execSync('npm install @prisma/client', { stdio: 'inherit' });
  } catch (installError) {
    console.error('❌ Failed to install Prisma:', installError.message);
    console.log('🔧 Try running: npm install');
    process.exit(1);
  }
}

try {
  // Generate Prisma client
  console.log('📦 Generating Prisma client...');
  execSync('npx prisma generate --schema=./prisma/schema.prisma', { stdio: 'inherit' });

  // Push database schema (creates dev.db if it doesn't exist)
  console.log('🗄️  Setting up database...');
  execSync('npx prisma db push --force --schema=./prisma/schema.prisma', { stdio: 'inherit' });

  console.log('\n✅ Setup complete! You can now run:');
  console.log('npm run dev');
  console.log('\n🌐 Open http://localhost:3000 in your browser');

} catch (error) {
  console.error('\n❌ Setup failed with error:');
  console.error(error.message);

  if (error.message.includes('prisma generate')) {
    console.log('\n🔧 Troubleshoot Prisma client generation:');
    console.log('1. Delete node_modules: rm -rf node_modules && npm install');
    console.log('2. Clear npm cache: npm cache clean --force');
    console.log('3. Check Node.js version: node --version (should be 18+)');
  }

  if (error.message.includes('db push')) {
    console.log('\n🔧 Troubleshoot database setup:');
    console.log('1. Check if .env has correct DATABASE_URL');
    console.log('2. Delete any existing prisma/dev.db file');
    console.log('3. Ensure you have write permissions in the directory');
  }

  console.log('\n📞 If issues persist, please check:');
  console.log('- npm install completed successfully');
  console.log('- Node.js version is 18 or higher');
  console.log('- You have write permissions');

  process.exit(1);
}
