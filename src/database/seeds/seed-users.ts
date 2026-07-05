/**
 * Dev seed: inserts 10 sample users covering all roles, providers, and statuses.
 * Safe to run multiple times — skips existing emails.
 *
 * Usage:
 *   pnpm db:seed:users
 */

import 'dotenv/config';
import * as bcrypt from 'bcrypt';
import * as path from 'path';
import { DataSource } from 'typeorm';

const DEV_PASSWORD = 'Password123!';
const BCRYPT_ROUNDS = 12;

const SEED_DATA = [
  {
    name: 'Alice Johnson',
    email: 'alice.johnson@hotel.dev',
    role: 'owner',
    authProvider: 'local',
    emailVerified: true,
    isBlocked: false,
  },
  {
    name: 'Bob Smith',
    email: 'bob.smith@hotel.dev',
    role: 'user',
    authProvider: 'local',
    emailVerified: true,
    isBlocked: false,
  },
  {
    name: 'Carol White',
    email: 'carol.white@hotel.dev',
    role: 'employee',
    authProvider: 'local',
    emailVerified: true,
    isBlocked: false,
  },
  {
    name: 'David Brown',
    email: 'david.brown@gmail.dev',
    role: 'user',
    authProvider: 'google',
    emailVerified: true,
    isBlocked: false,
  },
  {
    name: 'Emma Davis',
    email: 'emma.davis@facebook.dev',
    role: 'user',
    authProvider: 'facebook',
    emailVerified: true,
    isBlocked: false,
  },
  {
    name: 'Frank Miller',
    email: 'frank.miller@hotel.dev',
    role: 'user',
    authProvider: 'local',
    emailVerified: true,
    isBlocked: true,
  },
  {
    name: 'Grace Wilson',
    email: 'grace.wilson@hotel.dev',
    role: 'user',
    authProvider: 'local',
    emailVerified: false,
    isBlocked: false,
  },
  {
    name: 'Henry Moore',
    email: 'henry.moore@hotel.dev',
    role: 'employee',
    authProvider: 'local',
    emailVerified: true,
    isBlocked: false,
  },
  {
    name: 'Isabelle Taylor',
    email: 'isabelle.taylor@gmail.dev',
    role: 'user',
    authProvider: 'google',
    emailVerified: true,
    isBlocked: false,
  },
  {
    name: 'Jack Anderson',
    email: 'jack.anderson@hotel.dev',
    role: 'user',
    authProvider: 'local',
    emailVerified: true,
    isBlocked: true,
  },
] as const;

async function main() {
  const dataSource = new DataSource({
    type: 'postgres',
    url: process.env.DATABASE_URL,
    entities: [path.join(__dirname, '../../modules/**/*.entity.{ts,js}')],
    synchronize: false,
    logging: false,
  });

  await dataSource.initialize();
  console.log('✔ Connected to database\n');

  const repo = dataSource.getRepository('User');
  const localHash = await bcrypt.hash(DEV_PASSWORD, BCRYPT_ROUNDS);

  let created = 0;
  let skipped = 0;

  for (const data of SEED_DATA) {
    const exists = await repo.findOne({ where: { email: data.email } });

    if (exists) {
      console.log(`  skip    ${data.email}`);
      skipped++;
      continue;
    }

    const passwordHash = data.authProvider === 'local' ? localHash : null;

    await repo.save({
      ...data,
      passwordHash,
      permissions: [],
    });

    const tag = `[${data.role}]`.padEnd(10);
    console.log(`  create  ${tag}  ${data.email}`);
    created++;
  }

  console.log(`\nDone — ${created} created, ${skipped} skipped.`);
  if (created > 0) {
    console.log(`Dev password for all local accounts: ${DEV_PASSWORD}`);
  }

  await dataSource.destroy();
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
