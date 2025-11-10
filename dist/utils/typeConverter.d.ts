import { CreateShipRequest, CreateNewShipDBRequest, PatchShipRequest, ReceiveShipRequest, CreateReceivedShipDBRequest } from "../types/ship.types";
export declare const validateBaseParameters: (ship: CreateShipRequest | PatchShipRequest | ReceiveShipRequest, shipReceived?: boolean, userModification?: boolean) => boolean;
export declare const validateAllDefaultFieldsExist: (ship: CreateShipRequest | PatchShipRequest | ReceiveShipRequest, shipReceived?: boolean) => boolean;
export declare const validateAndGenerateNewShip: (ship: CreateShipRequest) => CreateNewShipDBRequest;
export declare const validateAndGenerateReceivedShip: (ship: ReceiveShipRequest) => CreateReceivedShipDBRequest;
//# sourceMappingURL=typeConverter.d.ts.map