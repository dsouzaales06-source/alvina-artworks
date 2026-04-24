/**
 * Status badge styling and labels for products
 */

export type ProductStatus = "available" | "out_of_stock" | "limited_time_deal" | "coming_soon";

export interface StatusBadgeConfig {
  label: string;
  bgColor: string;
  textColor: string;
  icon: string;
}

export const statusBadgeConfig: Record<ProductStatus, StatusBadgeConfig> = {
  available: {
    label: "In Stock",
    bgColor: "bg-green-100",
    textColor: "text-green-800",
    icon: "✓",
  },
  out_of_stock: {
    label: "Out of Stock",
    bgColor: "bg-gray-100",
    textColor: "text-gray-800",
    icon: "✕",
  },
  limited_time_deal: {
    label: "Limited Time Deal",
    bgColor: "bg-orange-100",
    textColor: "text-orange-800",
    icon: "⏰",
  },
  coming_soon: {
    label: "Coming Soon",
    bgColor: "bg-blue-100",
    textColor: "text-blue-800",
    icon: "★",
  },
};

export function getStatusBadge(status: ProductStatus): StatusBadgeConfig {
  return statusBadgeConfig[status] || statusBadgeConfig.available;
}
