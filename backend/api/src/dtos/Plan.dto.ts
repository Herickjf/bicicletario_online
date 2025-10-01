import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested, IsInt, IsEmail, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class PlanDto {
    @ApiProperty({
        example: 1,
        description: "ID do plano"
    })
    @IsInt()
    @IsOptional()
    plan_id?: number;

    @ApiProperty({ 
        example: "Plano Básico", 
        description: "Nome do plano" 
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    name: string;

    @ApiProperty({
        example: "Plano básico com funcionalidades essenciais",
        description: "Descrição do plano"
    })
    @IsString()
    @IsOptional()
    @MaxLength(500)
    description?: string;

    @ApiProperty({
        example: 29.99,
        description: "Preço do plano"
    })
    @IsNotEmpty()
    price: number;

    @ApiProperty({
        example: true,
        description: "Indica se o plano está ativo"
    })
    @IsOptional()
    active: boolean;

    @ApiProperty({
        example: 30,
        description: "ID do bicineta associado ao plano"
    })
    @IsInt()
    @IsNotEmpty()
    bike_rack_id: number;
}