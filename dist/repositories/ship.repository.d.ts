import { Ship, PatchShipRequest, CreateReceivedShipDBRequest } from "../types/ship.types";
export declare class ShipRepository {
    findById(id: string): Promise<Ship | null>;
    getAllShips(): Promise<Array<Ship>>;
    create(ship: {
        id: string;
        name: string;
        goldCargo: number;
        captain: string;
        status: "docked" | "sailing" | "lookingForAFight";
        crewSize: number;
        createdBy: string;
    }): Promise<Ship>;
    createReceivedShip(ship: CreateReceivedShipDBRequest): Promise<Ship>;
    editById(id: string, ship: PatchShipRequest, status?: "docked" | "sailing" | "lookingForAFight" | null): Promise<Ship>;
    deleteById(id: string): Promise<void>;
    deleteAll(): Promise<void>;
}
//# sourceMappingURL=ship.repository.d.ts.map