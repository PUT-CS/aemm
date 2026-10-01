import { useState } from "react";
import { Navigate } from "react-router";
import UsersTab from "~/routes/admin/UsersTab/UsersTab";
import { NavTabs, type TabItem } from "~/components/aemm/NavTabs";
import { useCurrentUser } from "~/lib/auth";

export function meta() {
  return [{ title: "Administration | AEMM" }];
}

type AdminSection = "users" | "system";

export default function Admin() {
  const [activeSection, setActiveSection] = useState<AdminSection>("users");
  const { data: user } = useCurrentUser();

  const adminTabs: TabItem<AdminSection>[] = [
    { id: "users", label: "Users" },
    { id: "system", label: "System" },
  ];

  if (user?.role !== "admin") {
    return <Navigate to="/" replace />;
  }

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
        <p className="text-muted-foreground">TODO</p>
      )}
    </div>
  );
}
