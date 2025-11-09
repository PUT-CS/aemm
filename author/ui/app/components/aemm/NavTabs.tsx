import { cn } from "~/lib/utils";

export interface TabItem<T extends string> {
  id: T;
  label: string;
}

interface NavTabsProps<T extends string> {
  tabs: TabItem<T>[];
  activeTab: T;
  onTabChange: (tab: T) => void;
}

export function NavTabs<T extends string>({
  tabs,
  activeTab,
  onTabChange,
}: NavTabsProps<T>) {
  return (
    <div className="flex gap-6 mb-8 border-b">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            "pb-3 font-medium transition-colors relative cursor-pointer",
            activeTab === tab.id
              ? "text-primary"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {tab.label}
          {activeTab === tab.id && (
            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary" />
          )}
        </button>
      ))}
    </div>
  );
}
