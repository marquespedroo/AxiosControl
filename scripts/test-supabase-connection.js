const { createClient } = require('@supabase/supabase-js');
const bcrypt = require('bcryptjs');

const supabaseUrl = 'https://vndbzqafzuqdyxbayrdd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZGJ6cWFmenVxZHl4YmF5cmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDUyOTIsImV4cCI6MjA3NTE4MTI5Mn0.Kz5CzdRJNKi3lg5TR__OP_PvyNL2Ji8LcrZp7_TlcP8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function testLogin() {
  console.log('🔍 Testing Supabase connection and login...\n');

  const email = 'joao@exemplo.com';
  const password = 'senha123';

  console.log('📧 Email:', email);
  console.log('🔑 Password:', password);
  console.log('');

  // Query the database
  console.log('1️⃣ Querying database for user...');
  const { data: psicologo, error: queryError } = await supabase
    .from('psicologos')
    .select('id, clinica_id, nome_completo, email, senha_hash, crp, ativo')
    .eq('email', email.toLowerCase().trim())
    .single();

  if (queryError) {
    console.log('❌ Query Error:', queryError);
    return;
  }

  if (!psicologo) {
    console.log('❌ No user found with email:', email);
    return;
  }

  console.log('✅ User found!');
  console.log('   ID:', psicologo.id);
  console.log('   Nome:', psicologo.nome_completo);
  console.log('   Email:', psicologo.email);
  console.log('   Ativo:', psicologo.ativo);
  console.log('   Hash:', psicologo.senha_hash);
  console.log('');

  // Test password comparison
  console.log('2️⃣ Testing password comparison...');
  const isValid = await bcrypt.compare(password, psicologo.senha_hash);

  if (isValid) {
    console.log('✅ Password is VALID!');
    console.log('');
    console.log('🎉 Login should work! If it still fails, check:');
    console.log('   - Browser console for JavaScript errors');
    console.log('   - Network tab for API request/response');
    console.log('   - Next.js server logs');
  } else {
    console.log('❌ Password is INVALID!');
    console.log('');
    console.log('🔧 The hash in the database doesn\'t match the password.');
    console.log('   Run this SQL to fix it:');
    console.log('');

    const correctHash = await bcrypt.hash(password, 10);
    console.log(`   UPDATE psicologos`);
    console.log(`   SET senha_hash = '${correctHash}'`);
    console.log(`   WHERE email = 'joao@exemplo.com';`);
  }
}

testLogin().catch(console.error);
