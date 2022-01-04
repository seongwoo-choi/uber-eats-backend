import { Module } from '@nestjs/common';
import { OrdersService } from './orders.service';
import { OrdersResolver } from './orders.resolver';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Order } from './entities/order.entity';
import { RestaurantRepository } from '../restaurants/repositories/restaurant.repository';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Order, RestaurantRepository, OrderItem, Dish]),
  ],
  providers: [OrdersService, OrdersResolver],
  exports: [],
})
export class OrdersModule {}
