import { EntityRepository, ILike, Raw, Repository } from 'typeorm';
import { Restaurant } from '../entities/restaurant.entity';
import {
  SearchRestaurantInput,
  SearchRestaurantOutput,
} from '../dto/search-restaurant.dto';
import { RestaurantsInput, RestaurantsOutput } from '../dto/restaurants.dto';
import { CategoryInput, CategoryOutput } from '../dto/category.dto';
import { Category } from '../entities/category.entity';

@EntityRepository(Restaurant)
export class RestaurantRepository extends Repository<Restaurant> {
  async searchPagination(
    searchRestaurantInput: SearchRestaurantInput,
  ): Promise<SearchRestaurantOutput> {
    const [restaurants, totalResults] = await this.findAndCount({
      take: 25,
      skip: (searchRestaurantInput.page - 1) * 25,
      where: {
        name: Raw((name) => `${name} ILIKE '%${searchRestaurantInput.query}%'`),
      },
    });

    if (!restaurants) {
      return {
        ok: false,
        error: '해당하는 식당은 존재하지 않습니다.',
      };
    }

    return {
      ok: true,
      restaurants,
      totalPage: Math.ceil(totalResults / 25),
    };
  }

  async allRestaurantsPagination(
    restaurantsInput: RestaurantsInput,
  ): Promise<RestaurantsOutput> {
    const [restaurants, totalResults] = await this.findAndCount({
      take: 25,
      skip: (restaurantsInput.page - 1) * 25,
      order: {
        isPromoted: 'DESC',
      },
    });

    if (!restaurants) {
      return {
        ok: false,
        error: '해당하는 식당은 존재하지 않습니다.',
      };
    }

    return {
      ok: true,
      totalPage: Math.ceil(totalResults / 25),
      results: restaurants,
    };
  }

  async categoryBySlugPagination(
    category: Category,
    categoryInput: CategoryInput,
  ): Promise<CategoryOutput> {
    const restaurants = await this.find({
      where: {
        category: category,
      },
      order: {
        isPromoted: 'DESC',
      },
      take: 25,
      skip: (categoryInput.page - 1) * 25,
    });

    category.restaurants = restaurants;

    const totalResults = await this.count({ category });

    return {
      ok: true,
      category,
      totalPage: Math.ceil(totalResults / 25),
    };
  }
}
