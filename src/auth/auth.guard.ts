import { CanActivate, ExecutionContext, HttpStatus, Injectable } from '@nestjs/common';
import { HttpException } from '@nestjs/common/exceptions/http.exception';
import * as jwt from 'jsonwebtoken';

import { UserService } from '../user/user.service';
import { GqlExecutionContext } from '@nestjs/graphql';

@Injectable()
export class AuthGuard implements CanActivate {
    constructor(private readonly userService: UserService) {
    }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const ctx = GqlExecutionContext.create(context);
        return await this.validateRequest(ctx.getContext());
    }

    async validateRequest(ctx) {
        const authHeaders = ctx.req.headers.authorization;
        if (authHeaders && (authHeaders as string).split(' ')[1]) {
            const token = (authHeaders as string).split(' ')[1];
            let decoded: any;
            try {
                decoded = jwt.verify(token, process.env.SECRET);
                if (decoded.exp < Date.now() / 1000) {
                    this.unAuthorized();
                }
            } catch (e) {
                this.unAuthorized();
            }
            const user = await this.userService.findById(decoded.id);
            if (!user) {
                this.unAuthorized();
            }
            ctx.user = user;
            return true;
        } else {
            this.unAuthorized();
        }
    }

    // TODO make an utility function across all app.
    private unAuthorized() {
        const errors = { username: 'No user were found.' };
        throw new HttpException(
            { data: { message: 'Token is not valid', errors } },
            HttpStatus.UNAUTHORIZED,
        );
    }
}
