import { Injectable } from '@nestjs/common';
import { Restaurant } from './entities/restaurant.entity';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';

@Injectable()
export class RestaurantService {
  // @Module() imports 에 TypeOrmModule.forFeature([엔티티 클래스, 엔티티 클래스]) => 레포지토리 작성 가능
  // restaurant entity 의 repository 를 inject 하고 있다.
  constructor(
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    @InjectRepository(Category)
    private readonly categoryRepository: Repository<Category>,
  ) {}

  // create 와 save 의 차이점
  async createRestaurant(
    owner: User,
    createRestaurantInput: CreateRestaurantInput,
  ): Promise<CreateRestaurantOutput> {
    try {
      const newRestaurant = this.restaurantRepository.create(
        createRestaurantInput,
      );
      newRestaurant.owner = owner;

      // trim 을 사용해서 문자 앞 뒤의 띄어쓰기 제거
      // toLowerCase 을 사용해서 모든 문자 소문자로 변경
      const categoryName = createRestaurantInput.categoryName
        .trim()
        .toLowerCase();

      // 정규 표현식을 사용해서 띄어쓰기 부분을 - 으로 대체한다.
      const categorySlug = categoryName.replace(/ /g, '-');

      let category = await this.categoryRepository.findOne({
        slug: categorySlug,
      });

      if (!category) {
        category = await this.categoryRepository.save(
          this.categoryRepository.create({
            slug: categorySlug,
            name: categoryName,
            coverImage: '',
          }),
        );
      }

      newRestaurant.category = category;

      await this.restaurantRepository.save(newRestaurant);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error: '레스토랑을 생성하지 못했습니다.',
      };
    }
  }
}
