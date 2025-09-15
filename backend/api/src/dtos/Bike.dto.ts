import { ApiProperty } from "@nestjs/swagger";
import { IsNotEmpty, IsNumber, IsOptional, IsString } from "class-validator";

export class BikeDto {
    @ApiProperty({ 
        description: 'ID do bicicletário ao qual a bicicleta pertence' 
    })
    @IsNumber()
    @IsOptional()
    bike_id?: number;

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

    @ApiProperty({
        description: 'Preco por hora do aluguel da bicicleta'
    })
    @IsNumber()
    @IsNotEmpty()
    rent_price: number;

    @ApiProperty({
        description: 'Status da bicicleta (disponível, em uso, manutenção, etc.)',
        example: 'available',
        enum: ['available', 'rented', 'under_maintenance']
    })
    @IsString()
    @IsOptional()
    status?: 'available' | 'rented' | 'under_maintenance';

    @ApiProperty({
        description: 'ID do rastreador GPS associado à bicicleta',
        example: 150
    })
    @IsNumber()
    @IsNotEmpty()
    tracker_number: number;

    @ApiProperty({
        description: 'ID do bicicletário ao qual a bicicleta pertence'
    })
    @IsNumber()
    @IsNotEmpty()
    bike_rack_id: number;
}