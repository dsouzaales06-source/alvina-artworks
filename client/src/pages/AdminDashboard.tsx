import { useAuth } from "@/_core/hooks/useAuth";
import { Link, useLocation } from "wouter";
import { Settings, Plus, Edit2, Trash2, Package, ShoppingCart } from "lucide-react";
import { trpc } from "@/lib/trpc";
import { useState } from "react";
import { toast } from "sonner";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional(),
  price: z.string().min(1, "Price is required"),
  categoryId: z.number().min(1, "Category is required"),
  sku: z.string().optional(),
  stock: z.number().default(0),
});

type ProductFormData = z.infer<typeof productSchema>;

export default function AdminDashboard() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState<"products" | "orders">("products");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);

  const { data: products, refetch: refetchProducts } =
    trpc.adminProducts.list.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "admin",
    });

  const { data: orders, refetch: refetchOrders } =
    trpc.adminOrders.list.useQuery(undefined, {
      enabled: isAuthenticated && user?.role === "admin",
    });

  const { data: categories } = trpc.categories.list.useQuery();

  const createProductMutation = trpc.adminProducts.create.useMutation({
    onSuccess: () => {
      toast.success("Product created successfully");
      refetchProducts();
      setIsFormOpen(false);
      reset();
      setImagePreview(null);
      setImageFile(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to create product");
    },
  });

  const updateProductMutation = trpc.adminProducts.update.useMutation({
    onSuccess: () => {
      toast.success("Product updated successfully");
      refetchProducts();
      setIsFormOpen(false);
      setEditingProduct(null);
      reset();
      setImagePreview(null);
      setImageFile(null);
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update product");
    },
  });

  const deleteProductMutation = trpc.adminProducts.delete.useMutation({
    onSuccess: () => {
      toast.success("Product deleted successfully");
      refetchProducts();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to delete product");
    },
  });

  const updateOrderStatusMutation = trpc.adminOrders.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Order status updated");
      refetchOrders();
    },
    onError: (error) => {
      toast.error(error.message || "Failed to update order status");
    },
  });

  const { register, handleSubmit, reset, formState: { errors } } =
    useForm({
      resolver: zodResolver(productSchema),
      defaultValues: editingProduct || {
        stock: 0,
      },
    } as any);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: any) => {
    let imageBase64 = undefined;
    let imageName = undefined;

    if (imageFile) {
      const reader = new FileReader();
      reader.onload = async () => {
        const base64 = (reader.result as string).split(",")[1];
        imageBase64 = base64;
        imageName = imageFile.name;

        if (editingProduct) {
          await updateProductMutation.mutateAsync({
            id: editingProduct.id,
            ...data,
            imageBase64,
            imageName,
          });
        } else {
          await createProductMutation.mutateAsync({
            ...data,
            imageBase64,
            imageName,
          });
        }
      };
      reader.readAsDataURL(imageFile);
    } else {
      if (editingProduct) {
        await updateProductMutation.mutateAsync({
          id: editingProduct.id,
          ...data,
        });
      } else {
        await createProductMutation.mutateAsync(data);
      }
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

  if (!isAuthenticated || user?.role !== "admin") {
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
          <h1 className="mb-4">Access Denied</h1>
          <p className="text-muted-foreground mb-8">
            You don't have permission to access this page.
          </p>
          <Link href="/">
            <a className="btn-primary">Go Home</a>
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
              Alvina Artworks Admin
            </a>
          </Link>

          <div className="flex items-center gap-6">
            <Link href="/">
              <a className="text-foreground hover:text-secondary transition-colors font-medium">
                Back to Store
              </a>
            </Link>
          </div>
        </div>
      </nav>

      {/* Page Header */}
      <section className="bg-gradient-to-r from-primary to-secondary text-primary-foreground py-12">
        <div className="container">
          <div className="flex items-center gap-3">
            <Settings size={32} />
            <h1>Admin Dashboard</h1>
          </div>
        </div>
      </section>

      {/* Tabs */}
      <div className="container py-8 border-b border-border">
        <div className="flex gap-8">
          <button
            onClick={() => setActiveTab("products")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "products"
                ? "border-secondary text-secondary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <Package size={20} />
            Products
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`flex items-center gap-2 pb-4 border-b-2 transition-colors ${
              activeTab === "orders"
                ? "border-secondary text-secondary font-semibold"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            <ShoppingCart size={20} />
            Orders
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="container py-12">
        {activeTab === "products" && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <h2>Product Management</h2>
              <button
                onClick={() => {
                  setEditingProduct(null);
                  setIsFormOpen(!isFormOpen);
                  reset();
                  setImagePreview(null);
                  setImageFile(null);
                }}
                className="btn-secondary flex items-center gap-2"
              >
                <Plus size={20} />
                Add Product
              </button>
            </div>

            {/* Product Form */}
            {isFormOpen && (
              <div className="card-elegant p-8 mb-8">
                <h3 className="mb-6">
                  {editingProduct ? "Edit Product" : "Add New Product"}
                </h3>

                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Product Name *
                      </label>
                      <input
                        {...register("name")}
                        type="text"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="Product name"
                      />
                      {errors.name && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.name?.message as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Slug *
                      </label>
                      <input
                        {...register("slug")}
                        type="text"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="product-slug"
                      />
                      {errors.slug && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.slug?.message as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Price *
                      </label>
                      <input
                        {...register("price")}
                        type="text"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="0.00"
                      />
                      {errors.price && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.price?.message as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Category *
                      </label>
                      <select
                        {...register("categoryId", { valueAsNumber: true })}
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      >
                        <option value="">Select category</option>
                        {categories?.map((cat) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.name}
                          </option>
                        ))}
                      </select>
                      {errors.categoryId && (
                        <p className="text-destructive text-sm mt-1">
                          {errors.categoryId?.message as string}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        SKU
                      </label>
                      <input
                        {...register("sku")}
                        type="text"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="SKU"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-semibold mb-2">
                        Stock
                      </label>
                      <input
                        {...register("stock", { valueAsNumber: true })}
                        type="number"
                        className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                        placeholder="0"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Description
                    </label>
                    <textarea
                      {...register("description")}
                      className="w-full px-4 py-2 border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                      placeholder="Product description"
                      rows={4}
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-semibold mb-2">
                      Product Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="w-full px-4 py-2 border border-border rounded-lg"
                    />
                    {imagePreview && (
                      <div className="mt-4">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="max-w-xs h-48 object-cover rounded-lg"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex gap-4">
                    <button
                      type="submit"
                      className="btn-secondary"
                    >
                      {editingProduct ? "Update Product" : "Create Product"}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsFormOpen(false);
                        setEditingProduct(null);
                        reset();
                        setImagePreview(null);
                        setImageFile(null);
                      }}
                      className="btn-outline"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {/* Products Table */}
            <div className="card-elegant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">
                        Name
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Price
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Stock
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {products?.map((product) => (
                      <tr key={product.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">{product.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {product.slug}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-secondary">
                          ${parseFloat(product.price).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`px-3 py-1 rounded-full text-sm font-semibold ${
                              product.stock > 0
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {product.stock}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => {
                                setEditingProduct(product);
                                setIsFormOpen(true);
                                setImagePreview(product.imageUrl);
                              }}
                              className="p-2 text-secondary hover:bg-secondary/10 rounded-lg transition-colors"
                            >
                              <Edit2 size={18} />
                            </button>
                            <button
                              onClick={() =>
                                deleteProductMutation.mutate({ id: product.id })
                              }
                              className="p-2 text-destructive hover:bg-destructive/10 rounded-lg transition-colors"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === "orders" && (
          <div>
            <h2 className="mb-8">Order Management</h2>

            <div className="card-elegant overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-muted border-b border-border">
                    <tr>
                      <th className="px-6 py-4 text-left font-semibold">
                        Order #
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Customer
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Amount
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Status
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Date
                      </th>
                      <th className="px-6 py-4 text-left font-semibold">
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border">
                    {orders?.map((order) => (
                      <tr key={order.id} className="hover:bg-muted/50">
                        <td className="px-6 py-4 font-semibold">
                          {order.orderNumber}
                        </td>
                        <td className="px-6 py-4">
                          <div>
                            <p className="font-semibold">
                              {order.customerName}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {order.customerEmail}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-secondary">
                          ${parseFloat(order.totalAmount).toFixed(2)}
                        </td>
                        <td className="px-6 py-4">
                          <select
                            value={order.status}
                            onChange={(e) =>
                              updateOrderStatusMutation.mutate({
                                orderId: order.id,
                                status: e.target.value as any,
                              })
                            }
                            className="px-3 py-1 border border-border rounded-lg text-sm"
                          >
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td className="px-6 py-4 text-sm text-muted-foreground">
                          {new Date(order.createdAt).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <Link href={`/admin/order/${order.id}`}>
                            <a className="text-secondary hover:text-accent transition-colors font-semibold">
                              View
                            </a>
                          </Link>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <footer className="bg-card border-t border-border py-12 mt-16">
        <div className="container text-center text-muted-foreground text-sm">
          <p>&copy; 2024 Alvina Artworks Admin Panel. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
}
