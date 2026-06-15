// src/components/Clients/Clients.jsx
import { useEffect, useState, useCallback } from "react";
import { clientsApi, reservationsApi } from "../../services/api";
import { useTableData } from "../../hooks/useTableData";
import { useSettings } from "../../hooks/useSettings";
import { exportToCsv } from "../../utils/tableUtils";
import {
  Page, Button, Card, Modal, ModalActions, Input, Alert, Loading, Badge,
  TableToolbar, Pagination, SortableHeader,
} from "../ui";

const EMPTY = { fullName: "", email: "", phone: "" };

function ClientModal({ client, onClose, onSaved }) {
  const [form, setForm] = useState(client || EMPTY);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const submit = async () => {
    if (!form.fullName) return setError("الاسم الكامل مطلوب");
    setSaving(true);
    try {
      const saved = client?.id ? await clientsApi.update(client.id, form) : await clientsApi.create(form);
      onSaved(saved);
    } catch (e) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Modal
      title={client?.id ? "تعديل عميل" : "إضافة عميل"}
      onClose={onClose}
      footer={<ModalActions onCancel={onClose} onSubmit={submit} loading={saving} />}
    >
      {error && <Alert>{error}</Alert>}
      <div className="space-y-4">
        <Input label="الاسم الكامل *" value={form.fullName} onChange={(e) => set("fullName", e.target.value)} placeholder="Ahmed Ben Ali" />
        <Input label="البريد الإلكتروني" type="email" value={form.email} onChange={(e) => set("email", e.target.value)} placeholder="email@example.com" />
        <Input label="رقم الهاتف" value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="0555-000000" />
      </div>
    </Modal>
  );
}

function ClientHistoryModal({ client, reservations, onClose }) {
  const history = reservations.filter((r) => r.clientId === client.id);

  return (
    <Modal title={`سجل حجوزات: ${client.fullName}`} onClose={onClose}>
      {history.length === 0 ? (
        <p className="py-8 text-center text-slate-400">لا توجد حجوزات لهذا العميل</p>
      ) : (
        <div className="space-y-3">
          {history.map((r) => (
            <div key={r.id} className="flex items-center justify-between rounded-lg border border-slate-100 p-3">
              <div>
                <p className="font-medium text-slate-800">غرفة #{r.roomNumber}</p>
                <p className="text-xs text-slate-500">{r.checkIn} → {r.checkOut}</p>
              </div>
              <Badge color={r.status === "cancelled" ? "red" : r.status === "checked_in" ? "green" : "blue"}>
                {r.status}
              </Badge>
            </div>
          ))}
        </div>
      )}
    </Modal>
  );
}

const clientFilterFn = (client, filters) => {
  if (filters.hasEmail === "yes" && !client.email) return false;
  if (filters.hasEmail === "no" && client.email) return false;
  if (filters.hasPhone === "yes" && !client.phone) return false;
  if (filters.hasPhone === "no" && client.phone) return false;
  return true;
};

export default function Clients() {
  const { settings } = useSettings();
  const [clients, setClients] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [historyClient, setHistoryClient] = useState(null);
  const [serverSearch, setServerSearch] = useState("");

  const load = useCallback((q = "") => {
    setLoading(true);
    Promise.all([clientsApi.getAll(q), reservationsApi.getAll()])
      .then(([c, r]) => { setClients(c); setReservations(r); })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  useEffect(() => {
    const t = setTimeout(() => load(serverSearch), 400);
    return () => clearTimeout(t);
  }, [serverSearch, load]);

  const table = useTableData(clients, {
    filterFn: clientFilterFn,
    defaultSortKey: "fullName",
    defaultSortDir: "asc",
  });

  useEffect(() => {
    table.setPageSize(settings.pageSize);
  }, [settings.pageSize]);

  const handleSaved = (saved) => {
    setClients((cs) =>
      cs.find((c) => c.id === saved.id) ? cs.map((c) => (c.id === saved.id ? saved : c)) : [...cs, saved]
    );
    setModal(null);
  };

  const handleDelete = async (id) => {
    if (!window.confirm("هل تريد حذف هذا العميل؟")) return;
    await clientsApi.delete(id);
    setClients((cs) => cs.filter((c) => c.id !== id));
  };

  const handleExport = () => {
    exportToCsv("clients.csv", [
      { label: "الاسم", value: (c) => c.fullName },
      { label: "البريد", value: (c) => c.email || "" },
      { label: "الهاتف", value: (c) => c.phone || "" },
    ], table.filteredRows);
  };

  return (
    <Page
      title="إدارة العملاء"
      subtitle={`${clients.length} عميل مسجل · ${table.total} نتيجة`}
      actions={
        <Button onClick={() => setModal("add")}>
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
          </svg>
          إضافة عميل
        </Button>
      }
    >
      <TableToolbar
        search={serverSearch}
        onSearchChange={setServerSearch}
        searchPlaceholder="بحث بالاسم أو البريد أو الهاتف..."
        onExport={handleExport}
        onReset={() => { table.resetAll(); setServerSearch(""); }}
        extra={
          <>
            <select
              value={table.filters.hasEmail || "all"}
              onChange={(e) => table.setFilter("hasEmail", e.target.value === "all" ? "" : e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">البريد: الكل</option>
              <option value="yes">لديه بريد</option>
              <option value="no">بدون بريد</option>
            </select>
            <select
              value={table.filters.hasPhone || "all"}
              onChange={(e) => table.setFilter("hasPhone", e.target.value === "all" ? "" : e.target.value)}
              className="rounded-lg border border-slate-200 px-3 py-2 text-sm"
            >
              <option value="all">الهاتف: الكل</option>
              <option value="yes">لديه هاتف</option>
              <option value="no">بدون هاتف</option>
            </select>
          </>
        }
      />

      <Card>
        {loading ? (
          <Loading />
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-right font-semibold text-slate-500">#</th>
                    <SortableHeader label="الاسم الكامل" sortKey="fullName" currentSort={table.sort} onSort={table.toggleSort} />
                    <SortableHeader label="البريد الإلكتروني" sortKey="email" currentSort={table.sort} onSort={table.toggleSort} />
                    <SortableHeader label="الهاتف" sortKey="phone" currentSort={table.sort} onSort={table.toggleSort} />
                    <th className="pb-3 text-right font-semibold text-slate-500">الإجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {table.rows.map((c, i) => (
                    <tr key={c.id} className="hover:bg-slate-50">
                      <td className="py-3.5 text-slate-400">{(table.page - 1) * table.pageSize + i + 1}</td>
                      <td className="py-3.5 font-semibold text-slate-800">{c.fullName}</td>
                      <td className="py-3.5 text-slate-600">{c.email || "—"}</td>
                      <td className="py-3.5 text-slate-600">{c.phone || "—"}</td>
                      <td className="py-3.5">
                        <div className="flex flex-wrap gap-2">
                          <Button size="sm" variant="ghost" onClick={() => setHistoryClient(c)}>السجل</Button>
                          <Button size="sm" variant="outline" onClick={() => setModal(c)}>تعديل</Button>
                          <Button size="sm" variant="danger" onClick={() => handleDelete(c.id)}>حذف</Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                  {table.rows.length === 0 && (
                    <tr><td colSpan={5} className="py-12 text-center text-slate-400">لا يوجد عملاء</td></tr>
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
          </>
        )}
      </Card>

      {modal && (
        <ClientModal client={modal === "add" ? null : modal} onClose={() => setModal(null)} onSaved={handleSaved} />
      )}
      {historyClient && (
        <ClientHistoryModal
          client={historyClient}
          reservations={reservations}
          onClose={() => setHistoryClient(null)}
        />
      )}
    </Page>
  );
}
