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

    async validateUser(email: string, pass: string): Promise<any> {
        const query = `
            SELECT u.*, a.* 
            FROM Users u
            LEFT JOIN Address a ON u.address_id = a.address_id
            WHERE u.email = $1;
        `;
        const values = [email];
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
        const user = await this.validateUser(loginDto.email, loginDto.password);
        const payload: JwtPayload = { username: user.username, sub: user.id };
        const access_token = this.jwtService.sign(payload);
        return { access_token: access_token, user: user };
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
