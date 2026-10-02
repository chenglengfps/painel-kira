import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/kira/dashboard";
import { getDashboard } from "@/lib/kira/queries";

export const Route = createFileRoute("/")({
  loader: () => getDashboard(),
  component: Home,
});

function Home() {
  const initial = Route.useLoaderData();
  return <Dashboard initialData={initial} />;
}
