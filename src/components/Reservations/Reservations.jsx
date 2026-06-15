// src/components/Reservations/Reservations.jsx
import { useEffect, useState } from "react";
import { reservationsApi, clientsApi, roomsApi } from "../../services/api";
import { useTableData } from "../../hooks/useTableData";
import { useSettings } from "../../hooks/useSettings";
import { exportToCsv, isDateInRange } from "../../utils/tableUtils";
import {
  Page, Button, Card, Badge, Modal, ModalActions, Input, Select, Alert, Loading,
  TableToolbar, Pagination, SortableHeader,
} from "../ui";

const STATUS_BADGE = {
  confirmed:   ["blue",   "مؤكد"],
  checked_in:  ["green",  "تسجيل دخول"],
  checked_out: ["gray",   "تسجيل خروج"],
  cancelled:   ["red",    "ملغي"],
};

function ResBadge({ status }) {
  const [color, label] = STATUS_BADGE[status] || ["gray", status];
  return <Badge color={color}>{label}</Badge>;
}

function ReservationModal({ onClose, onSaved }) {
  const [clients, setClients] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [form, setForm] = useState({ clientId: "", roomId: "", checkIn: "", checkOut: "", notes: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [loadingRooms, setLoadingRooms] = useState(false);

  useEffect(() => {
    clientsApi.getAll().then(setClients);
  }, []);

  useEffect(() => {
    if (!form.checkIn || !form.checkOut || form.checkOut <= form.checkIn) {
      roomsApi.getAvailable().then(setRooms);
      return;
    }
    setLoadingRooms(true);
    roomsApi.getAvailable(form.checkIn, form.checkOut)
      .then(setRooms)
      .catch(() => setRooms([]))
      .finally(() => setLoadingRooms(false));
  }, [form.checkIn, form.checkOut]);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.clientId || !form.roomId || !form.checkIn || !form.checkOut)
      return setError("جميع الحقول مطلوبة");
    if (form.checkOut <= form.checkIn)
      return setError("تاريخ المغادرة يجب أن يكون بعد تاريخ الوصول");
    setSaving(true);
    try {
      await reservationsApi.create({
        clientId: parseInt(form.clientId),
        roomId: parseInt(form.roomId),
        checkIn: form.checkIn,
        checkOut: form.checkOut,
      });
      onSaved();
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  const today = new Date().toISOString().split("T")[0];
  const room = rooms.find((r) => r.id === parseInt(form.roomId));
  const days = form.checkIn && form.checkOut && form.checkIn < form.checkOut
    ? Math.ceil((new Date(form.checkOut) - new Date(form.checkIn)) / 86400000)
    : 0;

  return (
    <Modal
      title="حجز جديد"
      onClose={onClose}
      footer={<ModalActions onCancel={onClose} onSubmit={submit} loading={saving} submitLabel="تأكيد الحجز" />}
    >
      {error && <Alert>{error}</Alert>}
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <Input label="تاريخ الوصول *" type="date" value={form.checkIn} onChange={(e) => set("checkIn", e.target.value)} min={today} />
          <Input label="تاريخ المغادرة *" type="date" value={form.checkOut} onChange={(e) => set("checkOut", e.target.value)} min={form.checkIn || today} />
        </div>
        <Select label="العميل *" value={form.clientId} onChange={(e) => set("clientId", e.target.value)}>
          <option value="">-- اختر عميلاً --</option>
          {clients.map((c) => <option key={c.id} value={c.id}>{c.fullName}</option>)}
        </Select>
        <Select
          label={loadingRooms ? "جاري تحميل الغرف المتاحة..." : `الغرفة المتاحة للتواريخ (${rooms.length}) *`}
          value={form.roomId}
          onChange={(e) => set("roomId", e.target.value)}
          disabled={loadingRooms || !form.checkIn || !form.checkOut}
        >
          <option value="">-- اختر غرفة --</option>
          {rooms.map((r) => (
            <option key={r.id} value={r.id}>
              #{r.number} — {r.type} — {r.price.toLocaleString()} دج/ليلة
            </option>
          ))}
        </Select>
        {days > 0 && room && (
          <Alert type="success">
            التكلفة الإجمالية: {(room.price * days).toLocaleString()} دج ({days} ليلة)
          </Alert>
        )}
      </div>
    </Modal>
  );
}

const reservationFilterFn = (r, filters, search) => {
  if (filters.status && filters.status !== "all" && r.status !== filters.status) return false;
  if (filters.today && r.checkIn !== new Date().toISOString().split("T")[0]) return false;
  if (!isDateInRange(r.checkIn, filters.dateFrom, filters.dateTo)) return false;
  if (search) {
    const q = search.toLowerCase();
    if (!r.clientName?.toLowerCase().includes(q) && !String(r.roomNumber).includes(q)) return false;
  }
  return true;
};

export default function Reservations() {
  const { settings } = useSettings();
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [alert, setAlert] = useState(null);

  const load = () => reservationsApi.getAll().then(setReservations).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const table = useTableData(reservations, {
    filterFn: reservationFilterFn,
    defaultSortKey: "checkIn",
    defaultSortDir: "desc",
  });

  useEffect(() => {
    table.setPageSize(settings.pageSize);
  }, [settings.pageSize]);

  const showAlert = (msg, type = "success") => {
    setAlert({ msg, type });
    setTimeout(() => setAlert(null), 3000);
  };

  const action = async (fn, id, successMsg) => {
    try {
      await fn(id);
      showAlert(successMsg);
      load();
    } catch (e) {
      showAlert(e.message, "error");
    }
  };

  const handleExport = () => {
    exportToCsv("reservations.csv", [
      { label: "ID", value: (r) => r.id },
      { label: "العميل", value: (r) => r.clientName },
      { label: "الغرفة", value: (r) => r.roomNumber },
      { label: "الوصول", value: (r) => r.checkIn },
      { label: "المغادرة", value: (r) => r.checkOut },
      { label: "الحالة", value: (r) => r.status },
    ], reservations.filter((r) => reservationFilterFn(r, table.filters, table.search)));
  };

  const tabs = [
    ["all", "الكل"],
    ["confirmed", "مؤكدة"],
    ["checked_in", "داخل الفندق"],
    ["checked_out", "غادر"],
    ["cancelled", "ملغية"],
  ];

  if (loading) return <Loading />;

  return (
    <Page
      title="إدارة الحجوزات"
      subtitle={`${reservations.length} حجز مسجل · ${table.total} نتيجة`}
      actions={
        <Button onClick={() => setModal(true)}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          حجز جديد
        </Button>
      }
    >
      {alert && <Alert type={alert.type}>{alert.msg}</Alert>}

      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="بحث بالعميل أو رقم الغرفة..."
        onExport={handleExport}
        onReset={table.resetAll}
        extra={
          <>
            <Input label="من تاريخ" type="date" value={table.filters.dateFrom || ""} onChange={(e) => table.setFilter("dateFrom", e.target.value)} />
            <Input label="إلى تاريخ" type="date" value={table.filters.dateTo || ""} onChange={(e) => table.setFilter("dateTo", e.target.value)} />
            <Button
              size="sm"
              variant={table.filters.today ? "primary" : "outline"}
              onClick={() => table.setFilter("today", !table.filters.today)}
              className="self-end"
            >
              وصول اليوم فقط
            </Button>
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {tabs.map(([val, label]) => (
            <Button
              key={val}
              size="sm"
              variant={(table.filters.status || "all") === val ? "primary" : "outline"}
              onClick={() => table.setFilter("status", val)}
            >
              {label}
            </Button>
          ))}
        </div>
      </TableToolbar>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100">
                <SortableHeader label="#" sortKey="id" currentSort={table.sort} onSort={table.toggleSort} />
                <SortableHeader label="العميل" sortKey="clientName" currentSort={table.sort} onSort={table.toggleSort} />
                <SortableHeader label="الغرفة" sortKey="roomNumber" currentSort={table.sort} onSort={table.toggleSort} />
                <SortableHeader label="الوصول" sortKey="checkIn" currentSort={table.sort} onSort={table.toggleSort} />
                <SortableHeader label="المغادرة" sortKey="checkOut" currentSort={table.sort} onSort={table.toggleSort} />
                <th className="pb-3 text-right font-semibold text-slate-500">التكلفة</th>
                <SortableHeader label="الحالة" sortKey="status" currentSort={table.sort} onSort={table.toggleSort} />
                <th className="pb-3 text-right font-semibold text-slate-500">الإجراءات</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {table.rows.map((r) => {
                const days = Math.ceil((new Date(r.checkOut) - new Date(r.checkIn)) / 86400000);
                return (
                  <tr key={r.id} className="hover:bg-slate-50">
                    <td className="py-3.5 text-slate-400">{r.id}</td>
                    <td className="py-3.5 font-semibold text-slate-800">{r.clientName}</td>
                    <td className="py-3.5 text-slate-600">#{r.roomNumber}</td>
                    <td className="py-3.5 text-slate-600">{r.checkIn}</td>
                    <td className="py-3.5 text-slate-600">{r.checkOut}</td>
                    <td className="py-3.5 text-slate-600">{(r.roomPrice * days).toLocaleString()} {settings.currency}</td>
                    <td className="py-3.5"><ResBadge status={r.status} /></td>
                    <td className="py-3.5">
                      <div className="flex flex-wrap gap-2">
                        {r.status === "confirmed" && (
                          <>
                            <Button size="sm" variant="success" onClick={() => action(reservationsApi.checkIn, r.id, "تم تسجيل الدخول")}>دخول</Button>
                            <Button size="sm" variant="danger" onClick={() => action(reservationsApi.cancel, r.id, "تم الإلغاء")}>إلغاء</Button>
                          </>
                        )}
                        {r.status === "checked_in" && (
                          <Button size="sm" variant="warning" onClick={() => action(reservationsApi.checkOut, r.id, "تم تسجيل الخروج")}>خروج</Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {table.rows.length === 0 && (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">لا توجد حجوزات</td></tr>
              )}
            </tbody>
          </table>
        </div>
        <Pagination
          page={table.page}
          totalPages={table.totalPages}
          total={table.total}
          pageSize={table.pageSize}
          onPageChange={table.setPage}
          onPageSizeChange={table.setPageSize}
        />
      </Card>

      {modal && (
        <ReservationModal
          onClose={() => setModal(false)}
          onSaved={() => { setModal(false); load(); showAlert("تم الحجز بنجاح"); }}
        />
      )}
    </Page>
  );
}
