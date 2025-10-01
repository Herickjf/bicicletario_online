import { ApiProperty } from "@nestjs/swagger";
import { ValidateNested, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, MaxLength } from "class-validator";

export class RentDto{
    @ApiProperty({
        description: 'Id do Pedido',
        example: 1
    })
    @IsOptional()
    @IsInt()
    rent_id: number;

    @ApiProperty({
        description: 'Data do Pedido',
        example: '2025-09-31'
    })
    @IsOptional()
    @IsString()
    rent_date: string;

    @ApiProperty({
        description: 'Timestamp do Início do Pedido',
        example: '2025-09-31 16:30:00'
    })
    @IsOptional()
    @IsString()
    init_time: string;

    @ApiProperty({
        description: 'Timestamp do Final do Pedido',
        example: '2025-09-31 17:30:00'
    })
    @IsOptional()
    @IsString()
    end_time: string;

    @ApiProperty({
        description: 'Valor Total do Pedido',
        example: 10.50
    })
    @IsNumber()
    @IsNotEmpty()
    total_value: number;

    @ApiProperty({
        description: "Status",
        example: "active"
    })
    @IsString()
    @IsOptional()
    status: "active" | "finished" | "canceled";

    @ApiProperty({
        description: "Id da bicicleta alugada",
        example: 10
    })
    @IsInt()
    @IsNotEmpty()
    bike_id: number;

    @ApiProperty({
        description: "Id do cliente",
        example: 10
    })
    @IsInt()
    @IsNotEmpty()
    client_id: number;

    @ApiProperty({
        description: "Id do vendedor",
        example: 10
    })
    @IsInt()
    @IsNotEmpty()
    employee_id: number;

    @ApiProperty({
        description: "Id do bicicletário",
        example: 10
    })
    @IsInt()
    @IsNotEmpty()
    bike_rack_id: number;
}