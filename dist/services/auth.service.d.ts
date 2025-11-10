import { User, LoginUserRequest, RegisterUserRequest } from '../types/user.types';
export declare class AuthService {
    getUserById(id: string): Promise<User | null>;
    getUserByUsername(username: string): Promise<User | null>;
    createUser(user: RegisterUserRequest): Promise<User>;
    verifyLoginUser(loginCredentials: LoginUserRequest): Promise<User>;
    registerUser(registerCredentials: RegisterUserRequest): Promise<string>;
    loginUser(loginCredentials: LoginUserRequest): Promise<string>;
    isValidPassword(password: string): boolean;
}
//# sourceMappingURL=auth.service.d.ts.map