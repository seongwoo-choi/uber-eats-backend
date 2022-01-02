import { Injectable } from '@nestjs/common';
import {
  CreateRestaurantInput,
  CreateRestaurantOutput,
} from './dto/create-restaurant.dto';
import { User } from '../users/entities/user.entity';
import { Category } from './entities/category.entity';
import {
  EditRestaurantInput,
  EditRestaurantOutput,
} from './dto/edit-restaurant.dto';
import { CategoryRepository } from './repositories/category.repository';
import { DeleteRestaurantOutput } from './dto/delete-restaurant.dto';
import { AllCategoriesOutput } from './dto/all-categories.dto';
import { CategoryInput, CategoryOutput } from './dto/category.dto';
import { RestaurantsInput, RestaurantsOutput } from './dto/restaurants.dto';
import { RestaurantInput, RestaurantOutput } from './dto/restaurnat.dto';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from './dto/search-restaurant.dto';
import { RestaurantRepository } from './repositories/restaurant.repository';

@Injectable()
export class RestaurantService {
  // @Module() imports 에 TypeOrmModule.forFeature([엔티티 클래스, 엔티티 클래스]) => 레포지토리 작성 가능
  // restaurant entity 의 repository 를 inject 하고 있다.
  constructor(
    private readonly restaurantRepository: RestaurantRepository,
    private readonly categoryRepository: CategoryRepository,
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

      newRestaurant.category = await this.categoryRepository.getOrCreate(
        createRestaurantInput.categoryName,
      );

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

  async editRestaurant(
    owner: User,
    editRestaurantInput: EditRestaurantInput,
  ): Promise<EditRestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(
        {
          id: editRestaurantInput.restaurantId,
        },
        { loadRelationIds: true },
      );

      if (!restaurant) {
        return {
          ok: false,
          error: '레스토랑을 찾지 못했습니다.',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '수정권한이 없는 사용자입니다.',
        };
      }

      let category: Category = null;

      if (editRestaurantInput.categoryName) {
        category = await this.categoryRepository.getOrCreate(
          editRestaurantInput.categoryName,
        );
      }

      // save 에서 id 를 보내지 않는 경우 -> 새로운 entity 를 생성하는 작업을 한다.
      // update 를 위해서라도 save 를 할 시에 꼭 id 를 보내줘야 한다.
      // 그래야 TypeORM 이 해당 entity 를 찾아 update 해준다.
      await this.restaurantRepository.save([
        {
          id: editRestaurantInput.restaurantId,
          ...editRestaurantInput,
          // category 가 존재하면 category 가 category 인 object 를 리턴
          ...(category && { category }),
        },
      ]);

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async deleteRestaurant(
    owner: User,
    id: number,
  ): Promise<DeleteRestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        id,
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '삭제하고자 하는 레스토랑이 존재하지 않습니다.',
        };
      }

      if (owner.id !== restaurant.ownerId) {
        return {
          ok: false,
          error: '삭제 권한이 없는 유저입니다.',
        };
      }

      await this.restaurantRepository.delete({
        id,
      });

      return {
        ok: true,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async allCategories(): Promise<AllCategoriesOutput> {
    try {
      const categories = await this.categoryRepository.find();
      return {
        ok: true,
        categories,
      };
    } catch (error) {
      return {
        ok: false,
        error: '카테고리를 찾지 못했습니다.',
      };
    }
  }

  countRestaurant(category: Category) {
    return this.restaurantRepository.count({ category });
  }

  async findCategoryBySlug(
    categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    try {
      const category = await this.categoryRepository.findOne({
        slug: categoryInput.slug,
      });

      if (!category) {
        return {
          ok: false,
          error: '해당하는 카테고리는 존재하지 않습니다.',
        };
      }

      return this.restaurantRepository.categoryBySlugPagination(
        category,
        categoryInput,
      );
    } catch {
      return {
        ok: false,
        error: '카테고리 목록을 불러올 수 없습니다.',
      };
    }
  }

  async allRestaurants(
    restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    try {
      return this.restaurantRepository.allRestaurantsPagination(
        restaurantsInput,
      );
    } catch {
      return {
        ok: false,
        error: '해당하는 식당을 찾을 수 없습니다.',
      };
    }
  }

  async findRestaurantById({
    restaurantId,
  }: RestaurantInput): Promise<RestaurantOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne({
        id: restaurantId,
      });

      if (!restaurant) {
        return {
          ok: false,
          error: '해당하는 식당은 존재하지 않습니다.',
        };
      }

      return {
        ok: true,
        restaurant,
      };
    } catch {
      return {
        ok: false,
        error: '해당하는 식당은 존재하지 않습니다.',
      };
    }
  }

  async searchRestaurantByName(
    searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    try {
      return this.restaurantRepository.searchPagination(searchRestaurantInput);
    } catch {
      return {
        ok: false,
        error: '해당하는 식당을 찾는 도중 오류가 발생했습니다.',
      };
    }
  }
}
