import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  UseGuards,
  Req,
  Logger,
} from '@nestjs/common';
import { FhirService } from './fhir.service';
import { CreateFhirPatientDto } from './dto/CreateFhirPatient.dto';
import { UpdateFhirPatientDto } from './dto/UpdateFhirPatient.dto';
import RoleGuard from '../auth/guards/role.guard';
import Role from 'src/common/role.enum';
import JwtTwoFactorGuard from '../auth/guards/jwtTwoFactor.guard';
import RequestWithUser from '../auth/dto/RequestWithUser.dto';
import { PatientDTO } from 'akinox-fhir-sdk';

@UseGuards(JwtTwoFactorGuard)
@UseGuards(RoleGuard(Role.User))
@Controller('fhir')
export class FhirController {
  private readonly logger = new Logger(FhirService.name);

  constructor(private readonly fhirService: FhirService) {}

  @Get('patient/:id')
  async findOne(
    @Param('id') id: string,
    @Req() request: RequestWithUser,
  ): Promise<PatientDTO> {
    const fhirPatient: PatientDTO = await this.fhirService.getFHIRPatient(
      id,
      request.user,
    );
    this.logger.log(
      `Patient ${fhirPatient.id} was accessed by user ${request.user.givenName} bearing id ${request.user.id}`,
    );
    return fhirPatient;
  }

  @Post('patient')
  async create(
    @Body() createFhirPatientDto: CreateFhirPatientDto,
    @Req() request: RequestWithUser,
  ): Promise<PatientDTO> {
    const newFhirPatient: PatientDTO = await this.fhirService.createFHIRPatient(
      createFhirPatientDto,
      request.user,
    );
    this.logger.log(
      `Patient ${newFhirPatient.id} was created by user ${request.user.givenName} bearing id ${request.user.id}`,
    );
    return newFhirPatient;
  }

  @Patch('patient/:id')
  async update(
    @Param('id') id: string,
    @Body() updateFhirPatientDto: UpdateFhirPatientDto,
    @Req() request: RequestWithUser,
  ): Promise<PatientDTO> {
    const updatedFhirPatient: PatientDTO =
      await this.fhirService.updateFhirPatient(
        id,
        updateFhirPatientDto,
        request.user,
      );
    this.logger.log(
      `Patient ${updatedFhirPatient.id} was updated by user ${request.user.givenName} bearing id ${request.user.id}`,
    );
    return updatedFhirPatient;
  }
}
