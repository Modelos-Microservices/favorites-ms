// src/favorites/favorites.service.ts

import { Inject, Injectable, Logger } from '@nestjs/common';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';
import { Prisma } from '@prisma/client';
import { PrismaService } from 'src/common/prisma.service';
import { NATS_SERVICE } from 'src/conf/services';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { HttpStatus } from '@nestjs/common';

@Injectable()
export class FavoritesService {
    private readonly logger = new Logger(FavoritesService.name);

    constructor(
        private readonly prisma: PrismaService,
        @Inject(NATS_SERVICE) private readonly client: ClientProxy
    ) {}

    async comprobateProductExists(productId: number) {
        this.logger.debug(`Checking existence of product ID: ${productId}`);
        try {
            const product = await firstValueFrom(
                this.client.send({ cmd: 'get_one_product' }, { id: productId })
            );

            if (!product) {
                this.logger.warn(`Product with ID ${productId} not found via product service.`);
                throw new RpcException({ status: HttpStatus.NOT_FOUND, message: 'Product not found' });
            }
            this.logger.debug(`Product with ID ${productId} found via product service.`);
            return product;
        } catch (error) {
            this.logger.error(`Error communicating with product service for ID ${productId}:`, error);
            if (error instanceof RpcException) {
                 throw error;
            }
            throw new RpcException({
                status: HttpStatus.INTERNAL_SERVER_ERROR,
                message: 'Error verifying product existence',
            });
        }
    }

    async create(createFavoriteDto: CreateFavoriteDto) {
        this.logger.log(`Attempting to create favorite for user ${createFavoriteDto.user_id} and product ${createFavoriteDto.product_id}`);
        const { product_id, user_id } = createFavoriteDto;

        await this.comprobateProductExists(product_id);

        try {
            const favorite = await this.prisma.favorite.create({
                data: {
                    user_id: user_id,
                    product_id: product_id,
                },
            });
            this.logger.log(`Favorite created with ID: ${favorite.id}`);
            return favorite;
        } catch (error) {
            this.logger.error('Error creating favorite:', error);
            if (error instanceof Prisma.PrismaClientKnownRequestError) {
                 if (error.code === 'P2002') {
                      throw new RpcException({ status: HttpStatus.CONFLICT, message: 'Product already favorited by this user' });
                 }
            }
            throw new RpcException({
                 status: HttpStatus.INTERNAL_SERVER_ERROR,
                 message: 'Failed to create favorite',
            });
        }
    }

    async findAll() {
        this.logger.log('Fetching all favorites...');
        try {
            const favorites = await this.prisma.favorite.findMany();
            this.logger.debug(`Found ${favorites.length} favorites.`);
            return favorites;
        } catch (error) {
            this.logger.error('Error finding all favorites:', error);
            throw new RpcException({
                 status: HttpStatus.INTERNAL_SERVER_ERROR,
                 message: 'Failed to fetch favorites',
            });
        }
    }

    async findOne(id: string) {
        this.logger.log(`Workspaceing favorite with ID: ${id}`);
         if (typeof id !== 'string' || id.length === 0) {
             throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid Favorite ID format' });
         }
        try {
            const favorite = await this.prisma.favorite.findUnique({
                where: { id: id },
            });

            if (!favorite) {
                this.logger.warn(`Favorite with ID ${id} not found.`);
                throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Favorite with id ${id} not found` });
            }
            this.logger.debug(`Favorite with ID ${id} found.`);
            return favorite;
        } catch (error) {
           if (error instanceof RpcException) {
               throw error;
           }
            this.logger.error(`Error fetching favorite with ID ${id}:`, error);
             throw new RpcException({
                 status: HttpStatus.INTERNAL_SERVER_ERROR,
                 message: `Failed to fetch favorite with id ${id}`,
            });
        }
    }

    async update(id: string, updateFavoriteDto: UpdateFavoriteDto) {
        this.logger.log(`Attempting to update favorite with ID: ${id}`);
        if (typeof id !== 'string' || id.length === 0) {
            throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid Favorite ID format' });
        }

        const dataToUpdate = updateFavoriteDto;

        try {
            const updatedFavorite = await this.prisma.favorite.update({
                where: { id: id },
                data: dataToUpdate as any,
            });
            this.logger.log(`Favorite with ID ${id} updated.`);
            return updatedFavorite;
        } catch (error) {
             if (error instanceof Prisma.PrismaClientKnownRequestError) {
                 if (error.code === 'P2025') {
                     this.logger.warn(`Favorite with ID ${id} not found for update.`);
                     throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Favorite with id ${id} not found` });
                 }
            }
            this.logger.error(`Error updating favorite with ID ${id}:`, error);
             throw new RpcException({
                 status: HttpStatus.INTERNAL_SERVER_ERROR,
                 message: `Failed to update favorite with id ${id}`,
            });
        }
    }

    async remove(id: string) {
        this.logger.log(`Attempting to remove favorite with ID: ${id}`);
         if (typeof id !== 'string' || id.length === 0) {
             throw new RpcException({ status: HttpStatus.BAD_REQUEST, message: 'Invalid Favorite ID format' });
         }
        try {
            const deletedFavorite = await this.prisma.favorite.delete({
                where: { id: id },
            });
            this.logger.log(`Favorite with ID ${id} removed.`);
            return deletedFavorite;
        } catch (error) {
             if (error instanceof Prisma.PrismaClientKnownRequestError) {
                 if (error.code === 'P2025') {
                      this.logger.warn(`Favorite with ID ${id} not found for removal.`);
                     throw new RpcException({ status: HttpStatus.NOT_FOUND, message: `Favorite with id ${id} not found` });
                 }
            }
            this.logger.error(`Error removing favorite with ID ${id}:`, error);
             throw new RpcException({
                 status: HttpStatus.INTERNAL_SERVER_ERROR,
                 message: `Failed to remove favorite with id ${id}`,
            });
        }
    }
}