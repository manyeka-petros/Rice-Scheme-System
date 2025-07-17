import React, { useState } from "react";
import AttendanceForm from "./AttendanceForm";
import AttendanceTable from "./AttendanceTable";
import { Container, Tabs, Tab } from "react-bootstrap";

export default function AttendancePage() {
  const [refreshFlag, setRefreshFlag] = useState(Date.now());
  const [activeTab, setActiveTab] = useState("manage");
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <Container className="py-4">
      <h1 className="mb-4 text-center">Attendance Management</h1>

      <Tabs
        activeKey={activeTab}
        onSelect={(k) => setActiveTab(k)}
        className="mb-3"
      >
        {/* Tab 1: Attendance Form + Table */}
        <Tab eventKey="manage" title="Manage Attendance">
          <div className="mt-3">
            {['admin', 'block_chair'].includes(user?.role) && (
              <AttendanceForm onSaved={() => setRefreshFlag(Date.now())} />
            )}
            
          </div>
        </Tab>

        {/* Tab 2: View Attendance Records */}
        <Tab eventKey="records" title="Attendance Records">
          <div className="mt-3">
            <AttendanceTable refreshFlag={refreshFlag} />
          </div>
        </Tab>
      </Tabs>
    </Container>
  );
}
