import { Request, Response, NextFunction } from 'express';
export declare class ShipController {
    createShip: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    createReceivedShip(req: Request, res: Response, next: NextFunction): Promise<void>;
    getAllShips: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    getShipByID: (req: Request, res: Response, next: NextFunction) => Promise<Response<any, Record<string, any>> | undefined>;
    patchShip: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteShip: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    deleteAllShips: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    listBrokerUsers: (req: Request, res: Response, next: NextFunction) => Promise<void>;
    sendShip: (req: Request, res: Response, next: NextFunction) => Promise<void>;
}
//# sourceMappingURL=ship.controller.d.ts.map