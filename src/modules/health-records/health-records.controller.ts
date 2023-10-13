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
import { HealthRecordsService } from './health-records.service';
import { CreateHealthRecordDto } from './dto/CreateHealthRecord.dto';
import { UpdateHealthRecordDto } from './dto/UpdateHealthRecord.dto';
import JwtTwoFactorGuard from '../auth/guards/jwtTwoFactor.guard';
import Role from 'src/common/role.enum';
import RoleGuard from '../auth/guards/role.guard';
import RequestWithUser from '../auth/dto/RequestWithUser.dto';
import { HealthRecord } from './entities/HealthRecord.entity';
import { ResponseWithHealthRecord } from './dto/ResponseWithHealthRecord.dto';

@Controller('health-records')
@UseGuards(JwtTwoFactorGuard)
@UseGuards(RoleGuard(Role.User))
export class HealthRecordsController {
  private readonly logger = new Logger(HealthRecordsService.name);
  constructor(private readonly healthRecordsService: HealthRecordsService) {}

  @Post()
  async create(
    @Body() createHealthRecordDto: CreateHealthRecordDto,
    @Req() request: RequestWithUser,
  ) {
    const newHealthRecord: HealthRecord =
      await this.healthRecordsService.create(
        createHealthRecordDto,
        request.user,
      );
    this.logger.log(
      `${request.user.email} has created a new health record ${
        newHealthRecord.id
      } for patient ${(await newHealthRecord.patient).id}`,
    );
    return new ResponseWithHealthRecord(
      newHealthRecord,
      createHealthRecordDto.patientId,
    );
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Req() request: RequestWithUser) {
    const healthRecord: HealthRecord = await this.healthRecordsService.findOne(
      id,
      request.user,
    );
    const patient = await healthRecord.patient;
    return new ResponseWithHealthRecord(healthRecord, patient.id);
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateHealthRecordDto: UpdateHealthRecordDto,
    @Req() request: RequestWithUser,
  ) {
    const updatedHealthRecord: HealthRecord =
      await this.healthRecordsService.update(
        id,
        updateHealthRecordDto,
        request.user,
      );
    this.logger.log(
      `${request.user.email} has updated health record ${
        updatedHealthRecord.id
      } for patient ${(await updatedHealthRecord.patient).id}`,
    );
    return new ResponseWithHealthRecord(
      updatedHealthRecord,
      updateHealthRecordDto.patientId,
    );
  }

  @Delete(':id')
  async remove(@Param('id') id: string, @Req() request: RequestWithUser) {
    const httpStatus: HttpStatus = await this.healthRecordsService.remove(
      id,
      request.user,
    );
    if (httpStatus === HttpStatus.OK) {
      this.logger.log(`${request.user.email} has deleted health record ${id}.`);
    }
    return httpStatus;
  }
}
