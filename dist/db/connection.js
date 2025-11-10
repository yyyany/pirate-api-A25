"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.testConnection = exports.db = void 0;
const mysql2_1 = require("drizzle-orm/mysql2");
const promise_1 = __importDefault(require("mysql2/promise"));
const schema = __importStar(require("./schema"));
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const connection = promise_1.default.createPool({
    host: process.env.DB_HOST || '127.0.0.1',
    port: parseInt(process.env.DB_PORT || '3306'),
    user: process.env.DB_USERNAME || 'pirate_user',
    password: process.env.DB_PASSWORD || 'password',
    database: process.env.DB_DATABASE || 'pirate',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});
exports.db = (0, mysql2_1.drizzle)(connection, { schema, mode: 'default' });
const testConnection = async () => {
    try {
        await connection.query('SELECT 1');
        const [databases] = await connection.query('SHOW DATABASES LIKE ?', ['pirate']);
        if (Array.isArray(databases) && databases.length === 0) {
            throw new Error(`pirate database does not exist`);
        }
        console.log('Database connection successfull');
        return { success: true };
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : 'Unknown database error';
        console.error('Database connection failed:', errorMessage);
        return { success: false, error: errorMessage };
    }
};
exports.testConnection = testConnection;
//# sourceMappingURL=connection.js.map