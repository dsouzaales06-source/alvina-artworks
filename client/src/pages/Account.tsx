import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ShoppingBag, LogOut, ChevronRight } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";

const statusColors: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  processing: "bg-blue-100 text-blue-800",
  shipped: "bg-purple-100 text-purple-800",
  delivered: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
};

export default function Account() {
  const { user, isAuthenticated, loading, logout } = useAuth();
  const [, setLocation] = useLocation();
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const { data: orders } = trpc.orders.list.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const { data: selectedOrderDetails } = trpc.orders.getById.useQuery(
    { id: selectedOrder || 0 },
    { enabled: !!selectedOrder }
  );

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      logout();
      setLocation("/");
      toast.success("Logged out successfully");
    },
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading account...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background">
        <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
          <div className="container flex items-center justify-between h-20">
            <Link href="/">
              <a className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
                Alvina Artworks
              </a>
            </Link>
          </div>
        </nav>
        <div className="container py-16 text-center">
          <h1 className="mb-4">Please Sign In</h1>
          <p className="text-muted-foreground mb-8">
            You need to be signed in to view your account.
          </p>
          <a href={getLoginUrl()} className="btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 bg-card border-b border-border shadow-sm">
        <div className="container flex items-center justify-between h-20">
          <Link href="/">
            <a className="text-2xl font-bold text-primary hover:text-secondary transition-colors">
              Alvina Artworks
            </a>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/catalog">
              <a className="text-foreground hover:text-secondary transition-colors font-medium">
                Shop
              </a>
            </Link>
            <Link href="/account">
              <a className="text-foreground hover:text-secondary transition-colors font-medium">
                Account
              </a>
            </Link>
            <Link href="/cart">
              <a className="flex items-center gap-2 text-foreground hover:text-secondary transition-colors font-medium">
                <ShoppingBag size={20} />
                Cart
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-12">
        <div className="container">
          <h1>My Account</h1>
        </div>
      </section>

      {/* Account Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="card-elegant p-6">
              <div className="mb-6 pb-6 border-b border-border">
                <p className="text-sm text-muted-foreground mb-2">Signed in as</p>
                <p className="font-semibold">{user?.name || user?.email}</p>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>

              <div className="space-y-3">
                <Link href="/catalog">
                  <a className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-medium">Continue Shopping</span>
                    <ChevronRight size={18} />
                  </a>
                </Link>
                <Link href="/cart">
                  <a className="flex items-center justify-between px-4 py-2 rounded-lg hover:bg-muted transition-colors">
                    <span className="font-medium">View Cart</span>
                    <ChevronRight size={18} />
                  </a>
                </Link>
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="w-full flex items-center justify-between px-4 py-2 rounded-lg hover:bg-destructive/10 text-destructive transition-colors font-medium"
                >
                  <span>Sign Out</span>
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="lg:col-span-3">
            <div className="card-elegant p-8">
              <h2 className="mb-8">Order History</h2>

              {!orders || orders.length === 0 ? (
                <div className="text-center py-12">
                  <ShoppingBag size={48} className="mx-auto mb-4 text-muted-foreground" />
                  <p className="text-lg text-muted-foreground mb-6">
                    You haven't placed any orders yet.
                  </p>
                  <Link href="/catalog">
                    <a className="btn-primary">Start Shopping</a>
                  </Link>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-border rounded-lg p-6 hover:shadow-lg transition-shadow cursor-pointer"
                      onClick={() =>
                        setSelectedOrder(
                          selectedOrder === order.id ? null : order.id
                        )
                      }
                    >
                      <div className="flex items-center justify-between mb-4">
                        <div>
                          <p className="font-semibold text-lg">
                            Order {order.orderNumber}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(order.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold text-2xl text-secondary">
                            ${parseFloat(order.totalAmount).toFixed(2)}
                          </p>
                          <span
                            className={`inline-block px-3 py-1 rounded-full text-sm font-semibold mt-2 ${
                              statusColors[order.status] ||
                              "bg-gray-100 text-gray-800"
                            }`}
                          >
                            {order.status.charAt(0).toUpperCase() +
                              order.status.slice(1)}
                          </span>
                        </div>
                      </div>

                      {selectedOrder === order.id && selectedOrderDetails && (
                        <div className="mt-6 pt-6 border-t border-border">
                          <h4 className="font-semibold mb-4">Order Details</h4>

                          {/* Shipping Info */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Shipping Address
                              </p>
                              <p className="font-semibold">
                                {selectedOrderDetails.customerName}
                              </p>
                              <p className="text-sm">
                                {selectedOrderDetails.shippingAddress}
                              </p>
                              <p className="text-sm">
                                {selectedOrderDetails.shippingCity},{" "}
                                {selectedOrderDetails.shippingState}{" "}
                                {selectedOrderDetails.shippingZip}
                              </p>
                              <p className="text-sm">
                                {selectedOrderDetails.shippingCountry}
                              </p>
                            </div>
                            <div>
                              <p className="text-sm text-muted-foreground mb-2">
                                Contact Information
                              </p>
                              <p className="font-semibold">
                                {selectedOrderDetails.customerEmail}
                              </p>
                              {selectedOrderDetails.customerPhone && (
                                <p className="text-sm">
                                  {selectedOrderDetails.customerPhone}
                                </p>
                              )}
                            </div>
                          </div>

                          {/* Order Items */}
                          <div>
                            <p className="text-sm text-muted-foreground mb-3">
                              Items
                            </p>
                            <div className="space-y-2">
                              {selectedOrderDetails.items?.map((item: any) => (
                                <div
                                  key={item.id}
                                  className="flex justify-between text-sm"
                                >
                                  <span>
                                    {item.productName} x {item.quantity}
                                  </span>
                                  <span className="font-semibold">
                                    ${parseFloat(item.subtotal).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Order Notes */}
                          {selectedOrderDetails.notes && (
                            <div className="mt-4 pt-4 border-t border-border">
                              <p className="text-sm text-muted-foreground mb-2">
                                Notes
                              </p>
                              <p className="text-sm">
                                {selectedOrderDetails.notes}
                              </p>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold mb-4">Alvina Artworks</h4>
              <p className="text-muted-foreground text-sm">
                Handcrafted elegance for your most cherished moments.
              </p>
            </div>
            <div>
              <h4 className="font-bold mb-4">Collections</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/catalog?category=candles">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Candles
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=wedding-decorations">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Wedding Decorations
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/catalog?category=catholic-church-decorations">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Church Decorations
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Customer</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/catalog">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      Shop
                    </a>
                  </Link>
                </li>
                <li>
                  <Link href="/account">
                    <a className="text-muted-foreground hover:text-secondary transition-colors">
                      My Account
                    </a>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold mb-4">Contact</h4>
              <p className="text-muted-foreground text-sm">
                For inquiries, please reach out through your account.
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Alvina Artworks. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
