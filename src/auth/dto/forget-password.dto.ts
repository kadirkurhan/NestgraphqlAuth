import { IsNotEmpty } from 'class-validator';
import { } from 'type-graphql';
import { InputType, Field } from '@nestjs/graphql';
@InputType()
export class ForgetPasswordDto {

  @Field()
  @IsNotEmpty()
  username: string;
}
