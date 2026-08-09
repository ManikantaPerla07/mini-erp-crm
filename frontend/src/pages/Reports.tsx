import { useEffect, useMemo, useState } from "react";
import {
  BarChart3,
  Boxes,
  CalendarDays,
  Download,
  FileText,
  RefreshCw,
  Search,
  ShoppingCart,
  Users,
  Warehouse,
} from "lucide-react";
import {
  getChallanReport,
  getCustomerReport,
  getInventoryReport,
  type ChallanReportItem,
  type CustomerReportItem,
  type InventoryReportItem,
} from "../services/report.service";
import "./Reports.css";

type ReportType = "inventory" | "customers" | "challans";

export default function Reports() {
  const [activeReport, setActiveReport] =
    useState<ReportType>("inventory");

  const [inventory, setInventory] = useState<InventoryReportItem[]>([]);
  const [customers, setCustomers] = useState<CustomerReportItem[]>([]);
  const [challans, setChallans] = useState<ChallanReportItem[]>([]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");

  const loadReports = async () => {
    try {
      setLoading(true);
      setError("");

      const [inventoryData, customerData, challanData] =
        await Promise.all([
          getInventoryReport(),
          getCustomerReport(),
          getChallanReport(),
        ]);

      setInventory(inventoryData);
      setCustomers(customerData);
      setChallans(challanData);
    } catch (err) {
      console.error("Failed to load reports:", err);

      setError(
        err instanceof Error
          ? err.message
          : "Failed to load reports"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReports();
  }, []);

  const filteredInventory = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return inventory;

    return inventory.filter((item) =>
      [
        item.name,
        item.sku,
        item.category,
        item.warehouseLocation,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [inventory, search]);

  const filteredCustomers = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return customers;

    return customers.filter((customer) =>
      [
        customer.customerName,
        customer.businessName,
        customer.phone,
        customer.email,
        customer.customerType,
        customer.status,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [customers, search]);

  const filteredChallans = useMemo(() => {
    const query = search.toLowerCase().trim();

    if (!query) return challans;

    return challans.filter((challan) =>
      [
        challan.challanNumber,
        challan.status,
        challan.customer?.customerName,
        challan.customer?.businessName,
        challan.createdBy?.name,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    );
  }, [challans, search]);

  const inventoryValue = inventory.reduce(
    (total, item) =>
      total + Number(item.unitPrice || 0) * Number(item.currentStock || 0),
    0
  );

  const totalStock = inventory.reduce(
    (total, item) => total + Number(item.currentStock || 0),
    0
  );

  const lowStockCount = inventory.filter(
    (item) =>
      Number(item.currentStock || 0) <= Number(item.minimumStock || 0)
  ).length;

  const customerChallanCount = customers.reduce(
    (total, customer) => total + (customer.challans?.length || 0),
    0
  );

  const challanValue = challans.reduce(
    (total, challan) =>
      total + Number(challan.totalAmount || 0),
    0
  );

  const formatCurrency = (value: number | string) => {
    return `₹${Number(value || 0).toLocaleString("en-IN", {
      maximumFractionDigits: 2,
    })}`;
  };

  const formatDate = (value?: string) => {
    if (!value) return "—";

    const date = new Date(value);

    if (Number.isNaN(date.getTime())) return "—";

    return date.toLocaleDateString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
    });
  };

  const exportCurrentReport = () => {
    let data: unknown[] = [];

    if (activeReport === "inventory") {
      data = filteredInventory;
    } else if (activeReport === "customers") {
      data = filteredCustomers;
    } else {
      data = filteredChallans;
    }

    if (!data.length) {
      return;
    }

    const headers = Object.keys(data[0] as Record<string, unknown>);

    const rows = data.map((item) => {
      const record = item as Record<string, unknown>;

      return headers
        .map((header) => {
          const value = record[header];

          if (value === null || value === undefined) {
            return "";
          }

          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(",");
    });

    const csv = [headers.join(","), ...rows].join("\n");

    const blob = new Blob([csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(blob);

    const link = document.createElement("a");
    link.href = url;
    link.download = `${activeReport}-report.csv`;

    document.body.appendChild(link);
    link.click();
    link.remove();

    URL.revokeObjectURL(url);
  };

  return (
    <div className="reports-page">
      <div className="reports-header">
        <div>
          <div className="reports-eyebrow">BUSINESS ANALYTICS</div>

          <h1>Reports</h1>

          <p>
            View operational reports across inventory, customers and
            sales challans.
          </p>
        </div>

        <div className="reports-actions">
          <button
            className="reports-secondary-button"
            onClick={loadReports}
            disabled={loading}
          >
            <RefreshCw size={17} className={loading ? "spin" : ""} />
            Refresh
          </button>

          <button
            className="reports-primary-button"
            onClick={exportCurrentReport}
            disabled={
              activeReport === "inventory"
                ? filteredInventory.length === 0
                : activeReport === "customers"
                ? filteredCustomers.length === 0
                : filteredChallans.length === 0
            }
          >
            <Download size={17} />
            Export CSV
          </button>
        </div>
      </div>

      {error && (
        <div className="reports-error">
          <FileText size={18} />
          <span>{error}</span>
          <button onClick={loadReports}>Try again</button>
        </div>
      )}

      <div className="reports-summary">
        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Boxes size={21} />
          </div>

          <div>
            <span>Total products</span>
            <strong>{inventory.length}</strong>
            <small>Products in catalog</small>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Warehouse size={21} />
          </div>

          <div>
            <span>Total stock</span>
            <strong>{totalStock}</strong>
            <small>Units currently tracked</small>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <Users size={21} />
          </div>

          <div>
            <span>Customers</span>
            <strong>{customers.length}</strong>
            <small>{customerChallanCount} linked challans</small>
          </div>
        </div>

        <div className="report-summary-card">
          <div className="report-summary-icon">
            <BarChart3 size={21} />
          </div>

          <div>
            <span>Inventory value</span>
            <strong>{formatCurrency(inventoryValue)}</strong>
            <small>{lowStockCount} low-stock products</small>
          </div>
        </div>
      </div>

      <div className="reports-tabs">
        <button
          className={activeReport === "inventory" ? "active" : ""}
          onClick={() => {
            setActiveReport("inventory");
            setSearch("");
          }}
        >
          <Boxes size={17} />
          Inventory
        </button>

        <button
          className={activeReport === "customers" ? "active" : ""}
          onClick={() => {
            setActiveReport("customers");
            setSearch("");
          }}
        >
          <Users size={17} />
          Customers
        </button>

        <button
          className={activeReport === "challans" ? "active" : ""}
          onClick={() => {
            setActiveReport("challans");
            setSearch("");
          }}
        >
          <ShoppingCart size={17} />
          Challans
        </button>
      </div>

      <div className="reports-content">
        <div className="reports-content-header">
          <div>
            <h2>
              {activeReport === "inventory"
                ? "Inventory Report"
                : activeReport === "customers"
                ? "Customer Report"
                : "Challan Report"}
            </h2>

            <p>
              {activeReport === "inventory"
                ? `${filteredInventory.length} products found`
                : activeReport === "customers"
                ? `${filteredCustomers.length} customers found`
                : `${filteredChallans.length} challans found`}
            </p>
          </div>

          <div className="reports-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder={
                activeReport === "inventory"
                  ? "Search product, SKU, category..."
                  : activeReport === "customers"
                  ? "Search customer, business, phone..."
                  : "Search challan, customer..."
              }
            />
          </div>
        </div>

        {loading ? (
          <div className="reports-empty">
            <RefreshCw size={28} className="spin" />
            <h3>Loading report...</h3>
            <p>Retrieving the latest operational data.</p>
          </div>
        ) : activeReport === "inventory" ? (
          filteredInventory.length === 0 ? (
            <div className="reports-empty">
              <Boxes size={38} />
              <h3>No inventory data</h3>
              <p>No products match your current search.</p>
            </div>
          ) : (
            <div className="reports-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>SKU</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Minimum</th>
                    <th>Unit price</th>
                    <th>Warehouse</th>
                    <th>Status</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredInventory.map((item) => {
                    const stock = Number(item.currentStock || 0);
                    const minimum = Number(item.minimumStock || 0);
                    const lowStock = stock <= minimum;

                    return (
                      <tr key={item.id}>
                        <td>
                          <strong>{item.name}</strong>
                        </td>

                        <td>{item.sku}</td>

                        <td>
                          <span className="report-tag">
                            {item.category}
                          </span>
                        </td>

                        <td>{stock}</td>

                        <td>{minimum}</td>

                        <td>{formatCurrency(item.unitPrice)}</td>

                        <td>{item.warehouseLocation}</td>

                        <td>
                          <span
                            className={
                              lowStock
                                ? "report-status danger"
                                : "report-status healthy"
                            }
                          >
                            {lowStock ? "Low stock" : "Healthy"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )
        ) : activeReport === "customers" ? (
          filteredCustomers.length === 0 ? (
            <div className="reports-empty">
              <Users size={38} />
              <h3>No customer data</h3>
              <p>No customers match your current search.</p>
            </div>
          ) : (
            <div className="reports-table-wrapper">
              <table>
                <thead>
                  <tr>
                    <th>Customer</th>
                    <th>Business</th>
                    <th>Phone</th>
                    <th>Email</th>
                    <th>Type</th>
                    <th>Status</th>
                    <th>Challans</th>
                    <th>Follow-ups</th>
                  </tr>
                </thead>

                <tbody>
                  {filteredCustomers.map((customer) => (
                    <tr key={customer.id}>
                      <td>
                        <strong>{customer.customerName}</strong>
                      </td>

                      <td>{customer.businessName || "—"}</td>

                      <td>{customer.phone || "—"}</td>

                      <td>{customer.email || "—"}</td>

                      <td>
                        <span className="report-tag">
                          {customer.customerType || "—"}
                        </span>
                      </td>

                      <td>
                        <span className="report-status healthy">
                          {customer.status || "Active"}
                        </span>
                      </td>

                      <td>{customer.challans?.length || 0}</td>

                      <td>{customer.followUps?.length || 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )
        ) : filteredChallans.length === 0 ? (
          <div className="reports-empty">
            <ShoppingCart size={38} />
            <h3>No challan data</h3>
            <p>No challans match your current search.</p>
          </div>
        ) : (
          <div className="reports-table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Challan</th>
                  <th>Customer</th>
                  <th>Business</th>
                  <th>Items</th>
                  <th>Value</th>
                  <th>Status</th>
                  <th>Created by</th>
                  <th>Date</th>
                </tr>
              </thead>

              <tbody>
                {filteredChallans.map((challan) => (
                  <tr key={challan.id}>
                    <td>
                      <strong>
                        {challan.challanNumber || challan.id}
                      </strong>
                    </td>

                    <td>
                      {challan.customer?.customerName || "Unknown customer"}
                    </td>

                    <td>
                      {challan.customer?.businessName || "—"}
                    </td>

                    <td>{challan.items?.length || 0}</td>

                    <td>
                      {formatCurrency(challan.totalAmount || 0)}
                    </td>

                    <td>
                      <span className="report-status">
                        {challan.status || "Draft"}
                      </span>
                    </td>

                    <td>{challan.createdBy?.name || "—"}</td>

                    <td>
                      <span className="report-date">
                        <CalendarDays size={15} />
                        {formatDate(challan.createdAt)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeReport === "challans" && challans.length > 0 && (
          <div className="reports-footer-summary">
            <span>Total challan value</span>
            <strong>{formatCurrency(challanValue)}</strong>
          </div>
        )}
      </div>
    </div>
  );
}