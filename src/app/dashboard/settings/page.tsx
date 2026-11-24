import { requireOwner } from "@/lib/auth/guards";
import { LogoUpload } from "@/components/dashboard/logo-upload";
import { ProfileForm } from "@/components/dashboard/profile-form";
import { Card, PageHeader } from "@/components/ui";

export const instant = false;

export default async function SettingsPage() {
  const owner = await requireOwner();
  return (
    <div>
      <PageHeader title="Settings" body="Your account email stays the login. Change the public business name here." />
      <div className="grid gap-4 lg:grid-cols-2">
        <Card>
          <ProfileForm name={owner.business.name} phone={owner.business.phone ?? ""} />
          <p className="mt-4 text-sm text-stone-500">Login email: {owner.user.email}</p>
        </Card>
        <Card>
          <h2 className="font-semibold">Business logo</h2>
          <LogoUpload target="business" current={owner.business.logoUrl} />
        </Card>
      </div>
    </div>
  );
}
