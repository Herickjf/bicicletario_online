import { BadGatewayException, Injectable } from '@nestjs/common';
import { DatabaseService } from 'src/database/database.service';
import EmployeeDto from 'src/dtos/Employee.dto';

@Injectable()
export class EmployeeService {
    constructor(private readonly database: DatabaseService){}

    async create(employee: EmployeeDto){
        try{
            return await this.database.query(
                `
                INSERT INTO Employee (name, email, phone, login, password, biketrack_id)
                VALUES ($1, $2, $3, $4, $5, $6)
                RETURNING *
                `, [
                    employee.name,
                    employee.email,
                    employee.login,
                    employee.password,
                    employee.bike_rack_id
                ]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar cadastrar Empregado!');
        }
    }

    async list(){
        try{
            return await this.database.query(
                `
                SELECT *
                FROM Employee
                `
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar listar Empregados!');
        }
    }

    async search(filter: {[key: string]: any}){
        const columns = Object.keys(filter);
        const values = Object.values(filter);

        const whereCondition = columns.map((col, index) => `${col} = $${index + 1}`).join(' AND ');
        const query = `SELECT * FROM Employee WHERE ${whereCondition}`;

        try{
            return await this.database.query(query, values);
        }catch(e){
            throw new BadGatewayException('Erro ao tentar buscar Empregados!');
        }
    }

    async update(id: number, employee: {[key: string]: any}){
        const columns = Object.keys(employee);
        const values = Object.values(employee);

        const setClause = columns.map((col, index) => `${col} = $${index + 1}`).join(', ');

        const query = `UPDATE Employee SET ${setClause} WHERE employee_id = $${columns.length + 1} RETURNING *`;

        try{
            return await this.database.query(query, [...values, id]);
        }catch(e){
            throw new BadGatewayException('Erro ao tentar atualizar Empregado!');
        }
    }

    async updateWhere(filter: {[key: string]: any}, employee: {[key: string]: any}){
        const filterColumns = Object.keys(filter);
        const filterValues = Object.values(filter);
        const employeeColumns = Object.keys(employee);
        const employeeValues = Object.values(employee);

        try{
            return await this.database.query(
                `
                UPDATE Employee
                SET ${employeeColumns.map((col, idx) => `${col} = $${idx + 1}`).join(', ')}
                WHERE ${filterColumns.map((col, idx) => `${col} = $${employeeColumns.length + idx + 1}`).join(' AND ')}
                RETURNING *
                `, [...employeeValues, ...filterValues]
            );
        }catch(e){
            throw new BadGatewayException('Erro ao tentar atualizar Empregados!');
        }
    }
}
