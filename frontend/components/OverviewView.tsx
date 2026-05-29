import { Employee } from "./EmployeesView";
import { useTranslation } from "react-i18next";
import { Product } from "./ProductsView";

type OverviewProps = {
  employees: Employee[];
  products: Product[];
};

export default function OverviewView({ employees, products }: OverviewProps) {
  const { t } = useTranslation();
  const totalEmployees = employees.length;
  const totalProducts = products.length;
  const stockAlerts = products.filter(p => p.status === 'Low' || p.status === 'Out of Stock').length;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>{t("overview_title", "General Overview")}</h1>
        <p>{t("overview_desc", "A quick look at the company's main metrics.")}</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>{t("overview_total_emp", "Total Employees")}</h3>
          <div className="value">{totalEmployees}</div>
        </div>
        <div className="metric-card">
          <h3>{t("overview_total_prod", "Products in Catalog")}</h3>
          <div className="value">{totalProducts}</div>
        </div>
        <div className="metric-card">
          <h3>{t("overview_stock_alerts", "Stock Alerts")}</h3>
          <div className="value" style={{ color: stockAlerts > 0 ? 'var(--error)' : 'var(--gold)' }}>{stockAlerts}</div>
        </div>
      </div>
    </div>
  );
}
