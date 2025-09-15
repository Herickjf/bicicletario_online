import { BadGatewayException, Injectable, NotFoundException } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import UserDto from '../dtos/User.dto';

@Injectable()
export class UserService {
    constructor(private readonly database: DatabaseService){}

    async create(cliente: UserDto){
        let address_id: number;
        let ret: any;

        try{
            if (cliente.address)
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
                INSERT INTO Users (name, email, password, cpf, phone, address_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *;
                `, [
                    cliente.name,
                    cliente.email,
                    cliente.password,
                    cliente.cpf,
                    cliente.phone,
                    address_id
                ]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar cadastrar User!');
        }
    }

    async login(email: string, password: string){
        try{
            const result = await this.database.query(
                `
                SELECT ur.bike_rack_id, ur.role, u.*, a.*
                FROM Users u
                LEFT JOIN Address a ON u.address_id = a.address_id
                LEFT JOIN UsersRole ur ON u.user_id = ur.user_id
                WHERE u.email = $1 AND u.password = $2;
                `, [email, password]
            );
            if(result.length > 0){
                return result;
            }
            throw new NotFoundException('Usuário ou senha inválidos!');
        }catch(e){
            throw new NotFoundException('Erro ao tentar realizar login:' + e.message);
        }
    }
        

    async setRole(id_user: number, id_bikerack: number, role: "owner" | "attendant" | "customer" | "manager"){
        try{
            return await this.database.query(
                `
                INSERT INTO UsersRole (user_id, bike_rack_id, role)
                VALUES ($1, $2, $3)
                RETURNING *
                `, [id_user, id_bikerack, role]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar definir papel para User!');
        }
    }

    async deleteRole(id_user: number, id_bikerack: number){
        try{
            return await this.database.query(
                `
                DELETE FROM UsersRole
                WHERE user_id = $1 AND bike_rack_id = $2
                RETURNING *
                `, [id_user, id_bikerack]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar remover papel de User!');
        }
    }

    async list(){
        try{
            return await this.database.query(
                `
                SELECT u.*, a.*
                FROM Users u
                LEFT JOIN Address a ON u.address_id = a.address_id
                `
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar listar Users!');
        }
    }

    async search(filter: {[key: string]: any}){
        const columns = Object.keys(filter);
        const values = Object.values(filter);

        const where = columns.map((col, idx) => `${col} = $${idx + 1}`).join(' AND ');

        try{
            return await this.database.query(
                `
                SELECT u.*, a.*
                FROM Users u
                LEFT JOIN Address a ON u.address_id = a.address_id
                WHERE ${where}
                `, values
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar buscar User(s)!', e.message);
        }
    }

    async update(id: number, cliente: {[key: string]: any}){
        const columns = Object.keys(cliente);
        const values = Object.values(cliente);
        
        try{
            return await this.database.query(
                `
                UPDATE Users
                SET ${columns.map((col, idx) => `${col} = $${idx + 1}`).join(', ')}
                WHERE user_id = $${columns.length + 1}
                RETURNING *
                `, [...values, id]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar atualizar User!');
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
                UPDATE Users
                SET ${updateColumns.map((col, idx) => `${col} = $${idx + 1}`).join(', ')}
                WHERE ${whereColumns.map((col, idx) => `${col} = $${updateColumns.length + idx + 1}`).join(' AND ')}
                RETURNING *
                `, [...updateValues, ...whereValues]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar atualizar User(s)!', e.message);
        }
    }

    async delete(id: number){
        try{
            return await this.database.query(
                `
                DELETE FROM Users
                WHERE user_id = $1
                RETURNING *
                `, [id]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar deletar User!');
        }
    }

    async deleteAll(){
        try{
            return await this.database.query(
                `
                DELETE FROM Users
                RETURNING *
                `
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar deletar Users!');
        }
    }

    async deleteWhere(whereClauses: {[key: string]: any}){
        const columns = Object.keys(whereClauses);
        const values = Object.values(whereClauses);

        const where = columns.map((col, idx) => `${col} = $${idx + 1}`).join(' AND ');

        try{
            return await this.database.query(
                `
                DELETE FROM Users
                WHERE ${where}
                RETURNING *
                `, values
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar deletar User(s)!', e.message);
        }
    }
}
