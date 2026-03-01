// Script untuk test koneksi Supabase dan create admin
// Run: bun run supabase-test.ts

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
const supabaseKey = env.SUPABASE_ANON_KEY || '';

console.log('🔧 Supabase Configuration:');
console.log('   URL:', supabaseUrl);
console.log('   Key:', supabaseKey.substring(0, 20) + '...');
console.log('');

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found!');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function testConnection() {
  console.log('📡 Testing Supabase connection...');
  
  try {
    // Test connection by querying users
    const { data, error } = await supabase.auth.admin.listUsers();
    
    if (error) {
      console.error('❌ Connection failed:', error.message);
      process.exit(1);
    }
    
    console.log('✅ Connected to Supabase successfully!');
    console.log('   Total users:', data.users.length);
    
    // Check if admin user exists
    const adminUser = data.users.find(u => 
      u.email === 'adminc@komida.site' || 
      u.user_metadata?.username === 'adminc'
    );
    
    if (adminUser) {
      console.log('\n✅ Admin user already exists!');
      console.log('   ID:', adminUser.id);
      console.log('   Email:', adminUser.email);
      console.log('   Username:', adminUser.user_metadata?.username);
      console.log('\n🔐 Login credentials:');
      console.log('   Email/Username: adminc');
      console.log('   Password: azsxdc147258');
      console.log('\n💡 Try login at: http://localhost:3000/login');
    } else {
      console.log('\n📝 Creating admin user...');
      
      const { data: newData, error: createError } = await supabase.auth.admin.createUser({
        email: 'adminc@komida.site',
        password: 'azsxdc147258',
        email_confirm: true,
        user_metadata: {
          username: 'adminc',
          display_name: 'Admin Komida',
          role: 'admin'
        }
      });
      
      if (createError) {
        console.error('❌ Failed to create admin:', createError.message);
      } else {
        console.log('✅ Admin user created successfully!');
        console.log('   ID:', newData.user.id);
        console.log('   Email:', newData.user.email);
        console.log('\n🔐 You can now login with:');
        console.log('   Email/Username: adminc');
        console.log('   Password: azsxdc147258');
        console.log('\n💡 Try login at: http://localhost:3000/login');
      }
    }
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  }
}

testConnection();
