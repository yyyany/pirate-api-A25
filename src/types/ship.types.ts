export interface Ship {
  id: string;
  name: string;
  goldCargo: number;
  captain: string;
  status: "docked" | "sailing" | "lookingForAFight";
  crewSize: number;
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
  // partie ajouter par moi
  pillagedCount: number;
}

export interface CreateShipRequest {
  name: string;
  goldCargo: number;
  captain: string;
  crewSize: number;
}


export interface ReceiveShipRequest {
  name: string;
  goldCargo: number;
  captain: string;
  status: "docked" | "sailing" | "lookingForAFight";
  crewSize: number;
  createdBy: string;
  createdAt: Date;
}

export interface PatchShipRequest {
  name: string;
  goldCargo: number;
  captain: string;
  crewSize: number;
}

// partie ajouter par moi 
export interface UpdateGoldRequest {
  amount: number;
}

export interface UpdateCrewRequest {
  amount: number;
}

export interface TransferGoldRequest {
  fromShipId: string;
  toShipId: string;
  amount: number;
}

export interface CreateNewShipDBRequest {
  id: string;
  name: string;
  goldCargo: number;
  captain: string;
  status: "docked" | "sailing" | "lookingForAFight";
  crewSize: number;
  createdBy: string;
}

export interface CreateReceivedShipDBRequest extends CreateNewShipDBRequest {
  createdAt: Date;
}