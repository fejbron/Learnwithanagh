import 'dotenv/config';
import { query } from '../lib/db';
import bcrypt from 'bcryptjs';

async function main() {
  try {
    const newPassword = 'admin123';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Check if admin user exists
    const existingUser = await query(
      'SELECT id, email FROM "User" WHERE email = $1',
      ['admin@learnwithanagh.com']
    );

    if (existingUser.rows.length === 0) {
      console.log('❌ Admin user not found. Run npm run db:seed first.');
      return;
    }

    // Update the admin user's password
    await query(
      `UPDATE "User" SET password = $1, "updatedAt" = NOW() WHERE email = $2`,
      [hashedPassword, 'admin@learnwithanagh.com']
    );

    console.log('✅ Admin password reset successfully!');
    console.log('Email: admin@learnwithanagh.com');
    console.log('Password: admin123');
    console.log('⚠️  IMPORTANT: Change the default password in production!');
  } catch (error) {
    console.error('❌ Error resetting password:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('Password reset completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Password reset failed:', error);
    process.exit(1);
  });
