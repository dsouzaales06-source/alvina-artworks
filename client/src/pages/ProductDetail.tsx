import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useParams, useLocation } from "wouter";
import { ShoppingBag, Heart, ChevronLeft, Minus, Plus } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { getLoginUrl } from "@/const";
import { toast } from "sonner";

export default function ProductDetail() {
  const { user, isAuthenticated } = useAuth();
  const { slug } = useParams<{ slug: string }>();
  const [, setLocation] = useLocation();
  const [quantity, setQuantity] = useState(1);
  const [isAdding, setIsAdding] = useState(false);

  const { data: product, isLoading } = trpc.products.getBySlug.useQuery(
    { slug: slug || "" },
    { enabled: !!slug }
  );

  const addToCartMutation = trpc.cart.add.useMutation({
    onSuccess: () => {
      toast.success("Added to cart!");
      setQuantity(1);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to add to cart");
    },
  });

  const handleAddToCart = async () => {
    if (!isAuthenticated) {
      setLocation(getLoginUrl());
      return;
    }

    if (!product) return;

    setIsAdding(true);
    try {
      await addToCartMutation.mutateAsync({
        productId: product.id,
        quantity,
      });
    } finally {
      setIsAdding(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
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
          <h1 className="mb-4">Product Not Found</h1>
          <p className="text-muted-foreground mb-8">
            The product you're looking for doesn't exist.
          </p>
          <Link href="/catalog">
            <a className="btn-primary">Back to Catalog</a>
          </Link>
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
            {isAuthenticated ? (
              <>
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
              </>
            ) : (
              <a href={getLoginUrl()} className="btn-primary">
                Sign In
              </a>
            )}
          </div>
        </div>
      </nav>

      {/* Breadcrumb */}
      <div className="container py-6 border-b border-border">
        <Link href="/catalog">
          <a className="flex items-center gap-2 text-muted-foreground hover:text-secondary transition-colors">
            <ChevronLeft size={18} />
            Back to Catalog
          </a>
        </Link>
      </div>

      {/* Product Detail */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Image Gallery */}
          <div className="flex flex-col gap-4">
            {product.imageUrl && (
              <div className="card-elegant overflow-hidden">
                <img
                  src={product.imageUrl}
                  alt={product.name}
                  className="w-full h-96 object-contain bg-muted rounded-lg"
                />
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <h1 className="mb-4">{product.name}</h1>

            {/* Price */}
            <div className="mb-6 pb-6 border-b border-border">
              <div className="flex items-center gap-4">
                <span className="text-4xl font-bold text-secondary">
                  ${parseFloat(product.price).toFixed(2)}
                </span>
                {product.stock > 0 ? (
                  <span className="bg-green-100 text-green-800 px-4 py-2 rounded-full text-sm font-semibold">
                    In Stock ({product.stock})
                  </span>
                ) : (
                  <span className="bg-red-100 text-red-800 px-4 py-2 rounded-full text-sm font-semibold">
                    Out of Stock
                  </span>
                )}
              </div>
            </div>

            {/* Description */}
            <div className="mb-8">
              <h3 className="mb-4">Description</h3>
              <p className="text-muted-foreground leading-relaxed">
                {product.description}
              </p>
            </div>

            {/* Quantity Selector */}
            {product.stock > 0 && (
              <div className="mb-8">
                <label className="block text-sm font-semibold mb-3">
                  Quantity
                </label>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Minus size={20} />
                  </button>
                  <input
                    type="number"
                    min="1"
                    max={product.stock}
                    value={quantity}
                    onChange={(e) =>
                      setQuantity(Math.max(1, parseInt(e.target.value) || 1))
                    }
                    className="w-16 text-center border border-border rounded-lg px-3 py-2"
                  />
                  <button
                    onClick={() =>
                      setQuantity(Math.min(product.stock, quantity + 1))
                    }
                    className="p-2 border border-border rounded-lg hover:bg-muted transition-colors"
                  >
                    <Plus size={20} />
                  </button>
                </div>
              </div>
            )}

            {/* Add to Cart Button */}
            <div className="flex gap-4">
              <button
                onClick={handleAddToCart}
                disabled={isAdding || product.stock === 0}
                className="flex-1 btn-secondary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                <ShoppingBag size={20} />
                {isAdding ? "Adding..." : "Add to Cart"}
              </button>
              <button className="p-3 border border-border rounded-lg hover:bg-muted transition-colors">
                <Heart size={20} />
              </button>
            </div>

            {/* Additional Info */}
            <div className="mt-12 pt-8 border-t border-border space-y-4">
              {product.sku && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">SKU:</span>
                  <span className="font-semibold">{product.sku}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-muted-foreground">Category:</span>
                <span className="font-semibold">Artisanal Collection</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Handcrafted:</span>
                <span className="font-semibold">Yes</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      <section className="bg-card border-t border-border py-16 mt-16">
        <div className="container">
          <h2 className="mb-8">You May Also Like</h2>
          <div className="text-center py-8 text-muted-foreground">
            <p>Explore more products in our catalog</p>
            <Link href="/catalog">
              <a className="btn-primary mt-4">Browse All Products</a>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12">
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
                {isAuthenticated && (
                  <li>
                    <Link href="/account">
                      <a className="text-muted-foreground hover:text-secondary transition-colors">
                        My Account
                      </a>
                    </Link>
                  </li>
                )}
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
