"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthRepository = void 0;
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
class AuthRepository {
    async findById(id) {
        const result = await connection_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.id, id));
        return result[0] || null;
    }
    async findByUsername(username) {
        const result = await connection_1.db.select().from(schema_1.users).where((0, drizzle_orm_1.eq)(schema_1.users.username, username));
        return result[0] || null;
    }
    async create(user) {
        await connection_1.db.insert(schema_1.users).values(user);
        const result = await this.findById(user.id);
        if (!result)
            throw new Error('Failed to create user');
        return result;
    }
}
exports.AuthRepository = AuthRepository;
//# sourceMappingURL=auth.repository.js.map