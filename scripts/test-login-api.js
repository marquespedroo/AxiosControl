const fetch = require('node-fetch');

async function testLoginAPI() {
  console.log('🔐 Testing Login API...\n');

  const loginData = {
    email: 'joao@exemplo.com',
    password: 'senha123'
  };

  console.log('📧 Email:', loginData.email);
  console.log('🔑 Password:', loginData.password);
  console.log('');

  try {
    console.log('📡 Sending POST request to http://localhost:3000/api/auth/login');

    const response = await fetch('http://localhost:3000/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(loginData),
    });

    console.log('📊 Status:', response.status, response.statusText);
    console.log('');

    const data = await response.json();

    if (response.ok) {
      console.log('✅ LOGIN SUCCESSFUL!');
      console.log('');
      console.log('🎉 User Data:');
      console.log('   ID:', data.user.id);
      console.log('   Nome:', data.user.nome_completo);
      console.log('   Email:', data.user.email);
      console.log('   CRP:', data.user.crp);
      console.log('   Clínica ID:', data.user.clinica_id);
      console.log('');
      console.log('🔑 Token:', data.token.substring(0, 50) + '...');
      console.log('');
      console.log('✅ Login is working! You can now access:');
      console.log('   http://localhost:3000/login');
      console.log('   Email: joao@exemplo.com');
      console.log('   Password: senha123');
    } else {
      console.log('❌ LOGIN FAILED!');
      console.log('');
      console.log('Error:', data.error);
      console.log('Message:', data.message);
      if (data.details) {
        console.log('Details:', data.details);
      }
    }
  } catch (error) {
    console.log('❌ Request failed:', error.message);
  }
}

testLoginAPI();
