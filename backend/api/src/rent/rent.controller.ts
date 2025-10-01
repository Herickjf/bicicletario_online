import { Controller, Get, Post, Body, Param, Patch, Delete } from '@nestjs/common';
import { RentService } from './rent.service'
import { RentDto } from 'src/dtos/Rent.dto'

@Controller('rent')
export class RentController {
    constructor(private readonly service: RentService){}

    @Post('createRent')
    async criarPedido(@Body() pedido: RentDto){
        return await this.service.criarPedido(pedido);
    }

    @Get('getRent/:id_rent')
    async getPedido(@Param('id_rent') id_rent: number){
        return await this.service.pedido(id_rent);
    }

    @Get('getAllBikerackRents/:id_bikerack')
    async listarPedidosBikerack(@Param('id_bikerack') id_bikerack: number){
        return await this.service.listarPedidosBikerack(id_bikerack);
    }

    @Get('getAllCustomerRents/:id_user/:id_bikerack')
    async listarPedidosUsuario(@Param('id_user') id_user: number, @Param('id_bikerack') id_bikerack: number){
        return await this.service.listarPedidosUsuario(id_bikerack, id_user);
    }

    @Patch('finishRent/:id_rent')
    async finalizarPedido(@Param('id_rent') id_rent: number){
        return await this.service.finalizarPedido(id_rent);
    }

    @Patch('cancelRent/:id_rent')
    async cancelarPedido(@Param('id_rent') id_rent: number){
        return await this.service.cancelarPedido(id_rent);
    }

    @Delete('deleteRent/:id_rent')
    async deletarPedido(@Param('id_rent') id_rent: number){
        return await this.service.deletarPedido(id_rent);
    }

}
