"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipRepository = void 0;
const connection_1 = require("../db/connection");
const schema_1 = require("../db/schema");
const drizzle_orm_1 = require("drizzle-orm");
const AppError_1 = require("../errors/AppError");
class ShipRepository {
    async findById(id) {
        const result = await connection_1.db.select().from(schema_1.ships).where((0, drizzle_orm_1.eq)(schema_1.ships.id, id));
        return result[0] || null;
    }
    async getAllShips() {
        return connection_1.db.select().from(schema_1.ships);
    }
    async create(ship) {
        await connection_1.db.insert(schema_1.ships).values(ship);
        const result = await this.findById(ship.id);
        if (!result)
            throw new Error('Failed to create ship');
        return result;
    }
    async createReceivedShip(ship) {
        await connection_1.db.insert(schema_1.ships).values(ship);
        const result = await this.findById(ship.id);
        if (!result)
            throw new Error('Failed to create ship');
        return result;
    }
    async editById(id, ship, status = null) {
        if (status)
            await connection_1.db.update(schema_1.ships).set({
                name: ship.name,
                goldCargo: ship.goldCargo,
                status: status,
                captain: ship.captain,
                crewSize: ship.crewSize,
            }).where((0, drizzle_orm_1.eq)(schema_1.ships.id, id));
        else
            await connection_1.db.update(schema_1.ships).set({
                name: ship.name,
                goldCargo: ship.goldCargo,
                captain: ship.captain,
                crewSize: ship.crewSize,
            }).where((0, drizzle_orm_1.eq)(schema_1.ships.id, id));
        const result = await this.findById(id);
        if (!result)
            throw new AppError_1.AppError("Failed to patch ship, likely doesn't exist.", { statusCode: 500, isOperational: false });
        return result;
    }
    async deleteById(id) {
        await connection_1.db.delete(schema_1.ships).where((0, drizzle_orm_1.eq)(schema_1.ships.id, id));
    }
    async deleteAll() {
        await connection_1.db.delete(schema_1.ships);
    }
}
exports.ShipRepository = ShipRepository;
//# sourceMappingURL=ship.repository.js.map