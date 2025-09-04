import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { BikerackService } from './bikerack/bikerack.service';
import { BikerackModule } from './bikerack/bikerack.module';

@Module({
  imports: [DatabaseModule, BikerackModule],
  controllers: [AppController],
  providers: [AppService, BikerackService],
})
export class AppModule {}
