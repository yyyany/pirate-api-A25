"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const auth_repository_1 = require("../repositories/auth.repository");
const uuid_1 = require("uuid");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jwt_1 = require("../utils/jwt");
const AppError_1 = require("../errors/AppError");
const authRepository = new auth_repository_1.AuthRepository();
class AuthService {
    async getUserById(id) {
        return authRepository.findById(id);
    }
    async getUserByUsername(username) {
        return authRepository.findByUsername(username);
    }
    async createUser(user) {
        if (user.username.length > 50) {
            throw new AppError_1.AppError("Invalid username length", { statusCode: 400, code: "VALIDATION_ERROR", details: "Username must be less than 50 characters long" });
        }
        if (!this.isValidPassword(user.password)) {
            throw new AppError_1.AppError("Invalid password", { statusCode: 400, code: "VALIDATION_ERROR", details: "Password must be at least 8 characters long and contain at least one uppercase letter, one lowercase letter, and one number" });
        }
        if (await authRepository.findByUsername(user.username)) {
            throw new AppError_1.AppError("User already exists", { statusCode: 409, code: "VALIDATION_ERROR", details: "A user with this username already exists" });
        }
        const userId = (0, uuid_1.v4)();
        const passwordHash = await bcrypt_1.default.hash(user.password, 10);
        const userToCreate = { username: user.username, passwordHash: passwordHash, id: userId };
        return authRepository.create(userToCreate);
    }
    async verifyLoginUser(loginCredentials) {
        const user = await authRepository.findByUsername(loginCredentials.username);
        if (!user) {
            // Juste pour que ça ne paraisse pas lors de l'exécution si l'utilisateur n'existe pas
            const passwordHash = await bcrypt_1.default.hash("dsjkJSHAU3892eiuHUIE9", 10);
            throw new AppError_1.AppError("Invalid username or password", { statusCode: 401, code: "AUTH_INVALID_CREDENTIALS", details: "Invalid username or password" });
        }
        else {
            const passwordMatch = await bcrypt_1.default.compare(loginCredentials.password, user.passwordHash);
            if (!passwordMatch) {
                throw new AppError_1.AppError("Invalid username or password", { statusCode: 401, code: "AUTH_INVALID_CREDENTIALS", details: "Invalid username or password" });
            }
            return user;
        }
    }
    async registerUser(registerCredentials) {
        const user = await this.createUser(registerCredentials);
        return (0, jwt_1.generateToken)(user);
    }
    async loginUser(loginCredentials) {
        const user = await this.verifyLoginUser(loginCredentials);
        return (0, jwt_1.generateToken)(user);
    }
    // ChatGPT, ça me tentait vraiment pas de faire du regex
    isValidPassword(password) {
        const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,}$/;
        return regex.test(password);
    }
}
exports.AuthService = AuthService;
//# sourceMappingURL=auth.service.js.map