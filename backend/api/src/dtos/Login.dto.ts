import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsString, Max, MaxLength } from 'class-validator';
import { Type } from 'class-transformer';

export class LoginDto {
    @ApiProperty({
        description: 'E-mail para login',
        example: 'usuario123@gmail.com'
    })
    @IsString()
    @IsEmail()
    @MaxLength(250)
    login: string;

    @ApiProperty({
        description: 'Senha do usuário',
        example: 'senhaSegura123'
    })
    @IsString()
    @MaxLength(200)
    password: string;
}