import { db } from '../db/connection'
import { Ship, PatchShipRequest, CreateReceivedShipDBRequest } from "../types/ship.types";
import { ships } from "../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../errors/AppError";

export class ShipRepository {

  // La partie pour mettre à jour le crew du navire
  async updateCrewById(id: string, crewSize: number): Promise<Ship> {
    await db.update(ships)
      .set({ crewSize: crewSize })
      .where(eq(ships.id, id));

    const result = await this.findById(id);
    
    if (!result) {
        throw new AppError("Failed to update crew, ship likely doesn't exist.", { statusCode: 500, isOperational: false });
    }
    return result;
  }

    // La partie pour mettre à jour l'or du navire
  async updateGoldById(id: string, goldCargo: number): Promise<Ship> {
    
    await db.update(ships)
      .set({ goldCargo: goldCargo }) 
      .where(eq(ships.id, id));

    const result = await this.findById(id);
    
    if (!result) throw new AppError("Failed to patch ship, likely doesn't exist.", { statusCode: 500, isOperational: false });
    return result;
  }


  
  async findById(id: string): Promise<Ship | null> {
    const result = await db.select().from(ships).where(eq(ships.id, id));
    return result[0] || null;
  }

  async getAllShips(): Promise<Array<Ship>> {
    return db.select().from(ships);
  }

  async create(ship: { id: string; name: string; goldCargo: number; captain: string; status: "docked" | "sailing" | "lookingForAFight"; crewSize: number; createdBy: string; }): Promise<Ship> {
    await db.insert(ships).values(ship);

    const result = await this.findById(ship.id);
    if (!result) throw new Error('Failed to create ship');

    return result;
  }

  async createReceivedShip(ship: CreateReceivedShipDBRequest): Promise<Ship> {

    await db.insert(ships).values(ship);

    const result = await this.findById(ship.id);
    if (!result) throw new Error('Failed to create ship');

    return result;
  }

  async editById(id: string, ship: PatchShipRequest, status: "docked" | "sailing" | "lookingForAFight" | null = null): Promise<Ship> {

    if (status)
      await db.update(ships).set({
        name: ship.name,
        goldCargo: ship.goldCargo,
        status: status,
        captain: ship.captain,
        crewSize: ship.crewSize,
      }).where(eq(ships.id, id));
    else
      await db.update(ships).set({
        name: ship.name,
        goldCargo: ship.goldCargo,
        captain: ship.captain,
        crewSize: ship.crewSize,
      }).where(eq(ships.id, id));

    const result = await this.findById(id);
    if (!result) throw new AppError("Failed to patch ship, likely doesn't exist.", { statusCode: 500, isOperational: false });

    return result;
  }

  async deleteById(id: string): Promise<void> {
    await db.delete(ships).where(eq(ships.id, id));
  }

  async deleteAll(): Promise<void> {
    await db.delete(ships);
  }
}