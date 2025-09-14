import { Module } from '@nestjs/common';
import { DatabaseModule } from 'src/database/database.module';
import { CustomerController } from './customer.controller';
import { CustomerService } from './customer.service';

@Module({
    imports: [DatabaseModule],
    controllers: [CustomerController],
    providers: [CustomerService]
})
export class CustomerModule {}
