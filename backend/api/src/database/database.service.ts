import { BadRequestException, Injectable, UnauthorizedException } from '@nestjs/common';
import { Pool } from 'pg';
import * as path from 'path';
import * as fs from 'fs';

import * as dotenv from 'dotenv';
dotenv.config();

@Injectable()
export class DatabaseService {
    private conn: Pool;
    constructor(){
        this.conn = new Pool({
            user:       process.env.DATABASE_USER,
            password:   process.env.DATABASE_PASSWORD,
            host:       process.env.DATABASE_HOST,
            port:       Number(process.env.DATAPASE_PORT),
            database:   process.env.DATABASE_NAME
        });
    }

    // Funcoes utilitárias
    async query(sql: string, params?: any[] | object){
        let queryParams: any[] = [];

        if (params && typeof params === 'object' && !Array.isArray(params)) {
            queryParams = Object.values(params);
        } else if (params) {
            queryParams = params as any[];
        }
        
        try {
            return (await this.conn.query(sql, queryParams)).rows;
        } catch (e) {
            console.error("Erro na query:", sql, e);
            throw new BadRequestException("Falha na execução da query:", e.message);
        }
    }

    async executeSQL(pathName: string, message?: string){
        const fullPath = path.join(__dirname, `sql/${pathName}`);
        const sql = fs.readFileSync(fullPath, "utf8");

        try{
            var ret = await this.query(sql);
            console.log("[v]", message ? message:"Operação", "bem sucedida(o)!");
            return ret;
        }catch(e){
            console.error("[!] Executar ao executar SQL: ", e);
            throw e;
        }
    }


    // Funcoes de Serviço, de fato
    async createTables(password: string){
        if(password != process.env.DATABASE_PERMISION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")

        return await this.executeSQL("create_tables.sql", "Criação das Tabelas");
    }

    async deleteAllTables(password: string){
        if(password != process.env.DATABASE_PERMISION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")
        
        return await this.executeSQL("delete_tables.sql", "Deleção das tabelas");
    }
    
    async deleteTable(password: string, tableName: string){
        if(password != process.env.DATABASE_PERMISION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")

        try{
            return await this.query(
                `
                DROP TABLE IF EXISTS $1 CASCADE;
                `
                ,[`${tableName}`]
            );
        }catch(e){
            throw e;
        }
    }

    async fillTables(password: string){
        if(password != process.env.DATABASE_PERMISION_PASSWORD)
            throw new UnauthorizedException("[!] Incorrect password. Looks like you're not authorized to do this change!")

        return await this.executeSQL("fill_tables.sql", "Preenchimento das Tabelas");
    }

}
