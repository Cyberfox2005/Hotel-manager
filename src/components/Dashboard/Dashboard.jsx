// src/components/Dashboard/Dashboard.jsx
import { useEffect, useState, useMemo } from "react";
import { dashboardApi, reservationsApi } from "../../services/api";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";
import { Page, Card, Loading, Button } from "../ui";
import { useSettings } from "../../hooks/useSettings";

function StatCard({ label, value, sub, accent = "text-brand-600" }) {
  return (
    <div className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-card transition-shadow hover:shadow-card-hover">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className={`mt-2 text-3xl font-bold ${accent}`}>{value}</p>
      {sub && <p className="mt-1 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}

const PERIODS = [
  { id: "today", label: "اليوم" },
  { id: "week", label: "هذا الأسبوع" },
  { id: "month", label: "هذا الشهر" },
  { id: "all", label: "الكل" },
];

function inPeriod(dateStr, period) {
  if (period === "all") return true;
  const d = new Date(dateStr);
  const now = new Date();
  if (period === "today") {
    return d.toDateString() === now.toDateString();
  }
  if (period === "week") {
    const weekAgo = new Date(now);
    weekAgo.setDate(now.getDate() - 7);
    return d >= weekAgo && d <= now;
  }
  if (period === "month") {
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  }
  return true;
}

export default function Dashboard() {
  const { settings } = useSettings();
  const [stats, setStats] = useState(null);
  const [allReservations, setAllReservations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState("month");

  useEffect(() => {
    Promise.all([dashboardApi.getStats(), reservationsApi.getAll(), reservationsApi.getToday()])
      .then(([s, all]) => { setStats(s); setAllReservations(all); })
      .finally(() => setLoading(false));
  }, []);

  const periodReservations = useMemo(
    () => allReservations.filter((r) => r.status !== "cancelled" && inPeriod(r.checkIn, period)),
    [allReservations, period]
  );

  const periodRevenue = useMemo(() => {
    return periodReservations.reduce((sum, r) => {
      const days = Math.ceil((new Date(r.checkOut) - new Date(r.checkIn)) / 86400000);
      return sum + r.roomPrice * days;
    }, 0);
  }, [periodReservations]);

  const todayArrivals = useMemo(
    () => allReservations.filter((r) => r.checkIn === new Date().toISOString().split("T")[0] && r.status !== "cancelled"),
    [allReservations]
  );

  if (loading) return <Loading />;
  if (!stats) return <div className="text-center text-red-600 py-16">فشل تحميل البيانات</div>;

  const chartData = [
    { name: "متاحة",  value: stats.availableRooms,  color: "#10b981" },
    { name: "مشغولة", value: stats.occupiedRooms,   color: "#2563eb" },
    { name: "صيانة",  value: stats.totalRooms - stats.availableRooms - stats.occupiedRooms, color: "#f59e0b" },
  ];

  const dateStr = new Date().toLocaleDateString("ar-DZ", {
    weekday: "long", year: "numeric", month: "long", day: "numeric",
  });

  return (
    <Page
      title={settings.hotelName}
      subtitle={dateStr}
      actions={
        <div className="flex flex-wrap gap-2">
          {PERIODS.map((p) => (
            <Button
              key={p.id}
              size="sm"
              variant={period === p.id ? "primary" : "outline"}
              onClick={() => setPeriod(p.id)}
            >
              {p.label}
            </Button>
          ))}
        </div>
      }
    >
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
        <StatCard label="إجمالي الغرف"   value={stats.totalRooms}         sub={`${stats.occupancyRate}% إشغال`} />
        <StatCard label="غرف متاحة"      value={stats.availableRooms}     accent="text-emerald-600" />
        <StatCard label="غرف مشغولة"     value={stats.occupiedRooms}    accent="text-brand-600" />
        <StatCard label="إجمالي العملاء" value={stats.totalClients}       accent="text-slate-700" />
        <StatCard label="حجوزات الفترة"  value={periodReservations.length} accent="text-amber-600" sub={PERIODS.find((p) => p.id === period)?.label} />
        <StatCard label="حجوزات نشطة"    value={stats.activeReservations} accent="text-violet-600" />
        <StatCard
          label="إيرادات الفترة"
          value={`${periodRevenue.toLocaleString()} ${settings.currency}`}
          accent="text-emerald-600"
        />
        <StatCard label="وصول اليوم"     value={todayArrivals.length}     accent="text-blue-600" />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="توزيع الغرف">
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={chartData}>
              <XAxis dataKey="name" tick={{ fontSize: 12, fill: "#64748b" }} />
              <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: "#64748b" }} />
              <Tooltip contentStyle={{ borderRadius: 8, border: "1px solid #e2e8f0", fontSize: 13 }} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]}>
                {chartData.map((entry, i) => (
                  <Cell key={i} fill={entry.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="وصول اليوم">
          {todayArrivals.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-400">لا يوجد وصول اليوم</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100">
                    <th className="pb-3 text-right font-semibold text-slate-500">العميل</th>
                    <th className="pb-3 text-right font-semibold text-slate-500">الغرفة</th>
                    <th className="pb-3 text-right font-semibold text-slate-500">المغادرة</th>
                    <th className="pb-3 text-right font-semibold text-slate-500">الحالة</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {todayArrivals.map((r) => (
                    <tr key={r.id} className="hover:bg-slate-50">
                      <td className="py-3 font-medium text-slate-800">{r.clientName}</td>
                      <td className="py-3 text-slate-600">#{r.roomNumber}</td>
                      <td className="py-3 text-slate-600">{r.checkOut}</td>
                      <td className="py-3 text-slate-600">{r.status}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </Page>
  );
}
