import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import AdminPageClient from "./admin-page-client";
import { getActiveCatalog } from "@/app/actions/catalog";

export default async function AdminPage() {
  // Server-side authentication and authorization check
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  // Redirect to main login if not authenticated
  if (!user) {
    redirect("/login?returnTo=/admin");
  }

  // Server-side role check - CRITICAL SECURITY
  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  // Redirect to home if not admin
  if (!profile || profile.role !== "admin") {
    redirect("/");
  }

  // Fetch initial orders server-side
  const { data: orders, error } = await supabase
    .from("orders")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    console.error("Error fetching orders:", error);
    // Return empty array on error - client can handle it
  }

  // Fetch the active catalog
  const catalogData = await getActiveCatalog();

  // Pass data to client component
  return (
    <AdminPageClient
      initialOrders={orders || []}
      initialCatalog={catalogData.categories}
      catalogRevision={catalogData.revision}
    />
  );
}
