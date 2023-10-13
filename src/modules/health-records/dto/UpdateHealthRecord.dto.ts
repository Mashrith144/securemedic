import { PartialType } from '@nestjs/mapped-types';
import { CreateHealthRecordDto } from './CreateHealthRecord.dto';

export class UpdateHealthRecordDto extends PartialType(CreateHealthRecordDto) {}
