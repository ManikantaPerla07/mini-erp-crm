import {
  useEffect,
  useMemo,
  useState,
} from "react";
import {
  AnimatePresence,
  motion,
} from "framer-motion";
import {
  Plus,
  Search,
  RefreshCw,
  Users,
  Building2,
  Phone,
  Mail,
  MapPin,
  Pencil,
  Trash2,
  Eye,
  X,
  ChevronDown,
  UserRound,
  CheckCircle2,
  AlertCircle,
  UserPlus,
} from "lucide-react";

import {
  createCustomer,
  deleteCustomer,
  getCustomers,
  updateCustomer,
} from "../services/customer.service";

import type {
  Customer,
  CustomerStatus,
  CustomerType,
  CreateCustomerPayload,
} from "../types/customer";

import "./Customers.css";

const EMPTY_FORM: CreateCustomerPayload = {
  customerName: "",
  mobile: "",
  email: "",
  businessName: "",
  gstNumber: "",
  customerType: "RETAIL",
  address: "",
  status: "ACTIVE",
};

function getInitials(name: string) {
  return name
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function statusLabel(status: CustomerStatus) {
  return {
    LEAD: "Lead",
    ACTIVE: "Active",
    INACTIVE: "Inactive",
  }[status];
}

function typeLabel(type: CustomerType) {
  return {
    RETAIL: "Retail",
    WHOLESALE: "Wholesale",
    DISTRIBUTOR: "Distributor",
  }[type];
}

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<
    CustomerType | "ALL"
  >("ALL");
  const [statusFilter, setStatusFilter] = useState<
    CustomerStatus | "ALL"
  >("ALL");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] =
    useState<Customer | null>(null);

  const [deleteTarget, setDeleteTarget] =
    useState<Customer | null>(null);
  const [viewCustomer, setViewCustomer] =
    useState<Customer | null>(null);

  const [form, setForm] =
    useState<CreateCustomerPayload>(EMPTY_FORM);

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const storedUser = localStorage.getItem("user");

  let isAdmin = false;

  try {
    if (storedUser) {
      const user = JSON.parse(storedUser);
      isAdmin = user?.role === "ADMIN";
    }
  } catch {
    isAdmin = false;
  }

  async function loadCustomers(showRefresh = false) {
    try {
      setError("");

      if (showRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      const data = await getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to load customers."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    loadCustomers();
  }, []);

  const filteredCustomers = useMemo(() => {
    const query = search.trim().toLowerCase();

    return customers.filter((customer) => {
      const matchesSearch =
        !query ||
        customer.customerName
          .toLowerCase()
          .includes(query) ||
        customer.businessName
          .toLowerCase()
          .includes(query) ||
        customer.mobile
          .toLowerCase()
          .includes(query) ||
        customer.email
          ?.toLowerCase()
          .includes(query) ||
        customer.gstNumber
          ?.toLowerCase()
          .includes(query);

      const matchesType =
        typeFilter === "ALL" ||
        customer.customerType === typeFilter;

      const matchesStatus =
        statusFilter === "ALL" ||
        customer.status === statusFilter;

      return (
        matchesSearch &&
        matchesType &&
        matchesStatus
      );
    });
  }, [
    customers,
    search,
    typeFilter,
    statusFilter,
  ]);

  const activeCount = customers.filter(
    (customer) => customer.status === "ACTIVE"
  ).length;

  const leadCount = customers.filter(
    (customer) => customer.status === "LEAD"
  ).length;

  const inactiveCount = customers.filter(
    (customer) => customer.status === "INACTIVE"
  ).length;

  function openCreateModal() {
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
    setError("");
    setModalOpen(true);
  }

  function openEditModal(customer: Customer) {
    setEditingCustomer(customer);

    setForm({
      customerName: customer.customerName,
      mobile: customer.mobile,
      email: customer.email ?? "",
      businessName: customer.businessName,
      gstNumber: customer.gstNumber ?? "",
      customerType: customer.customerType,
      address: customer.address,
      status: customer.status,
    });

    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    setEditingCustomer(null);
    setForm(EMPTY_FORM);
  }

  function updateField(
    field: keyof CreateCustomerPayload,
    value: string
  ) {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(
    event: React.FormEvent
  ) {
    event.preventDefault();

    if (
      !form.customerName.trim() ||
      !form.mobile.trim() ||
      !form.businessName.trim() ||
      !form.address.trim()
    ) {
      setError(
        "Please complete all required fields."
      );
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload: CreateCustomerPayload = {
        customerName: form.customerName.trim(),
        mobile: form.mobile.trim(),
        businessName: form.businessName.trim(),
        address: form.address.trim(),
        customerType: form.customerType,
        status: form.status,
      };

      if (form.email?.trim()) {
        payload.email = form.email.trim();
      }

      if (form.gstNumber?.trim()) {
        payload.gstNumber =
          form.gstNumber.trim();
      }

      if (editingCustomer) {
        const updated =
          await updateCustomer(
            editingCustomer.id,
            payload
          );

        setCustomers((previous) =>
          previous.map((customer) =>
            customer.id === updated.id
              ? updated
              : customer
          )
        );

        setSuccess(
          "Customer updated successfully."
        );
      } else {
        const created =
          await createCustomer(payload);

        setCustomers((previous) => [
          created,
          ...previous,
        ]);

        setSuccess(
          "Customer created successfully."
        );
      }

      closeModal();

      window.setTimeout(
        () => setSuccess(""),
        3000
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to save customer."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;

    try {
      setDeleting(true);
      setError("");

      await deleteCustomer(deleteTarget.id);

      setCustomers((previous) =>
        previous.filter(
          (customer) =>
            customer.id !== deleteTarget.id
        )
      );

      setDeleteTarget(null);

      setSuccess(
        "Customer deleted successfully."
      );

      window.setTimeout(
        () => setSuccess(""),
        3000
      );
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          "Unable to delete customer."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="customers-page">
      <div className="customers-header">
        <div>
          <div className="customers-eyebrow">
            CUSTOMER MANAGEMENT
          </div>

          <h1>Customers</h1>

          <p>
            Manage your customer relationships,
            business details and account status.
          </p>
        </div>

        <div className="customers-header-actions">
          <button
            className="customers-refresh-button"
            onClick={() => loadCustomers(true)}
            disabled={refreshing}
          >
            <RefreshCw
              size={17}
              className={
                refreshing
                  ? "customers-spin"
                  : ""
              }
            />

            Refresh
          </button>

          {isAdmin && (
            <button
              className="customers-primary-button"
              onClick={openCreateModal}
            >
              <Plus size={18} />

              Add customer
            </button>
          )}
        </div>
      </div>

      <div className="customer-stat-grid">
        <StatCard
          icon={<Users size={20} />}
          label="Total customers"
          value={customers.length}
          caption="Across your workspace"
        />

        <StatCard
          icon={<CheckCircle2 size={20} />}
          label="Active"
          value={activeCount}
          caption="Currently active"
          positive
        />

        <StatCard
          icon={<UserPlus size={20} />}
          label="Leads"
          value={leadCount}
          caption="Potential customers"
        />

        <StatCard
          icon={<AlertCircle size={20} />}
          label="Inactive"
          value={inactiveCount}
          caption="Currently inactive"
        />
      </div>

      <div className="customers-card">
        <div className="customers-toolbar">
          <div className="customer-search">
            <Search size={18} />

            <input
              value={search}
              onChange={(event) =>
                setSearch(event.target.value)
              }
              placeholder="Search customers, businesses, phone or GST..."
            />

            {search && (
              <button
                onClick={() => setSearch("")}
                className="clear-search"
              >
                <X size={15} />
              </button>
            )}
          </div>

          <div className="customer-filters">
            <FilterSelect
              value={typeFilter}
              onChange={(value) =>
                setTypeFilter(
                  value as CustomerType | "ALL"
                )
              }
              options={[
                ["ALL", "All types"],
                ["RETAIL", "Retail"],
                ["WHOLESALE", "Wholesale"],
                ["DISTRIBUTOR", "Distributor"],
              ]}
            />

            <FilterSelect
              value={statusFilter}
              onChange={(value) =>
                setStatusFilter(
                  value as CustomerStatus | "ALL"
                )
              }
              options={[
                ["ALL", "All statuses"],
                ["ACTIVE", "Active"],
                ["LEAD", "Lead"],
                ["INACTIVE", "Inactive"],
              ]}
            />
          </div>
        </div>

        {error && !modalOpen && (
          <div className="customers-alert error">
            <AlertCircle size={18} />
            {error}
          </div>
        )}

        {success && (
          <div className="customers-alert success">
            <CheckCircle2 size={18} />
            {success}
          </div>
        )}

        <div className="customers-table-wrap">
          {loading ? (
            <CustomerTableSkeleton />
          ) : filteredCustomers.length === 0 ? (
            <EmptyCustomers
              hasFilters={
                Boolean(search) ||
                typeFilter !== "ALL" ||
                statusFilter !== "ALL"
              }
              onClear={() => {
                setSearch("");
                setTypeFilter("ALL");
                setStatusFilter("ALL");
              }}
              onCreate={
                isAdmin
                  ? openCreateModal
                  : undefined
              }
            />
          ) : (
            <table className="customers-table">
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Business</th>
                  <th>Contact</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Added</th>
                  {isAdmin && (
                    <th className="actions-column">
                      Actions
                    </th>
                  )}
                </tr>
              </thead>

              <tbody>
                {filteredCustomers.map(
                  (customer, index) => (
                    <motion.tr
                      key={customer.id}
                      initial={{
                        opacity: 0,
                        y: 8,
                      }}
                      animate={{
                        opacity: 1,
                        y: 0,
                      }}
                      transition={{
                        delay: index * 0.025,
                      }}
                    >
                      <td>
                        <div className="customer-identity">
                          <div className="customer-avatar">
                            {getInitials(
                              customer.customerName
                            )}
                          </div>

                          <div>
                            <div className="customer-name">
                              {customer.customerName}
                            </div>

                            <div className="customer-gst">
                              {customer.gstNumber ||
                                "GST not provided"}
                            </div>
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="business-cell">
                          <Building2 size={16} />

                          <span>
                            {customer.businessName}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="contact-cell">
                          <div>
                            <Phone size={13} />
                            {customer.mobile}
                          </div>

                          {customer.email && (
                            <div>
                              <Mail size={13} />
                              {customer.email}
                            </div>
                          )}
                        </div>
                      </td>

                      <td>
                        <span className="customer-type-badge">
                          {typeLabel(
                            customer.customerType
                          )}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`customer-status-badge ${customer.status.toLowerCase()}`}
                        >
                          <span />
                          {statusLabel(
                            customer.status
                          )}
                        </span>
                      </td>

                      <td>
                        <span className="date-cell">
                          {formatDate(
                            customer.createdAt
                          )}
                        </span>
                      </td>

                      {isAdmin && (
                        <td>
                          <div className="row-actions">
  <button
    title="View customer"
    onClick={() => setViewCustomer(customer)}
  >
    <Eye size={16} />
  </button>

  <button
    title="Edit customer"
    onClick={() =>
      openEditModal(customer)
    }
  >
    <Pencil size={16} />
  </button>

  <button
    title="Delete customer"
                              className="danger"
                              onClick={() =>
                                setDeleteTarget(
                                  customer
                                )
                              }
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      )}
                    </motion.tr>
                  )
                )}
              </tbody>
            </table>
          )}
        </div>

        {!loading &&
          filteredCustomers.length > 0 && (
            <div className="customers-footer">
              <span>
                Showing{" "}
                <strong>
                  {filteredCustomers.length}
                </strong>{" "}
                of{" "}
                <strong>
                  {customers.length}
                </strong>{" "}
                customers
              </span>

              <span className="footer-location">
                <MapPin size={14} />
                Nexora workspace
              </span>
            </div>
          )}
      </div>

      <AnimatePresence>
        {modalOpen && (
          <motion.div
            className="customer-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={closeModal}
          >
            <motion.div
              className="customer-modal"
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              transition={{
                duration: 0.2,
              }}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <div className="modal-icon">
                    <UserRound size={20} />
                  </div>

                  <h2>
                    {editingCustomer
                      ? "Edit customer"
                      : "Add customer"}
                  </h2>

                  <p>
                    {editingCustomer
                      ? "Update the customer's business information."
                      : "Add a new customer to your workspace."}
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={closeModal}
                >
                  <X size={20} />
                </button>
              </div>

              {error && (
                <div className="customers-alert error modal-alert">
                  <AlertCircle size={17} />
                  {error}
                </div>
              )}

              <form
                className="customer-form"
                onSubmit={handleSubmit}
              >
                <div className="form-section-title">
                  Customer information
                </div>

                <div className="form-grid">
                  <FormField
                    label="Customer name"
                    required
                    value={form.customerName}
                    onChange={(value) =>
                      updateField(
                        "customerName",
                        value
                      )
                    }
                    placeholder="e.g. Rahul Sharma"
                  />

                  <FormField
                    label="Mobile"
                    required
                    value={form.mobile}
                    onChange={(value) =>
                      updateField(
                        "mobile",
                        value
                      )
                    }
                    placeholder="e.g. 9876543210"
                  />

                  <FormField
                    label="Business name"
                    required
                    value={form.businessName}
                    onChange={(value) =>
                      updateField(
                        "businessName",
                        value
                      )
                    }
                    placeholder="e.g. Rahul Electronics"
                  />

                  <FormField
                    label="Email"
                    type="email"
                    value={form.email ?? ""}
                    onChange={(value) =>
                      updateField(
                        "email",
                        value
                      )
                    }
                    placeholder="customer@example.com"
                  />

                  <FormField
                    label="GST number"
                    value={form.gstNumber ?? ""}
                    onChange={(value) =>
                      updateField(
                        "gstNumber",
                        value.toUpperCase()
                      )
                    }
                    placeholder="e.g. 29ABCDE1234F1Z5"
                  />

                  <SelectField
                    label="Customer type"
                    value={form.customerType}
                    onChange={(value) =>
                      updateField(
                        "customerType",
                        value
                      )
                    }
                    options={[
                      ["RETAIL", "Retail"],
                      [
                        "WHOLESALE",
                        "Wholesale",
                      ],
                      [
                        "DISTRIBUTOR",
                        "Distributor",
                      ],
                    ]}
                  />

                  <SelectField
                    label="Status"
                    value={form.status}
                    onChange={(value) =>
                      updateField(
                        "status",
                        value
                      )
                    }
                    options={[
                      ["ACTIVE", "Active"],
                      ["LEAD", "Lead"],
                      [
                        "INACTIVE",
                        "Inactive",
                      ],
                    ]}
                  />

                  <div className="form-field full">
                    <label>
                      Address{" "}
                      <span>*</span>
                    </label>

                    <textarea
                      value={form.address}
                      onChange={(event) =>
                        updateField(
                          "address",
                          event.target.value
                        )
                      }
                      placeholder="Enter customer address"
                      rows={3}
                    />
                  </div>
                </div>

                <div className="modal-footer">
                  <button
                    type="button"
                    className="modal-cancel"
                    onClick={closeModal}
                    disabled={saving}
                  >
                    Cancel
                  </button>

                  <button
                    type="submit"
                    className="modal-save"
                    disabled={saving}
                  >
                    {saving ? (
                      <>
                        <RefreshCw
                          size={17}
                          className="customers-spin"
                        />
                        Saving...
                      </>
                    ) : (
                      <>
                        {editingCustomer
                          ? "Save changes"
                          : "Create customer"}
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deleteTarget && (
          <motion.div
            className="customer-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() =>
              !deleting &&
              setDeleteTarget(null)
            }
          >
            <motion.div
              className="delete-dialog"
              initial={{
                opacity: 0,
                scale: 0.95,
              }}
              animate={{
                opacity: 1,
                scale: 1,
              }}
              exit={{
                opacity: 0,
                scale: 0.95,
              }}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="delete-icon">
                <Trash2 size={22} />
              </div>

              <h2>Delete customer?</h2>

              <p>
                You're about to permanently delete{" "}
                <strong>
                  {deleteTarget.customerName}
                </strong>{" "}
                from the workspace.
              </p>

              <div className="delete-actions">
                <button
                  onClick={() =>
                    setDeleteTarget(null)
                  }
                  disabled={deleting}
                  className="modal-cancel"
                >
                  Cancel
                </button>

                <button
                  onClick={handleDelete}
                  disabled={deleting}
                  className="delete-confirm"
                >
                  {deleting
                    ? "Deleting..."
                    : "Delete customer"}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
            <AnimatePresence>
        {viewCustomer && (
          <motion.div
            className="customer-modal-overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onMouseDown={() => setViewCustomer(null)}
          >
            <motion.div
              className="customer-detail-modal"
              initial={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              animate={{
                opacity: 1,
                scale: 1,
                y: 0,
              }}
              exit={{
                opacity: 0,
                scale: 0.96,
                y: 12,
              }}
              transition={{ duration: 0.2 }}
              onMouseDown={(event) =>
                event.stopPropagation()
              }
            >
              <div className="modal-header">
                <div>
                  <div className="modal-icon">
                    <UserRound size={20} />
                  </div>

                  <h2>{viewCustomer.customerName}</h2>

                  <p>
                    Customer profile and business information
                  </p>
                </div>

                <button
                  className="modal-close"
                  onClick={() => setViewCustomer(null)}
                >
                  <X size={20} />
                </button>
              </div>

              <div className="customer-detail-body">
                <div className="customer-detail-hero">
                  <div className="customer-detail-avatar">
                    {getInitials(
                      viewCustomer.customerName
                    )}
                  </div>

                  <div>
                    <h3>
                      {viewCustomer.customerName}
                    </h3>

                    <span
                      className={`customer-status-badge ${viewCustomer.status.toLowerCase()}`}
                    >
                      <span />
                      {statusLabel(viewCustomer.status)}
                    </span>
                  </div>
                </div>

                <div className="customer-detail-grid">
                  <DetailItem
                    label="Business"
                    value={viewCustomer.businessName}
                    icon={<Building2 size={17} />}
                  />

                  <DetailItem
                    label="Customer type"
                    value={typeLabel(
                      viewCustomer.customerType
                    )}
                    icon={<Users size={17} />}
                  />

                  <DetailItem
                    label="Mobile"
                    value={viewCustomer.mobile}
                    icon={<Phone size={17} />}
                  />

                  <DetailItem
                    label="Email"
                    value={
                      viewCustomer.email ||
                      "Not provided"
                    }
                    icon={<Mail size={17} />}
                  />

                  <DetailItem
                    label="GST number"
                    value={
                      viewCustomer.gstNumber ||
                      "Not provided"
                    }
                    icon={<Building2 size={17} />}
                  />

                  <DetailItem
                    label="Added on"
                    value={formatDate(
                      viewCustomer.createdAt
                    )}
                    icon={<CheckCircle2 size={17} />}
                  />

                  <div className="customer-detail-item full">
                    <div className="detail-item-icon">
                      <MapPin size={17} />
                    </div>

                    <div>
                      <span>Address</span>
                      <strong>
                        {viewCustomer.address}
                      </strong>
                    </div>
                  </div>
                </div>
              </div>

              <div className="modal-footer">
                <button
                  className="modal-cancel"
                  onClick={() => setViewCustomer(null)}
                >
                  Close
                </button>

                {isAdmin && (
                  <button
                    className="modal-save"
                    onClick={() => {
                      setViewCustomer(null);
                      openEditModal(viewCustomer);
                    }}
                  >
                    <Pencil size={16} />
                    Edit customer
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  caption,
  positive,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  caption: string;
  positive?: boolean;
}) {
  return (
    <motion.div
      className="customer-stat-card"
      whileHover={{ y: -2 }}
    >
      <div className="customer-stat-icon">
        {icon}
      </div>

      <div className="customer-stat-content">
        <span>{label}</span>

        <strong>{value}</strong>

        <small className={positive ? "positive" : ""}>
          {caption}
        </small>
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
  options: [string, string][];
}) {
  return (
    <div className="filter-select">
      <select
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>

      <ChevronDown size={15} />
    </div>
  );
}

function FormField({
  label,
  required,
  value,
  onChange,
  placeholder,
  type = "text",
}: {
  label: string;
  required?: boolean;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: string;
}) {
  return (
    <div className="form-field">
      <label>
        {label}{" "}
        {required && <span>*</span>}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) =>
          onChange(event.target.value)
        }
        placeholder={placeholder}
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: [string, string][];
}) {
  return (
    <div className="form-field">
      <label>{label}</label>

      <div className="form-select">
        <select
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
        >
          {options.map(([optionValue, text]) => (
            <option
              key={optionValue}
              value={optionValue}
            >
              {text}
            </option>
          ))}
        </select>

        <ChevronDown size={16} />
      </div>
    </div>
  );
}

function CustomerTableSkeleton() {
  return (
    <div className="customer-skeleton">
      {Array.from({ length: 5 }).map(
        (_, index) => (
          <div
            className="skeleton-row"
            key={index}
          >
            <div className="skeleton-customer">
              <div className="skeleton-circle" />

              <div>
                <div className="skeleton-line medium" />
                <div className="skeleton-line short" />
              </div>
            </div>

            <div className="skeleton-line medium" />
            <div className="skeleton-line medium" />
            <div className="skeleton-pill" />
            <div className="skeleton-pill" />
            <div className="skeleton-line short" />
          </div>
        )
      )}
    </div>
  );
}

function EmptyCustomers({
  hasFilters,
  onClear,
  onCreate,
}: {
  hasFilters: boolean;
  onClear: () => void;
  onCreate?: () => void;
}) {
  return (
    <div className="customers-empty">
      <div className="empty-icon">
        <Users size={26} />
      </div>

      <h3>
        {hasFilters
          ? "No customers found"
          : "No customers yet"}
      </h3>

      <p>
        {hasFilters
          ? "Try adjusting your search or filters."
          : "Add your first customer to start managing your relationships."}
      </p>

      <div className="empty-actions">
        {hasFilters && (
          <button
            className="modal-cancel"
            onClick={onClear}
          >
            Clear filters
          </button>
        )}

        {onCreate && !hasFilters && (
          <button
            className="modal-save"
            onClick={onCreate}
          >
            <Plus size={17} />
            Add customer
          </button>
        )}
      </div>
    </div>
  );
}
function DetailItem({
  label,
  value,
  icon,
  full,
}: {
  label: string;
  value: string;
  icon: React.ReactNode;
  full?: boolean;
}) {
  return (
    <div
      className={`customer-detail-item ${
        full ? "full" : ""
      }`}
    >
      <div className="detail-item-icon">
        {icon}
      </div>

      <div>
        <span>{label}</span>
        <strong>{value}</strong>
      </div>
    </div>
  );
}