import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { FavoritesModule } from './favorites/favorites.module';

@Module({
  imports: [FavoritesModule],
  controllers: [],
  providers: [AppService],
})
export class AppModule {}
