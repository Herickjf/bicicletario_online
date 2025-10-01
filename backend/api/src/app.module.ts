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
import { NotificationController } from './notification/notification.controller';
import { NotificationService } from './notification/notification.service';
import { NotificationModule } from './notification/notification.module';
import { ReviewService } from './review/review.service';
import { ReviewController } from './review/review.controller';
import { ReviewModule } from './review/review.module';
import { ReportsModule } from './reports/reports.module';
import { RentModule } from './rent/rent.module';

@Module({
  imports: [DatabaseModule, BikerackModule, UserModule, AuthModule, PlanModule, NotificationModule, ReviewModule, ReportsModule, RentModule],
  controllers: [AppController, UserController, AuthController, PlanController, NotificationController, ReviewController],
  providers: [AppService, BikerackService, UserService, AuthService, PlanService, NotificationService, ReviewService],
})
export class AppModule {}
