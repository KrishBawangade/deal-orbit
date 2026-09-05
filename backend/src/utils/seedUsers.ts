import bcrypt from 'bcryptjs';
import { Role } from '@prisma/client';
import { prisma } from '../config/database';

export interface IDemoUserSeed {
  email: string;
  name: string;
  role: Role;
  passwordPlainText: string;
  historicalAvgDiscount?: number;
}

export const DEMO_USERS_SEED: IDemoUserSeed[] = [
  {
    email: 'sales.rep@dealorbit.io',
    name: 'Sarah Jenkins',
    role: Role.SALES_REP,
    passwordPlainText: 'DealOrbit@123',
    historicalAvgDiscount: 8.5,
  },
  {
    email: 'sales.manager@dealorbit.io',
    name: 'Marcus Vance',
    role: Role.SALES_MANAGER,
    passwordPlainText: 'DealOrbit@123',
    historicalAvgDiscount: 14.2,
  },
  {
    email: 'finance.ops@dealorbit.io',
    name: 'Elena Rostova',
    role: Role.FINANCE_OPS,
    passwordPlainText: 'DealOrbit@123',
    historicalAvgDiscount: 0.0,
  },
  {
    email: 'admin@dealorbit.io',
    name: 'Alex Rivera',
    role: Role.ADMIN,
    passwordPlainText: 'DealOrbit@123',
    historicalAvgDiscount: 0.0,
  },
  {
    email: 'customer.acme@dealorbit.io',
    name: 'David Chen',
    role: Role.CUSTOMER,
    passwordPlainText: 'DealOrbit@123',
    historicalAvgDiscount: 0.0,
  },
];

export const seedUsersData = async (): Promise<void> => {
  console.log('🌱 Seeding 5 Persona Users for DealOrbit Authentication...');

  const salt = await bcrypt.genSalt(10);

  for (const user of DEMO_USERS_SEED) {
    const passwordHash = await bcrypt.hash(user.passwordPlainText, salt);

    const record = await prisma.user.upsert({
      where: { email: user.email.toLowerCase() },
      update: {
        name: user.name,
        role: user.role,
        passwordHash,
        isActive: true,
        historicalAvgDiscount: user.historicalAvgDiscount ?? 0.0,
      },
      create: {
        email: user.email.toLowerCase(),
        name: user.name,
        role: user.role,
        passwordHash,
        isActive: true,
        historicalAvgDiscount: user.historicalAvgDiscount ?? 0.0,
      },
    });

    console.log(`   ✓ Seeded User: ${record.email} | Role: ${record.role} | Name: ${record.name}`);
  }

  console.log('✅ User Seeding Complete!\n');
};

// If run directly via CLI
if (require.main === module) {
  seedUsersData()
    .catch((err) => {
      console.error('❌ User Seeding Failed:', err);
      process.exit(1);
    })
    .finally(async () => {
      await prisma.$disconnect();
    });
}
