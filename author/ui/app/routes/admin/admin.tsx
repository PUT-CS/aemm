import { useState } from "react";
import UsersTab from "~/routes/admin/UsersTab/UsersTab";
import { NavTabs, type TabItem } from "~/components/aemm/NavTabs";

export function meta() {
  return [{ title: "Administration | AEMM" }];
}

type AdminSection = "users" | "system";

export default function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>("users");

  const adminTabs: TabItem<AdminSection>[] = [
    { id: "users", label: "Users" },
    { id: "system", label: "System" },
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Administration</h1>

      <NavTabs
        tabs={adminTabs}
        activeTab={activeSection}
        onTabChange={setActiveSection}
      />

      {activeSection === "users" && <UsersTab />}
      {activeSection === "system" && (
        <p className="text-muted-foreground">System settings coming soon.</p>
      )}
    </div>
  );
}
