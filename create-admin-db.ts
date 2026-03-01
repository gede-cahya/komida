// Script untuk create admin user via direct database connection
// Run: bun run create-admin-db.ts

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';

// Read .env from backend
const envContent = readFileSync('/home/cahya/2026/komida-backend/.env', 'utf-8');
const envLines = envContent.split('\n');
const env: Record<string, string> = {};

for (const line of envLines) {
  const [key, ...valueParts] = line.split('=');
  if (key && valueParts.length > 0) {
    env[key.trim()] = valueParts.join('=').trim().replace(/"/g, '');
  }
}

const supabaseUrl = env.SUPABASE_URL || '';
const supabaseAnonKey = env.SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase Configuration:');
console.log('   URL:', supabaseUrl);
console.log('');

async function createAdminViaAuth() {
  console.log('📝 Creating admin user via Auth API...');
  
  const supabase = createClient(supabaseUrl, supabaseAnonKey);
  
  // Try to signup (this uses the public anon key)
  const email = 'adminc@komida.site';
  const password = 'azsxdc147258';
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        username: 'adminc',
        display_name: 'Admin Komida',
        role: 'admin'
      }
    }
  });
  
  if (error) {
    if (error.message.includes('already been registered')) {
      console.log('⚠️  User already exists!');
      
      // Try to login
      console.log('\n🔐 Testing login...');
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        console.error('❌ Login failed:', loginError.message);
        console.log('\n💡 You may need to confirm email or reset password');
      } else {
        console.log('✅ Login successful!');
        console.log('   User ID:', loginData.user.id);
        console.log('   Email:', loginData.user.email);
        console.log('\n🔐 Login credentials:');
        console.log('   Email/Username: adminc');
        console.log('   Password: azsxdc147258');
        console.log('\n💡 Try login at: http://localhost:3000/login');
      }
    } else {
      console.error('❌ Signup failed:', error.message);
    }
    return;
  }
  
  console.log('✅ Admin user created!');
  console.log('   User ID:', data.user?.id);
  console.log('   Email:', data.user?.email);
  console.log('\n⚠️  Note: Email confirmation may be required');
  console.log('\n🔐 Login credentials:');
  console.log('   Email/Username: adminc');
  console.log('   Password: azsxdc147258');
}

createAdminViaAuth();
