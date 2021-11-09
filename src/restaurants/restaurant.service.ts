import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateRestaurantDto } from './dto/create-restaurant.dto';

@Injectable()
export class RestaurantService {
  // @Module() imports 에 TypeOrmModule.forFeature([엔티티 클래스, 엔티티 클래스]) => 레포지토리 작성 가능
  // restaurant entity 의 repository 를 inject 하고 있다.
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
  ) {}

  async getAll(): Promise<Restaurant[]> {
    return this.restaurantRepository.find();
  }

  // create 와 save 의 차이점
  async createRestaurant(
    createRestaurantDto: CreateRestaurantDto,
  ): Promise<Restaurant> {
    // newRestaurant 는 자바스크립트 상에서 존재하고 실제 DB 에 저장되어 있지는 않다.
    const newRestaurant = this.restaurantRepository.create(createRestaurantDto);
    // this.restaurantRepository.save() 는 DB 와 실제로 통신을 하는 부분이고 이에 따라 async await 를 사용 => Promise 객체를 반환한다.
    return this.restaurantRepository.save(newRestaurant);
  }
}
