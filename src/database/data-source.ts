import 'dotenv/config';
import * as path from 'path';
import { DataSource } from 'typeorm';

// Used by TypeORM CLI for generating and running migrations.
// The app itself uses TypeOrmModule.forRootAsync in app.module.ts.
const AppDataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [path.join(__dirname, '../modules/**/*.entity.{ts,js}')],
  migrations: [path.join(__dirname, 'migrations/*.{ts,js}')],
  synchronize: false,
});

export default AppDataSource;
