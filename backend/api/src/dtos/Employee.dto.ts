import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsEmail, IsNotEmpty, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import AddressDto from "./Address.dto";

export enum Role{
    OWNER = 'owner',
    MANAGER = 'manager',
    ATTENDANT = 'attendant'
}

export default class EmployeeDto{
    @ApiProperty({
        description: 'Nome do Empregado',
        example: 'Marcelo da Silva'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(250)
    name: string;

    @ApiProperty({
        description: 'Email do Empregado',
        example: 'marcelo@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(200)
    email: string;

    @ApiProperty({
        description: 'Login do Empregado',
        example: 'marcelo123'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(50)
    login: string;
    
    @ApiProperty({
        description: 'Senha do Empregado',
        example: 'senha123'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(100)
    password: string;

    @ApiProperty({
        description: 'Função do Empregado',
        example: 'attendant',
        enum: ['owner', 'manager', 'attendant']
    })
    @IsNotEmpty()
    @IsString()
    role: Role;

    @ApiProperty({
        description: 'Id do bicicletário ao qual o empregado está vinculado',
        example: 1
    })
    @IsNotEmpty()
    @IsInt()
    bike_rack_id: number;
}