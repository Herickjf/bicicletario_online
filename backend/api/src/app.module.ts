import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BikerackService } from './bikerack/bikerack.service';
import { BikerackModule } from './bikerack/bikerack.module';
import { UserService } from './user/user.service';
import { UserController } from './user/user.controller';
import { UserModule } from './user/user.module';
import { AuthService } from './auth/auth.service';
import { AuthController } from './auth/auth.controller';
import { AuthModule } from './auth/auth.module';
import { PlanService } from './plan/plan.service';
import { PlanController } from './plan/plan.controller';
import { PlanModule } from './plan/plan.module';

@Module({
  imports: [DatabaseModule, BikerackModule, UserModule, AuthModule, PlanModule],
  controllers: [AppController, UserController, AuthController, PlanController],
  providers: [AppService, BikerackService, UserService, AuthService, PlanService],
})
export class AppModule {}
