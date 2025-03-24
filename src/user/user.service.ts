import { Injectable } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { UserDTO, userSchema } from './user.schema';
import { Logger } from 'nestjs-pino';

@Injectable()
export class UserService {
  constructor(
    private userRepository: UserRepository,
    private logger: Logger,
  ) {}

  async createUser(data: UserDTO) {
    const parsedData = userSchema.parse(data);
    this.logger.log({ message: 'User created', user: parsedData });
    return await this.userRepository.createUser(parsedData);
  }

  async getAllUsers() {
    this.logger.log({ message: 'Get all users' });
    return await this.userRepository.getAllUsers();
  }

  async getUserById(id: string | number) {
    this.logger.log({ message: `Get user with id ${id}` });
    return await this.userRepository.getUserById(id);
  }

  async updateUser(id: string | number, data: UserDTO) {
    const parsedData = userSchema.parse(data);
    this.logger.log({ message: `Update user with id ${typeof id === 'number' ? id : parseInt(id)}`, user: parsedData });
    return await this.userRepository.updateUser(id, parsedData);
  }

  async deleteUser(id: string | number) {
    this.logger.log({ message: `Delete user with id ${id}` });
    return await this.userRepository.deleteUser(id);
  }
}
