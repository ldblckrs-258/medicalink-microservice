import { NestFactory } from '@nestjs/core';
import * as bcrypt from 'bcrypt';
import { AccountsServiceModule } from '../src/accounts-service.module';
import { AuthRepository } from '../src/auth/auth.repository';
import { PrismaService } from '../prisma/prisma.service';
import { config } from 'dotenv';

// Load environment variables
config({ path: '../../.env' });

async function createSuperAdmin() {
  console.log('🚀 Creating super admin account...');

  // Check environment variables before creating app
  const requiredEnvVars = [
    'DATABASE_URL',
    'SUPER_ADMIN_EMAIL',
    'SUPER_ADMIN_PASSWORD',
  ];
  const missingVars = requiredEnvVars.filter(
    (varName) => !process.env[varName],
  );

  if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:');
    missingVars.forEach((varName) => {
      console.error(`   - ${varName}`);
    });
    console.error(
      '\nPlease check your .env file and ensure all required variables are set.',
    );
    console.error('You can copy .env.example to .env and update the values.');
    process.exit(1);
  }

  // Create NestJS application context with minimal configuration
  const app = await NestFactory.createApplicationContext(
    AccountsServiceModule,
    {
      logger: ['error'], // Only show errors to keep output clean
    },
  );

  try {
    const authRepository = app.get(AuthRepository);
    const prismaService = app.get(PrismaService);

    // Get credentials from environment variables
    const email = process.env.SUPER_ADMIN_EMAIL!;
    const password = process.env.SUPER_ADMIN_PASSWORD!;
    const fullName = process.env.SUPER_ADMIN_FULL_NAME || 'Super Admin';

    console.log(`📧 Email: ${email}`);
    console.log(`👤 Full Name: ${fullName}`);

    // Check if super admin already exists
    const existingAdmin = await authRepository.findByEmail(email);
    if (existingAdmin) {
      console.log('⚠️  Super admin with this email already exists!');
      console.log(`   ID: ${existingAdmin.id}`);
      console.log(`   Role: ${existingAdmin.role}`);

      // Update role to SUPER_ADMIN if needed
      if (existingAdmin.role !== 'SUPER_ADMIN') {
        console.log('🔄 Updating role to SUPER_ADMIN...');
        await prismaService.staffAccount.update({
          where: { id: existingAdmin.id },
          data: { role: 'SUPER_ADMIN' },
        });
        console.log('✅ Role updated successfully!');
      } else {
        console.log('✅ User already has SUPER_ADMIN role!');
      }

      return;
    }

    // Hash password
    console.log('🔒 Hashing password...');
    const passwordHash = await bcrypt.hash(password, 10);

    // Create super admin account
    console.log('👤 Creating super admin account...');
    const superAdmin = await authRepository.create({
      fullName,
      email,
      passwordHash,
      role: 'SUPER_ADMIN',
      phone: null,
      isMale: null,
      dateOfBirth: null,
    });

    console.log('✅ Super admin account created successfully!');
    console.log(`   ID: ${superAdmin.id}`);
    console.log(`   Email: ${superAdmin.email}`);
    console.log(`   Full Name: ${superAdmin.fullName}`);
    console.log(`   Role: ${superAdmin.role}`);
    console.log(`   Created At: ${superAdmin.createdAt?.toDateString()}`);
  } catch (error) {
    console.error('❌ Error creating super admin:');

    if (error.code === 'P1012') {
      console.error('   Missing DATABASE_URL environment variable');
      console.error('   Please check your .env file');
    } else if (error.code === 'P1001') {
      console.error('   Cannot connect to database');
      console.error(
        '   Please check your DATABASE_URL and ensure database is running',
      );
    } else if (error.code === 'ECONNREFUSED') {
      console.error(
        '   Connection refused - check if the database/Redis is running',
      );
    } else {
      console.error(`   ${error.message}`);
    }

    process.exit(1);
  } finally {
    // Clean up
    await app.close();
  }
}

// Run the script
createSuperAdmin()
  .then(() => {
    console.log('🎉 Script completed successfully!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('💥 Script failed:', error.message);
    process.exit(1);
  });
