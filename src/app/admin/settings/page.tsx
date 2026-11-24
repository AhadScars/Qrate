import { requireAdmin } from "@/lib/auth/guards";
import { getSettings } from "@/lib/config/settings";
import { SettingsForm } from "@/components/admin/settings-form";
import { Card, PageHeader } from "@/components/ui";

export const instant = false;

export default async function AdminSettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  return (
    <div>
      <PageHeader title="Platform settings" body="Trial length, price, and the public legal text live here." />
      <Card>
        <SettingsForm values={settings} />
      </Card>
    </div>
  );
}
