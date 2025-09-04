import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, ValidateNested } from "class-validator";
import AddressDto from "./Address.dto";
import { Type } from "class-transformer";

export default class BikeRackDto{
    @ApiProperty({
        description: 'Nome do Bicicletário',
        example: 'Aluguel de Bicicletas'
    })
    @IsNotEmpty()
    @IsString()
    @MaxLength(250)
    name: string;

    @ApiProperty({
        description: 'Imagem do Bicicletário',
        example: 'imagem_bicicletario.svg'
    })
    @IsString()
    @IsOptional()
    image: string;


    @ApiProperty({
        description: 'Endereço do Bicicletário',
        type: AddressDto
    })
    @ValidateNested()
    @Type(() => AddressDto)
    @IsOptional()
    address: AddressDto;
}