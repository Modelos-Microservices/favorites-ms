import { Controller, Logger } from '@nestjs/common'; 
import { MessagePattern, Payload } from '@nestjs/microservices';
import { FavoritesService } from './favorites.service';
import { CreateFavoriteDto } from './dto/create-favorite.dto';
import { UpdateFavoriteDto } from './dto/update-favorite.dto';

@Controller()
export class FavoritesController {
  private readonly logger = new Logger(FavoritesController.name); 

  constructor(private readonly favoritesService: FavoritesService) {}

  @MessagePattern({ cmd: 'createFavorite' })
  create(@Payload() createFavoriteDto: CreateFavoriteDto) {
    this.logger.log('Received createFavorite command');
    return this.favoritesService.create(createFavoriteDto);
  }

  @MessagePattern({ cmd: 'findAllFavorites' }) 
  findAll() {
    this.logger.log('Received findAllFavorites command');
    return this.favoritesService.findAll();
  }

  @MessagePattern({ cmd: 'findOneFavorite' }) 
  findOne(@Payload() id: string) {
    this.logger.log(`Received findOneFavorite command for ID: ${id}`);
    return this.favoritesService.findOne(id);
  }

  @MessagePattern({ cmd: 'updateFavorite' })
  update(@Payload() updateFavoriteDto: UpdateFavoriteDto) {
    this.logger.log(`Received updateFavorite command for ID: ${updateFavoriteDto.id}`);
    return this.favoritesService.update(updateFavoriteDto.id, updateFavoriteDto);
  }

  @MessagePattern({ cmd: 'removeFavorite' })
  remove(@Payload() id: string) {
    this.logger.log(`Received removeFavorite command for ID: ${id}`);
    return this.favoritesService.remove(id);
  }
}