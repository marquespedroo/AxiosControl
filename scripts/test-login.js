const bcrypt = require('bcryptjs');

// Test data
const password = 'senha123';
const hashes = [
  '$2a$10$GE8gM43Q8w/8pJ5rJ57tsegWUty64XWD4rdAH2FveuDfZ8VqTW2mq',  // seed.sql hash
  '$2a$10$N9qo8uLOickgx2ZMRZoMye.IizVKd.glYRJQi2FN.R6xGLmPvyPPi',  // old hash
  '$2a$10$rNakPLwHViNsHH/igHYPB.ODl73yyoEJJTpjvuW3uim8jtDqFdpIi',  // fresh hash
];

console.log('🔐 Testing password:', password);
console.log('');

hashes.forEach((hash, index) => {
  const isValid = bcrypt.compareSync(password, hash);
  const label = index === 0 ? 'seed.sql' : index === 1 ? 'old SETUP' : 'fresh';
  console.log(`${isValid ? '✅' : '❌'} Hash ${index + 1} (${label}): ${isValid ? 'VALID' : 'INVALID'}`);
  console.log(`   ${hash}`);
});

console.log('');
console.log('📋 To check what hash is in your Supabase database:');
console.log('   1. Go to: https://supabase.com/dashboard/project/vndbzqafzuqdyxbayrdd/editor');
console.log('   2. Run: SELECT senha_hash FROM psicologos WHERE email = \'joao@exemplo.com\';');
console.log('   3. Compare the result with the hashes above');
console.log('');
console.log('💡 If NO rows are returned, the seed data hasn\'t been inserted yet!');
console.log('   Execute the SQL from SETUP_INSTRUCTIONS.md in the Supabase SQL Editor');
