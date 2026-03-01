// Test login script
const response = await fetch('http://localhost:3002/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ username: 'adminc', password: 'azsxdc147258' })
});

const data = await response.json();
console.log('Status:', response.status);
console.log('Response:', data);
