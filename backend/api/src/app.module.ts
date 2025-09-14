import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BikerackService } from './bikerack/bikerack.service';
import { BikerackModule } from './bikerack/bikerack.module';
import { CustomerService } from './customer/customer.service';
import { CustomerController } from './customer/customer.controller';
import { CustomerModule } from './customer/customer.module';
import { EmployeeService } from './employee/employee.service';
import { EmployeeController } from './employee/employee.controller';
import { EmployeeModule } from './employee/employee.module';

@Module({
  imports: [DatabaseModule, BikerackModule, CustomerModule, EmployeeModule],
  controllers: [AppController, CustomerController, EmployeeController],
  providers: [AppService, BikerackService, CustomerService, EmployeeService],
})
export class AppModule {}
