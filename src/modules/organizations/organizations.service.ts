import {
  BadRequestException,
  HttpException,
  HttpStatus,
  Injectable,
} from '@nestjs/common';
import { Organization } from './entities/organization.entity';
import { DataSource, Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';
import { User } from '../auth/entities/user.entity';
import Role from 'src/common/role.enum';
import { hash } from 'bcrypt';
import { UpdateOrganizationDto } from './dto/UpdateOrganization.dto';
import { BCRYPT_SALT_HASH_ROUNDS } from 'src/common/constants';

@Injectable()
export class OrganizationsService {
  constructor(
    @InjectRepository(Organization)
    private organizationsRepository: Repository<Organization>,

    @InjectRepository(User)
    private usersRepository: Repository<User>,

    private dataSource: DataSource,
  ) {}

  async getOrganization(id: string) {
    try {
      const organization = await this.organizationsRepository.findOneByOrFail({
        id,
      });
      return organization;
    } catch (error) {
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    }
  }

  async deleteOrganization(id: string) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      const organization = await this.organizationsRepository.findOneByOrFail({
        id,
      });

      await queryRunner.manager.delete(Organization, organization.id);

      await queryRunner.commitTransaction();

      return HttpStatus.OK;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async updateOrganization(
    id: string,
    user: User,
    updateOrganizationDto: UpdateOrganizationDto,
  ): Promise<Organization> {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if the organization exists - if not, throw an error
      let organization = await this.organizationsRepository.findOneByOrFail({
        id,
      });

      // Update the organization in a transaction
      await queryRunner.manager.update(Organization, organization.id, {
        ...updateOrganizationDto,
        updatedBy: user,
      });

      await queryRunner.commitTransaction();

      organization = await this.organizationsRepository.findOneByOrFail({
        id,
      });

      return organization;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }

  async createAdmin(
    givenName: string,
    email: string,
    password: string,
    createdBy: User,
    organization: Organization,
    familyName?: string,
  ): Promise<User> {
    const user = new User();
    user.givenName = givenName;
    user.familyName = familyName;
    user.email = email;
    user.createdBy = createdBy;
    user.updatedBy = createdBy;
    user.organization = organization;
    user.role = Role.Admin;
    user.password = await hash(password, BCRYPT_SALT_HASH_ROUNDS);
    return user;
  }

  async createOrganization(
    createOrganizationDto: CreateOrganizationDto,
    user: User,
  ) {
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();
    try {
      // Check if an organization with the given domain exists
      const existingOrganization = await this.organizationsRepository.findOne({
        where: {
          domain: createOrganizationDto.domain,
        },
      });
      if (existingOrganization) {
        throw new BadRequestException(
          'Organization with that domain already exists',
        );
      }

      //   If it doesn't, create a new one
      const organization = this.organizationsRepository.create(
        createOrganizationDto,
      );
      organization.createdBy = user;
      organization.updatedBy = user;

      await queryRunner.manager.save(organization);

      // Once the organization has been created, create the admins for that organization
      let admin1 = await this.createAdmin(
        createOrganizationDto.admin1GivenName,
        createOrganizationDto.admin1Email,
        createOrganizationDto.admin1Password,
        user,
        organization,
        createOrganizationDto.admin1FamilyName,
      );

      let admin2 = await this.createAdmin(
        createOrganizationDto.admin2GivenName,
        createOrganizationDto.admin2Email,
        createOrganizationDto.admin2Password,
        user,
        organization,
        createOrganizationDto.admin2FamilyName,
      );

      admin1 = this.usersRepository.create(admin1);
      admin2 = this.usersRepository.create(admin2);

      await queryRunner.manager.save(admin1);
      await queryRunner.manager.save(admin2);

      await queryRunner.commitTransaction();

      return organization;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      throw new HttpException(error.message, HttpStatus.BAD_REQUEST);
    } finally {
      await queryRunner.release();
    }
  }
}
