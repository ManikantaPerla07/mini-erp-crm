import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Clock,
  Edit3,
  Plus,
  RefreshCw,
  Search,
  Trash2,
  UserRound,
  X,
} from "lucide-react";

type Customer = {
  id: string;
  name: string;
  businessName?: string | null;
};

type User = {
  id: string;
  name: string;
  email: string;
  role: string;
};

type Followup = {
  id: string;
  customerId: string;
  note: string;
  followupDate: string;
  customer: Customer;
  createdBy: User;
};

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

function getHeaders() {
  const token = localStorage.getItem("token");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString("en-IN", {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function getStatus(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();

  if (date < now) {
    return "OVERDUE";
  }

  if (date.toDateString() === now.toDateString()) {
    return "TODAY";
  }

  return "UPCOMING";
}

function toLocalDateTimeInput(dateString: string) {
  const date = new Date(dateString);

  const offset = date.getTimezoneOffset();
  const localDate = new Date(date.getTime() - offset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

export default function Followups() {
  const [followups, setFollowups] = useState<Followup[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [customerId, setCustomerId] = useState("");
  const [note, setNote] = useState("");
  const [followupDate, setFollowupDate] = useState("");

  const [error, setError] = useState("");

  async function loadData() {
    try {
      setLoading(true);
      setError("");

      const [followupsResponse, customersResponse] = await Promise.all([
        fetch(`${API_BASE_URL}/followups`, {
          headers: getHeaders(),
        }),
        fetch(`${API_BASE_URL}/customers`, {
          headers: getHeaders(),
        }),
      ]);

      if (!followupsResponse.ok) {
        throw new Error("Failed to load follow-ups");
      }

      if (!customersResponse.ok) {
        throw new Error("Failed to load customers");
      }

      const followupsData = await followupsResponse.json();
      const customersData = await customersResponse.json();

      setFollowups(followupsData.data || []);
      setCustomers(customersData.data || []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  function resetForm() {
    setCustomerId("");
    setNote("");
    setFollowupDate("");
    setEditingId(null);
    setError("");
  }

  function openCreateModal() {
    resetForm();
    setModalOpen(true);
  }

  function openEditModal(followup: Followup) {
    setEditingId(followup.id);
    setCustomerId(followup.customerId);
    setNote(followup.note);
    setFollowupDate(toLocalDateTimeInput(followup.followupDate));
    setError("");
    setModalOpen(true);
  }

  function closeModal() {
    if (saving) return;

    setModalOpen(false);
    resetForm();
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();

    if (!customerId) {
      setError("Please select a customer.");
      return;
    }

    if (note.trim().length < 3) {
      setError("Note must be at least 3 characters.");
      return;
    }

    if (!followupDate) {
      setError("Please select a follow-up date.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const body = {
        customerId,
        note: note.trim(),
        followupDate: new Date(followupDate).toISOString(),
      };

      const url = editingId
        ? `${API_BASE_URL}/followups/${editingId}`
        : `${API_BASE_URL}/followups`;

      const response = await fetch(url, {
        method: editingId ? "PUT" : "POST",
        headers: getHeaders(),
        body: JSON.stringify(body),
      });

      const responseText = await response.text();

console.log("FOLLOW-UP RESPONSE STATUS:", response.status);
console.log("FOLLOW-UP RESPONSE URL:", response.url);
console.log("FOLLOW-UP RESPONSE:", responseText);

let result;

try {
  result = JSON.parse(responseText);
} catch {
  throw new Error(
    `Server returned non-JSON response (${response.status}). Check the browser console.`
  );
}

      if (!response.ok) {
        throw new Error(result.message || "Failed to save follow-up");
      }

      setModalOpen(false);
      resetForm();

      await loadData();
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to save follow-up"
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    const confirmed = window.confirm(
      "Are you sure you want to delete this follow-up?"
    );

    if (!confirmed) return;

    try {
      const response = await fetch(
        `${API_BASE_URL}/followups/${id}`,
        {
          method: "DELETE",
          headers: getHeaders(),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Failed to delete follow-up");
      }

      setFollowups((current) =>
        current.filter((followup) => followup.id !== id)
      );
    } catch (err) {
      window.alert(
        err instanceof Error
          ? err.message
          : "Failed to delete follow-up"
      );
    }
  }

  const filteredFollowups = useMemo(() => {
    const query = search.trim().toLowerCase();

    if (!query) return followups;

    return followups.filter((followup) => {
      const customerName = followup.customer?.name?.toLowerCase() || "";
      const businessName =
        followup.customer?.businessName?.toLowerCase() || "";
      const noteText = followup.note.toLowerCase();

      return (
        customerName.includes(query) ||
        businessName.includes(query) ||
        noteText.includes(query)
      );
    });
  }, [followups, search]);

  const stats = useMemo(() => {
    let overdue = 0;
    let today = 0;
    let upcoming = 0;

    followups.forEach((followup) => {
      const status = getStatus(followup.followupDate);

      if (status === "OVERDUE") overdue++;
      else if (status === "TODAY") today++;
      else upcoming++;
    });

    return {
      total: followups.length,
      overdue,
      today,
      upcoming,
    };
  }, [followups]);

  return (
    <div className="page-container">
      {/* Header */}
      <div className="page-header">
        <div>
          <h1>Follow-ups</h1>
          <p>Manage customer follow-ups and CRM activities.</p>
        </div>

        <div className="page-header-actions">
          <button
            className="secondary-button"
            onClick={loadData}
            disabled={loading}
          >
            <RefreshCw size={17} />
            Refresh
          </button>

          <button
            className="primary-button"
            onClick={openCreateModal}
          >
            <Plus size={17} />
            New Follow-up
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>Total Follow-ups</span>
            <strong>{stats.total}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={20} />
          </div>

          <div>
            <span>Today</span>
            <strong>{stats.today}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <CalendarDays size={20} />
          </div>

          <div>
            <span>Upcoming</span>
            <strong>{stats.upcoming}</strong>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon">
            <Clock size={20} />
          </div>

          <div>
            <span>Overdue</span>
            <strong>{stats.overdue}</strong>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="table-toolbar">
        <div className="search-box">
          <Search size={18} />

          <input
            type="text"
            placeholder="Search customer or note..."
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
      </div>

      {error && !modalOpen && (
        <div className="error-banner">
          {error}
        </div>
      )}

      {/* Table */}
      <div className="data-card">
        {loading ? (
          <div className="empty-state">
            <RefreshCw size={24} className="loading-icon" />
            <p>Loading follow-ups...</p>
          </div>
        ) : filteredFollowups.length === 0 ? (
          <div className="empty-state">
            <CalendarDays size={35} />
            <h3>No follow-ups found</h3>
            <p>
              Create your first customer follow-up to get started.
            </p>

            <button
              className="primary-button"
              onClick={openCreateModal}
            >
              <Plus size={17} />
              New Follow-up
            </button>
          </div>
        ) : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Customer</th>
                  <th>Follow-up</th>
                  <th>Note</th>
                  <th>Created By</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>

              <tbody>
                {filteredFollowups.map((followup) => {
                  const status = getStatus(
                    followup.followupDate
                  );

                  return (
                    <tr key={followup.id}>
                      <td>
                        <div className="customer-cell">
                          <div className="customer-avatar">
                            {followup.customer?.name
                              ?.charAt(0)
                              ?.toUpperCase() || "C"}
                          </div>

                          <div>
                            <strong>
                              {followup.customer?.name ||
                                "Unknown customer"}
                            </strong>

                            {followup.customer?.businessName && (
                              <span>
                                {followup.customer.businessName}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td>
                        <div className="date-cell">
                          <strong>
                            {formatDate(
                              followup.followupDate
                            )}
                          </strong>

                          <span>
                            {formatTime(
                              followup.followupDate
                            )}
                          </span>
                        </div>
                      </td>

                      <td>
                        <div className="note-cell">
                          {followup.note}
                        </div>
                      </td>

                      <td>
                        <div className="created-by-cell">
                          <UserRound size={16} />

                          <span>
                            {followup.createdBy?.name ||
                              "Unknown"}
                          </span>
                        </div>
                      </td>

                      <td>
                        <span
                          className={`status-badge ${status.toLowerCase()}`}
                        >
                          {status}
                        </span>
                      </td>

                      <td>
                        <div className="action-buttons">
                          <button
                            className="icon-button"
                            title="Edit"
                            onClick={() =>
                              openEditModal(followup)
                            }
                          >
                            <Edit3 size={16} />
                          </button>

                          <button
                            className="icon-button danger"
                            title="Delete"
                            onClick={() =>
                              handleDelete(followup.id)
                            }
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="modal-overlay">
          <div className="modal-card">
            <div className="modal-header">
              <div>
                <h2>
                  {editingId
                    ? "Edit Follow-up"
                    : "New Follow-up"}
                </h2>

                <p>
                  Schedule a follow-up activity for a customer.
                </p>
              </div>

              <button
                className="modal-close"
                onClick={closeModal}
                disabled={saving}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit}>
              {error && (
                <div className="error-banner">
                  {error}
                </div>
              )}

              <div className="form-group">
                <label>
                  Customer <span>*</span>
                </label>

                <select
                  value={customerId}
                  onChange={(event) =>
                    setCustomerId(event.target.value)
                  }
                  disabled={saving || Boolean(editingId)}
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
              </div>

              <div className="form-group">
                <label>
                  Follow-up Date & Time <span>*</span>
                </label>

                <input
                  type="datetime-local"
                  value={followupDate}
                  onChange={(event) =>
                    setFollowupDate(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="form-group">
                <label>
                  Note <span>*</span>
                </label>

                <textarea
                  rows={5}
                  placeholder="Enter follow-up notes..."
                  value={note}
                  onChange={(event) =>
                    setNote(event.target.value)
                  }
                  disabled={saving}
                />
              </div>

              <div className="modal-footer">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={closeModal}
                  disabled={saving}
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  className="primary-button"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Update Follow-up"
                      : "Create Follow-up"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}