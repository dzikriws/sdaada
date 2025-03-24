import {
  Inject,
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool } from 'pg';
import { UserDTO } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async createUser(data: UserDTO) {
    const client = await this.pool.connect();
    try {
      await client.query('BEGIN');

      const query = `
        INSERT INTO users (username, email, password)
        VALUES ($1, $2, $3) RETURNING *;
      `;
      const values = [data.username, data.email, data.password];

      const result = await client.query(query, values);
      await client.query('COMMIT');

      return result.rows[0];
    } catch (error) {
      console.error('PostgreSQL Error Code:', error.code);
      await client.query('ROLLBACK');

      if (error.code === '23505') {
        throw new ConflictException({
          success: false,
          message: 'Username or email already exists',
          statusCode: 409,
        });
      }

      throw new InternalServerErrorException({
        success: false,
        message: 'An error occurred while creating the user',
        statusCode: 500,
      });
    } finally {
      client.release();
    }
  }

  async getAllUsers() {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users;');
      return result.rows;
    } finally {
      client.release();
    }
  }

  async getUserById(id: string) {
    const client = await this.pool.connect();
    try {
      const result = await client.query('SELECT * FROM users WHERE id = $1;', [
        id,
      ]);
      return result.rows[0];
    } finally {
      client.release();
    }
  }
}
