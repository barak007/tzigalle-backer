"use server";

import { createClient } from "@/lib/supabase/server";
import { BreadCategory } from "@/lib/constants/bread-categories";

export interface CatalogData {
  revision: number;
  categories: BreadCategory[];
}

/**
 * Get the active product catalog from the database
 */
export async function getActiveCatalog(): Promise<CatalogData> {
  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_catalog")
    .select("revision, catalog_data")
    .eq("is_active", true)
    .order("updated_at", { ascending: false })
    .limit(1)
    .single();

  if (error) {
    console.error("Error fetching catalog:", error);
    // Return empty array with revision 0 if no catalog found
    return { revision: 0, categories: [] };
  }

  return {
    revision: data?.revision || 0,
    categories: (data?.catalog_data as BreadCategory[]) || [],
  };
}

/**
 * Update the product catalog (admin only)
 */
export async function updateCatalog(
  catalogData: BreadCategory[]
): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient();

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "לא מחובר" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "אין הרשאות מנהל" };
  }

  try {
    // Get the next revision number
    const { data: latestCatalog } = await supabase
      .from("product_catalog")
      .select("revision")
      .order("revision", { ascending: false })
      .limit(1)
      .single();

    const nextRevision = (latestCatalog?.revision || 0) + 1;

    // First, deactivate all existing catalogs
    await supabase
      .from("product_catalog")
      .update({ is_active: false })
      .eq("is_active", true);

    // Insert new catalog with incremented revision
    const { error: insertError } = await supabase
      .from("product_catalog")
      .insert({
        revision: nextRevision,
        catalog_data: catalogData,
        is_active: true,
      });

    if (insertError) {
      console.error("Error inserting catalog:", insertError);
      return { success: false, error: "שגיאה בשמירת הקטלוג" };
    }

    return { success: true };
  } catch (error) {
    console.error("Unexpected error updating catalog:", error);
    return { success: false, error: "שגיאה לא צפויה" };
  }
}

/**
 * Get all catalog versions (admin only)
 */
export async function getAllCatalogs(): Promise<{
  success: boolean;
  data?: any[];
  error?: string;
}> {
  const supabase = await createClient();

  // Check if user is authenticated and is admin
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "לא מחובר" };
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (!profile || profile.role !== "admin") {
    return { success: false, error: "אין הרשאות מנהל" };
  }

  const { data, error } = await supabase
    .from("product_catalog")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching catalogs:", error);
    return { success: false, error: "שגיאה בטעינת היסטוריית קטלוגים" };
  }

  return { success: true, data };
}
