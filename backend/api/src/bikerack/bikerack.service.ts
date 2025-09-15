import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import AddressDto from 'src/dtos/Address.dto';
import BikeRackDto from 'src/dtos/BikeRack.dto';

@Injectable()
export class BikerackService {
    constructor(private readonly database: DatabaseService){}

    async create(bikerack: BikeRackDto){
        let address_id: number;
        let ret: any;
        try{
            ret = await this.database.query(
                `
                INSERT INTO Address (street, num, zip_code, city, state)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING address_id;
                `, bikerack.address);
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar cadastrar endereço'};
        }

        address_id = ret ? ret[0]['address_id'] : null

        try{
            return await this.database.query(
                `
                INSERT INTO BikeRack (name, image, address_id)
                VALUES ($1, $2, $3)
                RETURNING *;
                `, [
                    bikerack.name, 
                    bikerack.image, 
                    address_id
                ]
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar cadastrar Bicicletário!'};
        }
    }

    async list(){
        try{
            return await this.database.query(
                `
                SELECT br.*, a.*
                FROM BikeRack br
                JOIN Address a ON br.address_id = a.address_id;
                `
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar listar Bicicletários!'};
        }
    }

    async search(filter: {[key: string]: any}){
        const columns = Object.keys(filter);
        const values = Object.values(filter);

        const whereClauses = columns.map((col, idx) => {
            const value = values[idx];
            if (typeof value === 'string') {
                return `${col} ILIKE $${idx + 1}`; // busca case-insensitive
            }
            return `${col} = $${idx + 1}`;
        }).join(' AND ');

        console.log(whereClauses);

        try{
            return await this.database.query(
                `
                SELECT br.*, a.*
                FROM BikeRack br
                JOIN Address a ON br.address_id = a.address_id
                WHERE ${whereClauses};
                `, values
            );
        }catch(e){
            throw new BadRequestException('Erro ao tentar buscar Bicicletário(s)!', e.message);
        }
    }

    async mainScreenInfo(id: number){
        /*
           Retorna as informacoes principais da tela inicial:
           - Quantidade de bicicletas cadastradas no bicicletario
           - Quantidade de alugueis ativos no bicicletario
           - Renda mensal do bicicletario
           - Quantidade de usuarios cadastrados no bicicletario       
           - Percentual de aumento da renda mensal em relacao ao mes anterior
        */

        try{
            return await this.database.query(
                `
                SELECT 
                    (SELECT COUNT(*) FROM Bike WHERE bike_rack_id = $1) AS num_bicicletas,
                    (SELECT COUNT(*) FROM Rent WHERE bike_rack_id = $1 AND status = 'active') AS num_alugueis,
                    (SELECT COALESCE(SUM(total_value), 0)
                    FROM Rent
                    WHERE bike_rack_id = $1
                    AND EXTRACT(MONTH FROM rent_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                    AND EXTRACT(YEAR FROM rent_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                    ) AS receita_mensal,
                    (SELECT COUNT(*) FROM UsersRole WHERE bike_rack_id = $1) AS num_clientes,
                    (SELECT
                        CASE
                            WHEN COALESCE(prev_mes, 0) = 0 THEN 100
                            ELSE ((curr_mes - prev_mes) / prev_mes::numeric) * 100
                        END
                    FROM (
                        SELECT
                            (SELECT COALESCE(SUM(total_value), 0)
                            FROM Rent
                            WHERE bike_rack_id = $1
                                AND EXTRACT(MONTH FROM rent_date) = EXTRACT(MONTH FROM CURRENT_DATE) - 1
                                AND EXTRACT(YEAR FROM rent_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                            ) AS prev_mes,
                            (SELECT COALESCE(SUM(total_value), 0)
                            FROM Rent
                            WHERE bike_rack_id = $1
                                AND EXTRACT(MONTH FROM rent_date) = EXTRACT(MONTH FROM CURRENT_DATE)
                                AND EXTRACT(YEAR FROM rent_date) = EXTRACT(YEAR FROM CURRENT_DATE)
                            ) AS curr_mes
                    ) t
                    ) AS percent_aumento;


                `, [id]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar buscar informações para tela principal!', e.message);
        }
    }

    async lucroNoAno(bikeRackId:number, ano: number){
        try {
        return await this.database.query(
            `
            SELECT 
                EXTRACT(MONTH FROM rent_date)::int AS mes,
                COALESCE(SUM(total_value), 0) AS lucro
            FROM Rent
            WHERE bike_rack_id = $1
              AND EXTRACT(YEAR FROM rent_date) = $2
            GROUP BY mes
            ORDER BY mes;
            `,
            [bikeRackId, ano]
        );
    } catch (e) {
        throw new BadGatewayException(
            'Erro ao tentar buscar lucro do ano!',
            e.message,
        );
    }
    }

    async usersPerBikerack(){
        try{
            return await this.database.query(
                `
                SELECT ur.bike_rack_id AS id, br.name, COUNT(ur.user_id) AS num_usuarios
                FROM UsersRole ur
                INNER JOIN BikeRack br ON ur.bike_rack_id = br.bike_rack_id
                GROUP BY ur.bike_rack_id, br.name;
                `
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar listar Funcionários por Bicicletário!'};
        }
    }

    async usersPerRole(){
        try{
            return await this.database.query(
                `
                SELECT role, COUNT(user_id) AS num_usuarios
                FROM UsersRole
                GROUP BY role;
                `
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar listar Usuários por Papel!'};
        }
    }

    async userPerRolesBikerack(id_bikerack: number) {
        try{
            return await this.database.query(
                `
                SELECT ur.bike_rack_id AS id, ur.role, COUNT(ur.user_id) AS num_usuarios
                FROM UsersRole ur
                WHERE ur.bike_rack_id = $1
                GROUP BY ur.bike_rack_id, ur.role;
                `,
                [id_bikerack]
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar listar Usuários por Papel e Bicicletário!'};
        }
    }

    async userBikeRacks(id_user: number) {
        try {
            return await this.database.query(
                `
                SELECT ur.bike_rack_id AS id, br.name
                FROM UsersRole ur
                INNER JOIN BikeRack br ON ur.bike_rack_id = br.bike_rack_id
                WHERE user_id = $1;
                `, [id_user]
            );
        } catch (e) {
            throw new BadGatewayException('Erro ao tentar listar Bicicletários do Usuário!', e.message);
        }
    }

    async update(id: Number | String, bikerack: { [key: string]: any }) {
        const columns = Object.keys(bikerack);
        const values = Object.values(bikerack);

        try {
            return await this.database.query(
                `
                UPDATE BikeRack
                SET ${columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ')}
                WHERE bikerack_id = $${columns.length + 1}
                `, [...values, id]
            );
        } catch (e) {
            throw new BadGatewayException('Erro ao tentar atualizar Bicicletário!', e.message);
        }
    }

    async updateMany(
        whereClauses: { [key: string]: any },
        data: { [key: string]: any },
        ) {
        
        const dataCols = Object.keys(data);
        const dataVals = Object.values(data);

        const whereCols = Object.keys(whereClauses);
        const whereVals = Object.values(whereClauses);

        if (dataCols.length === 0) {
            throw new BadRequestException('Nenhum campo para atualizar foi informado!');
        }

        // monta o SET dinamicamente
        const setString = dataCols
            .map((col, idx) => `${col} = $${idx + 1}`)
            .join(', ');

        // monta o WHERE dinamicamente (os índices começam depois do último do SET)
        const whereString = whereCols
            .map((col, idx) => `${col} = $${dataCols.length + idx + 1}`)
            .join(' AND ');

        const query = `
            UPDATE BikeRack
            SET ${setString}
            WHERE ${whereString}
            RETURNING *;
        `;

        try {
            return await this.database.query(query, [...dataVals, ...whereVals]);
        } catch (e) {
            throw new BadGatewayException('Erro ao tentar atualizar Bicicletário(s)!', e.message);
        }
    }

    async deleteAll(){  
        return await this.database.query(
            `DELETE FROM BikeRack RETURNING *;`
        );
    }

    async delete(id: Number){
        return await this.database.query(
            `DELETE FROM BikeRack WHERE bikerack_id = $1 RETURNING *;`, [id]
        );
    }
}
