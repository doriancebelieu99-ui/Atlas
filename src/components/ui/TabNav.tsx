// ─── Atlas — Tab Navigation ───────────────────────────────────────

interface Tab {
  id: string;
  label: string;
}

interface TabNavProps {
  tabs: Tab[];
  activeTab: string;
  onTabChange: (id: string) => void;
}

export default function TabNav({ tabs, activeTab, onTabChange }: TabNavProps) {
  return (
    <div className="tab-nav" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          id={`tab-${tab.id}`}
          role="tab"
          className={`tab-btn ${activeTab === tab.id ? "active" : ""}`}
          onClick={() => onTabChange(tab.id)}
          aria-selected={activeTab === tab.id}
          aria-controls={`panel-${tab.id}`}
          tabIndex={activeTab === tab.id ? 0 : -1}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}
