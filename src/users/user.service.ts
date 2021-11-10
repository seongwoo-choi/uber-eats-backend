import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entites/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dtos/create-account.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<{ ok: boolean; error?: string }> {
    // 데이터베이스에 존재하는 이메일인지 체크해야 한다.
    try {
      const exists = await this.userRepository.findOne({ email });
      if (exists) {
        // 에러 발생 throw new error, return false
        // throw Error(); or throw new BadRequestError();
        return { ok: false, error: '이미 존재하는 이메일입니다.' };
      }
      // 계정을 생성하고 DB 에 계정 저장
      await this.userRepository.save(
        this.userRepository.create({ email, password, role }),
      );
      return { ok: true };
    } catch (e) {
      console.log(e);
      return { ok: false, error: '계정을 생성할 수 없습니다.' };
    }

    // 비밀번호 해쉬
    // 위 모든게 다 true 이면 db 에 save
  }
}
