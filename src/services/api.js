// src/services/api.js
const BASE = "/api";

async function request(method, url, body = null) {
  const options = {
    method,
    headers: { "Content-Type": "application/json" },
  };
  if (body) options.body = JSON.stringify(body);
  const res = await fetch(BASE + url, options);
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || "Server error");
  return data;
}

// ── Rooms ──────────────────────────────────────
export const roomsApi = {
  getAll:       ()       => request("GET",    "/rooms"),
  getAvailable: (checkIn, checkOut) => {
    const params = checkIn && checkOut ? `?checkIn=${checkIn}&checkOut=${checkOut}` : "";
    return request("GET", `/rooms/available${params}`);
  },
  create:       (room)   => request("POST",   "/rooms", room),
  update:       (id, r)  => request("PUT",    `/rooms/${id}`, r),
  delete:       (id)     => request("DELETE", `/rooms/${id}`),
};

// ── Clients ────────────────────────────────────
export const clientsApi = {
  getAll:  (q = "")    => request("GET",    `/clients${q ? `?q=${q}` : ""}`),
  create:  (c)         => request("POST",   "/clients", c),
  update:  (id, c)     => request("PUT",    `/clients/${id}`, c),
  delete:  (id)        => request("DELETE", `/clients/${id}`),
};

// ── Reservations ───────────────────────────────
export const reservationsApi = {
  getAll:    ()   => request("GET",  "/reservations"),
  getToday:  ()   => request("GET",  "/reservations/today"),
  create:    (r)  => request("POST", "/reservations", r),
  cancel:    (id) => request("POST", `/reservations/${id}/cancel`),
  checkIn:   (id) => request("POST", `/reservations/${id}/checkin`),
  checkOut:  (id) => request("POST", `/reservations/${id}/checkout`),
};

// ── Dashboard ──────────────────────────────────
export const dashboardApi = {
  getStats: () => request("GET", "/dashboard"),
};
