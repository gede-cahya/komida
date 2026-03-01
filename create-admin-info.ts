// Script untuk create admin user di backend
// Run dengan: bun run create-admin.ts

const ADMIN_CREDENTIALS = {
  username: 'adminc',
  email: 'adminc@komida.site',
  password: 'azsxdc147258',
  display_name: 'Admin Komida',
  role: 'admin'
};

console.log('Admin Credentials:');
console.log('Username:', ADMIN_CREDENTIALS.username);
console.log('Email:', ADMIN_CREDENTIALS.email);
console.log('Password:', ADMIN_CREDENTIALS.password);
console.log('Role:', ADMIN_CREDENTIALS.role);
console.log('');
console.log('Login di frontend dengan:');
console.log('  Email/Username:', ADMIN_CREDENTIALS.username);
console.log('  Password:', ADMIN_CREDENTIALS.password);
