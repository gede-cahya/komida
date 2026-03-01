// Script untuk create admin user di database lokal
// Run: bun run create-admin-local.ts

import { Database } from 'bun:sqlite';

const db = new Database('/home/cahya/2026/komida-backend/komida.db');

const ADMIN_USERNAME = 'adminc';
const ADMIN_PASSWORD = 'azsxdc147258';
const ADMIN_ROLE = 'admin';

console.log('🔧 Creating admin user in local database...');
console.log('   Username:', ADMIN_USERNAME);
console.log('   Password:', ADMIN_PASSWORD);
console.log('   Role:', ADMIN_ROLE);

async function createAdmin() {
  // Check if user already exists
  const existing = db.query('SELECT id, username, role FROM users WHERE username = ?').get(ADMIN_USERNAME);
  
  if (existing) {
    console.log('\n⚠️  Admin user already exists!');
    console.log('   ID:', (existing as any).id);
    console.log('   Username:', (existing as any).username);
    console.log('   Role:', (existing as any).role);
    console.log('\n🔐 Login credentials:');
    console.log('   Username: adminc');
    console.log('   Password: azsxdc147258');
    console.log('\n💡 Try login at: http://localhost:3000/login');
    return;
  }
  
  // Hash password using Bun's built-in
  const hashedPassword = await Bun.password.hash(ADMIN_PASSWORD);
  
  // Insert admin user
  const result = db.query(`
    INSERT INTO users (username, password, role, created_at)
    VALUES (?, ?, ?, CURRENT_TIMESTAMP)
  `).run(ADMIN_USERNAME, hashedPassword, ADMIN_ROLE);
  
  console.log('\n✅ Admin user created successfully!');
  console.log('   ID:', result.lastInsertRowid);
  console.log('   Username:', ADMIN_USERNAME);
  console.log('   Role:', ADMIN_ROLE);
  console.log('\n🔐 Login credentials:');
  console.log('   Username: adminc');
  console.log('   Password: azsxdc147258');
  console.log('\n💡 Try login at: http://localhost:3000/login');
}

createAdmin();
