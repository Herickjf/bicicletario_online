import { Module } from '@nestjs/common';
import { BikerackController } from './bikerack.controller';
import { DatabaseModule } from 'src/database/database.module';
import { BikerackService } from './bikerack.service';

@Module({
  imports: [DatabaseModule],
  controllers: [BikerackController],
  providers: [BikerackService]
})
export class BikerackModule {}
