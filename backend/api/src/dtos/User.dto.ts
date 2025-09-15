import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested, IsInt, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import AddressDto from "./Address.dto";

export default class UserDto{
    @ApiProperty({
        description: 'Nome do User',
        example: 'Marcelo da Silva'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(250)
    name: string;

    @ApiProperty({
        description: 'Email do User',
        example: 'marcelo@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(200)
    email: string;

    @ApiProperty({
        description: 'Senha do User',
        example: 'senha123'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(250)
    password: string;

    @ApiProperty({
        description: 'CPF do User',
        example: '12345678901'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(11)
    cpf: string;

    @ApiProperty({
        description: 'Telefone do User',
        example: '11999998888'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(11)
    phone: string;

    @ApiProperty({
        description: 'Endereco do User',
        type: AddressDto,
    })
    @ValidateNested()
    @IsOptional()
    @Type(() => AddressDto)
    address?: AddressDto;

    @ApiProperty({
        description: 'Role do User',
        example: 'owner',
        enum: ['owner', 'attendant', 'customer', 'manager']
    })
    @IsOptional()
    @IsString()
    role?: "owner" | "attendant" | "customer" | "manager";

}