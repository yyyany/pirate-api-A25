"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ships = exports.users = void 0;
const mysql_core_1 = require("drizzle-orm/mysql-core");
exports.users = (0, mysql_core_1.mysqlTable)('users', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    username: (0, mysql_core_1.varchar)('username', { length: 50 }).notNull().unique(),
    passwordHash: (0, mysql_core_1.varchar)('password_hash', { length: 255 }).notNull(),
    isAdmin: (0, mysql_core_1.boolean)('is_admin').default(false).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { fsp: 3 }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { fsp: 3 }).defaultNow().onUpdateNow().notNull(),
});
exports.ships = (0, mysql_core_1.mysqlTable)('ships', {
    id: (0, mysql_core_1.varchar)('id', { length: 36 }).primaryKey(),
    name: (0, mysql_core_1.varchar)('name', { length: 100 }).notNull(),
    goldCargo: (0, mysql_core_1.int)('gold_cargo').notNull(),
    captain: (0, mysql_core_1.varchar)('captain', { length: 50 }).notNull(),
    status: (0, mysql_core_1.mysqlEnum)('status', ['docked', 'sailing', 'lookingForAFight']).notNull(),
    crewSize: (0, mysql_core_1.int)('crew_size').notNull(),
    createdBy: (0, mysql_core_1.varchar)('created_by', { length: 38 }).notNull(),
    createdAt: (0, mysql_core_1.timestamp)('created_at', { fsp: 3 }).defaultNow().notNull(),
    updatedAt: (0, mysql_core_1.timestamp)('updated_at', { fsp: 3 }).defaultNow().onUpdateNow().notNull(),
});
//# sourceMappingURL=schema.js.map