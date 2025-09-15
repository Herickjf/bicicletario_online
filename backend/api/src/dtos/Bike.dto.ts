import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";


export class BikeDto {
    @ApiProperty({ 
        description: 'ID do bicicletário ao qual a bicicleta pertence' 
    })
    @IsNumber()
    @IsOptional()
    model?: number;

    @ApiProperty({
        description: 'Modelo da bicicleta'
    })
    @IsString()
    @IsNotEmpty()
    model: string;

    @ApiProperty({
        description: 'Ano da bicicleta'
    })
    @IsNumber()
    @IsNotEmpty()
    year: number;

    @ApiProperty({
        description: 'Imagem da Bicicleta'
    })
    @IsString()
    @IsOptional()
    image?: string;
}