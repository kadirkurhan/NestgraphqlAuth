import { Args, Context, Mutation, Query, Resolver } from '@nestjs/graphql';
import { JwtType, UserEntity } from '../user/user.entity';
import { UserService } from '../user/user.service';
import { ForgetPasswordDto, LoginDto, RefreshTokenDto, RegisterDto } from './dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { UserRO } from '../user/user.interface';
import { UseGuards } from '@nestjs/common';
import { AuthGuard } from './auth.guard';


@Resolver(() => UserEntity)
export class AuthResolver {
    constructor(private readonly userService: UserService) {
    }

    @Query(() => UserEntity)
    @UseGuards(AuthGuard)
    async me(@Context('user') user: UserEntity): Promise<UserEntity> {
        return user;
    }



    @Mutation(() => UserEntity)
    async login(@Args('loginData') loginData: LoginDto) {
        const user = await this.userService.login(loginData);
        return this.buildUserRO(user);
    }

    @Mutation(() => UserEntity)
    async register(@Args('registerData') registerData: RegisterDto): Promise<UserRO> {
        const user = await this.userService.create(registerData);
        return this.buildUserRO(user);
    }



    @Mutation(() => String)
    async forgetPassword(@Args('forgetPasswordData') forgetPasswordData: ForgetPasswordDto) {
        return await this.userService.forgetPassword(forgetPasswordData);
    }

    @Mutation(() => UserEntity)
    async resetPassword(@Args('resetPasswordData') resetPasswordData: ResetPasswordDto) {
        const user = await this.userService.resetPassword(resetPasswordData);
        return this.buildUserRO(user);
    }

    @Mutation(() => UserEntity)
    async refreshToken(@Args('refreshTokenData') refreshTokenData: RefreshTokenDto) {
        const user = await this.userService.refreshToken(refreshTokenData);
        return {
            ...user,
            accessToken: user.generateJWT(JwtType.ACCESS_TOKEN),
            refreshToken: user.generateJWT(JwtType.REFRESH_TOKEN),
        };
    }

    private buildUserRO = (user: UserEntity) => {
        return {
            ...user,
            accessToken: user.generateJWT(JwtType.ACCESS_TOKEN),
            refreshToken: user.generateJWT(JwtType.REFRESH_TOKEN),
        };
    };
}
