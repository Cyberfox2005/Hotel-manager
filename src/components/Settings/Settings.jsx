import { useState } from "react";
import { Page, Card, Button, Input, Select, Alert } from "../ui";
import { useSettings } from "../../hooks/useSettings";
import { DEFAULT_SETTINGS } from "../../utils/settings";

export default function Settings() {
  const { settings, update } = useSettings();
  const [form, setForm] = useState(settings);
  const [saved, setSaved] = useState(false);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const handleSave = () => {
    update(form);
    setSaved(true);
    setTimeout(() => setSaved(false), 2500);
  };

  const handleReset = () => {
    setForm(DEFAULT_SETTINGS);
    update(DEFAULT_SETTINGS);
  };

  return (
    <Page title="الإعدادات" subtitle="تخصيص تجربة الاستخدام والعرض">
      {saved && <Alert type="success">تم حفظ الإعدادات بنجاح</Alert>}

      <div className="grid gap-6 lg:grid-cols-2">
        <Card title="عام">
          <div className="space-y-4">
            <Input
              label="اسم الفندق"
              value={form.hotelName}
              onChange={(e) => set("hotelName", e.target.value)}
            />
            <Input
              label="رمز العملة"
              value={form.currency}
              onChange={(e) => set("currency", e.target.value)}
              placeholder="دج"
            />
          </div>
        </Card>

        <Card title="الجداول والعرض">
          <div className="space-y-4">
            <Select
              label="عدد الصفوف الافتراضي"
              value={form.pageSize}
              onChange={(e) => set("pageSize", Number(e.target.value))}
            >
              {[5, 10, 25, 50].map((n) => (
                <option key={n} value={n}>{n} صفوف</option>
              ))}
            </Select>
            <Select
              label="عرض الغرف الافتراضي"
              value={form.defaultRoomView}
              onChange={(e) => set("defaultRoomView", e.target.value)}
            >
              <option value="table">جدول</option>
              <option value="grid">بطاقات</option>
            </Select>
          </div>
        </Card>
      </div>

      <div className="flex gap-2">
        <Button onClick={handleSave}>حفظ الإعدادات</Button>
        <Button variant="outline" onClick={handleReset}>استعادة الافتراضي</Button>
      </div>
    </Page>
  );
}
