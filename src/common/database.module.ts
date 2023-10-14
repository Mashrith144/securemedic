import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { Organization } from 'src/modules/organizations/entities/organization.entity';
import { User } from 'src/modules/auth/entities/user.entity';
import { Session } from 'src/modules/auth/entities/session.entity';
import { Patient } from 'src/modules/patients/entities/patient.entity';
import { PatientAccess } from 'src/modules/patients/entities/patientAccess.entity';
import { HealthRecord } from 'src/modules/health-records/entities/HealthRecord.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('MYSQL_HOST'),
        port: configService.get('MYSQL_PORT'),
        username: configService.get('MYSQL_USER'),
        password: configService.get('MYSQL_PASSWORD'),
        database: configService.get('MYSQL_DB'),
        ssl: {
          rejectUnauthorized: true,
        },
        connectorPackage: 'mysql2',
        verboseRetryLog: true,
        driver: require('mysql2'),
        entities: [
          Organization,
          User,
          Session,
          Patient,
          PatientAccess,
          HealthRecord,
        ],
        synchronize: false,
      }),
    }),
  ],
})
export class DatabaseModule {}
