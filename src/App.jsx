import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect } from "react";
import Root from "./utils/root";
import Login from "./pages/login";
import Protected from "./utils/protected";
import Dashboard from "./pages/dashboard";
import Invoice from "./pages/Invoice";
import Categories from "./pages/Categories";
import Items from "./pages/Items";
import Vendors from "./pages/Vendors";
import Purchase from "./pages/Purchase";
import Stock from "./pages/Stock";
import Production from "./pages/Production";
import Wages from "./pages/Wages";
import Accounts from "./pages/Accounts";
import Users from "./pages/Users";
import Profile from "./pages/Profile";
import Logout from "./pages/Logout";
import Product from "./pages/Product";
import PurchaseBills from "./pages/PurchaseBills";
import ProductionOrder from "./pages/ProductionOrder";
import ProductionExecution from "./pages/ProductionExecution";
import Employees from "./pages/Employees";
import ProductStock from "./pages/ProductStock";
import ExpenseCategories from "./pages/ExpenseCategories";
import DashboardHome from "./pages/DashboardHome";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Customers from "./pages/Customer";
import DeliveryNote from "./pages/DeliveryNote";
import InvoiceAndCustomerLegder from "./pages/InvoiceAndCustomerLegder";

function App() {
  const [isMobile, setIsMobile] = React.useState(false);

  // useEffect(() => {
  //   const minWidth = 1024;
  //   const isMobileUA = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  //   if (window.innerWidth < minWidth || isMobileUA) {
  //     setIsMobile(true);
  //   }
  // }, []);

  // if (isMobile) {
  //   return (
  //     <div style={{ display: "flex", justifyContent: "center", alignItems: "center", height: "100vh", textAlign: "center", padding: "20px" }}>
  //       <h1>⚠️ This app is only available on laptops/desktops.</h1>
  //       <p>Please use a laptop or desktop computer to access this application.</p>
  //     </div>
  //   );
  // }

  return (
    <Router>
      <ToastContainer
        position="top-right"
        autoClose={3000}
        pauseOnHover
        draggable
        theme="light"
      />

      <Routes>
        {/* ================= PUBLIC ROUTES ================= */}
        <Route path="/" element={<Root />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/unauthorized"
          element={
            <p className="font-bold text-3xl mt-20 ml-20">Unauthorized</p>
          }
        />

        {/* ================= DASHBOARD (LOGIN REQUIRED) ================= */}
        <Route
          path="/admin/dashboard"
          element={
            <Protected>
              <Dashboard />
            </Protected>
          }
        >
          {/* DEFAULT PAGE */}
           <Route index element={<DashboardHome />} />

          {/* ================= STOCK ================= */}
          <Route
            path="categories"
            element={
              <Protected permission="stock">
                <Categories />
              </Protected>
            }
          />
          <Route
            path="items"
            element={
              <Protected permission="stock">
                <Items />
              </Protected>
            }
          />
          <Route
            path="stock"
            element={
              <Protected permission="stock">
                <Stock />
              </Protected>
            }
          />
          <Route
            path="product-stock"
            element={
              <Protected permission="stock">
                <ProductStock />
              </Protected>
            }
          />

          {/* ================= PURCHASE ================= */}
          <Route
            path="vendors"
            element={
              <Protected permission="purchase">
                <Vendors />
              </Protected>
            }
          />
          <Route
            path="purchase"
            element={
              <Protected permission="purchase">
                <Purchase />
              </Protected>
            }
          />

          {/* ================= ACCOUNTS ================= */}
          <Route
            path="purchase-bills"
            element={
              <Protected permission="accounts">
                <PurchaseBills />
              </Protected>
            }
          />
          <Route
            path="accounts"
            element={
              <Protected permission="accounts">
                <Accounts />
              </Protected>
            }
          />
          <Route
            path="expense-categories"
            element={
              <Protected permission="accounts">
                <ExpenseCategories />
              </Protected>
            }
          />

          {/* ================= PRODUCTION ================= */}
          <Route
            path="products"
            element={
              <Protected permission="production">
                <Product />
              </Protected>
            }
          />
          <Route
            path="production"
            element={
              <Protected permission="production">
                <Production />
              </Protected>
            }
          />
          <Route
            path="production-order"
            element={
              <Protected permission="production">
                <ProductionOrder />
              </Protected>
            }
          />
          <Route
            path="production-execution"
            element={
              <Protected permission="production">
                <ProductionExecution />
              </Protected>
            }
          />

          {/* ================= HR / WAGES ================= */}
          <Route
            path="employees"
            element={
              <Protected permission="settings">
                <Employees />
              </Protected>
            }
          />
          <Route
            path="wages"
            element={
              <Protected permission="wages">
                <Wages />
              </Protected>
            }
          />

          {/* ================= ADMIN / SETTINGS ================= */}
          <Route
            path="users"
            element={
              <Protected permission="settings">
                <Users />
              </Protected>
            }
          />

          {/* ================= COMMON ================= */}
          <Route path="invoice" element={<InvoiceAndCustomerLegder />} />
          <Route path="deliverNote" element={<DeliveryNote />} />
          <Route path="customer" element={<Customers />} />
          <Route path="profile" element={<Profile />} />
          <Route path="logout" element={<Logout />} />
        </Route>

        {/* OPTIONAL EMPLOYEE DASHBOARD */}
        <Route
          path="/employee/dashboard"
          element={<h1>Employee Dashboard</h1>}
        />
      </Routes>
    </Router>
  );
}

export default App;
