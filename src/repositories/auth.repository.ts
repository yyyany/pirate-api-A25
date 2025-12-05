import {db} from '../db/connection'
import {User} from '../types/user.types'
import {users} from '../db/schema'
import {eq} from "drizzle-orm";

export class AuthRepository {
  async findById(id: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.id, id));
    return result[0] || null;
  }

  async findByUsername(username: string): Promise<User | null> {
    const result = await db.select().from(users).where(eq(users.username, username));
    return result[0] || null;
  }

  async setAdmin(id: string): Promise<User | null> {

    const Idresult = await this.findById(id);
    if (!Idresult) throw new Error('Failed to find user Id');
    
    await db.update(users)
          .set({ isAdmin: true }) 
          .where(eq(users.id, id));
        const result = await this.findById(id);
    return result;
  }


  async create(user: { id: string; username: string; passwordHash: string }): Promise<User> {
    await db.insert(users).values(user);

    const result = await this.findById(user.id);
    if (!result) throw new Error('Failed to create user');

    return result;
  }
}