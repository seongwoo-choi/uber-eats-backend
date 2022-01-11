import { Inject, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Order, OrderStatus } from './entities/order.entity';
import { Repository } from 'typeorm';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { User, UserRole } from '../users/entities/user.entity';
import { RestaurantRepository } from '../restaurants/repositories/restaurant.repository';
import { OrderItem } from './entities/order-item.entity';
import { Dish } from '../restaurants/entities/dish.entity';
import { GetOrdersInput, GetOrdersOutput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { NEW_PENDING_ORDER, PUB_SUB } from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';

@Injectable()
export class OrdersService {
  constructor(
    @InjectRepository(Order)
    private readonly orderRepository: Repository<Order>,
    private readonly restaurantRepository: RestaurantRepository,
    @InjectRepository(OrderItem)
    private readonly orderItemRepository: Repository<OrderItem>,
    @InjectRepository(Dish)
    private readonly dishRepository: Repository<Dish>,
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
  ) {}

  async createOrder(
    customer: User,
    { restaurantId, items }: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(restaurantId);

      if (!restaurant) {
        return {
          ok: false,
          error: '해당하는 식당은 존재하지 않습니다.',
        };
      }

      let orderFinalPrice = 0;
      const orderItems: OrderItem[] = [];
      for (const item of items) {
        const dish = await this.dishRepository.findOne(item.dishId);

        if (!dish) {
          return {
            ok: false,
            error: '해당하는 메뉴를 찾지 못했습니다.',
          };
        }

        let dishFinalPrice = dish.price;

        for (const itemOptions of item.options) {
          const dishOption = dish.options.find(
            (dishOptions) => dishOptions.name == itemOptions.name,
          );
          if (dishOption.extra) {
            dishFinalPrice += dishOption.extra;
          } else {
            const dishOptionChoice = dishOption.choices.find(
              (optionChoice) => optionChoice.name === itemOptions.choice,
            );
            if (dishOptionChoice.extra) {
              dishFinalPrice += dishOptionChoice.extra;
            }
          }
        }
        orderFinalPrice += dishFinalPrice;

        const orderItem = await this.orderItemRepository.save(
          this.orderItemRepository.create({
            dish,
            options: item.options,
          }),
        );
        orderItems.push(orderItem);
      }

      const order = await this.orderRepository.save(
        this.orderRepository.create({
          customer,
          restaurant,
          total: orderFinalPrice,
          items: orderItems,
        }),
      );

      await this.pubSub.publish(NEW_PENDING_ORDER, {
        pendingOrders: { order, ownerId: restaurant.ownerId },
      });

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '주문 생성 실패',
      };
    }
  }

  async getOrders(
    user: User,
    { status }: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    try {
      let orders: Order[];
      if (user.role === UserRole.Client) {
        orders = await this.orderRepository.find({
          where: {
            customer: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Delivery) {
        orders = await this.orderRepository.find({
          where: {
            driver: user,
            ...(status && { status }),
          },
        });
      } else if (user.role === UserRole.Owner) {
        const restaurants = await this.restaurantRepository.find({
          where: {
            owner: user,
          },
          relations: ['orders'],
        });

        // Array 내부에서 Array 를 바깥으로 빼낸다.
        orders = restaurants.map((restaurant) => restaurant.orders).flat(1);

        if (status) {
          // filter 는 조건을 충족시키지 못하는 요소를 제외한다.
          orders = orders.filter((order) => order.status === status);
        }
      }

      return {
        ok: true,
        orders: orders,
      };
    } catch {
      return {
        ok: false,
        error: '주문을 불러오는데 실패했습니다.',
      };
    }
  }

  canSeeOrder(user: User, order: Order): boolean {
    let canSee = true;
    if (user.role === UserRole.Client && order.customerId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Delivery && order.driverId !== user.id) {
      canSee = false;
    }
    if (user.role === UserRole.Owner && order.restaurant.ownerId !== user.id) {
      canSee = false;
    }
    return canSee;
  }

  async getOrder(user: User, { id }: GetOrderInput): Promise<GetOrderOutput> {
    try {
      const order = await this.orderRepository.findOne(id, {
        relations: ['restaurant'],
      });

      if (!order) {
        return {
          ok: false,
          error: '해당하는 주문을 찾을 수 없습니다.',
        };
      }

      // if (
      //   order.customerId !== user.id &&
      //   order.driverId !== user.id &&
      //   order.restaurant.ownerId !== user.id
      // ) {
      //   return {
      //     ok: false,
      //     error: '권한이 없는 사용자입니다.',
      //   };
      // }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '수정 권한이 없는 사용자입니다.',
        };
      }

      return {
        ok: true,
        order,
      };
    } catch {
      return {
        ok: false,
        error: '주문을 불러오는데 실패했습니다.',
      };
    }
  }

  async editOrder(
    user: User,
    { id: orderId, status }: EditOrderInput,
  ): Promise<EditOrderOutput> {
    try {
      const order = await this.orderRepository.findOne(orderId, {
        relations: ['restaurant'],
      });
      if (!order) {
        return {
          ok: false,
          error: '해당하는 주문을 찾지 못했습니다.',
        };
      }

      if (!this.canSeeOrder(user, order)) {
        return {
          ok: false,
          error: '수정 권한이 없는 사용자입니다.',
        };
      }

      // 주문을 수정할 수 있는 건 Owner 와 Delivery
      // restaurant 가 order 를 받으면 order entity 의 status 는 Cooking
      // restaurant => Cooked, Cooking
      // Delivery => PickedUp, Delivered
      // Owner 는 메뉴를 수정, Delivery 는 Status 를 수정

      let canEdit = true;
      if (user.role === UserRole.Client) {
        canEdit = false;
      }
      if (user.role === UserRole.Owner) {
        if (status !== OrderStatus.Cooking && status !== OrderStatus.Cooked) {
          canEdit = false;
        }
      }
      if (user.role === UserRole.Delivery) {
        if (status !== OrderStatus.Cooked && status !== OrderStatus.PickedUp) {
          canEdit = false;
        }
      }

      if (!canEdit) {
        return {
          ok: false,
          error: '수정 권한이 없는 유저입니다.',
        };
      }

      await this.orderRepository.save({
        id: orderId,
        status,
      });

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '주문 수정에 실패했습니다.',
      };
    }
  }
}
