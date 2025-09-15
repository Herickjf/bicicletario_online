import { Controller, Post, Body, Req, Get } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from 'src/dtos/Login.dto';
import { ApiBody, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';

@Controller('auth')
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post('login')
    @ApiBody({ type: LoginDto })
    @ApiResponse({
        status: 201,
        example: { access_token: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9' },
    })
    @ApiResponse({ status: 401, description: 'Unauthorized' })
    async login(@Body() loginDto: LoginDto) {
        return this.authService.login(loginDto);
    }

    @Get('validate')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Token válido' })
    @ApiResponse({ status: 401, description: 'Token inválido' })
    async validateToken(@Req() req: any) {
        return this.authService.validateToken(req);
    }

    @Get('profile')
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Perfil do usuário' })
    @ApiResponse({ status: 401, description: 'Token inválido' })
    async getProfile(@Req() req: any) {
        return req.user;
    }
}
