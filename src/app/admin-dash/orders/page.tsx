import { Badge } from "@/components/ui";
import { getRepo } from "@/lib/repo";
import { formatPrice } from "@/lib/utils";

export default async function AdminOrders() {
  const repo = await getRepo();
  const orders = await repo.listOrders({ limit: 500 });

  return (
    <div>
      <h2 className="mb-5 text-lg font-semibold">Orders ({orders.length})</h2>
      {orders.length === 0 ? (
        <p className="rounded-card border border-dashed border-border p-10 text-center text-sm text-muted">
          No orders yet.
        </p>
      ) : (
        <div className="overflow-hidden rounded-card border border-border">
          <table className="w-full text-sm">
            <thead className="bg-surface text-left text-xs uppercase text-muted">
              <tr>
                <th className="p-3 font-medium">Reference</th>
                <th className="p-3 font-medium">Email</th>
                <th className="p-3 font-medium">Items</th>
                <th className="p-3 font-medium">Total</th>
                <th className="p-3 font-medium">Status</th>
                <th className="p-3 font-medium">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {orders.map((o) => (
                <tr key={o.id} className="bg-surface/40">
                  <td className="p-3 font-mono text-xs">{o.pesapalMerchantRef}</td>
                  <td className="p-3">{o.email}</td>
                  <td className="p-3">{o.items.length}</td>
                  <td className="p-3 font-medium">{formatPrice(o.totalCents, o.currency)}</td>
                  <td className="p-3">
                    <Badge tone={o.status === "paid" ? "free" : o.status === "failed" ? "mature" : "neutral"}>
                      {o.status}
                    </Badge>
                  </td>
                  <td className="p-3 text-xs text-muted">
                    {new Date(o.createdAt).toLocaleDateString()}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
