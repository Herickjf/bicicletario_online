import { Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { DatabaseService } from 'src/database/database.service';
import { LoginDto } from 'src/dtos/Login.dto';

interface JwtPayload {
    username: string;
    sub: number;
}

@Injectable()
export class AuthService {
    constructor(private jwtService: JwtService, private readonly database: DatabaseService) {}

    async validateUser(login: string, pass: string): Promise<any> {
        const query = `
            SELECT * 
            FROM "User" 
            WHERE login = $1 OR email = $1
        `;
        const values = [login];
        const result = await this.database.query(query, values);
        
        if (result.length === 0) {
            throw new NotFoundException('Usuário não encontrado');
        }

        const isValid = await bcrypt.compare(pass, result[0].password);
        if (!isValid) {
            throw new UnauthorizedException('Credenciais inválidas');
        }

        const { password, ...user } = result[0];
        return user;
    }

    async login(loginDto: LoginDto): Promise<any> {
        const user = await this.validateUser(loginDto.login, loginDto.password);

        const payload: JwtPayload = { username: user.username, sub: user.id };
        const access_token = this.jwtService.sign(payload);
        return { access_token: access_token };
    }

    async validateToken(req: any): Promise<any> {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) {
        throw new UnauthorizedException('Token não fornecido');
        }

        try {
            const decoded = this.jwtService.verify(token);
            return { valid: true, user: decoded };
        } catch (error) {
            throw new UnauthorizedException('Token inválido');
        }
    }
}
