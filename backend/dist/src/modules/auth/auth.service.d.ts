import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
export declare class AuthService {
    private usersService;
    private jwtService;
    constructor(usersService: UsersService, jwtService: JwtService);
    validateUser(email: string, pass: string): Promise<any>;
    login(user: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
        };
    }>;
    register(data: any): Promise<{
        id: string;
        email: string;
        fullName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
