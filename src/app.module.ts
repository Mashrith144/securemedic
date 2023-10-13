import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import * as Joi from '@hapi/joi';
import { DatabaseModule } from './common/database.module';
import { AuthModule } from './modules/auth/auth.module';
import { TwoFactorAuthenticationModule } from './modules/two-factor-authentication/two-factor-authentication.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { UsersModule } from './modules/users/users.module';
import { PatientsModule } from './modules/patients/patients.module';
import { HealthRecordsModule } from './modules/health-records/health-records.module';
import { FhirModule } from './modules/fhir/fhir.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      validationSchema: Joi.object({
        MYSQL_HOST: Joi.string().required(),
        MYSQL_PORT: Joi.number().required(),
        MYSQL_USER: Joi.string().required(),
        MYSQL_PASSWORD: Joi.string().required(),
        MYSQL_DB: Joi.string().required(),
        APPLICATION_PORT: Joi.number(),
        JWT_ACCESS_TOKEN_SECRET: Joi.string().required(),
        JWT_ACCESS_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        JWT_REFRESH_TOKEN_SECRET: Joi.string().required(),
        JWT_REFRESH_TOKEN_EXPIRATION_TIME: Joi.string().required(),
        TWO_FACTOR_AUTHENTICATION_APP_NAME: Joi.string().required(),
      }),
    }),
    DatabaseModule,
    AuthModule,
    TwoFactorAuthenticationModule,
    OrganizationsModule,
    UsersModule,
    PatientsModule,
    HealthRecordsModule,
    FhirModule,
  ],
  providers: [ConfigService],
})
export class AppModule {}
