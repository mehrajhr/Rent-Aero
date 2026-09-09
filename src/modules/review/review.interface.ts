export interface ICreateReview {
  userId: string;
  orderId: string;
  gearId: string;
  rating: number;
  comment?: string;
}
