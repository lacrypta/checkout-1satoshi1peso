export interface OrderUserData {
  fullname: string;
  email: string;
  newsletter?: boolean;
  code?: string;
}

export interface OrderRequestData extends OrderUserData {
  ticketQuantity: number;
}

export interface OrderRequestReturn {
  pr: string;
  verify: string;
  eventReferenceId: string;
}

export interface OrderClaimReturn {
  claim: boolean;
}
