import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Eye,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

const API_BASE =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

type Status = "DRAFT" | "CONFIRMED" | "CANCELLED";

interface Customer {
  id: string;
  name: string;
  businessName?: string | null;
  mobile?: string | null;
  email?: string | null;
}

interface Product {
  id: string;
  name: string;
  sku: string;
  unitPrice: number;
  currentStock: number;
}

interface ChallanItem {
  id: string;
  productId: string;
  quantity: number;
  productName: string;
  sku: string;
  unitPrice: number;
}

interface Challan {
  id: string;
  challanNumber: string;
  customerId: string;
  status: Status;
  totalQuantity: number;
  totalAmount: number;
  createdAt: string;
  customer: Customer;
  items: ChallanItem[];
  createdBy?: {
    id: string;
    name: string;
    email: string;
    role: string;
  };
}

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

interface DraftItem {
  productId: string;
  quantity: number;
}

function getToken() {
  return (
    localStorage.getItem("token") ||
    localStorage.getItem("accessToken") ||
    localStorage.getItem("authToken") ||
    ""
  );
}

async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getToken();

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(
      body?.message || `Request failed with status ${response.status}`
    );
  }

  return body;
}

function formatCurrency(value: number) {
  return `₹${Number(value || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: Status }) {
  const config = {
    DRAFT: {
      label: "Draft",
      className: "challan-status draft",
    },
    CONFIRMED: {
      label: "Confirmed",
      className: "challan-status confirmed",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "challan-status cancelled",
    },
  };

  return (
    <span className={config[status].className}>
      {status === "CONFIRMED" && <CheckCircle2 size={13} />}
      {status === "CANCELLED" && <X size={13} />}
      {status === "DRAFT" && <ClipboardList size={13} />}
      {config[status].label}
    </span>
  );
}

export default function Challans() {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);

  const [loading, setLoading] = useState(true);
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState("");

  const [search, setSearch] = useState("");

  const [showCreate, setShowCreate] = useState(false);
  const [selectedChallan, setSelectedChallan] =
    useState<Challan | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [status, setStatus] = useState<Status>("DRAFT");

  const [items, setItems] = useState<DraftItem[]>([
    {
      productId: "",
      quantity: 1,
    },
  ]);

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [challanResponse, customerResponse, productResponse] =
        await Promise.all([
          apiFetch<ApiResponse<Challan[]>>("/challans"),
          apiFetch<ApiResponse<Customer[]>>("/customers"),
          apiFetch<ApiResponse<Product[]>>("/products"),
        ]);

      setChallans(challanResponse.data || []);
      setCustomers(customerResponse.data || []);
      setProducts(productResponse.data || []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Unable to load challan data"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  const filteredChallans = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return challans;

    return challans.filter((challan) => {
      return (
        challan.challanNumber.toLowerCase().includes(query) ||
        challan.customer?.name?.toLowerCase().includes(query) ||
        challan.customer?.businessName
          ?.toLowerCase()
          .includes(query) ||
        challan.status.toLowerCase().includes(query)
      );
    });
  }, [challans, search]);

  const draftTotalQuantity = useMemo(() => {
    return items.reduce(
      (sum, item) => sum + Number(item.quantity || 0),
      0
    );
  }, [items]);

  const draftTotalAmount = useMemo(() => {
    return items.reduce((sum, item) => {
      const product = products.find(
        (product) => product.id === item.productId
      );

      return (
        sum +
        (product ? product.unitPrice * Number(item.quantity || 0) : 0)
      );
    }, 0);
  }, [items, products]);

  function addItem() {
    setItems((current) => [
      ...current,
      {
        productId: "",
        quantity: 1,
      },
    ]);
  }

  function removeItem(index: number) {
    setItems((current) => {
      if (current.length === 1) return current;
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
  }

  function updateItem(
    index: number,
    field: keyof DraftItem,
    value: string | number
  ) {
    setItems((current) =>
      current.map((item, itemIndex) => {
        if (itemIndex !== index) return item;

        return {
          ...item,
          [field]:
            field === "quantity"
              ? Math.max(1, Number(value))
              : value,
        };
      })
    );
  }

  function resetForm() {
    setCustomerId("");
    setStatus("DRAFT");
    setItems([
      {
        productId: "",
        quantity: 1,
      },
    ]);
  }

  async function handleCreate() {
    setError("");

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (items.length === 0) {
      setError("Add at least one product.");
      return;
    }

    const invalidItem = items.find(
      (item) => !item.productId || Number(item.quantity) <= 0
    );

    if (invalidItem) {
      setError("Please select a product and enter a valid quantity.");
      return;
    }

    try {
      setCreating(true);

      const response = await apiFetch<ApiResponse<Challan>>(
        "/challans",
        {
          method: "POST",
          body: JSON.stringify({
            customerId,
            status,
            items: items.map((item) => ({
              productId: item.productId,
              quantity: Number(item.quantity),
            })),
          }),
        }
      );

      setChallans((current) => [
        response.data,
        ...current,
      ]);

      setShowCreate(false);
      resetForm();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to create challan"
      );
    } finally {
      setCreating(false);
    }
  }

  async function handleDelete(challan: Challan) {
    const confirmed = window.confirm(
      `Delete ${challan.challanNumber}?\n\nThis will restore the stock associated with this challan.`
    );

    if (!confirmed) return;

    try {
      setError("");

      await apiFetch(`/challans/${challan.id}`, {
        method: "DELETE",
      });

      setChallans((current) =>
        current.filter((item) => item.id !== challan.id)
      );

      if (selectedChallan?.id === challan.id) {
        setSelectedChallan(null);
      }
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to delete challan"
      );
    }
  }

  return (
    <motion.div
      className="challans-page"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
    >
      {/* Header */}
      <div className="challans-header">
        <div>
          <div className="eyebrow">SALES OPERATIONS</div>

          <h1>Sales Challans</h1>

          <p>
            Create, track and manage sales challans across your
            business.
          </p>
        </div>

        <div className="challans-header-actions">
          <button
            className="challan-secondary-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw
              size={16}
              className={loading ? "spin" : ""}
            />
            Refresh
          </button>

          <button
            className="challan-primary-button"
            onClick={() => {
              setError("");
              setShowCreate(true);
            }}
          >
            <Plus size={17} />
            New Challan
          </button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            className="challan-error-banner"
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -6 }}
          >
            <AlertTriangle size={18} />

            <span>{error}</span>

            <button onClick={() => setError("")}>
              <X size={16} />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stats */}
      <div className="challan-stats">
        <div className="challan-stat-card">
          <div className="challan-stat-icon">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>Total Challans</span>
            <strong>{challans.length}</strong>
          </div>
        </div>

        <div className="challan-stat-card">
          <div className="challan-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Confirmed</span>
            <strong>
              {
                challans.filter(
                  (challan) => challan.status === "CONFIRMED"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="challan-stat-card">
          <div className="challan-stat-icon">
            <ClipboardList size={19} />
          </div>

          <div>
            <span>Drafts</span>
            <strong>
              {
                challans.filter(
                  (challan) => challan.status === "DRAFT"
                ).length
              }
            </strong>
          </div>
        </div>

        <div className="challan-stat-card">
          <div className="challan-stat-icon">
            <CheckCircle2 size={19} />
          </div>

          <div>
            <span>Total Value</span>
            <strong>
              {formatCurrency(
                challans.reduce(
                  (sum, challan) =>
                    sum + Number(challan.totalAmount || 0),
                  0
                )
              )}
            </strong>
          </div>
        </div>
      </div>

      {/* Main table */}
      <div className="challan-panel">
        <div className="challan-panel-header">
          <div>
            <h2>Recent Challans</h2>
            <p>
              {filteredChallans.length} challan
              {filteredChallans.length === 1 ? "" : "s"} found
            </p>
          </div>

          <div className="challan-search">
            <Search size={17} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search challan, customer..."
            />
          </div>
        </div>

        {loading ? (
          <div className="challan-loading">
            <Loader2 size={25} className="spin" />
            <span>Loading challans...</span>
          </div>
        ) : filteredChallans.length === 0 ? (
          <div className="challan-empty">
            <div className="challan-empty-icon">
              <ClipboardList size={28} />
            </div>

            <h3>No challans found</h3>

            <p>
              {search
                ? "Try changing your search."
                : "Create your first sales challan to get started."}
            </p>

            {!search && (
              <button
                className="challan-primary-button"
                onClick={() => setShowCreate(true)}
              >
                <Plus size={16} />
                Create Challan
              </button>
            )}
          </div>
        ) : (
          <div className="challan-table-wrapper">
            <table className="challan-table">
              <thead>
                <tr>
                  <th>CHALLAN</th>
                  <th>CUSTOMER</th>
                  <th>ITEMS</th>
                  <th>QUANTITY</th>
                  <th>VALUE</th>
                  <th>STATUS</th>
                  <th>DATE</th>
                  <th />
                </tr>
              </thead>

              <tbody>
                {filteredChallans.map((challan) => (
                  <motion.tr
                    key={challan.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    <td>
                      <div className="challan-number">
                        {challan.challanNumber}
                      </div>
                    </td>

                    <td>
                      <div className="challan-customer">
                        <strong>
                          {challan.customer?.name ||
                            "Unknown customer"}
                        </strong>

                        {challan.customer?.businessName && (
                          <span>
                            {challan.customer.businessName}
                          </span>
                        )}
                      </div>
                    </td>

                    <td>
                      <span className="challan-items-count">
                        {challan.items?.length || 0}
                      </span>
                    </td>

                    <td>
                      {challan.totalQuantity}
                    </td>

                    <td>
                      <strong>
                        {formatCurrency(challan.totalAmount)}
                      </strong>
                    </td>

                    <td>
                      <StatusBadge status={challan.status} />
                    </td>

                    <td>
                      <span className="challan-date">
                        {formatDate(challan.createdAt)}
                      </span>
                    </td>

                    <td>
                      <div className="challan-row-actions">
                        <button
                          className="challan-icon-button"
                          title="View"
                          onClick={() =>
                            setSelectedChallan(challan)
                          }
                        >
                          <Eye size={16} />
                        </button>

                        <button
                          className="challan-icon-button danger"
                          title="Delete"
                          onClick={() =>
                            handleDelete(challan)
                          }
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Create Modal */}
      <AnimatePresence>
        {showCreate && (
          <motion.div
            className="challan-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={(event) => {
              if (event.target === event.currentTarget) {
                setShowCreate(false);
              }
            }}
          >
            <motion.div
              className="challan-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
            >
              <div className="challan-modal-header">
                <div>
                  <div className="eyebrow">
                    SALES DOCUMENT
                  </div>

                  <h2>Create Sales Challan</h2>

                  <p>
                    Select a customer and add the products being
                    dispatched.
                  </p>
                </div>

                <button
                  className="challan-modal-close"
                  onClick={() => setShowCreate(false)}
                >
                  <X size={19} />
                </button>
              </div>

              <div className="challan-modal-body">
                {/* Customer */}
                <div className="challan-form-section">
                  <div className="challan-section-title">
                    Customer
                  </div>

                  <label className="challan-field">
                    <span>
                      Customer <b>*</b>
                    </span>

                    <div className="challan-select-wrapper">
                      <select
                        value={customerId}
                        onChange={(event) =>
                          setCustomerId(event.target.value)
                        }
                      >
                        <option value="">
                          Select customer
                        </option>

                        {customers.map((customer) => (
                          <option
                            key={customer.id}
                            value={customer.id}
                          >
                            {customer.name}
                            {customer.businessName
                              ? ` — ${customer.businessName}`
                              : ""}
                          </option>
                        ))}
                      </select>

                      <ChevronDown size={16} />
                    </div>
                  </label>
                </div>

                {/* Products */}
                <div className="challan-form-section">
                  <div className="challan-section-heading-row">
                    <div>
                      <div className="challan-section-title">
                        Products
                      </div>

                      <p>
                        Add one or more products to this
                        challan.
                      </p>
                    </div>

                    <button
                      type="button"
                      className="challan-add-item"
                      onClick={addItem}
                    >
                      <Plus size={15} />
                      Add Product
                    </button>
                  </div>

                  <div className="challan-items-editor">
                    {items.map((item, index) => {
                      const product = products.find(
                        (product) =>
                          product.id === item.productId
                      );

                      return (
                        <div
                          className="challan-item-row"
                          key={`${index}-${item.productId}`}
                        >
                          <div className="challan-item-number">
                            {String(index + 1).padStart(2, "0")}
                          </div>

                          <label className="challan-field product-field">
                            <span>Product</span>

                            <div className="challan-select-wrapper">
                              <select
                                value={item.productId}
                                onChange={(event) =>
                                  updateItem(
                                    index,
                                    "productId",
                                    event.target.value
                                  )
                                }
                              >
                                <option value="">
                                  Select product
                                </option>

                                {products.map((product) => (
                                  <option
                                    key={product.id}
                                    value={product.id}
                                    disabled={
                                      product.currentStock <= 0
                                    }
                                  >
                                    {product.name} —{" "}
                                    {product.sku}{" "}
                                    (Stock:{" "}
                                    {product.currentStock})
                                  </option>
                                ))}
                              </select>

                              <ChevronDown size={16} />
                            </div>

                            {product && (
                              <small>
                                ₹
                                {product.unitPrice.toLocaleString(
                                  "en-IN"
                                )}{" "}
                                per unit ·{" "}
                                {product.currentStock} in stock
                              </small>
                            )}
                          </label>

                          <label className="challan-field quantity-field">
                            <span>Quantity</span>

                            <input
                              type="number"
                              min="1"
                              max={
                                product?.currentStock ||
                                undefined
                              }
                              value={item.quantity}
                              onChange={(event) =>
                                updateItem(
                                  index,
                                  "quantity",
                                  Number(event.target.value)
                                )
                              }
                            />
                          </label>

                          <div className="challan-item-total">
                            <span>Amount</span>

                            <strong>
                              {formatCurrency(
                                product
                                  ? product.unitPrice *
                                      Number(item.quantity)
                                  : 0
                              )}
                            </strong>
                          </div>

                          <button
                            type="button"
                            className="challan-remove-item"
                            onClick={() =>
                              removeItem(index)
                            }
                            disabled={items.length === 1}
                            title="Remove product"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Status */}
                <div className="challan-form-section">
                  <div className="challan-section-title">
                    Status
                  </div>

                  <div className="challan-status-options">
                    {(
                      [
                        "DRAFT",
                        "CONFIRMED",
                        "CANCELLED",
                      ] as Status[]
                    ).map((option) => (
                      <button
                        key={option}
                        type="button"
                        className={
                          status === option
                            ? "challan-status-option active"
                            : "challan-status-option"
                        }
                        onClick={() => setStatus(option)}
                      >
                        <StatusBadge status={option} />
                      </button>
                    ))}
                  </div>
                </div>

                {/* Summary */}
                <div className="challan-summary">
                  <div>
                    <span>Total Items</span>
                    <strong>{items.length}</strong>
                  </div>

                  <div>
                    <span>Total Quantity</span>
                    <strong>{draftTotalQuantity}</strong>
                  </div>

                  <div className="summary-total">
                    <span>Total Amount</span>
                    <strong>
                      {formatCurrency(draftTotalAmount)}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="challan-modal-footer">
                <button
                  className="challan-secondary-button"
                  onClick={() => setShowCreate(false)}
                  disabled={creating}
                >
                  Cancel
                </button>

                <button
                  className="challan-primary-button"
                  onClick={handleCreate}
                  disabled={creating}
                >
                  {creating ? (
                    <>
                      <Loader2 size={16} className="spin" />
                      Creating...
                    </>
                  ) : (
                    <>
                      <CheckCircle2 size={16} />
                      Create Challan
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* View Modal */}
      <AnimatePresence>
        {selectedChallan && (
          <motion.div
            className="challan-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="challan-view-modal"
              initial={{ opacity: 0, y: 20, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20, scale: 0.98 }}
            >
              <div className="challan-view-header">
                <div>
                  <span className="challan-view-eyebrow">
                    SALES CHALLAN
                  </span>

                  <h2>
                    {selectedChallan.challanNumber}
                  </h2>

                  <p>
                    Created on{" "}
                    {formatDate(
                      selectedChallan.createdAt
                    )}
                  </p>
                </div>

                <div className="challan-view-header-right">
                  <StatusBadge
                    status={selectedChallan.status}
                  />

                  <button
                    className="challan-modal-close"
                    onClick={() =>
                      setSelectedChallan(null)
                    }
                  >
                    <X size={19} />
                  </button>
                </div>
              </div>

              <div className="challan-view-body">
                <div className="challan-view-customer">
                  <span>Customer</span>

                  <strong>
                    {selectedChallan.customer?.name}
                  </strong>

                  {selectedChallan.customer
                    ?.businessName && (
                    <small>
                      {
                        selectedChallan.customer
                          .businessName
                      }
                    </small>
                  )}
                </div>

                <div className="challan-detail-table">
                  <div className="challan-detail-head">
                    <span>PRODUCT</span>
                    <span>SKU</span>
                    <span>QTY</span>
                    <span>UNIT PRICE</span>
                    <span>AMOUNT</span>
                  </div>

                  {selectedChallan.items?.map((item) => (
                    <div
                      className="challan-detail-row"
                      key={item.id}
                    >
                      <strong>
                        {item.productName}
                      </strong>

                      <span>{item.sku}</span>

                      <span>{item.quantity}</span>

                      <span>
                        {formatCurrency(item.unitPrice)}
                      </span>

                      <strong>
                        {formatCurrency(
                          item.unitPrice * item.quantity
                        )}
                      </strong>
                    </div>
                  ))}
                </div>

                <div className="challan-view-total">
                  <div>
                    <span>Total Quantity</span>
                    <strong>
                      {selectedChallan.totalQuantity}
                    </strong>
                  </div>

                  <div>
                    <span>Total Amount</span>
                    <strong>
                      {formatCurrency(
                        selectedChallan.totalAmount
                      )}
                    </strong>
                  </div>
                </div>
              </div>

              <div className="challan-modal-footer">
                <button
                  className="challan-secondary-button"
                  onClick={() =>
                    setSelectedChallan(null)
                  }
                >
                  Close
                </button>

                <button
                  className="challan-danger-button"
                  onClick={() => {
                    handleDelete(selectedChallan);
                  }}
                >
                  <Trash2 size={16} />
                  Delete Challan
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}