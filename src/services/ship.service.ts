import { ShipRepository } from "../repositories/ship.repository";
import { Ship, CreateShipRequest, PatchShipRequest, ReceiveShipRequest, TransferGoldRequest } from "../types/ship.types";
import { AppError } from "../errors/AppError";
import {
  validateAndGenerateNewShip,
  validateAndGenerateReceivedShip,
  validateAndCalculateNewGold,
  validateAndCalculateNewCrew,
  validateBaseParameters
} from "../utils/typeConverter";
import * as axios from "axios";

const shipRepository = new ShipRepository();

//

export class ShipService {

  // IA m'a aidé sur cette partie le map est la pour annuler les 2 transactions en cas de conflit
  private static activeTransfers = new Map<string, boolean>();

  async transferGold(data: TransferGoldRequest): Promise<void> {
    const { fromShipId, toShipId, amount } = data;

    if (amount <= 0) throw new AppError("Le montant doit être positif", { statusCode: 400 });
    if (fromShipId === toShipId) throw new AppError("Impossible de transférer vers le même navire", { statusCode: 400 });

    // 2. VÉRIFICATION DE CONFLIT 
    if (ShipService.activeTransfers.has(fromShipId) || ShipService.activeTransfers.has(toShipId)) {
      
      if (ShipService.activeTransfers.has(fromShipId)) ShipService.activeTransfers.set(fromShipId, true);
      if (ShipService.activeTransfers.has(toShipId)) ShipService.activeTransfers.set(toShipId, true);

      throw new AppError("Interférence ! Une autre transaction est en cours. Les deux sont annulées.", { statusCode: 409 });
    }

    ShipService.activeTransfers.set(fromShipId, false);
    ShipService.activeTransfers.set(toShipId, false);

    try {
      // 3. DÉBUT DE LA TRANSACTION SQL (Via le Repository)
      await shipRepository.useTransaction(async (tx) => {
        
        // A. Verrouillage SQL
        const sourceShip = await shipRepository.getShipForUpdate(fromShipId, tx);
        const destShip = await shipRepository.getShipForUpdate(toShipId, tx);

        if (!sourceShip || !destShip) throw new AppError("Navire introuvable", { statusCode: 404 });
        
        await new Promise((resolve) => setTimeout(resolve, 4500));

        
        const collisionFrom = ShipService.activeTransfers.get(fromShipId);
        const collisionTo = ShipService.activeTransfers.get(toShipId);

        if (collisionFrom === true || collisionTo === true) {
          throw new AppError("Transaction annulée : Interférence détectée pendant le traitement.", { statusCode: 409 });
        }

        // D. CALCULS (Directement ici, plus d'utilitaire)
        const newSourceGold = sourceShip.goldCargo - amount;
        const newDestGold = destShip.goldCargo + amount;

        // Validations des montants
        if (newSourceGold < 0) {
            throw new AppError(`Fonds insuffisants. Le navire n'a que ${sourceShip.goldCargo} or.`, { statusCode: 400 });
        }
        if (newDestGold > 1000000) {
            throw new AppError("Le navire receveur est plein (Max 1,000,000).", { statusCode: 400 });
        }

        await shipRepository.updateGoldTx(fromShipId, newSourceGold, tx);
        await shipRepository.updateGoldTx(toShipId, newDestGold, tx);
        
        const newPillagedCount = (sourceShip.pillagedCount || 0) + 1;
        await shipRepository.incrementPillagedCountTx(fromShipId, newPillagedCount, tx);

        console.log("Transfert réussi.");
      });

    } finally {
      ShipService.activeTransfers.delete(fromShipId);
      ShipService.activeTransfers.delete(toShipId);
    }
  }

  // ajouter ou retirer des membres d'équipage au navire
  async updateCrew(id: string, amount: number): Promise<Ship> {
    const ship = await shipRepository.findById(id);
    if (!ship) {
      throw new AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found" });
    }
    const newCrew = validateAndCalculateNewCrew(ship.crewSize, amount);
    return shipRepository.updateCrewById(id, newCrew);
  }

   // ajouter ou retirer Or au navire
  async updateGold(id: string, amount: number): Promise<Ship> {
    const ship = await shipRepository.findById(id);
    if (!ship) {
      throw new AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found" });
    }
    const newGold = validateAndCalculateNewGold(ship.goldCargo, amount);
    return shipRepository.updateGoldById(id, newGold);
  }

  
  
  async getShipById(id: string): Promise<Ship | null> {
    return shipRepository.findById(id);
  }

  async getAllShips(): Promise<Array<Ship>> {
    return shipRepository.getAllShips();
  }

  async createShip(ship: CreateShipRequest): Promise<Ship> {
    if ((await shipRepository.getAllShips()).length >= 8) {
      throw new AppError("Maximum number of ships reached", { statusCode: 409, code: "VALIDATION_ERROR", details: "The port can only hold up to 8 ships. Delete or send a ship away before creating a new one." });
    }
    const shipToCreate = validateAndGenerateNewShip(ship);
    return shipRepository.create(shipToCreate);
  }

  async createReceivedShip(ship: ReceiveShipRequest): Promise<Ship> {

    if ((await shipRepository.getAllShips()).length >= 8) {
      throw new AppError("Maximum number of ships reached", { statusCode: 409, code: "VALIDATION_ERROR", details: "The port can only hold up to 8 ships. Delete or send a ship away before creating a new one." });
    }
    const shipToCreate = validateAndGenerateReceivedShip(ship);
    return shipRepository.createReceivedShip(shipToCreate);
  }

  async patchShip(id: string, ship: PatchShipRequest): Promise<Ship> {

    validateBaseParameters(ship);
    if (await shipRepository.findById(id) === null) {
      throw new AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found" });
    }
    return shipRepository.editById(id, ship);
  }

  async deleteShip(id: string): Promise<void> {
    const ship = await shipRepository.findById(id);
    if (!ship) {
      throw new AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found" });
    }
    await shipRepository.deleteById(id);
  }

  async deleteAllShips(): Promise<void> {
    await shipRepository.deleteAll();
  }

  // ChatGPT sur comment utiliser Axios

  async getBrokerUsers(): Promise<Array<string>> {
    const url = "https://pwa-broker-pirates-2bc1349418b0.herokuapp.com/api/users";

    try {
      const response = await axios.get<{ success: boolean; users: string[]; totalUsers: number; }>(
        url,
        {
          headers: {
            Authorization: `Bearer ${process.env.BROKER_CLIENT_SECRET}`,
            "x-client-id": process.env.BROKER_CLIENT_ID
          },
        }
      );

      if (!response.status.toString().startsWith("2")) {
        throw new AppError("Failed getting available ports", { statusCode: 503, code: "REMOTE_SERVICE_ERROR", isOperational: false });
      }

      return response.data.users;
    } catch (e: any) {
      if (e.response) {
        throw new AppError("Broker failed to return users list", { statusCode: 503, code: "REMOTE_SERVICE_ERROR", isOperational: false })
      } else {
        throw new AppError("Failed getting broker users", { statusCode: 500, code: "REMOTE_SERVICE_ERROR", isOperational: false })
      }
    }
  }

  async sendShip(shipId: string, recipientName: string): Promise<void> {
    let ship = await shipRepository.findById(shipId);

    if (!ship) {
      throw new AppError("Ship not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Ship not found", isOperational: true });
    }
    if (ship.status !== "docked") {
      throw new AppError("Ship is not docked", { statusCode: 400, code: "VALIDATION_ERROR", details: "Ship is not docked", isOperational: true });
    }

    const users = await this.getBrokerUsers();

    if (!users.includes(recipientName)) {
      throw new AppError("Recipient not found", { statusCode: 404, code: "VALIDATION_ERROR", details: "Recipient not found" });
    }

    await shipRepository.editById(shipId, ship, "sailing");
    ship = await shipRepository.findById(shipId);

    if (ship?.status !== "sailing") {
      throw new AppError("Failed sending ship", { statusCode: 400, code: "VALIDATION_ERROR", isOperational: true })
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
    }

    let response;

    try {
      response = await axios.post<{ success: boolean; statusCode: number | null; message: string; destinationResponse: string | null }>(url, data, {
        headers: {
          Authorization: `Bearer ${process.env.BROKER_CLIENT_SECRET}`,
          "x-client-id": process.env.BROKER_CLIENT_ID
        }
      });
    } catch (e: any) {
      await shipRepository.editById(shipId, ship, "docked");
      if (e.response) {
        throw new AppError("Recipient failed to receive the ship. See recipient response below.", { statusCode: 400, code: "REMOTE_SERVICE_ERROR", isOperational: true, details: e.response.data });
      } else {
        throw new AppError("Failed sending ship", { statusCode: 400, code: "REMOTE_SERVICE_ERROR", isOperational: true })
      }
    }


    if (!response.data.success) {
      await shipRepository.editById(shipId, ship, "docked");
      throw new AppError("Failed sending ship", { statusCode: 400, code: "REMOTE_SERVICE_ERROR", isOperational: true, details: response.data.message });
    }

    await shipRepository.deleteById(ship.id);
  }
}