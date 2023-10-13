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
import { PatientsService } from './patients.service';
import { CreatePatientDto } from './dto/CreatePatient.dto';
import { UpdatePatientDto } from './dto/UpdatePatient.dto';
import JwtTwoFactorGuard from '../auth/guards/jwtTwoFactor.guard';
import RoleGuard from '../auth/guards/role.guard';
import Role from 'src/common/role.enum';
import RequestWithUser from '../auth/dto/RequestWithUser.dto';
import { GrantPatientAccessDto } from './dto/GrantPatientAccess.dto';
import { Patient } from './entities/patient.entity';
import { ResponseWithPatient } from './dto/ResponseWithPatient.dto';

@Controller('patients')
@UseGuards(JwtTwoFactorGuard)
@UseGuards(RoleGuard(Role.User))
export class PatientsController {
  private readonly logger = new Logger(PatientsService.name);
  constructor(private readonly patientsService: PatientsService) {}

  @Post()
  async create(
    @Body() createPatientDto: CreatePatientDto,
    @Req() request: RequestWithUser,
  ) {
    const newPatient: Patient = await this.patientsService.create(
      createPatientDto,
      request.user,
    );
    this.logger.log(
      `${request.user.email} has created a new patient ${newPatient.givenName} with id ${newPatient.id}`,
    );
    return new ResponseWithPatient(newPatient);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: RequestWithUser) {
    return new ResponseWithPatient(
      await this.patientsService.findOne(id, request.user),
    );
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updatePatientDto: UpdatePatientDto,
    @Req() request: RequestWithUser,
  ) {
    const updatedPatient = await this.patientsService.update(
      id,
      updatePatientDto,
      request.user,
    );
    this.logger.log(
      `${request.user.email} has updated patient ${updatedPatient.givenName} with id ${updatedPatient.id}`,
    );
    return new ResponseWithPatient(updatedPatient);
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    const httpStatus: HttpStatus = await this.patientsService.remove(
      id,
      request.user,
    );
    if (httpStatus === HttpStatus.OK) {
      this.logger.log(
        `${request.user.email} has deleted patient with id ${id}`,
      );
    }
    return httpStatus;
  }

  @Post('grant-access')
  async grantAccess(
    @Body() grantPatientAccess: GrantPatientAccessDto,
    @Req() request: RequestWithUser,
  ) {
    await this.patientsService.grantPatientAccess(
      grantPatientAccess,
      request.user,
    );
    this.logger.log(
      `${grantPatientAccess.userId} was granted access to patient ${grantPatientAccess.patientId} by ${request.user.email}`,
    );
    request.res.status(200).json('OK');
  }
}
