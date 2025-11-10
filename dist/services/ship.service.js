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
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipService = void 0;
const ship_repository_1 = require("../repositories/ship.repository");
const AppError_1 = require("../errors/AppError");
const typeConverter_1 = require("../utils/typeConverter");
const axios = __importStar(require("axios"));
const shipRepository = new ship_repository_1.ShipRepository();
class ShipService {
    async getShipById(id) {
        return shipRepository.findById(id);
    }
    async getAllShips() {
        return shipRepository.getAllShips();
    }
    async createShip(ship) {
        if ((await shipRepository.getAllShips()).length >= 8) {
            throw new AppError_1.AppError("Maximum number of ships reached", { statusCode: 409, code: "VALIDATION_ERROR", details: "The port can only hold up to 8 ships. Delete or send a ship away before creating a new one." });
        }
        const shipToCreate = (0, typeConverter_1.validateAndGenerateNewShip)(ship);
        return shipRepository.create(shipToCreate);
    }
    async createReceivedShip(ship) {
        if ((await shipRepository.getAllShips()).length >= 8) {
            throw new AppError_1.AppError("Maximum number of ships reached", { statusCode: 409, code: "VALIDATION_ERROR", details: "The port can only hold up to 8 ships. Delete or send a ship away before creating a new one." });
        }
        const shipToCreate = (0, typeConverter_1.validateAndGenerateReceivedShip)(ship);
        return shipRepository.createReceivedShip(shipToCreate);
    }
    async patchShip(id, ship) {
        (0, typeConverter_1.validateBaseParameters)(ship);
        if (await shipRepository.findById(id) === null) {
            throw new AppError_1.AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found" });
        }
        return shipRepository.editById(id, ship);
    }
    async deleteShip(id) {
        const ship = await shipRepository.findById(id);
        if (!ship) {
            throw new AppError_1.AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found" });
        }
        await shipRepository.deleteById(id);
    }
    async deleteAllShips() {
        await shipRepository.deleteAll();
    }
    // ChatGPT sur comment utiliser Axios
    async getBrokerUsers() {
        const url = "https://pwa-broker-pirates-2bc1349418b0.herokuapp.com/api/users";
        try {
            const response = await axios.get(url, {
                headers: {
                    Authorization: `Bearer ${process.env.BROKER_CLIENT_SECRET}`,
                    "x-client-id": process.env.BROKER_CLIENT_ID
                },
            });
            if (!response.status.toString().startsWith("2")) {
                throw new AppError_1.AppError("Failed getting available ports", { statusCode: 503, code: "REMOTE_SERVICE_ERROR", isOperational: false });
            }
            return response.data.users;
        }
        catch (e) {
            if (e.response) {
                throw new AppError_1.AppError("Broker failed to return users list", { statusCode: 503, code: "REMOTE_SERVICE_ERROR", isOperational: false });
            }
            else {
                throw new AppError_1.AppError("Failed getting broker users", { statusCode: 500, code: "REMOTE_SERVICE_ERROR", isOperational: false });
            }
        }
    }
    async sendShip(shipId, recipientName) {
        let ship = await shipRepository.findById(shipId);
        if (!ship) {
            throw new AppError_1.AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found", isOperational: true });
        }
        if (ship.status !== "docked") {
            throw new AppError_1.AppError("Ship is not docked", { statusCode: 400, code: "VALIDATION_ERROR", details: "Ship is not docked", isOperational: true });
        }
        const users = await this.getBrokerUsers();
        if (!users.includes(recipientName)) {
            throw new AppError_1.AppError("Recipient not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Recipient not found" });
        }
        await shipRepository.editById(shipId, ship, "sailing");
        ship = await shipRepository.findById(shipId);
        if (ship?.status !== "sailing") {
            throw new AppError_1.AppError("Failed sending ship", { statusCode: 400, code: "VALIDATION_ERROR", isOperational: true });
        }
        const url = "https://pwa-broker-pirates-2bc1349418b0.herokuapp.com/api/ship/sail/" + recipientName;
        const data = {
            "name": ship.name,
            "goldCargo": ship.goldCargo,
            "captain": ship.captain,
            "crewSize": ship.crewSize,
            "status": ship.status,
            "createdAt": ship.createdAt,
            "createdBy": ship.createdBy,
            "lastModified": ship.updatedAt,
            "updatedAt": ship.updatedAt,
        };
        let response;
        try {
            response = await axios.post(url, data, {
                headers: {
                    Authorization: `Bearer ${process.env.BROKER_CLIENT_SECRET}`,
                    "x-client-id": process.env.BROKER_CLIENT_ID
                }
            });
        }
        catch (e) {
            await shipRepository.editById(shipId, ship, "docked");
            if (e.response) {
                throw new AppError_1.AppError("Recipient failed to receive the ship. See recipient response below.", { statusCode: 400, code: "REMOTE_SERVICE_ERROR", isOperational: true, details: e.response.data });
            }
            else {
                throw new AppError_1.AppError("Failed sending ship", { statusCode: 400, code: "REMOTE_SERVICE_ERROR", isOperational: true });
            }
        }
        if (!response.data.success) {
            await shipRepository.editById(shipId, ship, "docked");
            throw new AppError_1.AppError("Failed sending ship", { statusCode: 400, code: "REMOTE_SERVICE_ERROR", isOperational: true, details: response.data.message });
        }
        await shipRepository.deleteById(ship.id);
    }
}
exports.ShipService = ShipService;
//# sourceMappingURL=ship.service.js.map