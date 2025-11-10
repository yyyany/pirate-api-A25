"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ShipController = void 0;
const ship_service_1 = require("../services/ship.service");
const AppError_1 = require("../errors/AppError");
const shipService = new ship_service_1.ShipService();
class ShipController {
    createShip = async (req, res, next) => {
        const ship = req.body;
        try {
            const newShip = await shipService.createShip(ship);
            res.status(201).json(newShip);
        }
        catch (error) {
            next(error);
        }
    };
    async createReceivedShip(req, res, next) {
        const ship = req.body;
        try {
            if ((req.headers["authorization"] === undefined || req.headers["authorization"].split(" ")[1] != process.env.BROKER_CLIENT_SECRET)
                && (req.headers["x-client-id"] === undefined || req.headers["x-client-id"] != process.env.BROKER_CLIENT_ID)) {
                //console.log("Error on createReceivedShip");
                //console.log("Missing data(s)!");
                //console.log("req.headers[authorization]", req.headers["authorization"])
                //console.log("req.headers[x - client - id]", req.headers["x-client-id"]);
                throw new AppError_1.AppError("Unauthorized", { statusCode: 401, code: "AUTH_REQUIRED", details: "You need to be logged in to access this resource." });
            }
            const newShip = await shipService.createReceivedShip(ship);
            res.status(201).json(newShip);
        }
        catch (error) {
            next(error);
        }
    }
    getAllShips = async (req, res, next) => {
        try {
            const ships = await shipService.getAllShips();
            res.status(200).json(ships);
        }
        catch (error) {
            next(error);
        }
    };
    getShipByID = async (req, res, next) => {
        try {
            const ship = await shipService.getShipById(req.params.id);
            if (!ship)
                return res.status(404).json({ message: 'Ship not found' });
            else
                return res.status(200).json(ship);
        }
        catch (error) {
            next(error);
        }
    };
    patchShip = async (req, res, next) => {
        try {
            const ship = await shipService.patchShip(req.params.id, req.body);
            res.status(200).json(ship);
        }
        catch (error) {
            next(error);
        }
    };
    deleteShip = async (req, res, next) => {
        try {
            await shipService.deleteShip(req.params.id);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    };
    deleteAllShips = async (req, res, next) => {
        try {
            await shipService.deleteAllShips();
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    };
    listBrokerUsers = async (req, res, next) => {
        try {
            const users = await shipService.getBrokerUsers();
            res.status(200).json(users);
        }
        catch (error) {
            next(error);
        }
    };
    sendShip = async (req, res, next) => {
        try {
            await shipService.sendShip(req.body.id, req.params.recipient);
            res.status(204).send();
        }
        catch (error) {
            next(error);
        }
    };
}
exports.ShipController = ShipController;
//# sourceMappingURL=ship.controller.js.map