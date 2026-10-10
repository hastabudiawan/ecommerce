import { api } from "@/lib/api";
import type {
  ApiResponse,
  PageResponse,
  Settlement,
  SettlementStatus,
  SettlementSummary,
} from "@/types/api";

export async function getSettlements({ page, size }: { page: number; size: number }) {
  const res = await api.get<ApiResponse<PageResponse<Settlement>>>(
    "/seller/settlements",
    { params: { page, size } },
  );
  return res.data.data;
}

export async function getSettlementSummary() {
  const res = await api.get<ApiResponse<SettlementSummary>>("/seller/settlements/summary");
  return res.data.data;
}

export async function getSettlementsForAdmin({
  status,
  page,
  size,
}: {
  status?: SettlementStatus;
  page: number;
  size: number;
}) {
  const res = await api.get<ApiResponse<PageResponse<Settlement>>>("/admin/settlements", {
    params: { status, page, size },
  });
  return res.data.data;
}

export async function releaseSettlement(id: number) {
  const res = await api.put<ApiResponse<Settlement>>(`/admin/settlements/${id}/release`);
  return res.data.data;
}