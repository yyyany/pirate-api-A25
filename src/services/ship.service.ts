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

// Map pour suivre les transferts actifs
const activeTransfers = new Map<string, boolean>();

export class ShipService {

  // Transférer de l'or entre deux navires
  // IA ma grandement aidé pour cette fonction
  async transferGold(data: TransferGoldRequest): Promise<void> {
  const { fromShipId, toShipId, amount } = data;

  // Vérifier si l'un des navires est déjà utilisé
  if (activeTransfers.has(fromShipId) || activeTransfers.has(toShipId)) {

    if (activeTransfers.has(fromShipId)) activeTransfers.set(fromShipId, false); // false = collision détectée
    if (activeTransfers.has(toShipId)) activeTransfers.set(toShipId, false);
    
    throw new AppError("Collision détectée ! Toutes les transactions impliquées sont annulées.", { statusCode: 409 });
  }

  // Réserver les navires avec true = "pas de collision pour l'instant"
  activeTransfers.set(fromShipId, true);
  activeTransfers.set(toShipId, true);

  try {

    const sourceShip = await shipRepository.findById(fromShipId);
    const destShip = await shipRepository.findById(toShipId);

    if (!sourceShip || !destShip) {
      throw new AppError("Navire introuvable", { statusCode: 404 });
    }

    if (sourceShip.goldCargo < amount) {
      throw new AppError("Fonds insuffisants", { statusCode: 400 });
    }

    await new Promise((resolve) => setTimeout(resolve, 8000));

    // 3. VÉRIFICATION POST-PAUSE : est-ce qu'on a été marqué comme DEGAT si C > A || B alors A || B deviennt false donc on met pas la db a jour.
    const statusFrom = activeTransfers.get(fromShipId);
    const statusTo = activeTransfers.get(toShipId);

    if (statusFrom === false || statusTo === false) {
      console.log(" Transaction annulée : collision détectée pendant le traitement.");
      throw new AppError("Transaction annulée car une collision a eu lieu pendant le traitement.", { statusCode: 409 });
    }

    // 4. Tout est OK, on applique les changements
    const newGoldSource = validateAndCalculateNewGold(sourceShip.goldCargo, -amount);
    const newGoldDest = validateAndCalculateNewGold(destShip.goldCargo, amount);

    await shipRepository.updateGoldById(fromShipId, newGoldSource);
    await shipRepository.updateGoldById(toShipId, newGoldDest);

    await shipRepository.incrementPillagedCount(fromShipId, (sourceShip.pillagedCount || 0) + 1);

    console.log("Transfert réussi.");

  } finally {
    // Libérer les navires
    activeTransfers.delete(fromShipId);
    activeTransfers.delete(toShipId);
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