import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { ShoppingBag, ChevronLeft } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { getLoginUrl } from "@/const";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const checkoutSchema = z.object({
  customerName: z.string().min(1, "Name is required"),
  customerEmail: z.string().email("Valid email is required"),
  customerPhone: z.string().optional(),
  shippingAddress: z.string().min(1, "Address is required"),
  shippingCity: z.string().min(1, "City is required"),
  shippingState: z.string().optional(),
  shippingZip: z.string().min(1, "ZIP code is required"),
  shippingCountry: z.string().min(1, "Country is required"),
  notes: z.string().optional(),
});

type CheckoutFormData = z.infer<typeof checkoutSchema>;

export default function Checkout() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [isProcessing, setIsProcessing] = useState(false);

  const { data: cartItems } = trpc.cart.get.useQuery(undefined, {
    enabled: isAuthenticated,
  });

  const createOrderMutation = trpc.orders.create.useMutation({
    onSuccess: (data) => {
      toast.success("Order placed successfully!");
      setLocation(`/account?order=${data.orderId}`);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to place order");
      setIsProcessing(false);
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<CheckoutFormData>({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      customerName: user?.name || "",
      customerEmail: user?.email || "",
    },
  });

  const onSubmit = async (data: CheckoutFormData) => {
    if (!cartItems || cartItems.length === 0) {
      toast.error("Your cart is empty");
      return;
    }

    setIsProcessing(true);
    try {
      await createOrderMutation.mutateAsync(data);
    } finally {
      setIsProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
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
            You need to be signed in to checkout.
          </p>
          <a href={getLoginUrl()} className="btn-primary">
            Sign In
          </a>
        </div>
      </div>
    );
  }

  const total = cartItems?.reduce((sum, item) => {
    if (item.product) {
      return sum + parseFloat(item.product.price) * item.quantity;
    }
    return sum;
  }, 0) || 0;

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
          <h1>Checkout</h1>
        </div>
      </section>

      {/* Checkout Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <div className="card-elegant p-8">
              <h2 className="mb-8">Shipping Information</h2>

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                {/* Name */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Full Name *
                  </label>
                  <input
                    {...register("customerName")}
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Your full name"
                  />
                  {errors.customerName && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.customerName.message}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Email Address *
                  </label>
                  <input
                    {...register("customerEmail")}
                    type="email"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="your@email.com"
                  />
                  {errors.customerEmail && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.customerEmail.message}
                    </p>
                  )}
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Phone Number
                  </label>
                  <input
                    {...register("customerPhone")}
                    type="tel"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="(123) 456-7890"
                  />
                </div>

                {/* Address */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Street Address *
                  </label>
                  <input
                    {...register("shippingAddress")}
                    type="text"
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="123 Main St"
                  />
                  {errors.shippingAddress && (
                    <p className="text-destructive text-sm mt-1">
                      {errors.shippingAddress.message}
                    </p>
                  )}
                </div>

                {/* City & State */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      City *
                    </label>
                    <input
                      {...register("shippingCity")}
                      type="text"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="City"
                    />
                    {errors.shippingCity && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.shippingCity.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      State/Province
                    </label>
                    <input
                      {...register("shippingState")}
                      type="text"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="State"
                    />
                  </div>
                </div>

                {/* ZIP & Country */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      ZIP Code *
                    </label>
                    <input
                      {...register("shippingZip")}
                      type="text"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="12345"
                    />
                    {errors.shippingZip && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.shippingZip.message}
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Country *
                    </label>
                    <input
                      {...register("shippingCountry")}
                      type="text"
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Country"
                    />
                    {errors.shippingCountry && (
                      <p className="text-destructive text-sm mt-1">
                        {errors.shippingCountry.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <label className="block text-sm font-semibold mb-2">
                    Order Notes (Optional)
                  </label>
                  <textarea
                    {...register("notes")}
                    className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                    placeholder="Any special instructions or notes..."
                    rows={4}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="w-full btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing ? "Processing..." : "Place Order"}
                </button>
              </form>
            </div>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <div className="card-elegant p-6 sticky top-24">
              <h3 className="mb-6 pb-4 border-b border-border">Order Summary</h3>

              <div className="space-y-4 mb-6 max-h-96 overflow-y-auto">
                {cartItems?.map((item) => (
                  <div key={item.id} className="flex justify-between text-sm">
                    <span className="text-muted-foreground">
                      {item.product?.name} x {item.quantity}
                    </span>
                    <span className="font-semibold">
                      ${(
                        parseFloat(item.product?.price || "0") * item.quantity
                      ).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="border-t border-border pt-4 space-y-4 mb-6">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Subtotal</span>
                  <span className="font-semibold">${total.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Shipping</span>
                  <span className="font-semibold">TBD</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Tax</span>
                  <span className="font-semibold">TBD</span>
                </div>
              </div>

              <div className="border-t border-border pt-4">
                <div className="flex justify-between mb-6">
                  <span className="font-bold text-lg">Total</span>
                  <span className="font-bold text-2xl text-secondary">
                    ${total.toFixed(2)}
                  </span>
                </div>
              </div>

              <Link href="/cart">
                <a className="flex items-center justify-center gap-2 text-secondary hover:text-accent transition-colors font-semibold">
                  <ChevronLeft size={18} />
                  Back to Cart
                </a>
              </Link>
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
