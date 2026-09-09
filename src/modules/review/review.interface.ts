export interface ICreateReview {
  userId: string;
  orderId: string;
  gearId: string;
  rating: number;
  comment?: string;
}

export interface IUpdateReviewPayload {
  reviewId: string;
  userId: string;
  rating?: number;
  comment?: string;
}
