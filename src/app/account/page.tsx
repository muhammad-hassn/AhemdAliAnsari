import { redirect } from "next/navigation";
import { buildMetadata } from "@/lib/seo";
import { Container } from "@/components/ui/Container";
import { Section } from "@/components/ui/Section";
import {
  getCurrentUser,
  getCurrentProfile,
  getUserAddresses,
  getUserOrders,
} from "@/server/queries/account";
import { AccountTabs } from "@/components/account/AccountTabs";

export const metadata = buildMetadata({
  title: "My Account",
  description: "View and manage your Zahra Luxe profile, couture orders, and bespoke delivery addresses.",
  path: "/account",
  noindex: true,
});

export default async function AccountPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/account");
  }

  const [profile, addresses, orders] = await Promise.all([
    getCurrentProfile(),
    getUserAddresses(),
    getUserOrders(),
  ]);

  return (
    <main className="min-h-screen bg-ivory pt-8 pb-16">
      <Section className="pt-4">
        <Container>
          <div className="mb-8 border-b border-stone-light/60 pb-4">
            <h1 className="font-serif text-3xl md:text-4xl text-ink font-normal">
              Bespoke Account
            </h1>
            <p className="text-xs uppercase tracking-widest text-stone mt-1">
              Personal sanctuary for orders, addresses, and curated preferences
            </p>
          </div>

          <AccountTabs
            email={user.email ?? ""}
            profile={profile}
            addresses={addresses}
            orders={orders}
          />
        </Container>
      </Section>
    </main>
  );
}
