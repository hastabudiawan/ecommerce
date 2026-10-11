// Membaca klaim "exp" dari payload JWT (tanpa memverifikasi tanda tangan;
// verifikasi sebenarnya tetap dilakukan backend). Dipakai hanya untuk tahu
// apakah token sudah kedaluwarsa.
export function isTokenExpired(token: string) {
  try {
    const payload = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const { exp } = JSON.parse(atob(payload));
    return typeof exp === "number" && exp * 1000 <= Date.now();
  } catch {
    // Token yang formatnya rusak dianggap tidak berlaku
    return true;
  }
}