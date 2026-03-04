import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PatientAuthGuard implements CanActivate {
    constructor(
        private jwtService: JwtService,
        private configService: ConfigService,
    ) { }

    async canActivate(context: ExecutionContext): Promise<boolean> {
        const request = context.switchToHttp().getRequest();
        const token = this.extractTokenFromHeader(request);

        if (!token) {
            throw new UnauthorizedException('يرجى تسجيل الدخول');
        }

        try {
            const payload = await this.jwtService.verifyAsync(token, {
                secret: this.configService.getOrThrow<string>('JWT_SECRET'),
            });

            // التحقق من أن هذا توكن مريض وليس طبيب
            if (payload.type !== 'patient') {
                throw new UnauthorizedException('هذه البوابة للمرضى فقط');
            }

            // إرفاق بيانات المريض بالطلب
            request.user = {
                id: payload.sub,
                email: payload.email,
                type: 'patient',
            };
        } catch (error) {
            if (error instanceof UnauthorizedException) throw error;
            throw new UnauthorizedException('الجلسة منتهية، يرجى تسجيل الدخول مرة أخرى');
        }

        return true;
    }

    private extractTokenFromHeader(request: any): string | undefined {
        const [type, token] = request.headers.authorization?.split(' ') ?? [];
        return type === 'Bearer' ? token : undefined;
    }
}

