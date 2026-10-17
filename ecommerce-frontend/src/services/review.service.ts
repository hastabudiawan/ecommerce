import { api } from "@/lib/api";
import type {
  ApiResponse,
  PageResponse,
  Review,
  ReviewEligibility,
  ReviewRequest,
} from "@/types/api";

export async function getReviews({
  productId,
  page,
  size,
}: {
  productId: number;
  page: number;
  size: number;
}) {
  const res = await api.get<ApiResponse<PageResponse<Review>>>(
    `/products/${productId}/reviews`,
    { params: { page, size } },
  );
  return res.data.data;
}

export async function getReviewEligibility(productId: number) {
  const res = await api.get<ApiResponse<ReviewEligibility>>(
    `/products/${productId}/reviews/me`,
  );
  return res.data.data;
}

export async function createReview({
  productId,
  payload,
}: {
  productId: number;
  payload: ReviewRequest;
}) {
  const res = await api.post<ApiResponse<Review>>(`/products/${productId}/reviews`, payload);
  return res.data.data;
}

export async function updateReview({
  id,
  payload,
}: {
  id: number;
  payload: ReviewRequest;
}) {
  const res = await api.put<ApiResponse<Review>>(`/reviews/${id}`, payload);
  return res.data.data;
}

export async function deleteReview(id: number) {
  await api.delete(`/reviews/${id}`);
}