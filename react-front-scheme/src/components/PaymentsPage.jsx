import React, { useState } from "react";
import PaymentForm from "./PaymentForm";
import PaymentTable from "./PaymentTable";
import { Container, Tabs, Tab } from "react-bootstrap";

export default function PaymentsPage() {
  const [refreshFlag, setRefreshFlag] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("manage");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Payment Management</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* Tab for managing payments: Form + Table */}
        <Tab eventKey="manage" title="Manage Payments">
          <div className="mt-3">
            {['admin', 'block_chair', 'treasurer'].includes(user?.role) && (
              <PaymentForm onSaved={() => setRefreshFlag(Date.now())} />
            )}
          
          </div>
        </Tab>

        {/* Tab for viewing payment history (Table only) */}
        <Tab eventKey="history" title="Payment History">
          <div className="mt-3">
            <PaymentTable refreshFlag={refreshFlag} />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}
