export function compareValues(a, b, dir = "asc") {
  if (a == null && b == null) return 0;
  if (a == null) return 1;
  if (b == null) return -1;

  let result = 0;
  if (typeof a === "number" && typeof b === "number") {
    result = a - b;
  } else {
    result = String(a).localeCompare(String(b), "ar", { numeric: true });
  }
  return dir === "desc" ? -result : result;
}

export function exportToCsv(filename, columns, rows) {
  const escape = (val) => {
    const str = val == null ? "" : String(val);
    return str.includes(",") || str.includes('"') || str.includes("\n")
      ? `"${str.replace(/"/g, '""')}"`
      : str;
  };

  const header = columns.map((c) => escape(c.label)).join(",");
  const body = rows
    .map((row) => columns.map((c) => escape(c.value(row))).join(","))
    .join("\n");

  const blob = new Blob(["\uFEFF" + header + "\n" + body], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function isDateInRange(date, from, to) {
  if (!date) return true;
  if (from && date < from) return false;
  if (to && date > to) return false;
  return true;
}

export function hasReservationConflict(reservations, roomId, checkIn, checkOut, excludeId = 0) {
  return reservations.some(
    (r) =>
      r.roomId === roomId &&
      r.id !== excludeId &&
      r.status !== "cancelled" &&
      r.checkIn < checkOut &&
      r.checkOut > checkIn
  );
}
