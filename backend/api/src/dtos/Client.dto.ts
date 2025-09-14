import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested, IsInt, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";
import { Type } from "class-transformer";
import AddressDto from "./Address.dto";

export default class ClientDto{
    @ApiProperty({
        description: 'Nome do Cliente',
        example: 'Marcelo da Silva'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(250)
    name: string;

    @ApiProperty({
        description: 'Email do Cliente',
        example: 'marcelo@gmail.com'
    })
    @IsEmail()
    @IsNotEmpty()
    @MaxLength(200)
    email: string;

    @ApiProperty({
        description: 'CPF do Cliente',
        example: '12345678901'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(11)
    cpf: string;

    @ApiProperty({
        description: 'Telefone do Cliente',
        example: '11999998888'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(11)
    phone: string;

    @ApiProperty({
        description: 'Endereco do Cliente',
        type: AddressDto,
    })
    @ValidateNested()
    @IsOptional()
    @Type(() => AddressDto)
    address: AddressDto;

    @ApiProperty({
        description: 'Id do bicicletário ao qual o cliente está vinculado',
        example: 1
    })
    @IsNotEmpty()
    @IsInt()
    bike_rack_id: number;

}