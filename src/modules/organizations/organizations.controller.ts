import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
  Logger,
  HttpStatus,
} from '@nestjs/common';
import { OrganizationsService } from './organizations.service';
import JwtTwoFactorGuard from '../auth/guards/jwtTwoFactor.guard';
import RoleGuard from '../auth/guards/role.guard';
import Role from 'src/common/role.enum';
import { CreateOrganizationDto } from './dto/CreateOrganization.dto';
import RequestWithUser from '../auth/dto/RequestWithUser.dto';
import { UpdateOrganizationDto } from './dto/UpdateOrganization.dto';
import { ResponseWithOrganization } from './dto/ResponseWithOrganization.dto';

@Controller('organizations')
@UseGuards(JwtTwoFactorGuard)
@UseGuards(RoleGuard(Role.Staff))
export class OrganizationsController {
  private readonly logger = new Logger(OrganizationsService.name);
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get(':id')
  async getOrganization(@Param('id') id: string) {
    return new ResponseWithOrganization(
      await this.organizationsService.getOrganization(id),
    );
  }

  @Post()
  async createOrganization(
    @Req() request: RequestWithUser,
    @Body() createOrganizationDto: CreateOrganizationDto,
  ) {
    const newOrganization = await this.organizationsService.createOrganization(
      createOrganizationDto,
      request.user,
    );
    this.logger.log(
      `${request.user.email} has created the organization ${newOrganization.name} with id ${newOrganization.id}`,
    );
    return new ResponseWithOrganization(newOrganization);
  }

  @Delete(':id')
  async deleteOrganization(
    @Req() request: RequestWithUser,
    @Param('id') id: string,
  ) {
    const httpStatus: HttpStatus =
      await this.organizationsService.deleteOrganization(id);
    if (httpStatus === HttpStatus.OK)
      this.logger.log(
        `${request.user.email} has deleted the organization  with id ${id}`,
      );
    return httpStatus;
  }

  @Patch(':id')
  async updateOrganization(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
    @Body() updateOrganizationDto: UpdateOrganizationDto,
  ) {
    const updatedOrganization =
      await this.organizationsService.updateOrganization(
        id,
        request.user,
        updateOrganizationDto,
      );

    this.logger.log(
      `${request.user.email} has created the organization ${updatedOrganization.name} with id ${updatedOrganization.id}`,
    );

    return new ResponseWithOrganization(updatedOrganization);
  }
}
