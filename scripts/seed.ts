import { query } from '../lib/db';
import bcrypt from 'bcryptjs';
import { generateId } from '../lib/id';

async function main() {
  try {
    const hashedPassword = await bcrypt.hash('admin123', 10);
    const adminId = generateId();

    // Check if admin user already exists
    const existingUser = await query(
      'SELECT id FROM "User" WHERE email = $1',
      ['admin@learnwithanagh.com']
    );

    if (existingUser.rows.length > 0) {
      console.log('Admin user already exists');
      return;
    }

    // Create admin user
    await query(
      `INSERT INTO "User" (id, email, password, name, role, "createdAt", "updatedAt")
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())`,
      [adminId, 'admin@learnwithanagh.com', hashedPassword, 'Admin User', 'admin']
    );

    console.log('Admin user created successfully');
    console.log('Email: admin@learnwithanagh.com');
    console.log('Password: admin123');
    console.log('⚠️  IMPORTANT: Change the default password in production!');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
}

main()
  .then(() => {
    console.log('Seeding completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Seeding failed:', error);
    process.exit(1);
  });
