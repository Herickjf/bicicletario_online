import { ApiProperty } from '@nestjs/swagger';
import { IsString, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
    @ApiProperty({
        description: 'Nome de usuário ou e-mail para login',
        example: 'usuario123'
    })
    @IsString()
    @MaxLength(200)
    login: string;

    @ApiProperty({
        description: 'Senha do usuário',
        example: 'senhaSegura123'
    })
    @IsString()
    @MaxLength(200)
    password: string;
}