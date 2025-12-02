const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://vndbzqafzuqdyxbayrdd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InZuZGJ6cWFmenVxZHl4YmF5cmRkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTk2MDUyOTIsImV4cCI6MjA3NTE4MTI5Mn0.Kz5CzdRJNKi3lg5TR__OP_PvyNL2Ji8LcrZp7_TlcP8';

const supabase = createClient(supabaseUrl, supabaseKey);

async function checkDatabase() {
  console.log('🔍 Checking database contents...\n');

  // Check clinicas
  const { data: clinicas, error: clinicasError } = await supabase
    .from('clinicas')
    .select('*');

  console.log('1️⃣ Clinicas:');
  if (clinicasError) {
    console.log('   ❌ Error:', clinicasError.message);
  } else {
    console.log(`   ✅ Found ${clinicas.length} clinic(s)`);
    clinicas.forEach(c => console.log(`      - ${c.nome} (${c.id})`));
  }
  console.log('');

  // Check psicologos
  const { data: psicologos, error: psicologosError } = await supabase
    .from('psicologos')
    .select('*');

  console.log('2️⃣ Psicologos:');
  if (psicologosError) {
    console.log('   ❌ Error:', psicologosError.message);
  } else {
    console.log(`   ✅ Found ${psicologos.length} psychologist(s)`);
    psicologos.forEach(p => console.log(`      - ${p.nome_completo} (${p.email})`));
  }
  console.log('');

  // Check pacientes
  const { data: pacientes, error: pacientesError } = await supabase
    .from('pacientes')
    .select('*');

  console.log('3️⃣ Pacientes:');
  if (pacientesError) {
    console.log('   ❌ Error:', pacientesError.message);
  } else {
    console.log(`   ✅ Found ${pacientes.length} patient(s)`);
    pacientes.forEach(p => console.log(`      - ${p.nome_completo}`));
  }
  console.log('');

  // Check testes_templates
  const { data: testes, error: testesError } = await supabase
    .from('testes_templates')
    .select('*');

  console.log('4️⃣ Testes Templates:');
  if (testesError) {
    console.log('   ❌ Error:', testesError.message);
  } else {
    console.log(`   ✅ Found ${testes.length} test template(s)`);
    testes.forEach(t => console.log(`      - ${t.nome} (${t.sigla})`));
  }
  console.log('');

  if (clinicas.length === 0 && psicologos.length === 0) {
    console.log('⚠️  DATABASE IS EMPTY!');
    console.log('');
    console.log('📋 You need to execute the seed SQL:');
    console.log('   1. Go to: https://supabase.com/dashboard/project/vndbzqafzuqdyxbayrdd/sql');
    console.log('   2. Copy the SQL from SETUP_INSTRUCTIONS.md');
    console.log('   3. Execute it');
    console.log('   4. Check for any errors in the output');
  }
}

checkDatabase().catch(console.error);
