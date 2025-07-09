import bcrypt from 'bcryptjs';

// Generate a hashed password
const generateHashedPassword = async (password) => {
  const salt = await bcrypt.genSalt(10);
  const hash = await bcrypt.hash(password, salt);
  console.log(`Password: ${password}`);
  console.log(`Hash: ${hash}`);
  return hash;
};

// Example usage
if (process.argv[2]) {
  generateHashedPassword(process.argv[2]);
} else {
  console.log('Usage: node generatePassword.js <password>');
  console.log('Example: node generatePassword.js admin123');
}

export default generateHashedPassword;