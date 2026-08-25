import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";

const AccountLedger = () => {
  /* ============================
     STATE
  ============================ */
  const [accounts, setAccounts] = useState([]);
  const [ledger, setLedger] = useState([]);
  const [loading, setLoading] = useState(false);

  const [accountId, setAccountId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);

  /* ============================
     LOAD ACCOUNTS (DROPDOWN)
  ============================ */
  const loadAccounts = async () => {
    try {
      setLoading(true);
      const res = await api.get("/accounts");
      setAccounts(res.data.accounts || []);
    } catch {
      toast.error("Failed to load accounts");
    }
    finally {
    setLoading(false);
  }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  /* ============================
     LOAD LEDGER
  ============================ */
 const loadLedger = async () => {
  try {
    setLoading(true);
    const params = { page, limit };

    if (accountId) params.account = accountId;
    if (startDate) params.startDate = startDate;
    if (endDate) params.endDate = endDate;

    const res = await api.get("/account-ledger", { params });

    console.log("LEDGER RESPONSE:", res.data);

    setLedger(res.data.ledger || []);
    setTotalPages(res.data.totalPages || 1);
  } catch (err) {
    if (err.response?.status === 403) {
      toast.error("Access Denied");
    }
    else{
    console.error(err);
    toast.error("Failed to load ledger");
}
  }
  finally {
    setLoading(false);
  }
};
useEffect(() => {
  loadLedger();
}, [accountId, startDate, endDate, page]);
  /* ============================
     RENDER
  ============================ */
  return (
    <div >
      {/* ================= HEADER ================= */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Account Ledger</h1>
        <p className="text-sm text-gray-600">
          Transaction history for selected account
        </p>
      </div>

      {/* ================= FILTER BAR ================= */}
    
      <div className="bg-white p-4 rounded-xl shadow mb-4">
  <div className="flex flex-col gap-4 sm:flex-row sm:flex-wrap sm:items-end">

    {/* ACCOUNT SELECT */}
    <div className="w-full sm:w-64">
      <select
        className="w-full border rounded-lg px-3 py-2"
        value={accountId}
        onChange={(e) => {
          setAccountId(e.target.value);
          setPage(1);
        }}
      >
        <option value="">Select Account</option>
        {accounts.map((a) => (
          <option key={a._id} value={a._id}>
            {a.name}
          </option>
        ))}
      </select>
    </div>

    {/* START DATE */}
    <div className="w-full sm:w-44">
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={startDate}
        onChange={(e) => {
          setStartDate(e.target.value);
          setPage(1);
        }}
      />
    </div>

    {/* END DATE */}
    <div className="w-full sm:w-44">
      <input
        type="date"
        className="w-full border rounded-lg px-3 py-2"
        value={endDate}
        onChange={(e) => {
          setEndDate(e.target.value);
          setPage(1);
        }}
      />
    </div>

    {/* CLEAR BUTTON */}
    <div className="w-full sm:w-auto">
      <button
        onClick={() => {
          setAccountId("");
          setStartDate("");
          setEndDate("");
          setPage(1);
        }}
        className="w-full sm:w-auto border rounded-lg px-4 py-2 hover:bg-slate-100 transition"
      >
        Clear
      </button>
    </div>

  </div>
</div>


      {/* ================= TABLE ================= */}
      <div className="bg-white rounded-2xl shadow overflow-x-auto">
        <table className="w-full table-fixed text-sm">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="p-4 text-left">Date</th>
              <th className="p-4 text-left">Description</th>
              <th className="p-4 text-left">Account Name</th>
              <th className="p-4 text-center">Type</th>
              <th className="p-4 text-right">Amount</th>
              <th className="p-4 text-right">Balance</th>
            </tr>
          </thead>
{loading ? (
      <tbody>
        <tr>
          <td colSpan="6" className="h-40">
            <div className="flex justify-center items-center">
              <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          </td>
        </tr>
      </tbody>
    ) :
        (  <tbody>
            {!ledger.length && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-gray-500">
                  No ledger entries found
                </td>
              </tr>
            )}

            {ledger.map((l, idx) => (
              <tr
                key={idx}
                className={`${idx % 2 ? "bg-gray-50" : "bg-white"} border-b`}
              >
               <td className="p-4 text-gray-600">
  {new Date(l.createdAt).toLocaleDateString()}
</td>


                <td className="p-4">{l.description}</td>
                <td className="p-5">{l.account.name}</td>

                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      l.type === "Credit"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {l.type}
                  </span>
                </td>

                <td className="p-4 text-right font-semibold">
                  {Number(l.amount).toLocaleString()}
                </td>

                <td className="p-4 text-right font-semibold tabular-nums">
                  {Number(l.balanceAfter).toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>)}
        </table>
          
          <div className="flex justify-between items-center p-4">
          <button
            disabled={page === 1}
            onClick={() => setPage((p) => Math.max(p - 1, 1))}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Previous
          </button>

          <span className="text-sm text-gray-600">
            Page {page} of {totalPages}
          </span>

          <button
            disabled={page === totalPages}
            onClick={() =>
              setPage((p) => Math.min(p + 1, totalPages))
            }
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= PAGINATION ================= */}
    
    </div>
  );
};

export default AccountLedger;
