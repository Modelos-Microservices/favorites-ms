import { Module } from '@nestjs/common';
import { FavoritesService } from './favorites.service';
import { FavoritesController } from './favorites.controller';
import { PrismaService } from 'src/common/prisma.service';
import { NatsModule } from 'src/nats/nats.module';

@Module({
  controllers: [FavoritesController],
  providers: [FavoritesService, PrismaService],
  imports: [NatsModule],
})
export class FavoritesModule {}
