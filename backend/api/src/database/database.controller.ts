import { Controller, Delete, Param, Patch, Post } from '@nestjs/common';
import { DatabaseService } from './database.service';

@Controller('database')
export class DatabaseController {
    constructor(private readonly database: DatabaseService){}

    @Patch("/create/:password")
    async create(@Param("password") password: string){
        return await this.database.createTables(password);
    }

    @Delete("/deleteAll/:password")
    async deleteAllTables(@Param("password") password: string){
        return await this.database.deleteAllTables(password);
    }

    @Delete("/deleteTable/:password/:tableName")
    async deleteTable(
        @Param("password")  password: string,
        @Param("tableName") tableName: string
    ){
        return await this.database.deleteTable(password, tableName);
    }

    @Post("/fillTables/:password")
    async fillTables(@Param("password") password: string){
        return await this.database.fillTables(password);
    }
}
