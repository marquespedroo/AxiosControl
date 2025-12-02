const bcrypt = require('bcryptjs');

const password = 'senha123';
const rounds = 10;

console.log('Gerando hash para senha:', password);
console.log('Rounds:', rounds);
console.log('');

const hash = bcrypt.hashSync(password, rounds);

console.log('Hash gerado:');
console.log(hash);
console.log('');

// Testar o hash
const isValid = bcrypt.compareSync(password, hash);
console.log('Teste de validação:', isValid ? '✅ OK' : '❌ FALHA');
console.log('');

console.log('SQL para atualizar no banco:');
console.log('');
console.log(`UPDATE psicologos`);
console.log(`SET senha_hash = '${hash}'`);
console.log(`WHERE email = 'joao@exemplo.com';`);
