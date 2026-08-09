import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDown,
  ArrowUp,
  CheckCircle2,
  Package,
  Plus,
  RefreshCw,
  Search,
  Warehouse,
  X,
} from "lucide-react";
import {
  createStockMovement,
  getStockMovements,
  type StockMovement,
} from "../services/stock.service";
import api from "../services/api";
import "./Inventory.css";

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minimumStock: number;
  warehouseLocation: string;
}

interface ProductResponse {
  success: boolean;
  data: Product[];
}

export default function Inventory() {
  const [products, setProducts] = useState<Product[]>([]);
  const [movements, setMovements] = useState<StockMovement[]>([]);

  const [loading, setLoading] = useState(true);
  const [movementLoading, setMovementLoading] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");
  const [stockFilter, setStockFilter] = useState<
    "ALL" | "HEALTHY" | "LOW"
  >("ALL");

  const [modalOpen, setModalOpen] = useState(false);

  const [productId, setProductId] = useState("");
  const [movementType, setMovementType] =
    useState<"IN" | "OUT">("IN");
  const [quantity, setQuantity] = useState("");
  const [reason, setReason] = useState("");

  async function loadInventory() {
    try {
      setLoading(true);
      setError("");

      const [productsResponse, movementsResponse] =
        await Promise.all([
          api.get<ProductResponse>("/products"),
          getStockMovements(),
        ]);

      setProducts(productsResponse.data.data);
      setMovements(movementsResponse);
    } catch (err) {
      console.error(err);
      setError("Unable to load inventory data.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadInventory();
  }, []);

  const totalProducts = products.length;

  const lowStockProducts = products.filter(
    (product) => product.currentStock <= product.minimumStock
  );

  const healthyProducts = products.filter(
    (product) => product.currentStock > product.minimumStock
  );

  const totalUnits = products.reduce(
    (total, product) => total + product.currentStock,
    0
  );

  const inventoryValue = products.reduce(
    (total, product) =>
      total + product.currentStock * product.unitPrice,
    0
  );

  const filteredProducts = useMemo(() => {
    const query = search.toLowerCase().trim();

    return products.filter((product) => {
      const matchesSearch =
        !query ||
        product.name.toLowerCase().includes(query) ||
        product.sku.toLowerCase().includes(query) ||
        product.category.toLowerCase().includes(query) ||
        product.warehouseLocation
          .toLowerCase()
          .includes(query);

      const matchesFilter =
        stockFilter === "ALL" ||
        (stockFilter === "LOW" &&
          product.currentStock <= product.minimumStock) ||
        (stockFilter === "HEALTHY" &&
          product.currentStock > product.minimumStock);

      return matchesSearch && matchesFilter;
    });
  }, [products, search, stockFilter]);

  async function handleCreateMovement(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    const parsedQuantity = Number(quantity);

    if (!productId) {
      alert("Please select a product.");
      return;
    }

    if (!Number.isInteger(parsedQuantity) || parsedQuantity <= 0) {
      alert("Quantity must be a positive whole number.");
      return;
    }

    if (!reason.trim()) {
      alert("Please enter a reason.");
      return;
    }

    try {
      setMovementLoading(true);

      await createStockMovement({
        productId,
        quantity: parsedQuantity,
        movementType,
        reason: reason.trim(),
      });

      setModalOpen(false);
      setProductId("");
      setMovementType("IN");
      setQuantity("");
      setReason("");

      await loadInventory();
    } catch (err: any) {
      console.error(err);

      const message =
        err?.response?.data?.message ||
        "Unable to create stock movement.";

      alert(message);
    } finally {
      setMovementLoading(false);
    }
  }

  function formatCurrency(value: number) {
    return `₹${value.toLocaleString("en-IN")}`;
  }

  function formatDate(value: string) {
    return new Date(value).toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  }

  function getProductName(movement: StockMovement) {
    if (movement.product?.name) {
      return movement.product.name;
    }

    const product = products.find(
      (item) => item.id === movement.productId
    );

    return product?.name || "Unknown product";
  }

  function getProductSku(movement: StockMovement) {
    if (movement.product?.sku) {
      return movement.product.sku;
    }

    const product = products.find(
      (item) => item.id === movement.productId
    );

    return product?.sku || "—";
  }

  if (loading) {
    return (
      <div className="inventory-page">
        <div className="inventory-loading">
          <RefreshCw size={24} className="inventory-spin" />
          <span>Loading inventory...</span>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="inventory-page">
        <div className="inventory-error">
          <div className="inventory-error-icon">
            <AlertTriangle size={25} />
          </div>

          <h2>Unable to load inventory</h2>

          <p>{error}</p>

          <button
            className="inventory-primary-button"
            onClick={loadInventory}
          >
            <RefreshCw size={16} />
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory-page">
      {/* Header */}
      <div className="inventory-header">
        <div>
          <div className="inventory-eyebrow">
            INVENTORY MANAGEMENT
          </div>

          <h1>Inventory</h1>

          <p>
            Monitor stock levels, warehouse locations and
            stock movements.
          </p>
        </div>

        <div className="inventory-header-actions">
          <button
            className="inventory-refresh-button"
            onClick={loadInventory}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="inventory-primary-button"
            onClick={() => setModalOpen(true)}
          >
            <Plus size={18} />
            Stock movement
          </button>
        </div>
      </div>

      {/* Metrics */}
      <div className="inventory-metrics">
        <div className="inventory-metric-card">
          <div className="inventory-metric-icon purple">
            <Package size={20} />
          </div>

          <div className="inventory-metric-label">
            Total products
          </div>

          <div className="inventory-metric-value">
            {totalProducts}
          </div>

          <div className="inventory-metric-description">
            Products being tracked
          </div>
        </div>

        <div className="inventory-metric-card">
          <div className="inventory-metric-icon green">
            <CheckCircle2 size={20} />
          </div>

          <div className="inventory-metric-label">
            Healthy stock
          </div>

          <div className="inventory-metric-value">
            {healthyProducts.length}
          </div>

          <div className="inventory-metric-description">
            Above minimum level
          </div>
        </div>

        <div className="inventory-metric-card">
          <div className="inventory-metric-icon orange">
            <AlertTriangle size={20} />
          </div>

          <div className="inventory-metric-label">
            Low stock
          </div>

          <div className="inventory-metric-value">
            {lowStockProducts.length}
          </div>

          <div className="inventory-metric-description">
            Needs attention
          </div>
        </div>

        <div className="inventory-metric-card">
          <div className="inventory-metric-icon purple">
            <Warehouse size={20} />
          </div>

          <div className="inventory-metric-label">
            Inventory value
          </div>

          <div className="inventory-metric-value inventory-value">
            {formatCurrency(inventoryValue)}
          </div>

          <div className="inventory-metric-description">
            Current stock value
          </div>
        </div>
      </div>

      {/* Stock overview */}
      <section className="inventory-section">
        <div className="inventory-section-header">
          <div>
            <span className="inventory-section-eyebrow">
              STOCK OVERVIEW
            </span>

            <h2>Current inventory</h2>
          </div>

          <div className="inventory-unit-count">
            {totalUnits.toLocaleString("en-IN")} total units
          </div>
        </div>

        <div className="inventory-toolbar">
          <div className="inventory-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search products, SKU, category..."
            />
          </div>

          <div className="inventory-filter-group">
            <button
              className={
                stockFilter === "ALL"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() => setStockFilter("ALL")}
            >
              All
            </button>

            <button
              className={
                stockFilter === "HEALTHY"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() => setStockFilter("HEALTHY")}
            >
              Healthy
            </button>

            <button
              className={
                stockFilter === "LOW"
                  ? "inventory-filter active"
                  : "inventory-filter"
              }
              onClick={() => setStockFilter("LOW")}
            >
              Low stock
            </button>
          </div>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>SKU</th>
                <th>CATEGORY</th>
                <th>STOCK</th>
                <th>MINIMUM</th>
                <th>LOCATION</th>
                <th>STATUS</th>
              </tr>
            </thead>

            <tbody>
              {filteredProducts.length === 0 ? (
                <tr>
                  <td
                    colSpan={7}
                    className="inventory-empty"
                  >
                    No products found.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((product) => {
                  const isLow =
                    product.currentStock <=
                    product.minimumStock;

                  return (
                    <tr key={product.id}>
                      <td>
                        <div className="inventory-product">
                          <div className="inventory-product-avatar">
                            {product.name
                              .slice(0, 2)
                              .toUpperCase()}
                          </div>

                          <div>
                            <strong>{product.name}</strong>

                            <span>
                              {formatCurrency(
                                product.unitPrice
                              )}{" "}
                              / unit
                            </span>
                          </div>
                        </div>
                      </td>

                      <td>
                        <span className="inventory-sku">
                          {product.sku}
                        </span>
                      </td>

                      <td>{product.category}</td>

                      <td>
                        <strong>
                          {product.currentStock}
                        </strong>
                      </td>

                      <td>{product.minimumStock}</td>

                      <td>
                        <div className="inventory-location">
                          <Warehouse size={15} />
                          {product.warehouseLocation}
                        </div>
                      </td>

                      <td>
                        <span
                          className={
                            isLow
                              ? "inventory-status low"
                              : "inventory-status healthy"
                          }
                        >
                          <span />
                          {isLow ? "Low stock" : "Healthy"}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Movement history */}
      <section className="inventory-section">
        <div className="inventory-section-header">
          <div>
            <span className="inventory-section-eyebrow">
              MOVEMENT HISTORY
            </span>

            <h2>Recent stock movements</h2>
          </div>

          <div className="inventory-unit-count">
            {movements.length} movements
          </div>
        </div>

        <div className="inventory-table-wrapper">
          <table className="inventory-table movement-table">
            <thead>
              <tr>
                <th>PRODUCT</th>
                <th>TYPE</th>
                <th>QUANTITY</th>
                <th>REASON</th>
                <th>CREATED BY</th>
                <th>DATE</th>
              </tr>
            </thead>

            <tbody>
              {movements.length === 0 ? (
                <tr>
                  <td
                    colSpan={6}
                    className="inventory-empty"
                  >
                    No stock movements recorded yet.
                  </td>
                </tr>
              ) : (
                movements.map((movement) => (
                  <tr key={movement.id}>
                    <td>
                      <div className="movement-product">
                        <strong>
                          {getProductName(movement)}
                        </strong>

                        <span>
                          {getProductSku(movement)}
                        </span>
                      </div>
                    </td>

                    <td>
                      <span
                        className={
                          movement.movementType === "IN"
                            ? "movement-badge in"
                            : "movement-badge out"
                        }
                      >
                        {movement.movementType === "IN" ? (
                          <ArrowDown size={14} />
                        ) : (
                          <ArrowUp size={14} />
                        )}

                        {movement.movementType}
                      </span>
                    </td>

                    <td>
                      <strong
                        className={
                          movement.movementType === "IN"
                            ? "quantity-in"
                            : "quantity-out"
                        }
                      >
                        {movement.movementType === "IN"
                          ? "+"
                          : "-"}
                        {movement.quantity}
                      </strong>
                    </td>

                    <td>{movement.reason}</td>

                    <td>
                      {movement.createdBy?.name || "Admin"}
                    </td>

                    <td>
                      {formatDate(movement.createdAt)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </section>

      {/* Modal */}
      {modalOpen && (
        <div
          className="inventory-modal-overlay"
          onClick={() => setModalOpen(false)}
        >
          <div
            className="inventory-modal"
            onClick={(event) =>
              event.stopPropagation()
            }
          >
            <div className="inventory-modal-header">
              <div>
                <span>STOCK CONTROL</span>
                <h2>Add stock movement</h2>
              </div>

              <button
                className="inventory-modal-close"
                onClick={() => setModalOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            <form
              className="inventory-form"
              onSubmit={handleCreateMovement}
            >
              <label>
                Product

                <select
                  value={productId}
                  onChange={(event) =>
                    setProductId(event.target.value)
                  }
                  required
                >
                  <option value="">
                    Select product
                  </option>

                  {products.map((product) => (
                    <option
                      key={product.id}
                      value={product.id}
                    >
                      {product.name} — {product.sku}
                    </option>
                  ))}
                </select>
              </label>

              <div className="inventory-form-row">
                <label>
                  Movement type

                  <select
                    value={movementType}
                    onChange={(event) =>
                      setMovementType(
                        event.target.value as "IN" | "OUT"
                      )
                    }
                  >
                    <option value="IN">
                      Stock IN
                    </option>

                    <option value="OUT">
                      Stock OUT
                    </option>
                  </select>
                </label>

                <label>
                  Quantity

                  <input
                    type="number"
                    min="1"
                    step="1"
                    value={quantity}
                    onChange={(event) =>
                      setQuantity(event.target.value)
                    }
                    placeholder="Enter quantity"
                    required
                  />
                </label>
              </div>

              <label>
                Reason

                <input
                  type="text"
                  value={reason}
                  onChange={(event) =>
                    setReason(event.target.value)
                  }
                  placeholder="e.g. New purchase, damaged stock..."
                  required
                />
              </label>

              <div className="inventory-form-actions">
                <button
                  type="button"
                  className="inventory-cancel-button"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="inventory-primary-button"
                  disabled={movementLoading}
                >
                  {movementLoading ? (
                    <>
                      <RefreshCw
                        size={16}
                        className="inventory-spin"
                      />
                      Saving...
                    </>
                  ) : (
                    <>
                      <Plus size={17} />
                      Save movement
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}