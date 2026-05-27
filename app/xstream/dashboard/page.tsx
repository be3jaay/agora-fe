import { SellerDashboard } from "@/components/xstream/seller-dashboard";

export const metadata = {
  title: "Seller Dashboard — SukiCloser",
  description: "Live analytics firehose for the seller during a livestream.",
};

export default function DashboardPage() {
  return <SellerDashboard />;
}
