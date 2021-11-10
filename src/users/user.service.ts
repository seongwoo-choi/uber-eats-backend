import { BadRequestException, Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateAccountInput } from './dto/create-account.dto';
import { LoginInput, LoginOutput } from './dto/login.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
  ) {}

  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

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

    // 비밀번호 해쉬 => User Entity 에서 @BeforeInsert() 사용하여 해시
    // 위 모든게 다 true 이면 db 에 save
  }

  async login({
    email,
    password,
  }: LoginInput): Promise<{ ok: boolean; error?: string; token?: string }> {
    // 1. 해당하는 이메일을 가진 유저를 찾아라
    // 2. password 가 맞는지 확인
    // 3. JWT 를 만들고 user 에게 주기
    try {
      // .findOne({ email: email })
      const user = await this.userRepository.findOne({ email });
      if (!user) {
        return {
          ok: false,
          error: '해당하는 유저가 존재하지 않습니다.',
        };
      }
      const passwordCorrect = await user.checkPassword(password);
      if (!passwordCorrect) {
        return {
          ok: false,
          error: '잘못된 비밀번호입니다.',
        };
      }
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
    return {
      ok: true,
      token: 'correct',
    };
  }
}
