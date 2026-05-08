import { AuthService } from './auth.service';
export declare class AuthController {
    private authService;
    constructor(authService: AuthService);
    login(body: any): Promise<{
        access_token: string;
        user: {
            id: any;
            email: any;
            fullName: any;
        };
    }>;
    register(body: any): Promise<{
        id: string;
        email: string;
        fullName: string | null;
        createdAt: Date;
        updatedAt: Date;
    }>;
}
