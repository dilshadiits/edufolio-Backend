const bcrypt = require('bcryptjs');

async function createHash() {
  // Using exact same method as your model
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash('admin123', salt);
  
  console.log('=======================================');
  console.log('COPY THIS HASH TO MONGODB:');
  console.log(hash);
  console.log('=======================================');
  
  // Verify
  const check = await bcrypt.compare('admin123', hash);
  console.log('Verification:', check ? '✅ VALID' : '❌ INVALID');
}

createHash();