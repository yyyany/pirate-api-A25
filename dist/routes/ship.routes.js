"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.receiveShipRouter = exports.shipRouter = void 0;
const express_1 = require("express");
const ship_controller_1 = require("../controllers/ship.controller");
const auth_middleware_1 = require("../middleware/auth.middleware");
const shipRouter = () => {
    const router = (0, express_1.Router)();
    const shipController = new ship_controller_1.ShipController();
    router.post("/", auth_middleware_1.authenticateAdmin, shipController.createShip);
    router.get("/", auth_middleware_1.authenticate, shipController.getAllShips);
    router.get("/:id", auth_middleware_1.authenticate, shipController.getShipByID);
    router.patch("/:id", auth_middleware_1.authenticateAdmin, shipController.patchShip);
    router.delete("/:id", auth_middleware_1.authenticateAdmin, shipController.deleteShip);
    router.delete("/", auth_middleware_1.authenticateAdmin, shipController.deleteAllShips);
    router.get("/send/userlist", auth_middleware_1.authenticate, shipController.listBrokerUsers);
    router.post("/send/:recipient", auth_middleware_1.authenticateAdmin, shipController.sendShip);
    return router;
};
exports.shipRouter = shipRouter;
const receiveShipRouter = () => {
    const router = (0, express_1.Router)();
    const shipController = new ship_controller_1.ShipController();
    router.post("/dock", shipController.createReceivedShip);
    return router;
};
exports.receiveShipRouter = receiveShipRouter;
//# sourceMappingURL=ship.routes.js.map