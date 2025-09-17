import { PrismaClient } from '../generated/client';
import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from root directory
config({ path: resolve(__dirname, '../../../../.env') });

const prisma = new PrismaClient({
  datasourceUrl: process.env.DATABASE_URL,
});

// Core permissions mapping based on microservice resources
const CORE_PERMISSIONS = [
  // Authentication & Profile
  { resource: 'auth', action: 'login', description: 'Login to the system' },
  { resource: 'auth', action: 'logout', description: 'Logout from the system' },
  {
    resource: 'auth',
    action: 'refresh',
    description: 'Refresh authentication token',
  },
  { resource: 'profile', action: 'read', description: 'View own profile' },
  { resource: 'profile', action: 'update', description: 'Update own profile' },

  // Staff Management (Accounts Service)
  {
    resource: 'staff',
    action: 'create',
    description: 'Create new staff account',
  },
  { resource: 'staff', action: 'read', description: 'View staff accounts' },
  { resource: 'staff', action: 'update', description: 'Update staff accounts' },
  { resource: 'staff', action: 'delete', description: 'Delete staff accounts' },
  {
    resource: 'staff',
    action: 'manage',
    description: 'Full staff management access',
  },

  // Patient Management (Accounts Service)
  {
    resource: 'patients',
    action: 'create',
    description: 'Create patient records',
  },
  { resource: 'patients', action: 'read', description: 'View patient records' },
  {
    resource: 'patients',
    action: 'update',
    description: 'Update patient records',
  },
  {
    resource: 'patients',
    action: 'delete',
    description: 'Delete patient records',
  },

  // Appointments Management (Booking Service)
  {
    resource: 'appointments',
    action: 'create',
    description: 'Create appointments',
  },
  {
    resource: 'appointments',
    action: 'read',
    description: 'View appointments',
  },
  {
    resource: 'appointments',
    action: 'update',
    description: 'Update appointments',
  },
  {
    resource: 'appointments',
    action: 'delete',
    description: 'Cancel/delete appointments',
  },
  {
    resource: 'appointments',
    action: 'manage',
    description: 'Full appointment management',
  },

  // Provider Directory Management
  {
    resource: 'doctors',
    action: 'create',
    description: 'Create doctor profiles',
  },
  { resource: 'doctors', action: 'read', description: 'View doctor profiles' },
  {
    resource: 'doctors',
    action: 'update',
    description: 'Update doctor profiles',
  },
  {
    resource: 'doctors',
    action: 'delete',
    description: 'Delete doctor profiles',
  },

  {
    resource: 'specialties',
    action: 'create',
    description: 'Create specialties',
  },
  { resource: 'specialties', action: 'read', description: 'View specialties' },
  {
    resource: 'specialties',
    action: 'update',
    description: 'Update specialties',
  },
  {
    resource: 'specialties',
    action: 'delete',
    description: 'Delete specialties',
  },

  {
    resource: 'work-locations',
    action: 'create',
    description: 'Create work locations',
  },
  {
    resource: 'work-locations',
    action: 'read',
    description: 'View work locations',
  },
  {
    resource: 'work-locations',
    action: 'update',
    description: 'Update work locations',
  },
  {
    resource: 'work-locations',
    action: 'delete',
    description: 'Delete work locations',
  },

  {
    resource: 'schedules',
    action: 'create',
    description: 'Create doctor schedules',
  },
  {
    resource: 'schedules',
    action: 'read',
    description: 'View doctor schedules',
  },
  {
    resource: 'schedules',
    action: 'update',
    description: 'Update doctor schedules',
  },
  {
    resource: 'schedules',
    action: 'delete',
    description: 'Delete doctor schedules',
  },

  // Content Management
  { resource: 'blogs', action: 'create', description: 'Create blog posts' },
  { resource: 'blogs', action: 'read', description: 'View blog posts' },
  { resource: 'blogs', action: 'update', description: 'Update blog posts' },
  { resource: 'blogs', action: 'delete', description: 'Delete blog posts' },
  { resource: 'blogs', action: 'publish', description: 'Publish blog posts' },

  {
    resource: 'questions',
    action: 'create',
    description: 'Create Q&A questions',
  },
  { resource: 'questions', action: 'read', description: 'View Q&A questions' },
  {
    resource: 'questions',
    action: 'update',
    description: 'Update Q&A questions',
  },
  {
    resource: 'questions',
    action: 'delete',
    description: 'Delete Q&A questions',
  },
  { resource: 'questions', action: 'answer', description: 'Answer questions' },

  // Notifications
  {
    resource: 'notifications',
    action: 'send',
    description: 'Send notifications',
  },
  {
    resource: 'notifications',
    action: 'read',
    description: 'View notifications',
  },
  {
    resource: 'notifications',
    action: 'manage',
    description: 'Manage notification settings',
  },

  // System Administration
  {
    resource: 'system',
    action: 'admin',
    description: 'System administration access',
  },
  {
    resource: 'permissions',
    action: 'manage',
    description: 'Manage user permissions',
  },
  { resource: 'groups', action: 'manage', description: 'Manage user groups' },
];

// Default groups based on current roles
const DEFAULT_GROUPS = [
  {
    name: 'super_admin',
    description: 'Super Administrator with full system access',
    tenantId: 'global', // Use 'global' instead of null
  },
  {
    name: 'admin',
    description: 'Administrator with management access',
    tenantId: 'global',
  },
  {
    name: 'doctor',
    description: 'Doctor with patient care access',
    tenantId: 'global',
  },
];

// Role-based permission mapping
const ROLE_PERMISSION_MAPPING = {
  SUPER_ADMIN: [
    // Full system access
    'system:admin',
    'permissions:manage',
    'groups:manage',
    'staff:manage',
    'patients:*',
    'appointments:manage',
    'doctors:*',
    'specialties:*',
    'work-locations:*',
    'schedules:*',
    'blogs:*',
    'questions:*',
    'notifications:*',
  ],
  ADMIN: [
    // Management access without system admin
    'staff:read',
    'staff:update',
    'patients:*',
    'appointments:manage',
    'doctors:*',
    'specialties:read',
    'specialties:update',
    'work-locations:*',
    'schedules:*',
    'blogs:*',
    'questions:*',
    'notifications:send',
    'notifications:read',
  ],
  DOCTOR: [
    // Doctor-specific access
    'profile:read',
    'profile:update',
    'patients:read',
    'patients:update',
    'appointments:read',
    'appointments:update',
    'doctors:read',
    'schedules:read',
    'schedules:update', // Own schedules only
    'blogs:read',
    'questions:read',
    'questions:answer',
    'notifications:read',
  ],
};

export async function seedPermissions() {
  console.log('🌱 Seeding permissions...');

  try {
    // 1. Create core permissions
    console.log('Creating core permissions...');
    for (const permission of CORE_PERMISSIONS) {
      await prisma.permission.upsert({
        where: {
          resource_action: {
            resource: permission.resource,
            action: permission.action,
          },
        },
        update: {
          description: permission.description,
        },
        create: permission,
      });
    }

    // 2. Create default groups
    console.log('Creating default groups...');
    const createdGroups: Record<string, any> = {};
    for (const group of DEFAULT_GROUPS) {
      const createdGroup = await prisma.group.upsert({
        where: {
          name_tenantId: {
            name: group.name,
            tenantId: group.tenantId as any,
          },
        },
        update: {
          description: group.description,
        },
        create: group,
      });
      createdGroups[group.name] = createdGroup;
    }

    // 3. Assign permissions to groups
    console.log('Assigning permissions to groups...');
    for (const [roleName, permissions] of Object.entries(
      ROLE_PERMISSION_MAPPING,
    )) {
      const groupName = roleName.toLowerCase();
      const group = createdGroups[groupName];

      if (!group) continue;

      for (const permissionPattern of permissions) {
        const [resource, action] = permissionPattern.split(':');

        if (action === '*') {
          // Assign all permissions for this resource
          const resourcePermissions = await prisma.permission.findMany({
            where: { resource },
          });

          for (const permission of resourcePermissions) {
            await prisma.groupPermission.upsert({
              where: {
                groupId_permissionId: {
                  groupId: group.id,
                  permissionId: permission.id,
                },
              },
              update: {},
              create: {
                groupId: group.id,
                permissionId: permission.id,
                effect: 'ALLOW',
              },
            });
          }
        } else {
          // Assign specific permission
          const permission = await prisma.permission.findUnique({
            where: {
              resource_action: { resource, action },
            },
          });

          if (permission) {
            await prisma.groupPermission.upsert({
              where: {
                groupId_permissionId: {
                  groupId: group.id,
                  permissionId: permission.id,
                },
              },
              update: {},
              create: {
                groupId: group.id,
                permissionId: permission.id,
                effect: 'ALLOW',
              },
            });
          }
        }
      }
    }

    console.log('✅ Permissions seeded successfully!');

    // Summary
    const permissionCount = await prisma.permission.count();
    const groupCount = await prisma.group.count();
    const groupPermissionCount = await prisma.groupPermission.count();

    console.log(`📊 Summary:`);
    console.log(`  - Permissions: ${permissionCount}`);
    console.log(`  - Groups: ${groupCount}`);
    console.log(`  - Group Permissions: ${groupPermissionCount}`);
  } catch (error) {
    console.error('❌ Error seeding permissions:', error);
    throw error;
  }
}

export async function migrateExistingUsers() {
  console.log('🔄 Migrating existing users to permission system...');

  try {
    // Get all existing staff accounts
    const staffAccounts = await prisma.staffAccount.findMany({
      where: { deletedAt: null },
    });

    console.log(`Found ${staffAccounts.length} staff accounts to migrate`);

    for (const staff of staffAccounts) {
      // 1. Create auth version record
      await prisma.authVersion.upsert({
        where: { userId: staff.id },
        update: { version: 1 },
        create: {
          userId: staff.id,
          version: 1,
        },
      });

      // 2. Assign user to appropriate group based on role
      const groupName = staff.role.toLowerCase();
      const group = await prisma.group.findFirst({
        where: {
          name: groupName,
          tenantId: 'global',
        },
      });

      if (group) {
        await prisma.userGroup.upsert({
          where: {
            userId_groupId_tenantId: {
              userId: staff.id,
              groupId: group.id,
              tenantId: 'global',
            },
          },
          update: {},
          create: {
            userId: staff.id,
            groupId: group.id,
            tenantId: 'global',
          },
        });

        console.log(
          `✅ Migrated ${staff.email} (${staff.role}) to group ${groupName}`,
        );
      } else {
        console.warn(`⚠️  Group not found for role: ${staff.role}`);
      }
    }

    console.log('✅ User migration completed!');
  } catch (error) {
    console.error('❌ Error migrating users:', error);
    throw error;
  }
}

// Main seed function
export async function main() {
  try {
    await seedPermissions();
    await migrateExistingUsers();
  } catch (error) {
    console.error('Error in seed script:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  void main();
}
