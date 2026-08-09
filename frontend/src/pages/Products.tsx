import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  Box,
  CheckCircle2,
  ChevronDown,
  Edit3,
  MapPin,
  Package,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

import {
  createProduct,
  deleteProduct,
  getProducts,
  updateProduct,
} from "../services/product.service";

import type {
  CreateProductInput,
  Product,
} from "../types/product";

import "./Products.css";

type ProductFormData = CreateProductInput;

const emptyForm: ProductFormData = {
  name: "",
  sku: "",
  category: "",
  unitPrice: 0,
  currentStock: 0,
  minimumStock: 0,
  warehouseLocation: "",
};

function Products() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("All");
  const [stockFilter, setStockFilter] = useState("All");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [form, setForm] = useState<ProductFormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function loadProducts(showRefresh = false) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getProducts();
      setProducts(data);
    } catch (err) {
      console.error(err);
      setError("Unable to load products. Please try again.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadProducts();
  }, []);

  const categories = useMemo(() => {
    const values = products
      .map((product) => product.category.trim())
      .filter(Boolean);

    return ["All", ...Array.from(new Set(values))];
  }, [products]);

  const filteredProducts = useMemo(() => {
    const query = search.trim().toLowerCase();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.warehouseLocation.toLowerCase().includes(query);

      const matchesCategory =
        categoryFilter === "All" ||
        product.category === categoryFilter;

      const isLowStock = product.currentStock <= product.minimumStock;
      const isOutOfStock = product.currentStock === 0;

      const matchesStock =
        stockFilter === "All" ||
        (stockFilter === "Healthy" && !isLowStock) ||
        (stockFilter === "Low stock" && isLowStock && !isOutOfStock) ||
        (stockFilter === "Out of stock" && isOutOfStock);

      return matchesSearch && matchesCategory && matchesStock;
    });
  }, [products, search, categoryFilter, stockFilter]);

  const totalValue = useMemo(
    () =>
      products.reduce(
        (total, product) =>
          total + product.unitPrice * product.currentStock,
        0
      ),
    [products]
  );

  const lowStockCount = products.filter(
    (product) =>
      product.currentStock > 0 &&
      product.currentStock <= product.minimumStock
  ).length;

  const outOfStockCount = products.filter(
    (product) => product.currentStock === 0
  ).length;

  function openCreateModal() {
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
    setModalOpen(true);
  }

  function openEditModal(product: Product) {
    setEditingProduct(product);

    setForm({
      name: product.name,
      sku: product.sku,
      category: product.category,
      unitPrice: product.unitPrice,
      currentStock: product.currentStock,
      minimumStock: product.minimumStock,
      warehouseLocation: product.warehouseLocation,
    });

    setFormError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingProduct(null);
    setForm(emptyForm);
    setFormError("");
  }

  function updateField<K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  }

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFormError("");

    if (form.name.trim().length < 2) {
      setFormError("Product name must contain at least 2 characters.");
      return;
    }

    if (form.sku.trim().length < 2) {
      setFormError("SKU must contain at least 2 characters.");
      return;
    }

    if (form.category.trim().length < 2) {
      setFormError("Category is required.");
      return;
    }

    if (form.unitPrice <= 0) {
      setFormError("Unit price must be greater than 0.");
      return;
    }

    if (form.currentStock < 0 || form.minimumStock < 0) {
      setFormError("Stock values cannot be negative.");
      return;
    }

    if (!form.warehouseLocation.trim()) {
      setFormError("Warehouse location is required.");
      return;
    }

    try {
      setSaving(true);

      const payload: ProductFormData = {
        name: form.name.trim(),
        sku: form.sku.trim(),
        category: form.category.trim(),
        unitPrice: Number(form.unitPrice),
        currentStock: Number(form.currentStock),
        minimumStock: Number(form.minimumStock),
        warehouseLocation: form.warehouseLocation.trim(),
      };

      if (editingProduct) {
        const updated = await updateProduct(editingProduct.id, payload);

        setProducts((current) =>
          current.map((product) =>
            product.id === updated.id ? updated : product
          )
        );
      } else {
        const created = await createProduct(payload);
        setProducts((current) => [created, ...current]);
      }

      closeModal();
    } catch (err) {
      console.error(err);

      setFormError(
        err instanceof Error
          ? err.message
          : "Unable to save product."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);

      await deleteProduct(deleteTarget.id);

      setProducts((current) =>
        current.filter((product) => product.id !== deleteTarget.id)
      );

      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
      setError("Unable to delete the product. Please try again.");
    } finally {
      setDeleting(false);
    }
  }

  return (
    <motion.div
      className="products-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="products-header">
        <div>
          <div className="products-eyebrow">
            PRODUCT MANAGEMENT
          </div>

          <h1>Products</h1>

          <p>
            Manage your product catalog, pricing, stock levels and
            warehouse locations.
          </p>
        </div>

        <div className="products-header-actions">
          <button
            className="products-refresh-button"
            onClick={() => loadProducts(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={refreshing ? "products-spin" : ""}
            />
            Refresh
          </button>

          <button
            className="products-primary-button"
            onClick={openCreateModal}
          >
            <Plus size={18} />
            Add product
          </button>
        </div>
      </div>

      <div className="products-stats">
        <ProductStat
          icon={<Package size={20} />}
          label="Total products"
          value={products.length.toLocaleString()}
          description="Products in catalog"
        />

        <ProductStat
          icon={<CheckCircle2 size={20} />}
          label="Healthy stock"
          value={Math.max(
            products.length - lowStockCount - outOfStockCount,
            0
          ).toLocaleString()}
          description="Above minimum level"
          success
        />

        <ProductStat
          icon={<AlertTriangle size={20} />}
          label="Low stock"
          value={lowStockCount.toLocaleString()}
          description="Needs attention"
          warning
        />

        <ProductStat
          icon={<Box size={20} />}
          label="Catalog value"
          value={formatCurrency(totalValue)}
          description="Current stock value"
        />
      </div>

      <div className="products-panel">
        <div className="products-toolbar">
          <div className="products-search">
            <Search size={18} />

            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search products, SKU, category..."
            />

            {search && (
              <button
                className="products-search-clear"
                onClick={() => setSearch("")}
                aria-label="Clear search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="products-filters">
            <FilterSelect
              value={categoryFilter}
              onChange={setCategoryFilter}
              options={categories}
            />

            <FilterSelect
              value={stockFilter}
              onChange={setStockFilter}
              options={[
                "All",
                "Healthy",
                "Low stock",
                "Out of stock",
              ]}
            />
          </div>
        </div>

        {error && (
          <div className="products-error">
            <div className="products-error-icon">
              <AlertTriangle size={18} />
            </div>

            <div>
              <strong>Unable to load products</strong>
              <span>{error}</span>
            </div>

            <button onClick={() => loadProducts()}>
              Try again
            </button>
          </div>
        )}

        {loading ? (
          <ProductsLoading />
        ) : (
          <>
            <div className="products-table-wrapper">
              <table className="products-table">
                <thead>
                  <tr>
                    <th>PRODUCT</th>
                    <th>SKU</th>
                    <th>CATEGORY</th>
                    <th>PRICE</th>
                    <th>STOCK</th>
                    <th>LOCATION</th>
                    <th>STATUS</th>
                    <th>ACTIONS</th>
                  </tr>
                </thead>

                <tbody>
                  <AnimatePresence mode="popLayout">
                    {filteredProducts.map((product) => (
                      <motion.tr
                        key={product.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -8 }}
                        transition={{ duration: 0.2 }}
                      >
                        <td>
                          <div className="product-name-cell">
                            <div className="product-avatar">
                              {getInitials(product.name)}
                            </div>

                            <div>
                              <strong>{product.name}</strong>
                              <span>
                                Added{" "}
                                {formatDate(product.createdAt)}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td>
                          <span className="product-sku">
                            {product.sku}
                          </span>
                        </td>

                        <td>
                          <span className="product-category">
                            {product.category}
                          </span>
                        </td>

                        <td>
                          <strong className="product-price">
                            {formatCurrency(product.unitPrice)}
                          </strong>
                        </td>

                        <td>
                          <div className="stock-cell">
                            <strong>
                              {product.currentStock.toLocaleString()}
                            </strong>

                            <span>
                              Min.{" "}
                              {product.minimumStock.toLocaleString()}
                            </span>
                          </div>
                        </td>

                        <td>
                          <div className="location-cell">
                            <MapPin size={15} />
                            <span>
                              {product.warehouseLocation}
                            </span>
                          </div>
                        </td>

                        <td>
                          <StockStatus product={product} />
                        </td>

                        <td>
                          <div className="product-actions">
                            <button
                              className="product-action-button"
                              onClick={() =>
                                openEditModal(product)
                              }
                              title="Edit product"
                            >
                              <Edit3 size={16} />
                            </button>

                            <button
                              className="product-action-button danger"
                              onClick={() =>
                                setDeleteTarget(product)
                              }
                              title="Delete product"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </motion.tr>
                    ))}
                  </AnimatePresence>
                </tbody>
              </table>

              {filteredProducts.length === 0 && (
                <div className="products-empty">
                  <div className="products-empty-icon">
                    <Package size={25} />
                  </div>

                  <h3>No products found</h3>

                  <p>
                    {products.length === 0
                      ? "Your catalog is empty. Add your first product to get started."
                      : "Try changing your search or filters."}
                  </p>

                  {products.length === 0 && (
                    <button
                      className="products-primary-button"
                      onClick={openCreateModal}
                    >
                      <Plus size={17} />
                      Add your first product
                    </button>
                  )}
                </div>
              )}
            </div>

            <div className="products-footer">
              <span>
                Showing{" "}
                <strong>{filteredProducts.length}</strong> of{" "}
                <strong>{products.length}</strong> products
              </span>

              <span className="products-footer-location">
                <MapPin size={14} />
                Nexora workspace
              </span>
            </div>
          </>
        )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <ProductModal
            editingProduct={editingProduct}
            form={form}
            saving={saving}
            error={formError}
            onChange={updateField}
            onClose={closeModal}
            onSubmit={handleSubmit}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <DeleteModal
            product={deleteTarget}
            deleting={deleting}
            onCancel={() => {
              if (!deleting) {
                setDeleteTarget(null);
              }
            }}
            onConfirm={handleDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
}

function ProductStat({
  icon,
  label,
  value,
  description,
  success,
  warning,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  description: string;
  success?: boolean;
  warning?: boolean;
}) {
  return (
    <motion.div
      className="product-stat-card"
      whileHover={{ y: -3 }}
      transition={{ duration: 0.2 }}
    >
      <div
        className={`product-stat-icon ${
          success ? "success" : warning ? "warning" : ""
        }`}
      >
        {icon}
      </div>

      <div className="product-stat-content">
        <span>{label}</span>
        <strong>{value}</strong>
        <small>{description}</small>
      </div>
    </motion.div>
  );
}

function FilterSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: string[];
}) {
  return (
    <div className="products-filter">
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        {options.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>

      <ChevronDown size={15} />
    </div>
  );
}

function StockStatus({ product }: { product: Product }) {
  if (product.currentStock === 0) {
    return (
      <span className="stock-status out">
        <span />
        Out of stock
      </span>
    );
  }

  if (product.currentStock <= product.minimumStock) {
    return (
      <span className="stock-status low">
        <span />
        Low stock
      </span>
    );
  }

  return (
    <span className="stock-status healthy">
      <span />
      Healthy
    </span>
  );
}

function ProductModal({
  editingProduct,
  form,
  saving,
  error,
  onChange,
  onClose,
  onSubmit,
}: {
  editingProduct: Product | null;
  form: ProductFormData;
  saving: boolean;
  error: string;
  onChange: <K extends keyof ProductFormData>(
    field: K,
    value: ProductFormData[K]
  ) => void;
  onClose: () => void;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
}) {
  return (
    <motion.div
      className="product-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <motion.div
        className="product-modal"
        initial={{ opacity: 0, y: 20, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 15, scale: 0.98 }}
        transition={{ duration: 0.25 }}
      >
        <div className="product-modal-header">
          <div>
            <span className="product-modal-eyebrow">
              {editingProduct ? "PRODUCT EDITOR" : "NEW PRODUCT"}
            </span>

            <h2>
              {editingProduct
                ? "Edit product"
                : "Add a product"}
            </h2>

            <p>
              {editingProduct
                ? "Update the product information below."
                : "Add a new product to your Nexora catalog."}
            </p>
          </div>

          <button
            className="product-modal-close"
            onClick={onClose}
            type="button"
            disabled={saving}
          >
            <X size={19} />
          </button>
        </div>

        <form onSubmit={onSubmit}>
          <div className="product-form-grid">
            <FormField label="Product name" required>
              <input
                value={form.name}
                onChange={(event) =>
                  onChange("name", event.target.value)
                }
                placeholder="e.g. Premium Laptop"
              />
            </FormField>

            <FormField label="SKU" required>
              <input
                value={form.sku}
                onChange={(event) =>
                  onChange("sku", event.target.value)
                }
                placeholder="e.g. LAP-001"
              />
            </FormField>

            <FormField label="Category" required>
              <input
                value={form.category}
                onChange={(event) =>
                  onChange("category", event.target.value)
                }
                placeholder="e.g. Electronics"
              />
            </FormField>

            <FormField label="Warehouse location" required>
              <input
                value={form.warehouseLocation}
                onChange={(event) =>
                  onChange(
                    "warehouseLocation",
                    event.target.value
                  )
                }
                placeholder="e.g. Warehouse A"
              />
            </FormField>

            <FormField label="Unit price" required>
              <input
                type="number"
                min="0.01"
                step="0.01"
                value={form.unitPrice || ""}
                onChange={(event) =>
                  onChange(
                    "unitPrice",
                    Number(event.target.value)
                  )
                }
                placeholder="0.00"
              />
            </FormField>

            <FormField label="Current stock" required>
              <input
                type="number"
                min="0"
                step="1"
                value={form.currentStock}
                onChange={(event) =>
                  onChange(
                    "currentStock",
                    Number(event.target.value)
                  )
                }
                placeholder="0"
              />
            </FormField>

            <FormField label="Minimum stock" required>
              <input
                type="number"
                min="0"
                step="1"
                value={form.minimumStock}
                onChange={(event) =>
                  onChange(
                    "minimumStock",
                    Number(event.target.value)
                  )
                }
                placeholder="0"
              />
            </FormField>
          </div>

          {error && (
            <div className="product-form-error">
              <AlertTriangle size={16} />
              {error}
            </div>
          )}

          <div className="product-modal-footer">
            <button
              type="button"
              className="product-cancel-button"
              onClick={onClose}
              disabled={saving}
            >
              Cancel
            </button>

            <button
              type="submit"
              className="products-primary-button"
              disabled={saving}
            >
              {saving ? (
                <>
                  <RefreshCw
                    size={16}
                    className="products-spin"
                  />
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircle2 size={17} />
                  {editingProduct
                    ? "Save changes"
                    : "Create product"}
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
}

function FormField({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <label className="product-form-field">
      <span>
        {label}
        {required && <em>*</em>}
      </span>

      {children}
    </label>
  );
}

function DeleteModal({
  product,
  deleting,
  onCancel,
  onConfirm,
}: {
  product: Product;
  deleting: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <motion.div
      className="product-modal-backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="delete-modal"
        initial={{ opacity: 0, y: 15, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10 }}
      >
        <div className="delete-icon">
          <Trash2 size={23} />
        </div>

        <h2>Delete product?</h2>

        <p>
          You're about to permanently delete{" "}
          <strong>{product.name}</strong>. This action cannot be
          undone.
        </p>

        <div className="delete-actions">
          <button
            className="product-cancel-button"
            onClick={onCancel}
            disabled={deleting}
          >
            Cancel
          </button>

          <button
            className="delete-confirm-button"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? "Deleting..." : "Delete product"}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
}

function ProductsLoading() {
  return (
    <div className="products-loading">
      <div className="products-loading-row header">
        {Array.from({ length: 8 }).map((_, index) => (
          <span key={index} />
        ))}
      </div>

      {Array.from({ length: 5 }).map((_, row) => (
        <div className="products-loading-row" key={row}>
          {Array.from({ length: 8 }).map((_, index) => (
            <span key={index} />
          ))}
        </div>
      ))}
    </div>
  );
}

function getInitials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

function formatCurrency(value: number) {
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  }

  if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  }

  if (value >= 1000) {
    return `₹${(value / 1000).toFixed(1)}K`;
  }

  return `₹${value.toLocaleString("en-IN", {
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  if (!value) return "—";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

export default Products;