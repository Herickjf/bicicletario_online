import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { EmployeeController } from './employee.controller';
import { EmployeeService } from './employee.service';

@Module({
    imports: [DatabaseModule],
    controllers: [EmployeeController],
    providers: [EmployeeService]
})
export class EmployeeModule {}
