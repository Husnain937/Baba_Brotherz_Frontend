import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaToggleOn, FaToggleOff,FaEdit } from "react-icons/fa";
import AccountLedger from "./AccountLedger";
const Accounts = () => {
  /* ============================
     STATE
  ============================ */
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState("Account");
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [editAccount, setEditAccount] = useState(null); // will hold the account being edited
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [selectedType, setSelectedType] = useState("");

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [search]);

  const [form, setForm] = useState({
    name: "",
    type: "Cash",
    openingBalance: 0,
    note: "",
  });

  /* ============================
     LOAD ACCOUNTS
  ============================ */
  const loadAccounts = async () => {
    try {
       setLoading(true);
      const res = await api.get("/accounts", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          type: selectedType || undefined,
        },
      });

      setAccounts(res.data.accounts || []);
      setTotalPages(res.data.totalPages || 1);
    } catch (err) {
      toast.error("Failed to load accounts");
    }
    setLoading(false);
  };

  useEffect(() => {
  loadAccounts();
}, [debouncedSearch, page, limit,selectedType]); // reload when any of these change


  /* ============================
     CREATE ACCOUNT
  ============================ */
  // const submitForm = async (e) => {
  //   e.preventDefault();

  //   try {
  //     await api.post("/accounts", {
  //       ...form,
  //       openingBalance: Number(form.openingBalance),
  //     });

  //     toast.success("Account created");
  //     setShowForm(false);
  //     setForm({
  //       name: "",
  //       type: "Cash",
  //       openingBalance: 0,
  //       note: "",
  //     });
  //     loadAccounts();
  //   } catch (err) {
  //     toast.error(err.response?.data?.message || "Failed to create account");
  //   }
  // };
  const submitForm = async (e) => {
    e.preventDefault();
setLoading(true);
    try {
      if (editAccount) {
        // UPDATE
        await api.put(`/accounts/${editAccount._id}`, {
          ...form,
          openingBalance: Number(form.openingBalance),
        });
        toast.success("Account updated");
      } else {
        // CREATE
        await api.post("/accounts", {
          ...form,
          openingBalance: Number(form.openingBalance),
        });
        toast.success("Account created");
      }

      setShowForm(false);
      setEditAccount(null);
      setForm({
        name: "",
        type: "Cash",
        openingBalance: 0,
        note: "",
      });
      loadAccounts();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to save account");
    }
    setLoading(false);
  };

  /* ============================
     TOGGLE STATUS
  ============================ */
  const toggleStatus = async (id) => {
    try {
      setLoading(true);
      await api.patch(`/accounts/toggle/${id}`);
      loadAccounts();
    } catch {
      toast.error("Failed to update status");
    }
     setLoading(false);
  };

  /* ============================
     RENDER
  ============================ */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
       {loading && (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
    <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
  </div>
)}
      {/* TABS */}
      <div className="flex gap-6 mb-6 border-b">
        {[
          { key: "Account", label: "Account Master" },
          { key: "ledger", label: "Account Ledger" },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`
            pb-3 px-1 font-medium transition
            ${
              activeTab === tab.key
                ? "border-b-2 border-indigo-600 text-indigo-600"
                : "text-gray-600 hover:text-gray-800"
            }
          `}
          >
            {tab.label}
          </button>
        ))}
      </div>
      {activeTab === "Account" && (
        <>
          {/* ================= HEADER ================= */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Accounts</h1>
              <p className="text-sm text-gray-600">
                Cash, bank & payment accounts
              </p>
            </div>

            <button
              onClick={() => setShowForm(true)}
              className="
            flex items-center gap-2
            bg-gradient-to-r from-indigo-600 to-blue-600
            text-white px-5 py-2 rounded-lg
          "
            >
              <FaPlus /> Add Account
            </button>
          </div>
          {/* ================= FILTER BAR ================= */}
         <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-4">
  {/* 🔍 SEARCH */}
  <input
    type="text"
    placeholder="Search account..."
    className="border rounded-lg px-3 py-2 w-full md:w-1/3"
    value={search}
    onChange={(e) => setSearch(e.target.value)}
  />

  {/* 🟢 STATUS / TYPE FILTER */}
  <select
    className="border rounded-lg px-3 py-2 w-40"
    value={selectedType} // new state for filter
    onChange={(e) => {
      setSelectedType(e.target.value);
      setPage(1); // reset page when filter changes
    }}
  >
    <option value="">All</option>
    <option value="Cash">Cash</option>
    <option value="Bank">Bank</option>
    <option value="Wallet">Wallet</option>
  </select>

  {/* 📄 LIMIT */}
  <select
    value={limit}
    onChange={(e) => {
      setLimit(Number(e.target.value));
      setPage(1);
    }}
    className="border rounded-lg px-3 py-2 w-24"
  >
    {[5, 10, 20, 50].map((l) => (
      <option key={l} value={l}>
        {l}
      </option>
    ))}
  </select>
</div>


          {/* ================= TABLE ================= */}
          <div className="bg-white rounded-2xl shadow overflow-x-auto">
            <table className="w-full table-fixed text-sm">
              <thead className="bg-gray-100 border-b">
                <tr>
                  <th className="p-4 text-left">Account Name</th>
                  <th className="p-4 text-center">Type</th>
                  <th className="p-4 text-right">Balance</th>
                  <th className="p-4 text-center">Status</th>
                  <th className="p-4 text-center">Action</th>
                </tr>
              </thead>

              <tbody>
                {!accounts.length && (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No accounts found
                    </td>
                  </tr>
                )}

                {accounts.map((a, idx) => (
                  <tr
                    key={a._id}
                    className={`${
                      idx % 2 ? "bg-gray-50" : "bg-white"
                    } border-b`}
                  >
                    <td className="p-4 font-medium text-gray-800">{a.name}</td>

                    <td className="p-4 text-center capitalize">{a.type}</td>

                    <td className="p-4 text-right font-semibold tabular-nums">
                      {Number(a.currentBalance).toLocaleString()}
                    </td>
                    <td className="p-4 text-center">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          a.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-200 text-gray-600"
                        }`}
                      >
                        {a.status}
                      </span>
                    </td>

                    <td className="p-4 text-center">
                      <td className="p-4 text-center flex justify-center gap-2">
                        <button
                          onClick={() => {
                            setEditAccount(a); // set the account to edit
                            setForm({
                              name: a.name,
                              type: a.type,
                              openingBalance: a.openingBalance,
                              note: a.note || "",
                            });
                            setShowForm(true); // open the same form modal
                          }}
                          title="Edit Account"
                          className="text-blue-600"
                        >
                          <FaEdit/>
                        </button>
                          <button
                          onClick={() => toggleStatus(a._id)}
                          title="Toggle Status"
                          className="text-2xl"
                        >
                          {a.status === "Active" ? (
                            <FaToggleOn className="text-green-600" />
                          ) : (
                            <FaToggleOff className="text-gray-500" />
                          )}
                        </button>
                      </td>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* ================= PAGINATION ================= */}
            <div className="flex justify-between items-center p-4 border-t">
              <span className="text-sm text-gray-600">
                Page {page} of {totalPages}
              </span>

              <div className="flex gap-2">
                <button
                  disabled={page === 1}
                  onClick={() => setPage((p) => Math.max(p - 1, 1))}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Prev
                </button>

                <button
                  disabled={page === totalPages}
                  onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
                  className="px-4 py-2 border rounded-lg disabled:opacity-50"
                >
                  Next
                </button>
              </div>
            </div>
          </div>

          {/* ================= CREATE MODAL ================= */}
          {showForm && (
            <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
              <form
                onSubmit={submitForm}
                className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4"
              >
                <h2 className="text-lg font-semibold">Create Account</h2>

                <input
                  required
                  placeholder="Account Name"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                />

                <select
                  className="border rounded-lg px-3 py-2 w-full"
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value })}
                >
                  <option value="Cash">Cash</option>
                  <option value="Bank">Bank</option>
                  <option value="Wallet">Wallet</option>
                </select>

                <input
                  type="number"
                  placeholder="Opening Balance"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={form.openingBalance}
                  onChange={(e) =>
                    setForm({ ...form, openingBalance: e.target.value })
                  }
                />

                <textarea
                  placeholder="Note"
                  className="border rounded-lg px-3 py-2 w-full"
                  value={form.note}
                  onChange={(e) => setForm({ ...form, note: e.target.value })}
                />

                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowForm(false)}
                    className="px-4 py-2 border rounded-lg"
                  >
                    Cancel
                  </button>
                  <button
  type="submit"
  className="bg-green-600 text-white px-4 py-2 rounded"
  disabled={loading}>
  {editAccount ? "Update" : "Save"} 
</button>

                </div>
              </form>
            </div>
          )}
        </>
      )}
      {activeTab === "ledger" && (
        <>
          <AccountLedger></AccountLedger>
        </>
      )}
    </div>
  );
};

export default Accounts;
