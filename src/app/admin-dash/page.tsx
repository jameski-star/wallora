import Link from "next/link";
import { Images, ShoppingCart, DollarSign, Download } from "lucide-react";
import { getRepo } from "@/lib/repo";
import { formatPrice } from "@/lib/utils";

export default async function AdminOverview() {
  const repo = await getRepo();
  const [wallpapers, orders] = await Promise.all([
    repo.listWallpapers({ includeMature: true, limit: 1000 }),
    repo.listOrders({ limit: 1000 }),
  ]);
  const paid = orders.filter((o) => o.status === "paid");
  const revenue = paid.reduce((s, o) => s + o.totalCents, 0);
  const downloads = wallpapers.reduce((s, w) => s + w.downloads, 0);

  const stats = [
    { label: "Wallpapers", value: String(wallpapers.length), icon: Images },
    { label: "Paid orders", value: String(paid.length), icon: ShoppingCart },
    { label: "Revenue", value: formatPrice(revenue), icon: DollarSign },
    { label: "Total downloads", value: String(downloads), icon: Download },
  ];

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-card border border-border bg-surface p-5">
            <s.icon className="mb-3 text-accent" size={20} />
            <p className="text-2xl font-bold">{s.value}</p>
            <p className="text-sm text-muted">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="rounded-card border border-border bg-surface p-6">
        <h2 className="mb-4 text-lg font-semibold">Recent orders</h2>
        {orders.length === 0 ? (
          <p className="text-sm text-muted">No orders yet.</p>
        ) : (
          <ul className="divide-y divide-border text-sm">
            {orders.slice(0, 8).map((o) => (
              <li key={o.id} className="flex items-center justify-between py-2">
                <span className="font-mono text-xs">{o.pesapalMerchantRef}</span>
                <span className="text-muted">{o.email}</span>
                <span className="capitalize">{o.status}</span>
                <span className="font-medium">{formatPrice(o.totalCents, o.currency)}</span>
              </li>
            ))}
          </ul>
        )}
        <Link href="/admin-dash/orders" className="mt-4 inline-block text-sm text-accent hover:underline">
          View all orders →
        </Link>
      </div>
    </div>
  );
}
