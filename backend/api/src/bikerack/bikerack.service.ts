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
                RETURNING address_id
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
                RETURNING *
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
                JOIN Address a ON br.address_id = a.address_id
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

        try{
            return await this.database.query(
                `
                SELECT br.*, a.*
                FROM BikeRack br
                JOIN Address a ON br.address_id = a.address_id
                WHERE ${whereClauses}
                `, values
            );
        }catch(e){
            throw new BadRequestException('Erro ao tentar buscar Bicicletário(s)!', e.message);
        }
    }

    async customersPerBikerack(){
        try{
            return await this.database.query(
                `
                SELECT br.bike_rack_id, br.name, COUNT(c.client_id) AS customer_count
                FROM BikeRack br
                LEFT JOIN Client c ON br.bike_rack_id = c.bike_rack_id
                GROUP BY br.bike_rack_id, br.name
                ORDER BY customer_count DESC
                `
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar listar Clientes por Bicicletário!'};
        }
    }

    async employeesPerBikerack(){
        try{
            return await this.database.query(
                `
                SELECT br.bike_rack_id, br.name, COUNT(e.employee_id) AS employee_count
                FROM BikeRack br
                LEFT JOIN Employee e ON br.bike_rack_id = e.bike_rack_id
                GROUP BY br.bike_rack_id, br.name
                ORDER BY employee_count DESC
                `
            );
        }catch(e){
            throw {'error': e, 'message': 'Erro ao tentar listar Funcionários por Bicicletário!'};
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
            `DELETE FROM BikeRack RETURNING *`
        );
    }

    async delete(id: Number){
        return await this.database.query(
            `DELETE FROM BikeRack WHERE bikerack_id = $1 RETURNING *`, [id]
        );
    }
}
