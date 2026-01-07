// import React from 'react'
// import Sidebar from '../components/sidebar'
// import { Outlet } from 'react-router-dom'

// const Dashboard = () => {
//   return (
//     <div>
//         <div className='flex'>
//             <Sidebar/>
//             <div className='flex-1 ml-16 md:ml-64 bg-gray-100 min-h-screen'>
//                <Outlet/>
//             </div>
//         </div>
//     </div>
//   )
// }

// export default Dashboard
import { useState } from "react";
import Sidebar from "../components/Sidebar";
import { Outlet } from "react-router-dom";
import { FaBars } from "react-icons/fa";

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(true); // Desktop sidebar starts open

  return (
    <div className="flex">
      {/* Sidebar */}
      <Sidebar sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      {/* Main Content */}
   <div
  className={`flex-1 min-h-screen bg-gray-100 transition-all duration-300 ${
    sidebarOpen ? "ml-64" : "ml-0"
  }`}
>

        {/* Topbar */}
        <div className="flex items-center bg-white shadow p-3 sticky top-0 z-40">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="p-2 rounded-md bg-gray-200 hover:bg-gray-300 transition"
          >
            <FaBars className="text-gray-700" />
          </button>
          <span className="ml-3 font-semibold text-gray-800 text-lg">
            ERP Dashboard
          </span>
        </div>

        {/* Page Content */}
        <div className="p-4 md:p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
