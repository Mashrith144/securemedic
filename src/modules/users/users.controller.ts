import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  Req,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/CreateUser.dto';
import { UpdateUserDto } from './dto/UpdateUser.dto';
import JwtTwoFactorGuard from '../auth/guards/jwtTwoFactor.guard';
import Role from 'src/common/role.enum';
import RoleGuard from '../auth/guards/role.guard';
import RequestWithUser from '../auth/dto/RequestWithUser.dto';
import { User } from '../auth/entities/user.entity';
import { ResponseWithUser } from '../auth/dto/ResponseWithUser.dto';

@Controller('users')
@UseGuards(JwtTwoFactorGuard)
@UseGuards(RoleGuard(Role.Admin))
export class UsersController {
  private readonly logger = new Logger(UsersService.name);
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(
    @Body() createUserDto: CreateUserDto,
    @Req() request: RequestWithUser,
  ) {
    const newUser: User = await this.usersService.create(
      createUserDto,
      request.user,
    );
    this.logger.log(
      `${request.user.email} has created a new user ${newUser.givenName} with id ${newUser.id}`,
    );
    return new ResponseWithUser(newUser);
  }

  @Patch('approve/:id')
  async approve(@Param('id') id: string, @Req() request: RequestWithUser) {
    const approvedUser: User = await this.usersService.approveUser(
      id,
      request.user,
    );
    this.logger.log(
      `${request.user.email} has approved a new user ${approvedUser.givenName} with id ${approvedUser.id}`,
    );
    return new ResponseWithUser(approvedUser);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: RequestWithUser) {
    return new ResponseWithUser(
      await this.usersService.findOne(id, request.user),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
    @Req() request: RequestWithUser,
  ) {
    const updatedUser: User = await this.usersService.update(
      id,
      updateUserDto,
      request.user,
    );

    this.logger.log(
      `${request.user.email} has updated user ${updatedUser.givenName} with id ${updatedUser.id}`,
    );
    return new ResponseWithUser(updatedUser);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    const httpStatus: HttpStatus = await this.usersService.remove(
      id,
      request.user,
    );
    if (httpStatus === HttpStatus.OK) {
      this.logger.log(`${request.user.email} has deleted user with id ${id}`);
    }
    return httpStatus;
  }
}
