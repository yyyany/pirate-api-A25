import { Ship, CreateShipRequest, PatchShipRequest, ReceiveShipRequest } from "../types/ship.types";
export declare class ShipService {
    getShipById(id: string): Promise<Ship | null>;
    getAllShips(): Promise<Array<Ship>>;
    createShip(ship: CreateShipRequest): Promise<Ship>;
    createReceivedShip(ship: ReceiveShipRequest): Promise<Ship>;
    patchShip(id: string, ship: PatchShipRequest): Promise<Ship>;
    deleteShip(id: string): Promise<void>;
    deleteAllShips(): Promise<void>;
    getBrokerUsers(): Promise<Array<string>>;
    sendShip(shipId: string, recipientName: string): Promise<void>;
}
//# sourceMappingURL=ship.service.d.ts.map