import { BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service'
import { RentDto } from 'src/dtos/Rent.dto';

@Injectable()
export class RentService {
    constructor(private readonly database: DatabaseService){}

    // Criar aluguel
    async criarPedido(dto: RentDto) {
        try {
            return await this.database.query(
                `
                INSERT INTO Rent (rent_date, init_time, end_time, total_value, status, bike_id, employee_id, client_id, bike_rack_id)
                VALUES (CURRENT_DATE, $1, $2, $3, 'active', $4, $5, $6, $7)
                RETURNING *
                `,
                [
                    dto.init_time,
                    dto.end_time,
                    dto.total_value,
                    dto.bike_id,
                    dto.employee_id,
                    dto.client_id,
                    dto.bike_rack_id,
                ],
            );
        } catch (e) {
            throw new BadRequestException('Erro ao criar aluguel', e.message);
        }
    }

    async pedido(id_rent: number) {
        try {
            return await this.database.query(
                `
                    SELECT 
                    r.rent_id,
                    r.rent_date,
                    r.init_time,
                    r.end_time,
                    r.total_value,
                    r.status,
                    r.client_id,
                    r.employee_id,
                    json_build_object(
                        'id', b.bike_id,
                        'model', b.model
                    ) AS bike,
                    json_build_object(
                        'id', c.user_id,
                        'name', c.name
                    ) AS client,
                    json_build_object(
                        'id', e.user_id,
                        'name', e.name
                    ) AS employee
                    FROM Rent r
                    LEFT JOIN Bike b ON r.bike_id = b.bike_id
                    LEFT JOIN Users c ON r.client_id = c.user_id
                    LEFT JOIN Users e ON r.employee_id = e.user_id
                    WHERE r.rent_id = $1
                `,
                [id_rent],
            );
        } catch (e) {
            throw new BadRequestException('Erro ao buscar pedido', e.message);
        }
        }

    // Listar todos os pedidos de um bicicletário
    async listarPedidosBikerack(id_bikerack: number) {
        try {
            return await this.database.query(
            `
                SELECT 
                    r.rent_id,
                    r.rent_date,
                    r.init_time,
                    r.end_time,
                    r.total_value,
                    r.status,
                    r.client_id,
                    r.employee_id,
                    json_build_object(
                    'id', b.bike_id,
                    'model', b.model
                    ) AS bike,
                    json_build_object(
                    'id', c.user_id,
                    'name', c.name
                    ) AS client,
                    json_build_object(
                    'id', e.user_id,
                    'name', e.name
                    ) AS employee
                FROM Rent r
                LEFT JOIN Bike b ON r.bike_id = b.bike_id
                LEFT JOIN Users c ON r.client_id = c.user_id
                LEFT JOIN Users e ON r.employee_id = e.user_id
                WHERE r.bike_rack_id = $1
                ORDER BY r.rent_date DESC, r.init_time DESC
            `,
            [id_bikerack],
            );

        } catch (e) {
            throw new BadRequestException(
            'Erro ao listar pedidos do bicicletário',
            e.message,
            );
        }
    }


    async listarPedidosUsuario(id_bikerack: number, id_user: number) {
    try {
        return await this.database.query(
            `
                SELECT 
                    r.rent_id,
                    r.rent_date,
                    r.init_time,
                    r.end_time,
                    r.total_value,
                    r.status,
                    r.client_id,
                    r.employee_id,
                    json_build_object(
                    'id', b.bike_id,
                    'model', b.model
                    ) AS bike,
                    json_build_object(
                    'id', c.user_id,
                    'name', c.name
                    ) AS client,
                    json_build_object(
                    'id', e.user_id,
                    'name', e.name
                    ) AS employee
                FROM Rent r
                LEFT JOIN Bike b ON r.bike_id = b.bike_id
                LEFT JOIN Users c ON r.client_id = c.user_id
                LEFT JOIN Users e ON r.employee_id = e.user_id
                WHERE r.bike_rack_id = $1 AND r.client_id = $2
                ORDER BY r.rent_date DESC, r.init_time DESC
            `,
            [id_bikerack, id_user],
        );
    } catch (e) {
        throw new BadRequestException(
        'Erro ao listar pedidos do usuário',
        e.message,
        );
    }
    }

    async cancelarPedido(id_rent: number) {
        try {
            return await this.database.query(
                `
                UPDATE Rent
                SET status = 'canceled'
                WHERE rent_id = $1
                RETURNING *
                `,
                [id_rent],
            );

        } catch (e) {
            throw new BadRequestException('Erro ao cancelar pedido', e.message);
        }
    }

    async finalizarPedido(id_rent: number){
        try {
            return await this.database.query(
                `
                UPDATE Rent
                SET status = 'finished'
                WHERE rent_id = $1
                RETURNING *
                `,
                [id_rent],
            );
        } catch (e) {
            throw new BadRequestException('Erro ao finalizar pedido', e.message);
        }
    }

    async deletarPedido(id_rent: number) {
        try {
            return await this.database.query(
                `
                DELETE FROM Rent
                WHERE rent_id = $1
                RETURNING *
                `,
                [id_rent],
            );
        } catch (e) {
            throw new BadRequestException('Erro ao deletar pedido', e.message);
        }
    }
}
