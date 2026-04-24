import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link, useLocation } from "wouter";
import { ShoppingBag, Heart, ChevronDown } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState, useEffect } from "react";
import { getLoginUrl } from "@/const";
import { getStatusBadge } from "@/lib/statusBadge";

export default function Catalog() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();
  const { data: categories } = trpc.categories.list.useQuery();
  const { data: products } = trpc.products.list.useQuery();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [filteredProducts, setFilteredProducts] = useState<any[]>([]);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const categorySlug = params.get("category");
    setSelectedCategory(categorySlug);
  }, []);

  useEffect(() => {
    if (!products) return;

    if (selectedCategory) {
      const category = categories?.find((c) => c.slug === selectedCategory);
      if (category) {
        setFilteredProducts(
          products.filter((p) => p.categoryId === category.id)
        );
      }
    } else {
      setFilteredProducts(products);
    }
  }, [products, selectedCategory, categories]);

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

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-16">
        <div className="container">
          <h1 className="mb-4">Our Collections</h1>
          <p className="text-xl opacity-95">
            Discover our handcrafted selections
          </p>
        </div>
      </section>

      {/* Main Content */}
      <div className="container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar - Categories */}
          <div className="lg:col-span-1">
            <div className="card-elegant p-6">
              <h3 className="mb-6 pb-4 border-b border-border">Categories</h3>
              <div className="space-y-3">
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setLocation("/catalog");
                  }}
                  className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                    !selectedCategory
                      ? "bg-secondary text-secondary-foreground font-semibold"
                      : "text-foreground hover:bg-muted"
                  }`}
                >
                  All Products
                </button>
                {categories?.map((category) => (
                  <button
                    key={category.id}
                    onClick={() => {
                      setSelectedCategory(category.slug);
                      setLocation(`/catalog?category=${category.slug}`);
                    }}
                    className={`w-full text-left px-4 py-2 rounded-lg transition-colors ${
                      selectedCategory === category.slug
                        ? "bg-secondary text-secondary-foreground font-semibold"
                        : "text-foreground hover:bg-muted"
                    }`}
                  >
                    {category.name}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Products Grid */}
          <div className="lg:col-span-3">
            {filteredProducts.length === 0 ? (
              <div className="text-center py-16">
                <p className="text-xl text-muted-foreground mb-6">
                  No products found in this category.
                </p>
                <button
                  onClick={() => {
                    setSelectedCategory(null);
                    setLocation("/catalog");
                  }}
                  className="btn-primary"
                >
                  View All Products
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredProducts.map((product) => (
                  <a key={product.id} href={`/product/${product.slug}`} className="card-elegant overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer group h-full flex flex-col">
                      {product.imageUrl && (
                        <div className="relative h-64 bg-muted overflow-hidden">
                          <img
                            src={product.imageUrl}
                            alt={product.name}
                            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          />
                          {product.status && (
                            <div className="absolute top-3 right-3">
                              {(() => {
                                const badge = getStatusBadge(product.status);
                                return (
                                  <div className={`${badge.bgColor} ${badge.textColor} px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1`}>
                                    <span>{badge.icon}</span>
                                    <span>{badge.label}</span>
                                  </div>
                                );
                              })()}
                            </div>
                          )}
                        </div>
                      )}
                      <div className="p-6 flex flex-col flex-grow">
                        <h4 className="mb-2 line-clamp-2 flex-grow">
                          {product.name}
                        </h4>
                        <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                          {product.description}
                        </p>
                        <div className="flex items-center justify-between pt-4 border-t border-border">
                          <span className="text-2xl font-bold text-secondary">
                            ${parseFloat(product.price).toFixed(2)}
                          </span>
                          <span className="text-sm text-muted-foreground">
                            View →
                          </span>
                        </div>
                      </div>
                    </a>
                ))}
              </div>
            )}
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
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <button
                      onClick={() => setLocation(`/catalog?category=${cat.slug}`)}
                      className="text-muted-foreground hover:text-secondary transition-colors"
                    >
                      {cat.name}
                    </button>
                  </li>
                ))}
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
