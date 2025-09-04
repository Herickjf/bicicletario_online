import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Max, MaxLength, MinLength } from 'class-validator'

export default class AddressDto{
    @ApiProperty({
        description: 'Rua',
        example: 'Rua do Bicicletário'
    })
    @IsString()
    @MaxLength(300)
    street: string;

    @ApiProperty({
        description: 'Número do Estabelecimento'
    })
    @IsInt()
    @IsOptional()
    num?: number;

    @ApiProperty({
        description: 'CEP do Estabelecimento',
        example: '99999-999'
    })
    @IsString()
    @MaxLength(9)
    @MinLength(9)
    zip_code: string;

    @ApiProperty({
        description: 'Cidade do Bicicletário',
        example: 'João Pessoa'
    })
    @IsString()
    @MaxLength(50)
    city: string;
    
    @ApiProperty({
        description: 'Estado do Estabelecimento',
        example: 'Paraíba'
    })
    @IsString()
    @MaxLength(100)
    state: string;
}