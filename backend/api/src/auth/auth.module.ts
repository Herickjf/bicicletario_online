import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { AuthService } from './auth.service';
import { DatabaseService } from '../database/database.service';
import { jwtConstants } from './constants';

@Module({
  imports: [
    JwtModule.register({
      secret: jwtConstants.secret || 'chave-super-secreta',
      signOptions: { expiresIn: '1h' },
    }),
  ],
  providers: [AuthService, DatabaseService],
  exports: [AuthService, JwtModule],
})
export class AuthModule {}
