import {
  Inject,
  Injectable,
  ConflictException,
  InternalServerErrorException,
} from '@nestjs/common';
import { Pool, PoolClient } from 'pg';
import { UserDTO } from './user.schema';

@Injectable()
export class UserRepository {
  constructor(@Inject('PG_POOL') private pool: Pool) {}

  async createUser(data: UserDTO) {
    let client: PoolClient | null = null;

    try {
      client = await this.pool.connect();
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
      if (client) {
        await client.query('ROLLBACK');
      }

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
      if (client) {
        client.release();
      }
    }
  }

  async getAllUsers() {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      const result = await client.query('SELECT * FROM users;');
      return result.rows;
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async getUserById(id: string | number) {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      const result = await client.query('SELECT * FROM users WHERE id = $1;', [
        id,
      ]);
      return result.rows[0];
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async updateUser(id: string | number, data: UserDTO) {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');
      const query = `
        UPDATE users
        SET username = $1, email = $2, password = $3
        WHERE id = $4
        RETURNING *;
      `;
      const values = [data.username, data.email, data.password, id];

      const result = await client.query(query, values);

      await client.query('COMMIT');
      return result.rows[0];
    } catch (error) {
      console.error('PostgreSQL Error Code:', error.code);
      if (client) {
        await client.query('ROLLBACK');
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }

  async deleteUser(id: string | number) {
    let client: PoolClient | null = null;
    try {
      client = await this.pool.connect();
      await client.query('BEGIN');
      const result = await client.query('DELETE FROM users WHERE id = $1;', [
        id,
      ]);
      await client.query('COMMIT');
      return result.rowCount;
    } catch (error) {
      console.error('PostgreSQL Error Code:', error.code);
      if (client) {
        await client.query('ROLLBACK');
      }

      if (error.code === '23503') {
        throw new ConflictException({
          success: false,
          message: 'User not found',
          statusCode: 404,
        });
      }
    } finally {
      if (client) {
        client.release();
      }
    }
  }
}
