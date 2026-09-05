"use client";

import { useState, useEffect, useCallback } from "react";
import { ICatalogProduct, CATALOG_PRODUCTS } from "@/config/catalogData";
import { siteConfig } from "@/config/site";
import { ProductCategory, BillingFrequency } from "@/types";

export interface UseProductCatalogReturn {
  catalog: ICatalogProduct[];
  isLoading: boolean;
  isLive: boolean;
  error: string | null;
  lastFetchedAt: Date | null;
  refreshCatalog: () => Promise<void>;
}

export function useProductCatalog(): UseProductCatalogReturn {
  const [catalog, setCatalog] = useState<ICatalogProduct[]>(CATALOG_PRODUCTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [lastFetchedAt, setLastFetchedAt] = useState<Date | null>(null);

  const fetchCatalog = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Retrieve stored token or demo token if available
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("dealorbit_token") || "demo_token_sales_rep"
          : "demo_token_sales_rep";

      const headers: Record<string, string> = {
        "Content-Type": "application/json",
      };

      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const response = await fetch(`${siteConfig.apiUrl}/api/v1/products?limit=50`, {
        method: "GET",
        headers,
      });

      if (!response.ok) {
        throw new Error(`API responded with status ${response.status}`);
      }

      const json = await response.json();
      const rawProducts: any[] = json?.data?.products || [];

      if (rawProducts.length > 0) {
        const mappedProducts: ICatalogProduct[] = rawProducts.map((p) => {
          const categoryName: ProductCategory =
            p.category?.name === "SOFTWARE"
              ? "SOFTWARE"
              : p.category?.name === "SERVICES"
              ? "SERVICES"
              : "HARDWARE";

          const billingFreq: BillingFrequency =
            p.defaultBillingCycle === "MONTHLY"
              ? "MONTHLY"
              : p.defaultBillingCycle === "QUARTERLY"
              ? "QUARTERLY"
              : p.defaultBillingCycle === "YEARLY"
              ? "YEARLY"
              : categoryName === "SOFTWARE"
              ? "MONTHLY"
              : "ONE_TIME";

          const isRecurring = Boolean(
            p.isRecurringDefault || categoryName === "SOFTWARE" || billingFreq !== "ONE_TIME"
          );

          return {
            id: p.id,
            sku: p.sku,
            name: p.name,
            category: categoryName,
            basePrice: Number(p.basePrice) || 0,
            unitCost: Number(p.costPrice) || 0,
            unit: p.unit || (categoryName === "SERVICES" ? "Service" : "Unit"),
            isRecurring,
            billingFrequency: billingFreq,
            description: p.description || "",
            inStock: typeof p.totalStock === "number" ? p.totalStock : categoryName === "HARDWARE" ? 25 : 999,
            taxRate: (Number(p.taxRate) || 18) / 100,
          };
        });

        setCatalog(mappedProducts);
        setIsLive(true);
        setLastFetchedAt(new Date());
      } else {
        // Fallback to static catalog if empty
        setCatalog(CATALOG_PRODUCTS);
        setIsLive(false);
      }
    } catch (err: any) {
      console.warn("⚠️ Failed to fetch live products from API, using cached fallback:", err.message);
      setError(err.message || "Failed to load live catalog");
      setCatalog(CATALOG_PRODUCTS);
      setIsLive(false);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCatalog();
  }, [fetchCatalog]);

  return {
    catalog,
    isLoading,
    isLive,
    error,
    lastFetchedAt,
    refreshCatalog: fetchCatalog,
  };
}
