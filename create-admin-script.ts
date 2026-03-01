// File: create-admin.ts
// Copy file ini ke /home/cahya/2026/komida-backend/create-admin.ts
// Lalu run: bun run create-admin.ts

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';

// Load .env
config();

const supabaseUrl = process.env.SUPABASE_URL || '';
const supabaseKey = process.env.SUPABASE_ANON_KEY || '';

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase credentials not found in .env');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function createAdminUser() {
  console.log('🔧 Connecting to Supabase...');
  console.log('URL:', supabaseUrl);
  
  // Create admin user via Supabase Auth
  const email = 'adminc@komida.site';
  const password = 'azsxdc147258';
  
  console.log('\n📝 Creating admin user:');
  console.log('   Email:', email);
  console.log('   Password:', password);
  console.log('   Username: adminc');
  console.log('   Role: admin');
  
  try {
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        username: 'adminc',
        display_name: 'Admin Komida',
        role: 'admin'
      }
    });
    
    if (error) {
      console.error('❌ Error creating user:', error.message);
      process.exit(1);
    }
    
    console.log('\n✅ Admin user created successfully!');
    console.log('   User ID:', data.user.id);
    console.log('   Email:', data.user.email);
    console.log('\n🔐 You can now login with:');
    console.log('   Email/Username: adminc');
    console.log('   Password: azsxdc147258');
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    
    if (error.message.includes('already exists')) {
      console.log('\n⚠️  User already exists, trying to login...');
      
      // Try to login with existing user
      const { data: loginData, error: loginError } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (loginError) {
        console.error('❌ Login failed:', loginError.message);
      } else {
        console.log('✅ User exists and password is correct!');
        console.log('   User ID:', loginData.user.id);
        console.log('\n🔐 You can login with:');
        console.log('   Email/Username: adminc');
        console.log('   Password: azsxdc147258');
      }
    }
  }
}

createAdminUser();
