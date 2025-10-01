import { BadGatewayException, BadRequestException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import AddressDto from 'src/dtos/Address.dto';
import BikeRackDto from 'src/dtos/BikeRack.dto';
import { BikeDto } from 'src/dtos/Bike.dto';

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
                RETURNING *;
                `, bikerack.address);
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar cadastrar endereço'};
        }

        address_id = ret ? ret[0]['address_id'] : null

        try{
            const br = await this.database.query(
                `
                INSERT INTO BikeRack (name, image, address_id)
                VALUES ($1, $2, $3)
                RETURNING *;
                `, [
                    bikerack.name, 
                    bikerack.image, 
                    address_id
                ]
            )
            return {
                bike_rack_id: br[0].bike_rack_id,
                name: br[0].name,
                street: ret[0].street,
                num: ret[0].num,
                zip_code: ret[0].zip_code,
                city: ret[0].city,
                state: ret[0].state,
            }
        }catch(e){
            throw new BadRequestException(e.message)
        }
    }

    async createBike(bike: BikeDto){
        if(!bike.bike_rack_id) throw new BadRequestException('O campo bike_rack_id é obrigatório');

        try{
            return await this.database.query(
                `
                INSERT INTO Bike (model, year, image, rent_price, status, tracker_number, bike_rack_id)
                VALUES ($1, $2, $3, $4, $5, $6, $7)
                RETURNING *;
                `, [
                    bike.model, 
                    bike.year, 
                    bike.image,
                    bike.rent_price,
                    bike.status || 'available',
                    bike.tracker_number,
                    bike.bike_rack_id
                ]
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar cadastrar Bicicleta!'};
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

    async viewBikeracks(){
        return await this.database.query(`
            SELECT * FROM v_bikerack_detalhes;
        `,
        []);
    }

    async listBikes(bike_rack_id: number){
        try{
            return await this.database.query(
                `
                SELECT *
                FROM Bike
                WHERE bike_rack_id = $1;
                `, [bike_rack_id]
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar listar Bicicletas do Bicicletário!'};
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
           - num_bicicletas: Quantidade de bicicletas cadastradas no bicicletario
           - num_alugueis: Quantidade de alugueis ativos no bicicletario
           - receita_mensal: Renda mensal do bicicletario
           - num_clientes: Quantidade de usuarios cadastrados no bicicletario       
           - percent_aumento: Percentual de aumento da renda mensal em relacao ao mes anterior
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
            throw new BadRequestException('Erro ao tentar buscar informações para tela principal!', e.message);
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

    async bikerackUsers(id_bikerack: number){
        try{
            return await this.database.query(
                `
                    WITH ids_roles AS(
                        SELECT user_id, role
                        FROM UsersRole
                        WHERE bike_rack_id = $1
                    )
                    SELECT u.*, a.*, i.role
                    FROM Users u
                    LEFT JOIN Address a
                        ON u.address_id = a.address_id
                    INNER JOIN ids_roles i
                        ON u.user_id = i.user_id
                `,
                [id_bikerack]
            )
        }catch(e){
            throw new BadGatewayException('Erro ao tentar listar clientes de um bicicletário!', e.message)
        }
    }

    async bikerackCustomers(id_bikerack: number){
        try{
            return await this.database.query(
                `
                    WITH ids_roles AS(
                        SELECT user_id, role
                        FROM UsersRole
                        WHERE bike_rack_id = $1 AND role = 'customer'
                    )
                    SELECT u.user_id, u.email, u.name
                    FROM Users u
                    LEFT JOIN Address a
                        ON u.address_id = a.address_id
                    INNER JOIN ids_roles i
                        ON u.user_id = i.user_id
                `,
                [id_bikerack]
            )
        }catch(e){
            throw new BadGatewayException('Erro ao tentar listar clientes de um bicicletário!', e.message)
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
                WHERE bike_rack_id = $${columns.length + 1}
                `, [...values, id]
            );
        } catch (e) {
            throw new BadGatewayException('Erro ao tentar atualizar Bicicletário!', e.message);
        }
    }

    async updateFull(bikerack: {
        id: number,
        name: string,
        street: string,
        num: number,
        zip_code: string,
        city: string,
        state: string
    }){
        const query1 = `
            UPDATE BikeRack
            SET name = $1
            WHERE bike_rack_id = $2
            RETURNING *        
        `;
        const query2 = `
            UPDATE Address
            SET 
                street = $1,
                num = $2,
                zip_code = $3,
                city = $4,
                state = $5
            WHERE address_id = $6
            RETURNING *
        `;

        try{
            const br_ret = (await this.database.query(query1, [bikerack.name, bikerack.id]))[0];
            const addr_ret = (await this.database.query(query2, [
                bikerack.street,
                bikerack.num,
                bikerack.zip_code,
                bikerack.city,
                bikerack.state,
                br_ret.address_id
            ]))[0];

            const ret = {
                bike_rack_id: br_ret.bike_rack_id,
                name: br_ret.name,
                street: addr_ret.street,
                num: addr_ret.num,
                zip_code: addr_ret.zip_code,
                city: addr_ret.city,
                state: addr_ret.state,
            }

            return ret;
        }catch(e){
            throw new BadGatewayException("Erro ao tentar atualizar o bicicletário por completo: ", e.message);
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

    async updateBike(id_bike_rack: number, id_bike: number, bike: BikeDto) {
        try{
            this.database.query(
                `
                UPDATE Bike
                SET model = $1, year = $2, image = $3, rent_price = $4, status = $5, tracker_number = $6
                WHERE bike_rack_id = $7 AND bike_id = $8
                RETURNING *;
                `, [
                    bike.model,
                    bike.year,
                    bike.image,
                    bike.rent_price,
                    bike.status,
                    bike.tracker_number,
                    id_bike_rack,
                    id_bike
                ]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar atualizar Bicicleta!', e.message);
        }
    }

    async deleteAll(){  
        return await this.database.query(
            `DELETE FROM BikeRack RETURNING *;`
        );
    }

    async delete(id: Number){
        return await this.database.query(
            `DELETE FROM BikeRack WHERE bike_rack_id = $1 RETURNING *;`, [id]
        );
    }

    async deleteBike(bike_rack_id: number, bike_id: number){
        return await this.database.query(
            `DELETE FROM Bike WHERE bike_rack_id = $1 AND bike_id = $2 RETURNING *;`, [bike_rack_id, bike_id]
        );
    }
}
