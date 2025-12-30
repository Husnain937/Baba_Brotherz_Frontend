// /** @format */

// import React, { useEffect, useState } from "react";
// import api from "../api/axios";
// import { toast } from "react-toastify";
// import { FaPlus, FaCheck, FaEdit, FaTrash } from "react-icons/fa";

// const Wages = () => {
//   /* ============================
//      STATE
//   ============================ */
//   const [wages, setWages] = useState([]);
//   const [employees, setEmployees] = useState([]);
//   const [summary, setSummary] = useState(null);
//   const [showForm, setShowForm] = useState(false);
//   const [loadingPayId, setLoadingPayId] = useState(null);
//   const [editWage, setEditWage] = useState(null);
//   const [payWagesId, setPayWagesId] = useState(null);
//   const [accounts, setAccounts] = useState([]);
//   const [selectedAccount, setSelectedAccount] = useState("");
//   // list controls
//   const [page, setPage] = useState(1);
//   const [limit, setLimit] = useState(10);
//   const [totalPages, setTotalPages] = useState(1);

//   const [search, setSearch] = useState("");
//   const [debouncedSearch, setDebouncedSearch] = useState("");

//   const [status, setStatus] = useState("");
//   const [month, setMonth] = useState("");
//   const [year, setYear] = useState("");

//   const [sortBy, setSortBy] = useState("createdAt");
//   const [sortOrder, setSortOrder] = useState("desc");

//   /* ============================
//      FORM STATE
//   ============================ */
//   const [form, setForm] = useState({
//     employee: "",
//     month: "",
//     year: "",
//     baseSalary: 0,
//     additions: 0,
//     deductions: 0,
//     netSalary: 0,
//     note: "",
//   });

//   /* ============================
//      DEBOUNCE SEARCH
//   ============================ */
//   useEffect(() => {
//     const t = setTimeout(() => {
//       setDebouncedSearch(search.trim());
//       setPage(1);
//     }, 400);
//     return () => clearTimeout(t);
//   }, [search]);

//   /* ============================
//      LOAD DATA
//   ============================ */
//   const loadEmployees = async () => {
//     try {
//       const res = await api.get("/employees/dropdown/active");
//       setEmployees(res.data.employees || []);
//     } catch {
//       toast.error("Failed to load employees");
//     }
//   };

//   const deleteWage = async (id) => {
//     if (!window.confirm("Are u sure u want to delete this Wage")) return;
//     try {
//       const res = await api.delete(`/wages/waging/${id}`);
//       toast.success(res?.data?.message || "Deleted Successfully");
//       loadWages();
//     } catch (error) {
//       toast.error(error?.response?.data?.message || "Error");
//     }
//   };

//   const loadWages = async () => {
//     try {
//       const res = await api.get("/wages", {
//         params: {
//           page,
//           limit,
//           search: debouncedSearch,
//           status,
//           month,
//           year,
//           sortBy,
//           sortOrder,
//         },
//       });

//       setWages(res.data.wages || []);
//       setTotalPages(res.data.totalPages || 1);
//     } catch {
//       toast.error("Failed to load wages");
//     }
//   };

//   useEffect(() => {
//     loadWages();
//   }, [page, limit, debouncedSearch, status, month, year, sortBy, sortOrder]);

//   /* ============================
//      HANDLE EMPLOYEE SELECT
//   ============================ */
//   const handleEmployeeChange = (id) => {
//     const emp = employees.find((e) => e._id === id);
//     if (!emp) return;

//     const baseSalary = emp.monthlySalary;

//     setForm({
//       ...form,
//       employee: id,
//       baseSalary,
//       netSalary: baseSalary,
//     });
//   };
//   const loadPayrollSummary = async () => {
//     if (
//       !month ||
//       !year ||
//       String(year).length !== 4 ||
//       Number(month) < 1 ||
//       Number(month) > 12
//     ) {
//       return;
//     }

//     try {
//       const res = await api.get("/wages/summary", {
//         params: {
//           month: Number(month),
//           year: Number(year),
//         },
//       });

//       setSummary(res.data.summary);
//     } catch (err) {
//       console.error(err);
//       toast.error("Failed to load payroll summary");
//     }
//   };

//   /* ============================
//      HANDLE SALARY CALC
//   ============================ */
//   useEffect(() => {
//     setForm((f) => ({
//       ...f,
//       netSalary:
//         Number(f.baseSalary || 0) +
//         Number(f.additions || 0) -
//         Number(f.deductions || 0),
//     }));
//   }, [form.baseSalary, form.additions, form.deductions]);

//   useEffect(() => {
//     if (!month || !year) {
//       setSummary(null); // 👈 RESET
//       return;
//     }

//     loadPayrollSummary();
//   }, [month, year]);

//   const loadAccounts = async () => {
//     const res = await api.get("/accounts");
//     setAccounts(res.data.accounts.filter((a) => a.status === "Active"));
//   };

//   const loadCategories = async () => {
//     try {
//       const res = await api.get("/expense-categories/dropdown/active");
//       setCategories(res.data.categories || []);
//     } catch {
//       toast.error("Failed to load categories");
//     }
//   };
//   useEffect(() => {
//     loadAccounts();
//   }, []);

//   /* ============================
//      CREATE WAGE
//   ============================ */
//   const submitForm = async (e) => {
//     e.preventDefault();

//     if (!form.employee || !form.month || !form.year) {
//       return toast.error("Employee, month and year are required");
//     }

//     try {
//       await api.post("/wages", {
//         employee: form.employee,
//         month: Number(form.month),
//         year: Number(form.year),
//         additions: Number(form.additions),
//         deductions: Number(form.deductions),
//         note: form.note,
//       });

//       toast.success("Wage created successfully");
//       setShowForm(false);
//       setForm({
//         employee: "",
//         month: "",
//         year: "",
//         baseSalary: 0,
//         additions: 0,
//         deductions: 0,
//         netSalary: 0,
//         note: "",
//       });
//       loadWages();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Failed to create wage");
//     }
//   };

//   /* ============================
//      PAY WAGE
//   ============================ */
//   const payWage = async () => {
//     try {
//       await api.patch(`/wages/pay/${payWagesId}`, {
//         accounts: selectedAccount,
//       });
//       toast.success("Wages paid successfully");
//       setPayWagesId(null);
//       loadWages();
//       loadPayrollSummary();
//     } catch (err) {
//       toast.error(err.response?.data?.message || "Payment failed");
//     }
//   };

//   /* ============================
//      RENDER
//   ============================ */
//   return (
//     <div className="p-6 bg-gray-100 min-h-screen">
//       {summary && (
//         <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
//           <div className="bg-white p-5 rounded-xl shadow">
//             <p className="text-sm text-gray-500">Net Payroll</p>
//             <p className="text-2xl font-bold text-gray-800">
//               {summary.netPayroll.toLocaleString()}
//             </p>
//           </div>

//           <div className="bg-white p-5 rounded-xl shadow">
//             <p className="text-sm text-gray-500">Paid Amount</p>
//             <p className="text-2xl font-bold text-green-600">
//               {summary.paidAmount.toLocaleString()}
//             </p>
//           </div>

//           <div className="bg-white p-5 rounded-xl shadow">
//             <p className="text-sm text-gray-500">Unpaid Amount</p>
//             <p className="text-2xl font-bold text-red-600">
//               {summary.unpaidAmount.toLocaleString()}
//             </p>
//           </div>

//           <div className="bg-white p-5 rounded-xl shadow">
//             <p className="text-sm text-gray-500">Employees</p>
//             <p className="text-lg font-semibold text-gray-700">
//               Paid: {summary.paidEmployees} / {summary.totalEmployees}
//             </p>
//           </div>
//         </div>
//       )}

//       {editWage && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <form
//             onSubmit={async (e) => {
//               e.preventDefault();
//               try {
//                 await api.patch(`/wages/wage/${editWage._id}`, {
//                   additions: editWage.additions,
//                   deductions: editWage.deductions,
//                   note: editWage.note,
//                 });

//                 toast.success("Wage updated successfully");
//                 setEditWage(null);
//                 loadWages();
//               } catch (err) {
//                 toast.error(err.response?.data?.message || "Update failed");
//               }
//             }}
//             className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4"
//           >
//             <h2 className="text-lg font-semibold">Edit Wage</h2>

//             {/* EMPLOYEE (READ ONLY) */}
//             <input
//               disabled
//               className="border rounded-lg px-3 py-2 w-full bg-gray-100"
//               value={`${editWage.employee?.name} (${editWage.employee?.employeeCode})`}
//             />

//             {/* MONTH/YEAR */}
//             <input
//               disabled
//               className="border rounded-lg px-3 py-2 w-full bg-gray-100"
//               value={`${editWage.month}/${editWage.year}`}
//             />

//             {/* BASE SALARY */}
//             <input
//               disabled
//               className="border rounded-lg px-3 py-2 w-full bg-gray-100"
//               value={`Base Salary: ${editWage.baseSalary}`}
//             />

//             {/* ADDITIONS */}
//             <input
//               type="number"
//               placeholder="Additions"
//               className="border rounded-lg px-3 py-2 w-full"
//               value={editWage.additions}
//               onChange={(e) =>
//                 setEditWage({
//                   ...editWage,
//                   additions: Number(e.target.value),
//                   netSalary:
//                     editWage.baseSalary +
//                     Number(e.target.value) -
//                     editWage.deductions,
//                 })
//               }
//             />

//             {/* DEDUCTIONS */}
//             <input
//               type="number"
//               placeholder="Deductions"
//               className="border rounded-lg px-3 py-2 w-full"
//               value={editWage.deductions}
//               onChange={(e) =>
//                 setEditWage({
//                   ...editWage,
//                   deductions: Number(e.target.value),
//                   netSalary:
//                     editWage.baseSalary +
//                     editWage.additions -
//                     Number(e.target.value),
//                 })
//               }
//             />

//             {/* NET SALARY */}
//             <input
//               disabled
//               className="border rounded-lg px-3 py-2 w-full bg-gray-100"
//               value={`Net Salary: ${editWage.netSalary}`}
//             />

//             {/* NOTE */}
//             <textarea
//               placeholder="Note"
//               className="border rounded-lg px-3 py-2 w-full"
//               value={editWage.note || ""}
//               onChange={(e) =>
//                 setEditWage({ ...editWage, note: e.target.value })
//               }
//             />

//             <div className="flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => setEditWage(null)}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-5 py-2 bg-indigo-600 text-white rounded-lg"
//               >
//                 Update
//               </button>
//             </div>
//           </form>
//         </div>
//       )}

//       {/* ================= HEADER ================= */}
//       <div className="flex justify-between items-center mb-6">
//         <div>
//           <h1 className="text-2xl font-bold text-gray-800">Wages</h1>
//           <p className="text-sm text-gray-600">
//             Monthly payroll & salary payments
//           </p>
//         </div>

//         <button
//           onClick={() => {
//             loadEmployees();
//             setShowForm(true);
//           }}
//           className="
//             flex items-center gap-2
//             bg-gradient-to-r from-indigo-600 to-blue-600
//             text-white px-5 py-2 rounded-lg
//           "
//         >
//           <FaPlus /> Add Wage
//         </button>
//       </div>

//       {/* ================= FILTER BAR ================= */}
//       <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-3">
//         <input
//           placeholder="Search employee..."
//           className="border rounded-lg px-3 py-2"
//           value={search}
//           onChange={(e) => setSearch(e.target.value)}
//         />

//         <select
//           value={status}
//           onChange={(e) => setStatus(e.target.value)}
//           className="border rounded-lg px-3 py-2"
//         >
//           <option value="">All Status</option>
//           <option value="Unpaid">Unpaid</option>
//           <option value="Paid">Paid</option>
//         </select>

//         <input
//           type="number"
//           placeholder="Month"
//           className="border rounded-lg px-3 py-2 w-24"
//           value={month}
//           onChange={(e) => setMonth(e.target.value)}
//         />

//         <input
//           type="number"
//           placeholder="Year"
//           className="border rounded-lg px-3 py-2 w-28"
//           value={year}
//           onChange={(e) => setYear(e.target.value)}
//         />

//         <select
//           value={limit}
//           onChange={(e) => setLimit(Number(e.target.value))}
//           className="border rounded-lg px-3 py-2"
//         >
//           {[5, 10, 20, 50].map((l) => (
//             <option key={l} value={l}>
//               {l}
//             </option>
//           ))}
//         </select>
//       </div>

//       {/* ================= TABLE ================= */}
//       <div className="bg-white rounded-2xl shadow overflow-x-auto">
//         <table className="w-full table-fixed text-sm">
//           <thead className="bg-gray-100 border-b">
//             <tr>
//               <th className="p-4 text-left">Employee</th>
//               <th className="p-4 text-center">Month</th>
//               <th className="p-4 text-right">Base</th>
//               <th className="p-4 text-right">Net</th>
//               <th className="p-4 text-center">Status</th>
//               <th className="p-4 text-center">Action</th>
//             </tr>
//           </thead>

//           <tbody>
//             {!wages.length && (
//               <tr>
//                 <td colSpan="6" className="p-8 text-center text-gray-500">
//                   No wages found
//                 </td>
//               </tr>
//             )}

//             {wages.map((w, idx) => (
//               <tr
//                 key={w._id}
//                 className={`${idx % 2 ? "bg-gray-50" : "bg-white"} border-b`}
//               >
//                 <td className="p-4 font-semibold">
//                   {w.employee?.name}
//                   {/* ({w.employee?.employeeCode}) */}
//                 </td>
//                 <td className="p-4 text-center">
//                   {w.month}/{w.year}
//                 </td>
//                 <td className="p-4 text-right">
//                   {w.baseSalary?.toLocaleString()}
//                 </td>
//                 <td className="p-4 text-right font-semibold">
//                   {w.netSalary?.toLocaleString()}
//                 </td>
//                 <td className="p-4 text-center">
//                   <span
//                     className={`px-3 py-1 rounded-full text-xs font-semibold ${
//                       w.status === "Paid"
//                         ? "bg-green-100 text-green-700"
//                         : "bg-orange-100 text-orange-700"
//                     }`}
//                   >
//                     {w.status}
//                   </span>
//                 </td>
//                 <td className="p-4 text-center">
//                   <div className="flex justify-center items-center gap-3">
//                     {/* ✏️ EDIT (only unpaid & unlocked) */}
//                     {w.status === "Unpaid" && !w.isLocked && (
//                       <button
//                         onClick={() => setEditWage(w)}
//                         title="Edit Wage"
//                         className="
//           p-2 rounded-lg
//           bg-indigo-50 text-indigo-600
//           hover:bg-indigo-100 hover:text-indigo-800
//           transition
//         "
//                       >
//                         <FaEdit />
//                       </button>
//                     )}

//                     {/* ✅ PAY (only unpaid) */}
//                     {w.status === "Unpaid" && (
//                       <button
//                         onClick={() => {
//                           setPayWagesId(w._id);
//                           setSelectedAccount("");
//                         }}
//                         disabled={loadingPayId === w._id}
//                         title="Mark as Paid"
//                         className="
//           p-2 rounded-lg
//           bg-green-50 text-green-600
//           hover:bg-green-100 hover:text-green-800
//           disabled:opacity-50 disabled:cursor-not-allowed
//           transition
//         "
//                       >
//                         <FaCheck />
//                       </button>
//                     )}
//                     {w.status === "Unpaid" && (
//                       <button
//                         onClick={() => deleteWage(w._id)}
//                         className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
//                       >
//                         <FaTrash />
//                       </button>
//                     )}
//                   </div>
//                 </td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//         <div className="flex justify-between items-center p-4">
//           <button
//             disabled={page === 1}
//             onClick={() => setPage((p) => Math.max(p - 1, 1))}
//             className="px-4 py-2 rounded-lg border disabled:opacity-50"
//           >
//             Previous
//           </button>

//           <span className="text-sm text-gray-600">
//             Page {page} of {totalPages}
//           </span>

//           <button
//             disabled={page === totalPages}
//             onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
//             className="px-4 py-2 rounded-lg border disabled:opacity-50"
//           >
//             Next
//           </button>
//         </div>
//       </div>

//       {/* ================= CREATE WAGE MODAL ================= */}
//       {showForm && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <form
//             onSubmit={submitForm}
//             className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4"
//           >
//             <h2 className="text-lg font-semibold">Create Wage</h2>

//             <select
//               className="border rounded-lg px-3 py-2 w-full"
//               value={form.employee}
//               onChange={(e) => handleEmployeeChange(e.target.value)}
//             >
//               <option value="">Select Employee</option>
//               {employees.map((e) => (
//                 <option key={e._id} value={e._id}>
//                   {e.name} ({e.employeeCode})
//                 </option>
//               ))}
//             </select>

//             <div className="grid grid-cols-2 gap-3">
//               <input
//                 type="number"
//                 placeholder="Month"
//                 className="border rounded-lg px-3 py-2"
//                 value={form.month}
//                 onChange={(e) => setForm({ ...form, month: e.target.value })}
//               />

//               <input
//                 type="number"
//                 placeholder="Year"
//                 className="border rounded-lg px-3 py-2"
//                 value={form.year}
//                 onChange={(e) => setForm({ ...form, year: e.target.value })}
//               />
//             </div>

//             <input
//               disabled
//               className="border rounded-lg px-3 py-2 w-full bg-gray-100"
//               value={`Base Salary: ${form.baseSalary}`}
//             />

//             <input
//               type="number"
//               placeholder="Additions"
//               className="border rounded-lg px-3 py-2 w-full"
//               value={form.additions}
//               onChange={(e) => setForm({ ...form, additions: e.target.value })}
//             />

//             <input
//               type="number"
//               placeholder="Deductions"
//               className="border rounded-lg px-3 py-2 w-full"
//               value={form.deductions}
//               onChange={(e) => setForm({ ...form, deductions: e.target.value })}
//             />

//             <input
//               disabled
//               className="border rounded-lg px-3 py-2 w-full bg-gray-100"
//               value={`Net Salary: ${form.netSalary}`}
//             />

//             <textarea
//               placeholder="Note"
//               className="border rounded-lg px-3 py-2 w-full"
//               value={form.note}
//               onChange={(e) => setForm({ ...form, note: e.target.value })}
//             />

//             <div className="flex justify-end gap-3">
//               <button
//                 type="button"
//                 onClick={() => setShowForm(false)}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>
//               <button
//                 type="submit"
//                 className="px-5 py-2 bg-green-600 text-white rounded-lg"
//               >
//                 Save
//               </button>
//             </div>
//           </form>
//         </div>
//       )}
//       {payWagesId && (
//         <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
//           <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
//             <h2 className="text-lg font-semibold">Pay Wages</h2>

//             <select
//               className="border rounded-lg px-3 py-2 w-full"
//               value={selectedAccount}
//               onChange={(e) => setSelectedAccount(e.target.value)}
//             >
//               <option value="">Select Account</option>
//               {accounts.map((a) => (
//                 <option key={a._id} value={a._id}>
//                   {a.name} (Balance: {a.currentBalance.toLocaleString()})
//                 </option>
//               ))}
//             </select>

//             <div className="flex justify-end gap-3">
//               <button
//                 onClick={() => setPayWagesId(null)}
//                 className="px-4 py-2 border rounded-lg"
//               >
//                 Cancel
//               </button>

//               <button
//                 disabled={!selectedAccount}
//                 onClick={() => payWage()}
//                 className="px-5 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
//               >
//                 Confirm Pay
//               </button>
//             </div>
//           </div>
//         </div>
//       )}
//     </div>
//   );
// };

// export default Wages;

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import { toast } from "react-toastify";
import { FaPlus, FaCheck, FaEdit, FaTrash } from "react-icons/fa";

const Wages = () => {
  /* ============================ STATE ============================ */
  const [wages, setWages] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [summary, setSummary] = useState(null);
  const [showForm, setShowForm] = useState(false);
  const [loadingPayId, setLoadingPayId] = useState(null);
  const [editWage, setEditWage] = useState(null);
  const [payWagesId, setPayWagesId] = useState(null);
  const [accounts, setAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState("");

  // list controls
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [status, setStatus] = useState("");
  const [month, setMonth] = useState("");
  const [year, setYear] = useState("");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortOrder, setSortOrder] = useState("desc");

  /* ============================ FORM STATE ============================ */
  const [form, setForm] = useState({
    employee: "",
    month: "",
    year: "",
    baseSalary: 0,
    advanceSalary: 0,
    additions: 0,
    deductions: 0,
    netSalary: 0,
    note: "",
  });

  /* ============================ DEBOUNCE SEARCH ============================ */
  useEffect(() => {
    const t = setTimeout(() => {
      setDebouncedSearch(search.trim());
      setPage(1);
    }, 400);
    return () => clearTimeout(t);
  }, [search]);

  /* ============================ LOAD DATA ============================ */
  const loadEmployees = async () => {
    try {
      const res = await api.get("/employees/dropdown/active");
      setEmployees(res.data.employees || []);
    } catch {
      toast.error("Failed to load employees");
    }
  };

  const deleteWage = async (id) => {
    if (!window.confirm("Are u sure u want to delete this Wage")) return;
    try {
      const res = await api.delete(`/wages/waging/${id}`);
      toast.success(res?.data?.message || "Deleted Successfully");
      loadWages();
    } catch (error) {
      toast.error(error?.response?.data?.message || "Error");
    }
  };

  const loadWages = async () => {
    try {
      const res = await api.get("/wages", {
        params: {
          page,
          limit,
          search: debouncedSearch,
          status,
          month,
          year,
          sortBy,
          sortOrder,
        },
      });
      setWages(res.data.wages || []);
      setTotalPages(res.data.totalPages || 1);
    } catch {
      toast.error("Failed to load wages");
    }
  };

  useEffect(() => {
    loadWages();
  }, [page, limit, debouncedSearch, status, month, year, sortBy, sortOrder]);

  /* ============================ HANDLE EMPLOYEE SELECT ============================ */
  const handleEmployeeChange = (id) => {
    const emp = employees.find((e) => e._id === id);
    if (!emp) return;
    const baseSalary = emp.monthlySalary;
    setForm({ ...form, employee: id, baseSalary, netSalary: baseSalary });
  };

  const loadPayrollSummary = async () => {
    if (
      !month ||
      !year ||
      String(year).length !== 4 ||
      Number(month) < 1 ||
      Number(month) > 12
    ) {
      return;
    }
    try {
      const res = await api.get("/wages/summary", {
        params: { month: Number(month), year: Number(year) },
      });
      setSummary(res.data.summary);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payroll summary");
    }
  };

  /* ============================ HANDLE SALARY CALC ============================ */
  useEffect(() => {
    setForm((f) => ({
      ...f,
      netSalary:
        Number(f.baseSalary || 0) +
        Number(f.additions || 0) -
        Number(f.deductions || 0) -
        Number(f.advanceSalary || 0),
    }));
  }, [form.baseSalary, form.additions, form.deductions, form.advanceSalary]);

  useEffect(() => {
    if (!month || !year) {
      setSummary(null); // 👈 RESET
      return;
    }
    loadPayrollSummary();
  }, [month, year]);

  const loadAccounts = async () => {
    const res = await api.get("/accounts");
    setAccounts(res.data.accounts.filter((a) => a.status === "Active"));
  };

  const loadCategories = async () => {
    try {
      const res = await api.get("/expense-categories/dropdown/active");
      setCategories(res.data.categories || []);
    } catch {
      toast.error("Failed to load categories");
    }
  };

  useEffect(() => {
    loadAccounts();
  }, []);

  /* ============================ CREATE WAGE ============================ */
  const submitForm = async (e) => {
    e.preventDefault();
    if (!form.employee || !form.month || !form.year) {
      return toast.error("Employee, month and year are required");
    }
    try {
      await api.post("/wages", {
        employee: form.employee,
        month: Number(form.month),
        year: Number(form.year),
        advanceSalary: Number(form.advanceSalary),
        additions: Number(form.additions),
        deductions: Number(form.deductions),
        note: form.note,
      });
      toast.success("Wage created successfully");
      setShowForm(false);
      setForm({
        employee: "",
        month: "",
        year: "",
        advanceSalary: 0,
        baseSalary: 0,
        additions: 0,
        deductions: 0,
        netSalary: 0,
        note: "",
      });
      loadWages();
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to create wage");
    }
  };

  /* ============================ PAY WAGE ============================ */
  const payWage = async () => {
    try {
      await api.patch(`/wages/pay/${payWagesId}`, { accounts: selectedAccount });
      toast.success("Wages paid successfully");
      setPayWagesId(null);
      loadWages();
      loadPayrollSummary();
    } catch (err) {
      toast.error(err.response?.data?.message || "Payment failed");
    }
  };

  /* ============================ RENDER ============================ */
  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {summary && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Net Payroll</p>
            <p className="text-2xl font-bold text-gray-800">
              {summary.netPayroll.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Paid Amount</p>
            <p className="text-2xl font-bold text-green-600">
              {summary.paidAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Unpaid Amount</p>
            <p className="text-2xl font-bold text-red-600">
              {summary.unpaidAmount.toLocaleString()}
            </p>
          </div>
          <div className="bg-white p-5 rounded-xl shadow">
            <p className="text-sm text-gray-500">Employees</p>
            <p className="text-lg font-semibold text-gray-700">
              Paid: {summary.paidEmployees} / {summary.totalEmployees}
            </p>
          </div>
        </div>
      )}

      {editWage && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form
            onSubmit={async (e) => {
              e.preventDefault();
              try {
                await api.patch(`/wages/wage/${editWage._id}`, {
                  advanceSalary: editWage.advanceSalary,
                  additions: editWage.additions,
                  deductions: editWage.deductions,
                  note: editWage.note,
                });
                toast.success("Wage updated successfully");
                setEditWage(null);
                loadWages();
              } catch (err) {
                toast.error(err.response?.data?.message || "Update failed");
              }
            }}
            className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4"
          >
            <h2 className="text-lg font-semibold">Edit Wage</h2>
            {/* EMPLOYEE (READ ONLY) */}
            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={`${editWage.employee?.name} (${editWage.employee?.employeeCode})`}
            />
            {/* MONTH/YEAR */}
            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={`${editWage.month}/${editWage.year}`}
            />
            {/* BASE SALARY */}
            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={`Base Salary: ${editWage.baseSalary}`}
            />
            <input
              type="number"
              placeholder="Advance Salary"
              className="border rounded-lg px-3 py-2 w-full"
              value={editWage.advanceSalary !== null ? editWage.advanceSalary : ""}
              onChange={(e) => {
                const advance = Number(e.target.value);
                setEditWage({
                  ...editWage,
                  advanceSalary: advance,
                  netSalary:
                    (editWage.baseSalary || 0) +
                    (editWage.additions || 0) -
                    (editWage.deductions || 0) -
                    advance,
                });
              }}
            />
            {/* ADDITIONS */}
            <input
              type="number"
              placeholder="Additions"
              className="border rounded-lg px-3 py-2 w-full"
              value={editWage.additions !== null ? editWage.additions : ""}
              onChange={(e) =>
                setEditWage({
                  ...editWage,
                  additions: Number(e.target.value),
                  netSalary: editWage.baseSalary + Number(e.target.value) - editWage.deductions,
                })
              }
            />
            {/* DEDUCTIONS */}
            <input
              type="number"
              placeholder="Deductions"
              className="border rounded-lg px-3 py-2 w-full"
              value={editWage.deductions !== null ? editWage.deductions : ""}
              onChange={(e) =>
                setEditWage({
                  ...editWage,
                  deductions: Number(e.target.value),
                  netSalary: editWage.baseSalary + editWage.additions - Number(e.target.value),
                })
              }
            />
            {/* NET SALARY */}
            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={`Net Salary: ${editWage.netSalary}`}
            />
            {/* NOTE */}
            <textarea
              placeholder="Note"
              className="border rounded-lg px-3 py-2 w-full"
              value={editWage.note || ""}
              onChange={(e) => setEditWage({ ...editWage, note: e.target.value })}
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setEditWage(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button type="submit" className="px-5 py-2 bg-indigo-600 text-white rounded-lg">
                Update
              </button>
            </div>
          </form>
        </div>
      )}

      {/* ================= HEADER ================= */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Wages</h1>
          <p className="text-sm text-gray-600"> Monthly payroll & salary payments </p>
        </div>
        <button
          onClick={() => {
            loadEmployees();
            setShowForm(true);
          }}
          className=" flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 text-white px-5 py-2 rounded-lg "
        >
          <FaPlus /> Add Wage
        </button>
      </div>

      {/* ================= FILTER BAR ================= */}
      <div className="bg-white p-4 rounded-xl shadow mb-4 flex flex-wrap gap-3">
        <input
          placeholder="Search employee..."
          className="border rounded-lg px-3 py-2"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="border rounded-lg px-3 py-2"
        >
          <option value="">All Status</option>
          <option value="Unpaid">Unpaid</option>
          <option value="Paid">Paid</option>
        </select>
        <input
          type="number"
          placeholder="Month"
          className="border rounded-lg px-3 py-2 w-24"
          value={month}
          onChange={(e) => setMonth(e.target.value)}
        />
        <input
          type="number"
          placeholder="Year"
          className="border rounded-lg px-3 py-2 w-28"
          value={year}
          onChange={(e) => setYear(e.target.value)}
        />
        <select
          value={limit}
          onChange={(e) => setLimit(Number(e.target.value))}
          className="border rounded-lg px-3 py-2"
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
              <th className="p-4 text-left">Employee</th>
              <th className="p-4 text-center">Month</th>
              <th className="p-4 text-right">Base</th>
              <th className="p-4 text-right">Net</th>
              <th className="p-4 text-center">Status</th>
              <th className="p-4 text-center">Action</th>
            </tr>
          </thead>
          <tbody>
            {!wages.length && (
              <tr>
                <td colSpan="6" className="p-8 text-center text-gray-500">
                  No wages found
                </td>
              </tr>
            )}
            {wages.map((w, idx) => (
              <tr
                key={w._id}
                className={`${idx % 2 ? "bg-gray-50" : "bg-white"} border-b`}
              >
                <td className="p-4 font-semibold">{w.employee?.name}</td>
                <td className="p-4 text-center">{w.month}/{w.year}</td>
                <td className="p-4 text-right">{w.baseSalary?.toLocaleString()}</td>
                <td className="p-4 text-right font-semibold">{w.netSalary?.toLocaleString()}</td>
                <td className="p-4 text-center">
                  <span
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      w.status === "Paid"
                        ? "bg-green-100 text-green-700"
                        : "bg-orange-100 text-orange-700"
                    }`}
                  >
                    {w.status}
                  </span>
                </td>
                <td className="p-4 text-center">
                  <div className="flex justify-center items-center gap-3">
                    {/* ✏️ EDIT (only unpaid & unlocked) */}
                    {w.status === "Unpaid" && !w.isLocked && (
                      <button
                        onClick={() => setEditWage(w)}
                        title="Edit Wage"
                        className=" p-2 rounded-lg bg-indigo-50 text-indigo-600 hover:bg-indigo-100 hover:text-indigo-800 transition "
                      >
                        <FaEdit />
                      </button>
                    )}
                    {/* ✅ PAY (only unpaid) */}
                    {w.status === "Unpaid" && (
                      <button
                        onClick={() => {
                          setPayWagesId(w._id);
                          setSelectedAccount("");
                        }}
                        disabled={loadingPayId === w._id}
                        title="Mark as Paid"
                        className=" p-2 rounded-lg bg-green-50 text-green-600 hover:bg-green-100 hover:text-green-800 disabled:opacity-50 disabled:cursor-not-allowed transition "
                      >
                        <FaCheck />
                      </button>
                    )}
                    {w.status === "Unpaid" && (
                      <button
                        onClick={() => deleteWage(w._id)}
                        className="p-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"
                      >
                        <FaTrash />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
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
            onClick={() => setPage((p) => Math.min(p + 1, totalPages))}
            className="px-4 py-2 rounded-lg border disabled:opacity-50"
          >
            Next
          </button>
        </div>
      </div>

      {/* ================= CREATE WAGE MODAL ================= */}
      {showForm && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <form onSubmit={submitForm} className="bg-white rounded-xl p-6 w-full max-w-lg space-y-4">
            <h2 className="text-lg font-semibold">Create Wage</h2>
            <select
              className="border rounded-lg px-3 py-2 w-full"
              value={form.employee}
              onChange={(e) => handleEmployeeChange(e.target.value)}
            >
              <option value="">Select Employee</option>
              {employees.map((e) => (
                <option key={e._id} value={e._id}>
                  {e.name} ({e.employeeCode})
                </option>
              ))}
            </select>
            <div className="grid grid-cols-2 gap-3">
              <input
                type="number"
                placeholder="Month"
                className="border rounded-lg px-3 py-2"
                value={form.month}
                onChange={(e) => setForm({ ...form, month: e.target.value })}
              />
              <input
                type="number"
                placeholder="Year"
                className="border rounded-lg px-3 py-2"
                value={form.year}
                onChange={(e) => setForm({ ...form, year: e.target.value })}
              />
            </div>
            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={`Base Salary: ${form.baseSalary}`}
            />
            <input
              type="number"
              placeholder="Advance Salary"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.advanceSalary}
              onChange={(e) => setForm({ ...form, advanceSalary: e.target.value })}
            />
            <input
              type="number"
              placeholder="Additions"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.additions}
              onChange={(e) => setForm({ ...form, additions: e.target.value })}
            />
            <input
              type="number"
              placeholder="Deductions"
              className="border rounded-lg px-3 py-2 w-full"
              value={form.deductions}
              onChange={(e) => setForm({ ...form, deductions: e.target.value })}
            />
            <input
              disabled
              className="border rounded-lg px-3 py-2 w-full bg-gray-100"
              value={`Net Salary: ${form.netSalary}`}
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
              <button type="submit" className="px-5 py-2 bg-green-600 text-white rounded-lg">
                Save
              </button>
            </div>
          </form>
        </div>
      )}

      {payWagesId && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md space-y-4">
            <h2 className="text-lg font-semibold">Pay Wages</h2>
            <select
              className="border rounded-lg px-3 py-2 w-full"
              value={selectedAccount}
              onChange={(e) => setSelectedAccount(e.target.value)}
            >
              <option value="">Select Account</option>
              {accounts.map((a) => (
                <option key={a._id} value={a._id}>
                  {a.name} (Balance: {a.currentBalance.toLocaleString()})
                </option>
              ))}
            </select>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPayWagesId(null)}
                className="px-4 py-2 border rounded-lg"
              >
                Cancel
              </button>
              <button
                disabled={!selectedAccount}
                onClick={() => payWage()}
                className="px-5 py-2 bg-green-600 text-white rounded-lg disabled:opacity-50"
              >
                Confirm Pay
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Wages;
