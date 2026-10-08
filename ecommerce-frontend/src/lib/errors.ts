import axios from "axios";

export function getErrorMessage(
  error: unknown,
  fallback = "Terjadi kesalahan. Coba lagi.",
) {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { message?: string } | undefined;
    return data?.message ?? fallback;
  }
  return fallback;
}