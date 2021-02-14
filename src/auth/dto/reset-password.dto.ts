import { IsNotEmpty } from 'class-validator';
import { } from 'type-graphql';
import { InputType, Field } from '@nestjs/graphql';

@InputType()
export class ResetPasswordDto {
  @Field()
  @IsNotEmpty()
  forgetPasswordToken: string;

  @Field()
  @IsNotEmpty()
  username: string;

  @Field()
  @IsNotEmpty()
  newPassword: string;
}
