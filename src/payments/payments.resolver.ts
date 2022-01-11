import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { PaymentsService } from './payments.service';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { AuthUser } from '../auth/auth-user.decorator';
import { User } from '../users/entities/user.entity';
import { Role } from '../auth/role.decorator';
import { GetPaymentsOutput } from './dtos/get-payments.dto';

@Resolver()
export class PaymentsResolver {
  constructor(private readonly paymentsService: PaymentsService) {}

  @Mutation(() => CreatePaymentOutput)
  @Role(['Owner'])
  createPayment(
    @AuthUser() owner: User,
    @Args('input') createPaymentInput: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    return this.paymentsService.createPayment(owner, createPaymentInput);
  }

  @Query(() => GetPaymentsOutput)
  @Role(['Owner'])
  getPayments(@AuthUser() owner: User): Promise<GetPaymentsOutput> {
    return this.paymentsService.getPayments(owner);
  }
}
