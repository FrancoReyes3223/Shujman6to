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
  const stockAlerts = products.filter(p => p.status === 'Bajo' || p.status === 'Agotado').length;

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>{t("overview_title", "Resumen General")}</h1>
        <p>{t("overview_desc", "Un vistazo rápido a las métricas principales de la empresa.")}</p>
      </div>

      <div className="metrics-grid">
        <div className="metric-card">
          <h3>{t("overview_total_emp", "Total Empleados")}</h3>
          <div className="value">{totalEmployees}</div>
        </div>
        <div className="metric-card">
          <h3>{t("overview_total_prod", "Productos en Catálogo")}</h3>
          <div className="value">{totalProducts}</div>
        </div>
        <div className="metric-card">
          <h3>{t("overview_stock_alerts", "Alertas de Stock")}</h3>
          <div className="value" style={{ color: stockAlerts > 0 ? 'var(--error)' : 'var(--gold)' }}>{stockAlerts}</div>
        </div>
      </div>
    </div>
  );
}
