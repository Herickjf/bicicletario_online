import { Injectable } from '@nestjs/common';
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
}
