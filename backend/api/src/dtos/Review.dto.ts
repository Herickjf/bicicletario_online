import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength, Max, Min } from "class-validator";

export class ReviewDto {
    @ApiProperty({
        example: 1,
        description: "ID da avaliação"
    })
    @IsInt()
    @IsOptional()
    review_id?: number;

    @ApiProperty({
        example: 5,
        description: "Nota da avaliação (1 a 5)"
    })
    @IsInt()
    @Max(5)
    @Min(1)
    @IsNotEmpty()
    rating: number;

    @ApiProperty({
        example: "Ótimo produto, muito satisfeito!",
        description: "Comentário da avaliação"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(500)
    comment: string;

    @ApiProperty({
        example: '2024-10-01T12:00:00Z',
        description: "Data e hora em que a avaliação foi criada"
    })
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({
        example: 42,
        description: "ID do usuário que fez a avaliação"
    })
    @IsInt()
    @IsNotEmpty()
    user_id: number;

    @ApiProperty({
        example: 1001,
        description: "ID do bicicletario avaliado"
    })
    @IsInt()
    @IsNotEmpty()
    bike_rack_id: number;
}