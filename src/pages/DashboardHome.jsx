    // /** @format */

    // import React, { useEffect, useState } from "react";
    // import api from "../api/axios";
    // import {
    // FaUsers,
    // FaBox,
    // FaCubes,
    // FaTruck,
    // FaClipboardList,
    // FaIndustry,
    // FaUserTie,
    // FaArrowUp,
    // } from "react-icons/fa";
    // import {
    // LineChart,
    // Line,
    // BarChart,
    // Bar,
    // PieChart,
    // Pie,
    // Cell,
    // XAxis,
    // YAxis,
    // Tooltip,
    // ResponsiveContainer,
    // } from "recharts";
    // import { toast } from "react-toastify";
    // import { useAuth } from "../context/AuthContext";

    // /* ================= COLORS ================= */
    // const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

    // const BAR_COLORS = {
    // Production: "#6366f1",
    // Purchases: "#22c55e",
    // "Stock Qty": "#f59e0b",
    // "Stock Value": "#ec4899",
    // };

    // const DashboardHome = () => {
    // const { user } = useAuth();
    // const isAdmin = user?.role === "admin";

    // const [stats, setStats] = useState(null);
    // const [loading, setLoading] = useState(true);

    // /* ================= LOAD DASHBOARD ================= */
    // const loadDashboard = async () => {
    //     try {
    //     const res = await api.get("/dashboard");
    //     setStats(res.data.stats);
    //     } catch {
    //     toast.error("Failed to load dashboard");
    //     } finally {
    //     setLoading(false);
    //     }
    // };

    // useEffect(() => {
    //     loadDashboard();
    // }, []);

    // /* ================= LOADING ================= */
    // if (loading || !stats) {
    //     return (
    //     <div className="flex items-center justify-center min-h-[60vh] text-gray-500">
    //         Loading dashboard...
    //     </div>
    //     );
    // }

    // /* ================= KPI CARDS ================= */
    // const cards = [];

    // if (isAdmin || user?.permissions?.users)
    //     cards.push({
    //     label: "Users",
    //     value: stats.users,
    //     icon: <FaUsers />,
    //     color: "from-indigo-500 to-indigo-700",
    //     });

    // if (isAdmin || user?.permissions?.products)
    //     cards.push({
    //     label: "Products",
    //     value: stats.products,
    //     icon: <FaIndustry />,
    //     color: "from-emerald-500 to-emerald-700",
    //     });

    // if (isAdmin || user?.permissions?.items)
    //     cards.push({
    //     label: "Items",
    //     value: stats.items,
    //     icon: <FaCubes />,
    //     color: "from-sky-500 to-sky-700",
    //     });

    // if (isAdmin || user?.permissions?.purchase)
    //     cards.push({
    //     label: "Vendors",
    //     value: stats.vendors,
    //     icon: <FaTruck />,
    //     color: "from-amber-500 to-amber-700",
    //     });

    // if (isAdmin || user?.permissions?.purchase)
    //     cards.push({
    //     label: "Orders",
    //     value: stats.purchaseOrders,
    //     icon: <FaClipboardList />,
    //     color: "from-violet-500 to-violet-700",
    //     });

    // if (isAdmin || user?.permissions?.production)
    //     cards.push({
    //     label: "BOMs",
    //     value: stats.boms,
    //     icon: <FaBox />,
    //     color: "from-pink-500 to-pink-700",
    //     });

    // if (isAdmin || user?.permissions?.employees)
    //     cards.push({
    //     label: "Employees",
    //     value: stats.employees,
    //     icon: <FaUserTie />,
    //     color: "from-teal-500 to-teal-700",
    //     });

    // /* ================= LINE CHART ================= */
    // const monthlyData =
    //     stats.monthlyOrders?.map((m) => ({
    //     month: m.month,
    //     value: m.value,
    //     })) || [];

    // /* ================= BAR CHART ================= */
    // const moduleUsage = [{ name: "Production", value: stats.boms }];

    // if (isAdmin || user?.permissions?.purchase)
    //     moduleUsage.push({
    //     name: "Purchases",
    //     value: stats.purchaseOrders,
    //     });

    // if (isAdmin || user?.permissions?.stock)
    //     moduleUsage.push({
    //     name: "Stock Qty",
    //     value: stats.stockQty,
    //     });

    // if (isAdmin || user?.permissions?.accounts)
    //     moduleUsage.push({
    //     name: "Stock Value",
    //     value: stats.stockValue,
    //     });

    // /* ================= PIE CHART ================= */
    // const pieData = [];

    // if (isAdmin || user?.permissions?.users)
    //     pieData.push({ name: "Users", value: stats.users });

    // if (isAdmin || user?.permissions?.products)
    //     pieData.push({ name: "Products", value: stats.products });

    // if (isAdmin || user?.permissions?.items)
    //     pieData.push({ name: "Items", value: stats.items });

    // if (isAdmin || user?.permissions?.purchase)
    //     pieData.push({ name: "Vendors", value: stats.vendors });

    
    // /* ================= UI ================= */
    // return (
    //     <div className="space-y-10 p-10 bg-gray-100 min-h-screen">

    //     {/* HEADER */}
    //     <div className="flex justify-between items-center">
    //         <div>
    //         <h1 className="text-4xl font-extrabold text-gray-800">
    //             ERP Dashboard 🚀
    //         </h1>
    //         <p className="text-sm text-gray-500">
    //             Complete overview of system performance
    //         </p>
    //         </div>
    //         <span className="text-sm text-gray-600">
    //         {new Date().toDateString()}
    //         </span>
    //     </div>

    //     {/* KPI CARDS */}
    //     <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
    //         {cards.map((c) => (
    //         <div key={c.label} className="bg-white rounded-2xl shadow">
    //             <div className={`p-6 bg-gradient-to-r ${c.color} text-white rounded-2xl`}>
    //             <div className="flex justify-between">
    //                 <span className="text-3xl">{c.icon}</span>
    //                 <span className="text-xs flex items-center gap-1">
    //                 <FaArrowUp /> Live
    //                 </span>
    //             </div>
    //             <p className="mt-6 text-sm">{c.label}</p>
    //             <p className="text-3xl font-bold">
    //                 {c.value?.toLocaleString() ?? 0}
    //             </p>
    //             </div>
    //         </div>
    //         ))}
    //     </div>

    //     {/* CHARTS */}
    //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    //         {/* LINE */}
    //         <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
    //         <h2 className="text-lg font-semibold mb-4">
    //             Monthly Purchase Orders
    //         </h2>
    //         <ResponsiveContainer width="100%" height={260}>
    //             <LineChart data={monthlyData}>
    //             <XAxis dataKey="month" />
    //             <YAxis />
    //             <Tooltip />
    //             <Line
    //                 type="monotone"
    //                 dataKey="value"
    //                 stroke="#6366f1"
    //                 strokeWidth={3}
    //             />
    //             </LineChart>
    //         </ResponsiveContainer>
    //         </div>

    //         {/* PIE */}
    //         <div className="bg-white rounded-2xl shadow p-6">
    //         <h2 className="text-lg font-semibold mb-4">
    //             Data Distribution
    //         </h2>
    //         <ResponsiveContainer width="100%" height={260}>
    //             <PieChart>
    //             <Pie
    //                 data={pieData}
    //                 dataKey="value"
    //                 innerRadius={60}
    //                 outerRadius={90}
    //             >
    //                 {pieData.map((_, i) => (
    //                 <Cell
    //                     key={i}
    //                     fill={PIE_COLORS[i % PIE_COLORS.length]}
    //                 />
    //                 ))}
    //             </Pie>
    //             <Tooltip />
    //             </PieChart>
    //         </ResponsiveContainer>
    //         </div>
    //     </div>

    //     {/* BAR + QUICK STATS */}
    //     <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

    //         {/* BAR */}
    //         <div className="lg:col-span-2 bg-white rounded-2xl shadow p-6">
    //         <h2 className="text-lg font-semibold mb-4">
    //             Module Overview
    //         </h2>

    //         <ResponsiveContainer width="100%" height={260}>
    //             <BarChart data={moduleUsage}>
    //             <XAxis dataKey="name" />
    //             <YAxis />
    //             <Tooltip />
    //             <Bar dataKey="value" radius={[8, 8, 0, 0]}>
    //                 {moduleUsage.map((entry, index) => (
    //                 <Cell
    //                     key={index}
    //                     fill={BAR_COLORS[entry.name] || "#94a3b8"}
    //                 />
    //                 ))}
    //             </Bar>
    //             </BarChart>
    //         </ResponsiveContainer>
    //         </div>

    //         {/* QUICK STATS */}
    //         <div className="bg-white rounded-2xl shadow p-6">
    //         <h2 className="text-lg font-semibold mb-4">
    //             Quick Stats
    //         </h2>
    //         <ul className="space-y-3 text-sm text-gray-600">
    //             <li className="flex justify-between">
    //             <span>Users</span>
    //             <span className="font-bold">{stats.users}</span>
    //             </li>
    //             <li className="flex justify-between">
    //             <span>Products</span>
    //             <span className="font-bold">{stats.products}</span>
    //             </li>
    //             <li className="flex justify-between">
    //             <span>Orders</span>
    //             <span className="font-bold">{stats.purchaseOrders}</span>
    //             </li>
    //             <li className="flex justify-between">
    //             <span>Employees</span>
    //             <span className="font-bold">{stats.employees}</span>
    //             </li>
    //         </ul>
    //         </div>
    //     </div>
    //     </div>
    // );
    // };

    // export default DashboardHome;
/** @format */

import React, { useEffect, useState } from "react";
import api from "../api/axios";
import {
  FaUsers,
  FaBox,
  FaCubes,
  FaTruck,
  FaClipboardList,
  FaIndustry,
  FaUserTie,
  FaArrowUp,
} from "react-icons/fa";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { toast } from "react-toastify";
import { useAuth } from "../context/AuthContext";

/* ================= COLORS ================= */
const PIE_COLORS = ["#6366f1", "#22c55e", "#f59e0b", "#ec4899"];

const BAR_COLORS = {
  Production: "#6366f1",
  Purchases: "#22c55e",
  "Stock Qty": "#f59e0b",
  "Stock Value": "#ec4899",
};

const DashboardHome = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === "admin";

  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  /* ================= LOAD DASHBOARD ================= */
  const loadDashboard = async () => {
    try {
      const res = await api.get("/dashboard");
      setStats(res.data.stats);
    } catch {
      toast.error("Failed to load dashboard");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  /* ================= LOADING ================= */
  if (loading || !stats) {
    return (
      <div className="flex items-center justify-center min-h-screen text-slate-500 text-lg">
        Loading your command center...
      </div>
    );
  }

  /* ================= KPI CARDS ================= */
  const cards = [];

  if (isAdmin || user?.permissions?.users)
    cards.push({
      label: "Users",
      value: stats.users,
      icon: <FaUsers />,
      color: "from-indigo-500 to-indigo-700",
    });

  if (isAdmin || user?.permissions?.products)
    cards.push({
      label: "Products",
      value: stats.products,
      icon: <FaIndustry />,
      color: "from-emerald-500 to-emerald-700",
    });

  if (isAdmin || user?.permissions?.items)
    cards.push({
      label: "Items",
      value: stats.items,
      icon: <FaCubes />,
      color: "from-sky-500 to-sky-700",
    });

  if (isAdmin || user?.permissions?.purchase)
    cards.push({
      label: "Vendors",
      value: stats.vendors,
      icon: <FaTruck />,
      color: "from-amber-500 to-amber-700",
    });

  if (isAdmin || user?.permissions?.purchase)
    cards.push({
      label: "Orders",
      value: stats.purchaseOrders,
      icon: <FaClipboardList />,
      color: "from-violet-500 to-violet-700",
    });

  if (isAdmin || user?.permissions?.production)
    cards.push({
      label: "BOMs",
      value: stats.boms,
      icon: <FaBox />,
      color: "from-pink-500 to-pink-700",
    });

  if (isAdmin || user?.permissions?.employees)
    cards.push({
      label: "Employees",
      value: stats.employees,
      icon: <FaUserTie />,
      color: "from-teal-500 to-teal-700",
    });

  /* ================= CHART DATA ================= */
  const monthlyData =
    stats.monthlyOrders?.map((m) => ({
      month: m.month,
      value: m.value,
    })) || [];

  const moduleUsage = [{ name: "Production", value: stats.boms }];

  if (isAdmin || user?.permissions?.purchase)
    moduleUsage.push({ name: "Purchases", value: stats.purchaseOrders });

  if (isAdmin || user?.permissions?.stock)
    moduleUsage.push({ name: "Stock Qty", value: stats.stockQty });

  if (isAdmin || user?.permissions?.accounts)
    moduleUsage.push({ name: "Stock Value", value: stats.stockValue });

  const pieData = [];

  if (isAdmin || user?.permissions?.users)
    pieData.push({ name: "Users", value: stats.users });

  if (isAdmin || user?.permissions?.products)
    pieData.push({ name: "Products", value: stats.products });

  if (isAdmin || user?.permissions?.items)
    pieData.push({ name: "Items", value: stats.items });

  if (isAdmin || user?.permissions?.purchase)
    pieData.push({ name: "Vendors", value: stats.vendors });

  /* ================= UI ================= */
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-slate-50 to-slate-200 p-8 space-y-10">

      {/* HEADER */}
      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight text-slate-800">
            ERP Command Center
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Real-time operational intelligence
          </p>
        </div>
        <span className="px-4 py-2 rounded-full bg-white shadow text-slate-600 text-sm">
          📅 {new Date().toDateString()}
        </span>
      </div>

      {/* KPI CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div
            key={c.label}
            className="group relative overflow-hidden rounded-3xl bg-white shadow-lg transform transition-all duration-500 hover:shadow-2xl hover:scale-105"
          >
            <div
              className={`p-6 bg-gradient-to-br ${c.color} text-white`}
            >
              <div className="flex justify-between items-center">
                <div className="text-4xl">{c.icon}</div>
                <span className="text-xs bg-white/20 px-2 py-1 rounded-full flex items-center gap-1">
                  <FaArrowUp /> Live
                </span>
              </div>

              <p className="mt-6 text-sm uppercase tracking-wide opacity-90">
                {c.label}
              </p>
              <p className="text-4xl font-extrabold">
                {c.value?.toLocaleString() ?? 0}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CHARTS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* LINE */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">
            Monthly Purchase Orders
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <LineChart data={monthlyData}>
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#6366f1"
                strokeWidth={3}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* PIE */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">
            Data Distribution
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={pieData} dataKey="value" innerRadius={60} outerRadius={90}>
                {pieData.map((_, i) => (
                  <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* BAR + QUICK STATS */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* BAR */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">
            Module Overview
          </h2>
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={moduleUsage}>
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {moduleUsage.map((entry, index) => (
                  <Cell
                    key={index}
                    fill={BAR_COLORS[entry.name] || "#94a3b8"}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* QUICK STATS */}
        <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-xl p-6">
          <h2 className="text-lg font-bold text-slate-700 mb-4">
            Quick Stats
          </h2>
          <ul className="space-y-3 text-sm text-slate-600">
            {[
              ["Users", stats.users],
              ["Products", stats.products],
              ["Orders", stats.purchaseOrders],
              ["Employees", stats.employees],
            ].map(([label, value]) => (
              <li
                key={label}
                className="flex justify-between p-3 rounded-xl bg-white shadow-sm hover:shadow-lg hover:bg-gradient-to-r hover:from-purple-50 hover:to-indigo-50 transition-all duration-300 cursor-pointer transform hover:scale-105"
              >
                <span>{label}</span>
                <span className="font-extrabold text-slate-800">
                  {value}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;
