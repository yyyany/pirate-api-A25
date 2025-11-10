import { User } from '../types/user.types';
export declare class AuthRepository {
    findById(id: string): Promise<User | null>;
    findByUsername(username: string): Promise<User | null>;
    create(user: {
        id: string;
        username: string;
        passwordHash: string;
    }): Promise<User>;
}
//# sourceMappingURL=auth.repository.d.ts.map