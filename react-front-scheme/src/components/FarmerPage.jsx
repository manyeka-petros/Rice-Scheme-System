import React, { useState } from "react";
import FarmerForm from "./FarmerForm";
import FarmerTable from "./FarmerTable";
import BlockSectionManager from "./BlockSectionManager";
import { Tab, Tabs } from "react-bootstrap";

export default function FarmerPage() {
  const [editData, setEditData] = useState(null);
  const [refreshFlag, setRefreshFlag] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("farmers");

  return (
    <div className="container-fluid my-4">
      <h1 className="text-center mb-4">Limphasa Rice Scheme System</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* Farmers Management: Form + Table */}
        <Tab eventKey="farmers" title="Farmers Management">
          <div className="mt-3">
            <FarmerForm
              editData={editData}
              onSaved={() => {
                setEditData(null);
                setRefreshFlag(Date.now());
              }}
              onCancel={() => setEditData(null)}
            />

           
          </div>
        </Tab>

        {/* Farmer Records: Only Table */}
        <Tab eventKey="farmer-table" title="Farmer Records">
          <div className="mt-3">
            <FarmerTable
              refreshFlag={refreshFlag}
              onEdit={(farmer) => {
                setEditData(farmer);
                setActiveTab("farmers");
              }}
              onDeleted={() => setRefreshFlag(Date.now())}
            />
          </div>
        </Tab>

        {/* System Setup */}
        <Tab eventKey="setup" title="System Setup">
          <div className="mt-3">
            <BlockSectionManager />
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
