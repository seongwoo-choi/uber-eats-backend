import { Module } from '@nestjs/common';
import { CategoryResolver, RestaurantsResolver } from './restaurants.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RestaurantService } from './restaurant.service';
import { CategoryRepository } from './repositories/category.repository';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Module({
  // 배열 안에 entity 클래스들을 넣을 것이다.
  imports: [
    TypeOrmModule.forFeature([RestaurantRepository, CategoryRepository]),
  ],
  providers: [RestaurantsResolver, CategoryResolver, RestaurantService],
})
export class RestaurantsModule {}
