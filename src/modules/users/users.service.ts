import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { User } from '../auth/entities/user.entity';
import { hash } from 'bcrypt';
import { BCRYPT_SALT_HASH_ROUNDS } from 'src/common/constants';
import Role from 'src/common/role.enum';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private dataSource: DataSource,
  ) {}

  async create(createUserDto: CreateUserDto, requester: User) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if a user with that email already exists
      const existingUser = await this.usersRepository.findOneBy({
        email: createUserDto.email,
      });
      if (existingUser) {
        throw new BadRequestException('User with that email already exists');
      }

      const newUser: User = this.usersRepository.create(createUserDto);
      newUser.createdBy = requester;
      newUser.organization = await requester.organization;
      newUser.password = await hash(
        createUserDto.password,
        BCRYPT_SALT_HASH_ROUNDS,
      );

      await queryRunner.manager.save(newUser);
      await queryRunner.commitTransaction();

      return newUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async findOne(id: string, requester: User) {
    try {
      const requesterOrganization = await requester.organization;
      const user = await this.usersRepository.findOneByOrFail({
        id,
        organization: {
          id: requesterOrganization.id,
        },
      });
      return user;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async update(id: string, updateUserDto: UpdateUserDto, requester: User) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if a user with that email already exists
      const requesterOrganization = await requester.organization;
      let existingUser = await this.usersRepository.findOneByOrFail({
        id,
        organization: {
          id: requesterOrganization.id,
        },
      });

      // Update the organization in a transaction
      await queryRunner.manager.update(User, existingUser.id, {
        ...updateUserDto,
        ...(updateUserDto.password
          ? {
              password: await hash(
                updateUserDto.password,
                BCRYPT_SALT_HASH_ROUNDS,
              ),
            }
          : {}),
        updatedBy: requester,
      });

      await queryRunner.commitTransaction();

      existingUser = await this.usersRepository.findOneByOrFail({
        id,
      });

      return existingUser;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async remove(id: string, requester: User) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const requesterOrganization = await requester.organization;

      const user = await this.usersRepository.findOneByOrFail({
        id,
        organization: {
          id: requesterOrganization.id,
        },
      });

      await queryRunner.manager.delete(User, user.id);

      await queryRunner.commitTransaction();

      return HttpStatus.OK;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async approveUser(id: string, requester: User) {
    try {
      const requesterOrganization = await requester.organization;

      const existingUser = await this.usersRepository.findOneByOrFail({
        id,
        organization: {
          id: requesterOrganization.id,
        },
      });

      const existingUserCreatedBy = await existingUser.createdBy;

      if (!existingUser) {
        throw new BadRequestException('User with that id does not exist');
      } else if (existingUser?.role) {
        throw new BadRequestException(
          'You cannot approve a user who has already been approved',
        );
      } else if (existingUserCreatedBy.id === requester.id) {
        throw new BadRequestException(
          'You cannot approve a user created by yourself ',
        );
      }

      // Setting a role approves the user
      existingUser.role = Role.User;
      existingUser.updatedBy = requester;
      await this.usersRepository.save(existingUser);

      return existingUser;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }
}
