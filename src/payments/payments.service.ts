import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Payment } from './entities/payment.entity';
import { LessThan, Repository } from 'typeorm';
import {
  CreatePaymentInput,
  CreatePaymentOutput,
} from './dtos/create-payment.dto';
import { User } from '../users/entities/user.entity';
import { Restaurant } from '../restaurants/entities/restaurant.entity';
import { GetPaymentsOutput } from './dtos/get-payments.dto';
import { Cron, Interval, SchedulerRegistry, Timeout } from '@nestjs/schedule';

@Injectable()
export class PaymentsService {
  constructor(
    @InjectRepository(Payment)
    private readonly paymentsRepository: Repository<Payment>,
    @InjectRepository(Restaurant)
    private readonly restaurantRepository: Repository<Restaurant>,
    private schedulerRegistry: SchedulerRegistry,
  ) {}

  async createPayment(
    owner: User,
    { transactionId, restaurantId }: CreatePaymentInput,
  ): Promise<CreatePaymentOutput> {
    try {
      const restaurant = await this.restaurantRepository.findOne(restaurantId);
      if (!restaurant) {
        return {
          ok: false,
          error: '해당하는 레스토랑은 존재하지 않습니다.',
        };
      }

      if (restaurant.ownerId !== owner.id) {
        return {
          ok: false,
          error: '생성 권한이 없는 사용자입니다.',
        };
      }

      restaurant.isPromoted = true;
      const date = new Date();
      date.setDate(date.getDate() + 7);
      restaurant.promotedUntil = date;

      await this.restaurantRepository.save(restaurant);

      await this.paymentsRepository.save(
        this.paymentsRepository.create({
          transactionId,
          user: owner,
          restaurant,
        }),
      );

      return {
        ok: true,
      };
    } catch {
      return {
        ok: false,
        error: '결제 생성 실패',
      };
    }
  }

  async getPayments(owner: User): Promise<GetPaymentsOutput> {
    try {
      const payments = await this.paymentsRepository.find({
        user: owner,
      });
      return {
        ok: true,
        payments: payments,
      };
    } catch {
      return {
        ok: false,
        error: '결제 정보를 불러오는데 실패했습니다.',
      };
    }
  }

  @Cron('0 0 24 * * *')
  async checkPromotedRestaurants() {
    const restaurants = await this.restaurantRepository.find({
      isPromoted: true,
      promotedUntil: LessThan(new Date()),
    });

    for (const restaurant of restaurants) {
      restaurant.isPromoted = false;
      restaurant.promotedUntil = null;
      await this.restaurantRepository.save(restaurant);
    }
  }
}
