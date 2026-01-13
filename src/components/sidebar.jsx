// import React, { useState } from "react";
// import {
//   FaHome,
//   FaTable,
//   FaBox,
//   FaWarehouse,
//   FaTruck,
//   FaShoppingCart,
//   FaFileInvoice,
//   FaCogs,
//   FaUsers,
//   FaHandHoldingUsd,
//   FaSignOutAlt,
//   FaIndustry,
//   FaBars,
// } from "react-icons/fa";
// import { NavLink } from "react-router-dom";
// import { useAuth } from "../context/AuthContext";

// const Sidebar = () => {
//   const [mobileOpen, setMobileOpen] = useState(false);
//   const { user } = useAuth();

//   // Safety check
//   if (!user) return null;

//   const isAdmin = user.role === "admin";

//   const menuItems = [
//     // DASHBOARD
//     {
//       name: "Dashboard",
//       path: "/admin/dashboard",
//       icon: <FaHome />,
//       exact: true,
//     },

//     // STOCK
//     {
//       name: "Categories",
//       path: "/admin/dashboard/categories",
//       icon: <FaTable />,
//       permission: "stock",
//     },
//     {
//       name: "Items",
//       path: "/admin/dashboard/items",
//       icon: <FaBox />,
//       permission: "stock",
//     },
//     {
//       name: "Stock In/Out",
//       path: "/admin/dashboard/stock",
//       icon: <FaWarehouse />,
//       permission: "stock",
//     },
//     {
//       name: "Product Stock",
//       path: "/admin/dashboard/product-stock",
//       icon: <FaWarehouse />,
//       permission: "stock",
//     },

//     // PURCHASE
//     {
//       name: "Vendors",
//       path: "/admin/dashboard/vendors",
//       icon: <FaTruck />,
//       permission: "purchase",
//     },
//     {
//       name: "Purchase",
//       path: "/admin/dashboard/purchase",
//       icon: <FaShoppingCart />,
//       permission: "purchase",
//     },

//     // ACCOUNTS
//     {
//       name: "Purchase Bills",
//       path: "/admin/dashboard/purchase-bills",
//       icon: <FaTable />,
//       permission: "accounts",
//     },
//     {
//       name: "Expense Categories",
//       path: "/admin/dashboard/expense-categories",
//       icon: <FaTable />,
//       permission: "accounts",
//     },
//     {
//       name: "Accounts",
//       path: "/admin/dashboard/accounts",
//       icon: <FaFileInvoice />,
//       permission: "accounts",
//     },

//     // PRODUCTION
//     {
//       name: "Production BOM",
//       path: "/admin/dashboard/production",
//       icon: <FaIndustry />,
//       permission: "production",
//     },
//     {
//       name: "Products",
//       path: "/admin/dashboard/products",
//       icon: <FaIndustry />,
//       permission: "production",
//     },
//     {
//       name: "Production Execution",
//       path: "/admin/dashboard/production-execution",
//       icon: <FaIndustry />,
//       permission: "production",
//     },

//     // HR / WAGES
//     {
//       name: "Wages / Contractors",
//       path: "/admin/dashboard/wages",
//       icon: <FaHandHoldingUsd />,
//       permission: "wages",
//     },

//     // ADMIN / SETTINGS
//     {
//       name: "Employees",
//       path: "/admin/dashboard/employees",
//       icon: <FaUsers />,
//       permission: "settings",
//     },
//     {
//       name: "Users",
//       path: "/admin/dashboard/users",
//       icon: <FaUsers />,
//       permission: "settings",
//     },

//     // COMMON
//     {
//       name: "Profile",
//       path: "/admin/dashboard/profile",
//       icon: <FaCogs />,
//     },
//     {
//       name: "Logout",
//       path: "/admin/dashboard/logout",
//       icon: <FaSignOutAlt />,
//     },
//   ];

//   // 🔐 FILTER MENU BY PERMISSIONS
//   const visibleMenu = menuItems.filter((item) => {
//     if (!item.permission) return true; // common items
//     if (isAdmin) return true; // admin sees all
//     return user.permissions?.[item.permission];
//   });

//   return (
//     <>
//       {/* MOBILE MENU BUTTON */}
//       <button
//         onClick={() => setMobileOpen(true)}
//         className="md:hidden fixed top-4 left-4 z-50 bg-black/80 text-white p-2 rounded-lg"
//       >
//         <FaBars />
//       </button>

//       {/* MOBILE BACKDROP */}
//       {mobileOpen && (
//         <div
//           className="fixed inset-0 bg-black/40 z-40 md:hidden"
//           onClick={() => setMobileOpen(false)}
//         />
//       )}

//       {/* SIDEBAR */}
//       <aside
//         className={`
//           fixed left-0 top-0 h-screen
//           w-16 md:w-64
//           bg-gradient-to-b from-black to-gray-900
//           text-gray-300
//           flex flex-col
//           z-50
//           transition-transform duration-300
//           ${mobileOpen ? "translate-x-0" : "-translate-x-full"}
//           md:translate-x-0
//         `}
//       >
//         {/* LOGO */}
//         <div className="h-16 flex items-center justify-center border-b border-white/10">
//           <span className="hidden md:block text-lg font-semibold text-white">
//             ERP System
//           </span>
//           <span className="md:hidden text-lg font-semibold text-white">
//             ERP
//           </span>
//         </div>

//         {/* MENU */}
//         <nav className="flex-1 overflow-y-auto px-2 py-3 space-y-1">
//           {visibleMenu.map((item) => (
//             <NavLink
//               key={item.name}
//               to={item.path}
//               end={item.exact}
//               onClick={() => setMobileOpen(false)}
//               className={({ isActive }) =>
//                 `
//                 group flex items-center gap-3
//                 px-2 py-2 rounded-lg
//                 transition
//                 ${
//                   isActive
//                     ? "bg-white/10 text-white"
//                     : "hover:bg-white/5 hover:text-white"
//                 }
//               `
//               }
//             >
//               <span className="text-xl">{item.icon}</span>
//               <span className="hidden md:block text-sm font-medium">
//                 {item.name}
//               </span>
//             </NavLink>
//           ))}
//         </nav>
//       </aside>
//     </>
//   );
// };

// export default Sidebar;
import { NavLink } from "react-router-dom";
import {
  FaHome,
  FaTable,
  FaBox,
  FaWarehouse,
  FaTruck,
  FaShoppingCart,
  FaFileInvoice,
  FaCogs,
  FaUsers,
  FaHandHoldingUsd,
  FaSignOutAlt,
  FaIndustry,
  FaBars,
} from "react-icons/fa";
import { useAuth } from "../context/AuthContext";

const Sidebar = ({ sidebarOpen, setSidebarOpen }) => {
  const { user } = useAuth();
  if (!user) return null;

  const isAdmin = user.role === "admin";

 const menuItems = [
    // DASHBOARD
    {
      name: "Dashboard",
      path: "/admin/dashboard",
      icon: <FaHome />,
      exact: true,
    },

    // STOCK
    {
      name: "Categories",
      path: "/admin/dashboard/categories",
      icon: <FaTable />,
      permission: "stock",
    },
    {
      name: "Items",
      path: "/admin/dashboard/items",
      icon: <FaBox />,
      permission: "stock",
    },
    {
      name: "Stock In/Out",
      path: "/admin/dashboard/stock",
      icon: <FaWarehouse />,
      permission: "stock",
    },
    {
      name: "Product Stock",
      path: "/admin/dashboard/product-stock",
      icon: <FaWarehouse />,
      permission: "stock",
    },

    // PURCHASE
    {
      name: "Vendors",
      path: "/admin/dashboard/vendors",
      icon: <FaTruck />,
      permission: "purchase",
    },
    {
      name: "Purchase",
      path: "/admin/dashboard/purchase",
      icon: <FaShoppingCart />,
      permission: "purchase",
    },

    // ACCOUNTS
    {
      name: "Purchase Bills",
      path: "/admin/dashboard/purchase-bills",
      icon: <FaTable />,
      permission: "accounts",
    },
    {
      name: "Expense Categories",
      path: "/admin/dashboard/expense-categories",
      icon: <FaTable />,
      permission: "accounts",
    },
    {
      name: "Accounts",
      path: "/admin/dashboard/accounts",
      icon: <FaFileInvoice />,
      permission: "accounts",
    },

    // PRODUCTION
    {
      name: "Production BOM",
      path: "/admin/dashboard/production",
      icon: <FaIndustry />,
      permission: "production",
    },
    {
      name: "Products",
      path: "/admin/dashboard/products",
      icon: <FaIndustry />,
      permission: "production",
    },
    {
      name: "Production Execution",
      path: "/admin/dashboard/production-execution",
      icon: <FaIndustry />,
      permission: "production",
    },

    // HR / WAGES
    {
      name: "Wages / Contractors",
      path: "/admin/dashboard/wages",
      icon: <FaHandHoldingUsd />,
      permission: "wages",
    },

    // ADMIN / SETTINGS
    {
      name: "Employees",
      path: "/admin/dashboard/employees",
      icon: <FaUsers />,
      permission: "settings",
    },
    {
      name: "Users",
      path: "/admin/dashboard/users",
      icon: <FaUsers />,
      permission: "settings",
    },
    {
      name: "Invoice",
      path: "/admin/dashboard/invoice",
      icon: <FaCogs />,
    },
     {
      name: "DeliveryNote",
      path: "/admin/dashboard/deliverNote",
      icon: <FaCogs />,
    },
 {
      name: "Customer",
      path: "/admin/dashboard/customer",
      icon: <FaTruck />,
    },
    // COMMON
    {
      name: "Profile",
      path: "/admin/dashboard/profile",
      icon: <FaCogs />,
    },
    {
      name: "Logout",
      path: "/admin/dashboard/logout",
      icon: <FaSignOutAlt />,
    },
  ];


  const visibleMenu = menuItems.filter((item) => {
    if (!item.permission) return true;
    if (isAdmin) return true;
    return user.permissions?.[item.permission];
  });

  return (
    <>
      {/* Sidebar */}
      {sidebarOpen && (
      <aside
  className={`
    fixed top-0 left-0 h-screen
    bg-gradient-to-b from-black to-gray-900 text-gray-300 flex flex-col z-50
    transition-all duration-300
    ${sidebarOpen ? "w-64" : "w-0"}
  `}
>
  
  {/* Logo + Collapse */}
  <div className="h-16 flex items-center justify-between px-3 border-b border-white/10">
    {sidebarOpen ? (
      <span className="font-bold text-lg text-white">ERP System</span>
    ) : (
      <span className="text-lg font-bold text-white">E</span> // optional small icon/logo
    )}
    <button
      className="p-2 rounded-md hover:bg-gray-800 text-white"
      onClick={() => setSidebarOpen(!sidebarOpen)}
    >
      {sidebarOpen && "✕" }
    </button>
  </div>

  {/* Menu */}
  <nav className="flex-1 overflow-y-auto px-1 py-3 space-y-1">
    {visibleMenu.map((item) => (
      <NavLink
        key={item.name}
        to={item.path}
        end={item.exact || false}
        className={({ isActive }) =>
          `group flex items-center gap-3 px-3 py-2 rounded hover:bg-gray-700 transition ${
            isActive ? "bg-gray-800" : ""
          }`
        }
      >
        <span className="text-xl">{item.icon}</span>
        {sidebarOpen && <span className="text-sm font-medium">{item.name}</span>}
      </NavLink>
    ))}
  </nav>
</aside>

      )}
    </>
  );
};

export default Sidebar;
