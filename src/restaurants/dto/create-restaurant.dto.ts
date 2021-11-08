import { ArgsType, Field, InputType } from '@nestjs/graphql';
import { IsBoolean, IsString, Length } from 'class-validator';

// @InputType()
@ArgsType()
export class CreateRestaurantDto {
  // class-validator 설정을 해줬다 해도 유효성 검사가 되는 것이 아니다.
  // validation-pipeline 을 만들어줘야 한다.
  @Field((type) => String)
  @IsString()
  @Length(5, 10)
  name: string;

  @Field((type) => Boolean)
  @IsBoolean()
  isVegan: boolean;

  @Field((type) => String)
  @IsString()
  address: string;

  @Field((type) => String)
  @IsString()
  ownersName: string;
}
