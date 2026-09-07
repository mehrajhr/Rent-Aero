export interface ICreateRentalPayload {
  startDate: string;
  endDate: string;
  items: {
    gearId: string;
    quantity: number;
  }[];
}
