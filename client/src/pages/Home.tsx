import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { ShoppingBag, Heart, Sparkles } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useEffect, useState } from "react";
import { getLoginUrl } from "@/const";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const { data: categories } = trpc.categories.list.useQuery();
  const [featuredProducts, setFeaturedProducts] = useState<any[]>([]);
  const { data: products } = trpc.products.list.useQuery();

  useEffect(() => {
    if (products) {
      setFeaturedProducts(products.slice(0, 3));
    }
  }, [products]);

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

      {/* Hero Banner */}
      <section className="relative bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-72 h-72 bg-secondary rounded-full mix-blend-multiply filter blur-3xl"></div>
          <div className="absolute bottom-10 left-10 w-72 h-72 bg-accent rounded-full mix-blend-multiply filter blur-3xl"></div>
        </div>
        
        <div className="container relative z-10 py-32 md:py-48">
          <div className="max-w-3xl">
            <div className="flex items-center gap-2 mb-6">
              <Sparkles size={24} />
              <span className="text-lg font-semibold">Handcrafted Elegance</span>
            </div>
            <h1 className="mb-6 leading-tight">
              Artisanal Beauty for Your Most Cherished Moments
            </h1>
            <p className="text-xl mb-8 opacity-95 max-w-2xl">
              Discover exquisite handmade candles, wedding decorations, and Catholic church adornments crafted with passion and precision. Each piece tells a story of dedication and artistry.
            </p>
            <div className="flex gap-4">
              <Link href="/catalog">
                <a className="btn-secondary">
                  Explore Collections
                </a>
              </Link>
              {!isAuthenticated && (
                <a href={getLoginUrl()} className="btn-outline">
                  Create Account
                </a>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Featured Collections */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="mb-4">Our Collections</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore our carefully curated collections, each designed to bring elegance and meaning to your special occasions.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {categories?.map((category) => (
              <Link key={category.id} href={`/catalog?category=${category.slug}`}>
                <a className="card-elegant p-8 text-center hover:scale-105 transition-transform cursor-pointer">
                  <div className="w-16 h-16 bg-gradient-to-br from-accent to-orange-400 rounded-full flex items-center justify-center mx-auto mb-6">
                    <Heart size={32} className="text-white" />
                  </div>
                  <h3 className="mb-3">{category.name}</h3>
                  <p className="text-muted-foreground mb-4">
                    {category.description || "Discover our exquisite selection"}
                  </p>
                  <span className="text-secondary font-semibold">Browse Collection →</span>
                </a>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="section-padding bg-card">
          <div className="container">
            <div className="text-center mb-16">
              <h2 className="mb-4">Featured Products</h2>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Handpicked selections showcasing our finest creations
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {featuredProducts.map((product) => (
                <Link key={product.id} href={`/product/${product.slug}`}>
                  <a className="card-elegant overflow-hidden hover:shadow-2xl transition-shadow cursor-pointer group">
                    {product.imageUrl && (
                      <div className="relative h-64 bg-muted overflow-hidden">
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h4 className="mb-2 line-clamp-2">{product.name}</h4>
                      <p className="text-muted-foreground text-sm mb-4 line-clamp-2">
                        {product.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <span className="text-2xl font-bold text-secondary">
                          ${parseFloat(product.price).toFixed(2)}
                        </span>
                        <span className="text-sm text-muted-foreground">
                          View Details →
                        </span>
                      </div>
                    </div>
                  </a>
                </Link>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link href="/catalog">
                <a className="btn-primary">
                  View All Products
                </a>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Brand Story */}
      <section className="section-padding bg-background">
        <div className="container">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="mb-6">About Alvina Artworks</h2>
              <p className="text-lg text-muted-foreground mb-4">
                Alvina Artworks was born from a passion for creating meaningful, beautiful objects that enhance life's most important moments. Each piece is meticulously handcrafted with premium materials and an unwavering commitment to excellence.
              </p>
              <p className="text-lg text-muted-foreground mb-4">
                Whether you're planning a wedding, decorating a sacred space, or seeking the perfect ambiance with our artisanal candles, we bring artistry and intention to every creation.
              </p>
              <p className="text-lg text-muted-foreground">
                Our collections celebrate tradition, elegance, and the timeless beauty of handmade craftsmanship. We believe that the finest things in life deserve to be crafted with care.
              </p>
            </div>
            <div className="relative">
              <div className="bg-gradient-to-br from-accent to-orange-400 rounded-2xl p-1">
                <div className="bg-card rounded-xl p-12 text-center">
                  <Sparkles size={48} className="text-secondary mx-auto mb-6" />
                  <h3 className="mb-4">Handcrafted with Love</h3>
                  <p className="text-muted-foreground">
                    Every product is created by hand, ensuring unique character and exceptional quality in every piece.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="section-padding bg-gradient-to-r from-primary to-secondary text-primary-foreground">
        <div className="container text-center">
          <h2 className="mb-6">Ready to Discover?</h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto opacity-95">
            Explore our complete collection and find the perfect pieces for your special moments.
          </p>
          <Link href="/catalog">
            <a className="btn-secondary">
              Start Shopping
            </a>
          </Link>
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
                {categories?.map((cat) => (
                  <li key={cat.id}>
                    <Link href={`/catalog?category=${cat.slug}`}>
                      <a className="text-muted-foreground hover:text-secondary transition-colors">
                        {cat.name}
                      </a>
                    </Link>
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
                For inquiries, please reach out through your account or contact us directly.
              </p>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground text-sm">
            <p>&copy; 2024 Alvina Artworks. All rights reserved. Handcrafted with care.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
