import { Module } from '@nestjs/common';
import { AppService } from './app.service';
import { UserModule } from './user/module/user.module';
import { AuthModule } from './auth/auth.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GraphQLModule } from '@nestjs/graphql';

@Module({
  imports: [
    TypeOrmModule.forRoot(),
    UserModule,
    AuthModule,
    GraphQLModule.forRoot({
      autoSchemaFile: 'schema.gql',
      context: ({ req }) => ({ req })
    }),
  ],
  controllers: [],
  providers: [AppService],
})
export class AppModule { }
