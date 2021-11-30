import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import {
  CreateAccountInput,
  CreateAccountOutput,
} from './dto/create-account.dto';
import { LoginInput } from './dto/login.dto';
import { JwtService } from '../jwt/jwt.service';
import { EditProfileInput, EditProfileOutput } from './dto/edit-profile.dto';
import { Verification } from './entities/verification.entity';
import { VerifyEmailOutput } from './dto/verify-email.dto';
import { UserProfileOutput } from './dto/user-profile.dto';
import { MailService } from '../mail/mail.service';
import { v4 as uuidv4 } from 'uuid';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private readonly userRepository: Repository<User>,
    @InjectRepository(Verification)
    private readonly verificationRepository: Repository<Verification>,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
    // console.log(this.config.get('SECRET_KEY'));
    // console.log(this.config.get('DB_NAME'));
    // console.log(this.config.get('DB_PORT'));
    // console.log(this.config.get('DB_USERNAME'));
  }

  async getAll(): Promise<User[]> {
    return await this.userRepository.find();
  }

  async createAccount({
    email,
    password,
    role,
  }: CreateAccountInput): Promise<CreateAccountOutput> {
    // 데이터베이스에 존재하는 이메일인지 체크해야 한다.
    try {
      const exists = await this.userRepository.findOne({ email });
      console.log(exists);
      if (exists) {
        // 에러 발생 throw new error, return false
        // throw Error(); or throw new BadRequestError();
        return { ok: false, error: '이미 존재하는 이메일입니다.' };
      }

      // 계정을 생성하고 DB 에 계정 저장 => BeforeInsert 로 인해 password 암호화
      const user = await this.userRepository.save(
        this.userRepository.create({ email, password, role }),
      );
      const verification = await this.verificationRepository.save(
        this.verificationRepository.create({
          user,
        }),
      );
      this.mailService.sendVerificationEmail(user.email, verification.code);
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
      const user = await this.userRepository.findOne(
        { email },
        // select 가 false 여서 select: ['password'] 로 값을 명시적으로 적어야 가져온다.
        { select: ['id', 'password', 'email', 'verified'] },
      );
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
      // token 에는 중요한 정보를 넣지 않는다. 유저가 누구인지를 알 수 있는 정보만 넣도록 한다.
      // const token = jwt.sign({ id: user.id }, process.env.SECRET_KEY);
      // ConfigService 를 DI 받아서 configService 를 service 단에서 사용 가능
      // const token = jwt.sign({ id: user.id }, this.config.get('SECRET_KEY'));
      // const token = this.jwtService.sign({ id: user.id });
      console.log(user);
      const token = this.jwtService.sign(user.id);
      return {
        ok: true,
        token,
      };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }

  async findById(id: number): Promise<UserProfileOutput> {
    try {
      const user = await this.userRepository.findOneOrFail({ id });

      return {
        ok: true,
        user: user,
      };
    } catch (error) {
      return { ok: false, error: '해당하는 유저를 찾을 수 없습니다.' };
    }
  }

  async editProfile(
    userId: number,
    { email, password }: EditProfileInput,
  ): Promise<EditProfileOutput> {
    // update 는 entity 를 부분적으로 update 한다.
    // db 에 entity 가 존재하는지 안하는지 체크하지 않는다.
    // login 한 경우가 아니면 user service 에서 editProfile 을 실행할 수 없다.
    // criteria 에는 변경하고자 하는 녀석을 값을 key-value 로 지정해서 넘겨주고, 그 후에 update 할 내용을 넘겨준다.
    // typeORM 은 string, number, number[], objectID 모두 criteria 로 보낼 수 있다.
    // await this.userRepository.update({ id: userId }, { email, password });
    // update 후 영향을 받은 결과나 영향을 받은 행의 갯수나 SQL query 나 생성된 data 인 generatedMaps 를 return 한다.
    try {
      const user = await this.userRepository.findOne(userId, {
        select: [
          'id',
          'createdAt',
          'updatedAt',
          'email',
          'password',
          'role',
          'verified',
        ],
        relations: ['verification'],
      });
      console.log('user >>>> ', user);

      // CASE 1. 인증이 완료되서 Verification 이 비어있는 상태 => 이 경우엔 password 변경 시엔 문제가 없지만 email 을 변경할 경우 새롭게 Verification 객체를 만들어줘야 한다.
      // CASE 2. Verification 이 있는 상태
      if (user.verification) {
        // user 와 verification 을 양방향 연관관계를 맺어서 레포지토리에서 값을 찾지 않고 user.verification 으로 데이터를 가져왔다.
        const newVerification = user.verification;

        if (email) {
          user.email = email;
          user.verified = false;
          // email 이 변경되면 code 값을 변경
          newVerification.code = uuidv4();

          // 변경된 값을 저장
          await this.verificationRepository.save(newVerification);
          console.log('user >>>> ', user);
          console.log('newVerification >>>>>', newVerification);

          this.mailService.sendVerificationEmail(
            user.email,
            newVerification.code,
          );
        }
        if (password) {
          user.password = password;
        }
        await this.userRepository.save(
          this.userRepository.create({
            ...user,
          }),
        );

        return { ok: true };
      } else {
        if (password) {
          user.password = password;

          await this.userRepository.save(
            this.userRepository.create({
              ...user,
            }),
          );
        }
        if (email) {
          user.email = email;
          user.verified = false;

          const newVerification = new Verification();

          newVerification.user = user;
          newVerification.code = uuidv4();

          console.log('newVerification >>>> ', newVerification);

          await this.userRepository.save(
            this.userRepository.create({
              ...user,
            }),
          );
          await this.verificationRepository.save(newVerification);
          // console.log('no user.verification >>>> ', user);
          // console.log('newVerification >>>>> ', newVerification);
          // console.log('user.verification >>>>> ', user.verification);

          this.mailService.sendVerificationEmail(
            user.email,
            newVerification.code,
          );
        }
        return { ok: true };
      }
    } catch (error) {
      console.log('error >>>>>', error);
      return {
        ok: false,
        error: '유저가 업데이트 되지 않았습니다.',
      };
    }
  }

  async verifyEmail(code: string): Promise<VerifyEmailOutput> {
    // 1. verification 을 찾는다.
    // 2. 만약 존재한다면 verification 을 삭제
    // 3. 그리고 그 verification 가 연결된 user 를 찾아 verified 를 true 로 변경

    try {
      const verification = await this.verificationRepository.findOne(
        {
          code: code,
        },
        { relations: ['user'] },
        // { loadRelationIds: true },
      );
      if (verification) {
        // verification 의 user 릴레이션을 타고가서 verified 를 true 로 수정
        verification.user.verified = true;
        // user 의 값이 수정되었고 userRepository 로 verification.user, 즉 수정된 유저를 save -> update
        // this.userRepository.save(verification.user); -> 문제 발생, save 메서드를 사용했기 때문에 비밀번호가 또 한번 더 해쉬된다.
        // 유저 인증 완료
        await this.userRepository.save(verification.user);
        // 인증되면 인증서를 삭제한다. 하나의 유저에 하나의 인증서만 존재하기 때문
        await this.verificationRepository.delete(verification.id);
        return { ok: true };
      }
      return { ok: false, error: 'Verification Not found' };
    } catch (error) {
      return {
        ok: false,
        error,
      };
    }
  }
}
