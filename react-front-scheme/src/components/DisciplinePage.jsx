import React, { useState } from "react";
import DisciplineForm from "./DisciplineForm";
import DisciplineTable from "./DisciplineTable";
import { Container, Tabs, Tab } from "react-bootstrap";

export default function DisciplinePage() {
  const [refreshFlag, setRefreshFlag] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("manage");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Discipline Management</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* Tab 1: Form + Table */}
        <Tab eventKey="manage" title="Manage Discipline">
          <div className="mt-3">
            {['admin', 'block_chair'].includes(user?.role) && (
              <DisciplineForm onSaved={() => setRefreshFlag(Date.now())} />
            )}
          </div>
        </Tab>

        {/* Tab 2: Table Only */}
        <Tab eventKey="records" title="Discipline Records">
          <div className="mt-3">
            <DisciplineTable refreshFlag={refreshFlag} />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}
