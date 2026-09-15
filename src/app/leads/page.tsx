import { lead } from "@/lib/auth";
import { configured } from "@/lib/firebase-admin";
import { LeadLogin } from "@/components/leads/login";
import { Dashboard } from "@/components/leads/dashboard";
export const dynamic = "force-dynamic";
export default async function Page() {
  const user = await lead();
  return user ? (
    <Dashboard email={user.email} />
  ) : (
    <LeadLogin ready={configured()} />
  );
}
