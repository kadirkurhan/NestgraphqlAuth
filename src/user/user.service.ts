import { HttpException, HttpStatus, Injectable, InternalServerErrorException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as jwt from 'jsonwebtoken';

import { UserEntity } from './user.entity';
import { ForgetPasswordDto, LoginDto, RefreshTokenDto, RegisterDto } from '../auth/dto';
import { ResetPasswordDto } from '../auth/dto/reset-password.dto';

@Injectable()
export class UserService {
    constructor(
        @InjectRepository(UserEntity)
        private readonly userRepository: Repository<UserEntity>,
    ) {
    }

    async create(registerData: RegisterDto): Promise<UserEntity> {
        const { username, email, password } = registerData;
        const user = await this.userRepository.findOne({
            where: [{ username }, { email }],
        });

        if (user) {
            const errors = { username: 'Username and Email must be unique.' };
            throw new HttpException(
                { message: 'Input data validation failed', errors },
                HttpStatus.BAD_REQUEST,
            );
        }

        const newUser = new UserEntity({
            username,
            email,
            password,
        });

        return await this.userRepository.save(newUser);
    }

    async findOne(loginData: LoginDto): Promise<UserEntity> {
        const { username, password } = loginData;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user || !(await user.comparePassword(password))) {
            throw new HttpException(
                {
                    data: {
                        message: 'Invalid username/password',
                        errors: [{ username: 'Invalid username/password' }],
                    },
                },
                HttpStatus.BAD_REQUEST,
            );
        }
        return user;
    }

    async login(loginData: LoginDto): Promise<UserEntity> {
        return await this.findOne(loginData);
    }

    async findById(id: string): Promise<UserEntity> {
        const user = await this.userRepository.findOne({ where: { id } });

        if (!user) {
            this.noUserWereFound();
        }

        return user;
    }

    async forgetPassword(forgetPasswordData: ForgetPasswordDto) {
        const { username } = forgetPasswordData;
        const user = await this.userRepository.findOne({ where: { username } });
        if (!user) {
            this.noUserWereFound();
        }
        const userToUpdate = await this.userRepository.findOne({
            where: { id: user.id },
        });
        userToUpdate.generateForgetPasswordToken();
        try {
            const userData = await userToUpdate.save();
            return userData.forgetPasswordToken;
        } catch (e) {
            throw new InternalServerErrorException();
        }
    }

    async resetPassword(resetPasswordData: ResetPasswordDto) {
        const { newPassword, forgetPasswordToken, username } = resetPasswordData;

        const user = await this.userRepository.findOne({
            where: { forgetPasswordToken, username },
        });

        if (!user) {
            this.noUserWereFound();
        }
        user.password = newPassword;
        await user.save();
        return user;
    }

    async refreshToken(refreshTokenData: RefreshTokenDto) {
        // TODO its better to store a count in db and inside refresh token payload to \
        //  validate incoming token with that count and invalidate all other tokens
        const { refreshToken } = refreshTokenData;
        let decoded: any;
        try {
            decoded = jwt.verify(refreshToken, "SECRET_KEY");
        } catch (e) {
            const errors = { username: 'No user were found.' };
            throw new HttpException(
                { data: { message: 'Token is not valid', errors } },
                HttpStatus.UNAUTHORIZED,
            );
        }

        const user = await this.findById(decoded.id);

        if (!user) {
            this.noUserWereFound();
        }

        return user;
    }

    private noUserWereFound() {
        const errors = { username: 'No user were found.' };
        throw new HttpException(
            { data: { message: 'Input data validation failed', errors } },
            HttpStatus.BAD_REQUEST,
        );
    }
}
