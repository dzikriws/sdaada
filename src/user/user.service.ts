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
    return await this.userRepository.getAllUsers();
  }

  async getUserById(id: string) {
    return await this.userRepository.getUserById(id);
  }
}
