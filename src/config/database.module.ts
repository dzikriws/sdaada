import { Module } from '@nestjs/common';
import { Pool } from 'pg';
import { ConfigModule, ConfigService } from '@nestjs/config';

export const PG_POOL = 'PG_POOL';

@Module({
  imports: [ConfigModule], // Tambahkan ini agar ConfigService tersedia
  providers: [
    {
      provide: PG_POOL,
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => {
        const pool = new Pool({
          user: configService.get<string>('DB_USER', 'postgres'),
          host: configService.get<string>('DB_HOST', 'localhost'),
          database: configService.get<string>('DB_NAME', 'test'),
          password: configService.get<string>('DB_PASS', 'postgres'),
          port: configService.get<number>('DB_PORT', 5432),
          max: 10,
          connectionTimeoutMillis: 5000,
        });

        return pool;
      },
    },
  ],
  exports: [PG_POOL],
})
export class DatabaseModule {}
