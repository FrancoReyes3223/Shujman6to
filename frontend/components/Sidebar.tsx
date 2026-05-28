import { useTranslation } from "react-i18next";

type SidebarProps = {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onLogout: () => void;
  userFullName?: string;
  isOpen: boolean;
  setIsOpen: (isOpen: boolean) => void;
};

const Icons = {
  overview: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="7" height="9" x="3" y="3" rx="1"/><rect width="7" height="5" x="14" y="3" rx="1"/><rect width="7" height="9" x="14" y="12" rx="1"/><rect width="7" height="5" x="3" y="16" rx="1"/></svg>,
  employees: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>,
  products: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>,
  logout: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>,
  menu: <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="4" x2="20" y1="12" y2="12"/><line x1="4" x2="20" y1="6" y2="6"/><line x1="4" x2="20" y1="18" y2="18"/></svg>
};

export default function Sidebar({ activeTab, setActiveTab, onLogout, userFullName, isOpen, setIsOpen }: SidebarProps) {
  const { t } = useTranslation();

  const tabs = [
    { id: "overview", label: t("sidebar_overview", "Resumen General"), icon: Icons.overview },
    { id: "employees", label: t("sidebar_employees", "Empleados"), icon: Icons.employees },
    { id: "products", label: t("sidebar_products", "Productos y Stock"), icon: Icons.products },
  ];

  return (
    <div className={`dashboard-sidebar ${isOpen ? 'open' : 'closed'}`}>
      <div className="sidebar-header">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: isOpen ? 'space-between' : 'center', width: '100%' }}>
          {isOpen && <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Shujman<span style={{ color: 'var(--gold)' }}>B2B</span></h2>}
          <button onClick={() => setIsOpen(!isOpen)} className="toggle-btn">
            {Icons.menu}
          </button>
        </div>
        {isOpen && (
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
            {userFullName ? `Hola, ${userFullName}` : 'Cargando perfil...'}
          </p>
        )}
      </div>

      <nav className="sidebar-nav">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`nav-item ${activeTab === tab.id ? "active" : ""}`}
            onClick={() => setActiveTab(tab.id)}
            title={!isOpen ? tab.label : undefined}
          >
            <span className="icon">{tab.icon}</span>
            {isOpen && <span className="label">{tab.label}</span>}
          </button>
        ))}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <button 
          className="nav-item" 
          onClick={onLogout}
          style={{ color: 'var(--error)' }}
          title={!isOpen ? t("logout", "Cerrar Sesión") : undefined}
        >
          <span className="icon">{Icons.logout}</span>
          {isOpen && <span className="label">{t("logout", "Cerrar Sesión")}</span>}
        </button>
      </div>
    </div>
  );
}
