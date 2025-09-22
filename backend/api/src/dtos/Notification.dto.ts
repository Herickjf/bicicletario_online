import { ApiProperty } from "@nestjs/swagger";
import { IsInt, IsNotEmpty, IsOptional, IsString, MaxLength } from "class-validator";

export class NotificationDto {
    @ApiProperty({
        example: 1,
        description: "ID da notificação"
    })
    @IsInt()
    @IsOptional()
    notification_id?: number;

    @ApiProperty({ 
        example: "Nova mensagem recebida", 
        description: "Título da notificação"
    })
    @IsString()
    @IsNotEmpty()
    @MaxLength(200)
    title: string;

    @ApiProperty({
        example: "Você tem uma nova mensagem no seu perfil.",
        description: "Conteúdo da notificação"
    })
    @IsString()
    @IsNotEmpty()
    message: string;

    @ApiProperty({
        example: false,
        description: "Indica se a notificação foi lida"
    })
    @IsOptional()
    read?: boolean;

    @ApiProperty({
        example: '2024-10-01T12:00:00Z',
        description: "Data e hora em que a notificação foi criada"
    })
    @IsOptional()
    createdAt?: Date;

    @ApiProperty({
        example: 42,
        description: "ID do usuário associado à notificação"
    })
    @IsInt()
    @IsNotEmpty()
    recipient_id: number;

    @ApiProperty({
        example: 7,
        description: "ID do remetente da notificação (se aplicável)"
    })
    @IsInt()
    @IsOptional()
    sender_id?: number;

}