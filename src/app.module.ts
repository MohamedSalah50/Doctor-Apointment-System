import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { resolve } from 'node:path';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { SharedAutnenticationModule } from './common/modules/autnentication.module';
import { CommonModule } from './common';
import { PatientModule } from './modules/patient/patient.module';
import { ClinicModule } from './modules/clinic/clinic.module';
import { DoctorsModule } from './modules/doctors/doctors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      envFilePath: resolve('./config/.env.dev'),
      isGlobal: true,
    }),

    MongooseModule.forRoot(process.env.MONGODB_URI as string, {
      connectionFactory: (connection) => {
        console.log('✅ Connected to MongoDB :', connection.name);
        return connection;
      },
    }),

    SharedAutnenticationModule,
    AuthModule,
    UserModule,
    PatientModule,
    ClinicModule,
    DoctorsModule,
    CommonModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule { }
