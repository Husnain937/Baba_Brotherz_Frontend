import React from 'react'
import Invoice from './Invoice';
import CustomerLedger from './CustomerLedger';
import { useState } from 'react';

const InvoiceAndCustomerLegder = () => {
const [activeTab, setActiveTab] = useState("Invoice");
    
  return (
    
    <div>  <div className="flex gap-6 mb-6 border-b">
        {[
          { key: "Invoice", label: "Invoice" },
          { key: "ledger", label: "Customer Ledger" },
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
      {activeTab ==="Invoice" && (
        <Invoice/>
      )}
       {activeTab ==="ledger" && (
        <CustomerLedger/>
      )}
      </div>
  )
}

export default InvoiceAndCustomerLegder