import { BadGatewayException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import ClientDto from '../dtos/Client.dto';

@Injectable()
export class CustomerService {
    constructor(private readonly database: DatabaseService){}

    async create(cliente: ClientDto){
        let address_id: number;
        let ret: any;

        try{
            ret = await this.database.query(
                `
                INSERT INTO Address (street, num, zip_code, city, state)
                VALUES ($1, $2, $3, $4, $5)
                RETURNING address_id
                `, cliente.address);
        }catch(e){
            throw new BadGatewayException('Erro ao tentar cadastrar endereço');
        }

        address_id = ret ? ret[0]['address_id'] : null

        try{
            return await this.database.query(
                `
                INSERT INTO Client (name, email, phone, address_id)
                VALUES ($1, $2, $3, $4)
                RETURNING *
                `, [
                    cliente.name,
                    cliente.email,
                    cliente.phone,
                    address_id
                ]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar cadastrar Cliente!');
        }
    }

    async list(){
        try{
            return await this.database.query(
                `
                SELECT c.*, a.*
                FROM Client c
                LEFT JOIN Address a ON c.address_id = a.address_id
                `
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar listar Clientes!');
        }
    }

    async search(filter: {[key: string]: any}){
        const columns = Object.keys(filter);
        const values = Object.values(filter);

        const where = columns.map((col, idx) => `${col} = $${idx + 1}`).join(' AND ');

        try{
            return await this.database.query(
                `
                SELECT c.*, a.*
                FROM Client c
                LEFT JOIN Address a ON c.address_id = a.address_id
                WHERE ${where}
                `, values
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar buscar Cliente(s)!', e.message);
        }
    }

    async update(id: number, cliente: {[key: string]: any}){
        const columns = Object.keys(cliente);
        const values = Object.values(cliente);
        
        try{
            return await this.database.query(
                `
                UPDATE Client
                SET ${columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ')}
                WHERE client_id = $${columns.length + 1}
                RETURNING *
                `, [...values, id]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar atualizar Cliente!');
        }
    }

    async updateWhere(whereClauses: {[key: string]: any}, cliente: {[key: string]: any}){
        const whereColumns = Object.keys(whereClauses);
        const whereValues = Object.values(whereClauses);
        const updateColumns = Object.keys(cliente);
        const updateValues = Object.values(cliente);

        try{
            return await this.database.query(
                `
                UPDATE Client
                SET ${updateColumns.map((col, idx) => `${col} = $${idx + 1}`).join(', ')}
                WHERE ${whereColumns.map((col, idx) => `${col} = $${updateColumns.length + idx + 1}`).join(' AND ')}
                RETURNING *
                `, [...updateValues, ...whereValues]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar atualizar Cliente(s)!', e.message);
        }
    }

    async delete(id: number){
        try{
            return await this.database.query(
                `
                DELETE FROM Client
                WHERE client_id = $1
                RETURNING *
                `, [id]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar deletar Cliente!');
        }
    }

    async deleteAll(){
        try{
            return await this.database.query(
                `
                DELETE FROM Client
                RETURNING *
                `
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar deletar Clientes!');
        }
    }

    async deleteWhere(whereClauses: {[key: string]: any}){
        const columns = Object.keys(whereClauses);
        const values = Object.values(whereClauses);

        const where = columns.map((col, idx) => `${col} = $${idx + 1}`).join(' AND ');

        try{
            return await this.database.query(
                `
                DELETE FROM Client
                WHERE ${where}
                RETURNING *
                `, values
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar deletar Cliente(s)!', e.message);
        }
    }
}
