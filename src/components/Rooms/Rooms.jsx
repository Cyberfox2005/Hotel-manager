// src/components/Rooms/Rooms.jsx
import { useEffect, useState, useCallback } from "react";
import { roomsApi } from "../../services/api";
import { useTableData } from "../../hooks/useTableData";
import { useSettings } from "../../hooks/useSettings";
import { exportToCsv } from "../../utils/tableUtils";
import {
  Page, Button, Card, Badge, Modal, ModalActions, Input, Select, Alert, Loading,
  TableToolbar, Pagination, SortableHeader,
} from "../ui";

const EMPTY = { number: "", type: "single", price: "", status: "available" };

const STATUS_BADGE = {
  available:   ["green",  "متاحة"],
  occupied:    ["blue",   "مشغولة"],
  maintenance: ["yellow", "صيانة"],
};

const TYPE_AR = { single: "فردية", double: "مزدوجة", suite: "جناح" };

function RoomBadge({ status }) {
  const [color, label] = STATUS_BADGE[status] || ["gray", status];
  return <Badge color={color}>{label}</Badge>;
}

function RoomModal({ room, onClose, onSaved }) {
  const [form, setForm] = useState(room || EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.number || !form.price) return setError("رقم الغرفة والسعر مطلوبان");
    setSaving(true);
    try {
      const saved = room?.id ? await roomsApi.update(room.id, form) : await roomsApi.create(form);
      onSaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={room?.id ? "تعديل غرفة" : "إضافة غرفة"}
      onClose={onClose}
      footer={<ModalActions onCancel={onClose} onSubmit={submit} loading={saving} />}
    >
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-2 gap-4">
        <Input label="رقم الغرفة" value={form.number} onChange={(e) => set("number", e.target.value)} placeholder="101" />
        <Select label="النوع" value={form.type} onChange={(e) => set("type", e.target.value)}>
          <option value="single">غرفة فردية</option>
          <option value="double">غرفة مزدوجة</option>
          <option value="suite">جناح</option>
        </Select>
        <Input label="السعر (دج / ليلة)" type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="1500" />
        <Select label="الحالة" value={form.status} onChange={(e) => set("status", e.target.value)}>
          <option value="available">متاحة</option>
          <option value="occupied">مشغولة</option>
          <option value="maintenance">صيانة</option>
        </Select>
      </div>
    </Modal>
  );
}

const roomFilterFn = (room, filters, search) => {
  if (filters.status && filters.status !== "all" && room.status !== filters.status) return false;
  if (filters.type && filters.type !== "all" && room.type !== filters.type) return false;
  if (filters.minPrice && room.price < Number(filters.minPrice)) return false;
  if (filters.maxPrice && room.price > Number(filters.maxPrice)) return false;
  if (search && !String(room.number).includes(search) && !TYPE_AR[room.type]?.includes(search)) return false;
  return true;
};

export default function Rooms() {
  const { settings } = useSettings();
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [view, setView] = useState(settings.defaultRoomView);

  const load = () => roomsApi.getAll().then(setRooms).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const table = useTableData(rooms, {
    filterFn: roomFilterFn,
    defaultSortKey: "number",
    defaultSortDir: "asc",
  });

  useEffect(() => {
    table.setPageSize(settings.pageSize);
  }, [settings.pageSize]);

  const handleSaved = (saved) => {
    setRooms((rs) =>
      rs.find((r) => r.id === saved.id) ? rs.map((r) => (r.id === saved.id ? saved : r)) : [...rs, saved]
    );
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذه الغرفة؟")) return;
    await roomsApi.delete(id);
    setRooms((rs) => rs.filter((r) => r.id !== id));
  };

  const handleExport = useCallback(() => {
    exportToCsv("rooms.csv", [
      { label: "رقم الغرفة", value: (r) => r.number },
      { label: "النوع", value: (r) => TYPE_AR[r.type] || r.type },
      { label: "السعر", value: (r) => r.price },
      { label: "الحالة", value: (r) => STATUS_BADGE[r.status]?.[1] || r.status },
    ], rooms.filter((r) => roomFilterFn(r, table.filters, table.search)));
  }, [rooms, table.filters, table.search]);

  const statusTabs = [
    ["all", "الكل"],
    ["available", "متاحة"],
    ["occupied", "مشغولة"],
    ["maintenance", "صيانة"],
  ];

  if (loading) return <Loading />;

  return (
    <Page
      title="إدارة الغرف"
      subtitle={`${rooms.length} غرفة مسجلة · ${table.total} نتيجة`}
      actions={
        <div className="flex gap-2">
          <Button size="sm" variant={view === "table" ? "primary" : "outline"} onClick={() => setView("table")}>جدول</Button>
          <Button size="sm" variant={view === "grid" ? "primary" : "outline"} onClick={() => setView("grid")}>بطاقات</Button>
          <Button onClick={() => setModal("add")}>
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            إضافة غرفة
          </Button>
        </div>
      }
    >
      <TableToolbar
        search={table.search}
        onSearchChange={table.setSearch}
        searchPlaceholder="بحث برقم الغرفة أو النوع..."
        onExport={handleExport}
        onReset={table.resetAll}
        extra={
          <>
            <Select label="النوع" value={table.filters.type || "all"} onChange={(e) => table.setFilter("type", e.target.value)} className="min-w-[140px]">
              <option value="all">كل الأنواع</option>
              <option value="single">فردية</option>
              <option value="double">مزدوجة</option>
              <option value="suite">جناح</option>
            </Select>
            <Input label="سعر من" type="number" value={table.filters.minPrice || ""} onChange={(e) => table.setFilter("minPrice", e.target.value)} className="w-28" />
            <Input label="سعر إلى" type="number" value={table.filters.maxPrice || ""} onChange={(e) => table.setFilter("maxPrice", e.target.value)} className="w-28" />
          </>
        }
      >
        <div className="flex flex-wrap gap-2">
          {statusTabs.map(([val, label]) => (
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

      {view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {table.rows.map((room) => (
            <div key={room.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-card">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-2xl font-bold text-slate-900">#{room.number}</p>
                  <p className="text-sm text-slate-500">{TYPE_AR[room.type]}</p>
                </div>
                <RoomBadge status={room.status} />
              </div>
              <p className="mt-3 text-lg font-semibold text-brand-600">
                {room.price.toLocaleString()} {settings.currency}/ليلة
              </p>
              <div className="mt-4 flex gap-2">
                <Button size="sm" variant="outline" onClick={() => setModal(room)}>تعديل</Button>
                <Button size="sm" variant="danger" onClick={() => handleDelete(room.id)}>حذف</Button>
              </div>
            </div>
          ))}
          {table.rows.length === 0 && (
            <p className="col-span-full py-12 text-center text-slate-400">لا توجد غرف</p>
          )}
        </div>
      ) : null}

      {view === "grid" && table.total > 0 && (
        <Card>
          <Pagination
            page={table.page}
            totalPages={table.totalPages}
            total={table.total}
            pageSize={table.pageSize}
            onPageChange={table.setPage}
            onPageSizeChange={table.setPageSize}
          />
        </Card>
      )}

      {view === "table" && (
        <Card>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  <SortableHeader label="رقم الغرفة" sortKey="number" currentSort={table.sort} onSort={table.toggleSort} />
                  <SortableHeader label="النوع" sortKey="type" currentSort={table.sort} onSort={table.toggleSort} />
                  <SortableHeader label="السعر / ليلة" sortKey="price" currentSort={table.sort} onSort={table.toggleSort} />
                  <SortableHeader label="الحالة" sortKey="status" currentSort={table.sort} onSort={table.toggleSort} />
                  <th className="pb-3 text-right font-semibold text-slate-500">الإجراءات</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {table.rows.map((room) => (
                  <tr key={room.id} className="hover:bg-slate-50">
                    <td className="py-3.5 font-semibold text-slate-800">#{room.number}</td>
                    <td className="py-3.5 text-slate-600">{TYPE_AR[room.type] || room.type}</td>
                    <td className="py-3.5 text-slate-600">{room.price.toLocaleString()} {settings.currency}</td>
                    <td className="py-3.5"><RoomBadge status={room.status} /></td>
                    <td className="py-3.5">
                      <div className="flex gap-2">
                        <Button size="sm" variant="outline" onClick={() => setModal(room)}>تعديل</Button>
                        <Button size="sm" variant="danger" onClick={() => handleDelete(room.id)}>حذف</Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {table.rows.length === 0 && (
                  <tr><td colSpan={5} className="py-12 text-center text-slate-400">لا توجد غرف</td></tr>
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
      )}

      {modal && (
        <RoomModal room={modal === "add" ? null : modal} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
    </Page>
  );
}
