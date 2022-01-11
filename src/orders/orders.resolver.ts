import { Args, Mutation, Query, Resolver, Subscription } from '@nestjs/graphql';
import { Order } from './entities/order.entity';
import { OrdersService } from './orders.service';
import { CreateOrderInput, CreateOrderOutput } from './dtos/create-order.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/role.decorator';
import { GetOrdersOutput, GetOrdersInput } from './dtos/get-orders.dto';
import { GetOrderInput, GetOrderOutput } from './dtos/get-order.dto';
import { EditOrderInput, EditOrderOutput } from './dtos/edit-order.dto';
import { Inject } from '@nestjs/common';
import { PUB_SUB } from '../common/common.constants';
import { PubSub } from 'graphql-subscriptions';
import { filter } from 'rxjs';

@Resolver(() => Order)
export class OrdersResolver {
  constructor(
    @Inject(PUB_SUB)
    private readonly pubSub: PubSub,
    private readonly ordersService: OrdersService,
  ) {}

  @Mutation(() => CreateOrderOutput)
  @Role(['Client', 'Owner'])
  async createOrder(
    @AuthUser() customer: User,
    @Args('input') createOrderInput: CreateOrderInput,
  ): Promise<CreateOrderOutput> {
    return this.ordersService.createOrder(customer, createOrderInput);
  }

  @Query(() => GetOrdersOutput)
  @Role(['Any'])
  async getOrders(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrdersInput,
  ): Promise<GetOrdersOutput> {
    return this.ordersService.getOrders(user, getOrdersInput);
  }

  @Query(() => GetOrderOutput)
  @Role(['Any'])
  async getOrder(
    @AuthUser() user: User,
    @Args('input') getOrdersInput: GetOrderInput,
  ): Promise<GetOrderOutput> {
    return this.ordersService.getOrder(user, getOrdersInput);
  }

  @Mutation(() => EditOrderOutput)
  @Role(['Any'])
  async editOrder(
    @AuthUser() user: User,
    @Args('input') editOrderInput: EditOrderInput,
  ): Promise<EditOrderOutput> {
    return this.ordersService.editOrder(user, editOrderInput);
  }

  @Mutation(() => Boolean)
  async sinReady(@Args('id') sinId: number) {
    await this.pubSub.publish('sin', { readySin: sinId });
    return true;
  }

  @Subscription(() => String, {
    filter: ({ readySin }, { id }, context) => {
      console.log(readySin, id, context);
      // payload.sinId 가 variables 와 같을 경우 true
      return readySin === id;
    },
  })
  @Role(['Any'])
  readySin(@Args('id') sinId: number) {
    return this.pubSub.asyncIterator('sin');
  }
}
