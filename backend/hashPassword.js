
import bcrypt from 'bcryptjs';
import readline from 'node:readline';

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

rl.question('Enter your new staff password: ', async (password) => {
  try {
    if (password.length < 10) {
      console.log('Password must contain at least 10 characters.');
    } else {
      const hash = await bcrypt.hash(password, 12);

      console.log('\nYour password hash is:\n');
      console.log(hash);
      console.log('\nCopy this hash into your .env file.');
    }
  } catch (error) {
    console.error('Could not generate password hash:', error);
  } finally {
    rl.close();
  }
});
