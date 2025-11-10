import { User } from "../types/user.types";
import jwt from 'jsonwebtoken';
export declare const generateToken: (user: User) => string;
export declare function verifyToken(token: string): string | jwt.JwtPayload;
//# sourceMappingURL=jwt.d.ts.map