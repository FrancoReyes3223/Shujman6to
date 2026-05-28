import { useState } from "react";
import { useTranslation } from "react-i18next";

export type Employee = { id: number; name: string; role: string; department: string; status: string };

export const INITIAL_EMPLOYEES: Employee[] = [
  { id: 1, name: "Carlos Rodríguez", role: "Gerente de Ventas", department: "Comercial", status: "Activo" },
  { id: 2, name: "Laura Gómez", role: "Especialista en Marketing", department: "Marketing", status: "Activo" },
  { id: 3, name: "Martín Silva", role: "Desarrollador Frontend", department: "IT", status: "Vacaciones" },
  { id: 4, name: "Ana Martínez", role: "Analista de RRHH", department: "Recursos Humanos", status: "Activo" },
  { id: 5, name: "Pedro Sánchez", role: "Soporte Técnico", department: "IT", status: "Inactivo" },
];

const EditIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z"/><path d="m15 5 4 4"/>
  </svg>
);

const SaveIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="20 6 9 17 4 12"/>
  </svg>
);

const EMPTY_EMP = { name: "", role: "", department: "", status: "Activo" };

export default function EmployeesView({ employees, setEmployees }: { employees: Employee[], setEmployees: (emps: Employee[]) => void }) {
  const { t } = useTranslation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Employee | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Employee, "id">>(EMPTY_EMP);

  const handleEditClick = (emp: Employee) => {
    setEditingId(emp.id);
    setEditFormData({ ...emp });
  };

  const handleAddNew = () => {
    setNewForm(EMPTY_EMP);
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    if (!newForm.name.trim()) return;
    setEmployees([{ id: Date.now(), ...newForm }, ...employees]);
    setShowAddModal(false);
  };

  const handleSave = () => {
    if (editFormData) {
      setEmployees(employees.map(emp => emp.id === editFormData.id ? editFormData : emp));
      setEditingId(null);
    }
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h1>{t("emp_title", "Directorio de Empleados")}</h1>
        </div>
        <p>{t("emp_desc", "Gestiona la información y estado de tu equipo.")}</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>{t("emp_list_title", "Lista de Personal")}</h2>
          <button className="btn-primary" onClick={handleAddNew} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>{t("emp_btn_new", "+ Nuevo Empleado")}</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("emp_col_name", "Nombre")}</th>
              <th>{t("emp_col_role", "Cargo")}</th>
              <th>{t("emp_col_dept", "Departamento")}</th>
              <th>{t("emp_col_status", "Estado")}</th>
              <th style={{ width: '80px', textAlign: 'center' }}>{t("col_actions", "Acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 500 }}>
                  {editingId === emp.id ? (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.name} 
                      onChange={e => setEditFormData({...editFormData!, name: e.target.value})}
                    />
                  ) : (
                    emp.name
                  )}
                </td>
                <td>
                  {editingId === emp.id ? (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.role} 
                      onChange={e => setEditFormData({...editFormData!, role: e.target.value})}
                    />
                  ) : (
                    emp.role
                  )}
                </td>
                <td>
                  {editingId === emp.id ? (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.department} 
                      onChange={e => setEditFormData({...editFormData!, department: e.target.value})}
                    />
                  ) : (
                    emp.department
                  )}
                </td>
                <td>
                  {editingId === emp.id ? (
                    <select 
                      className="form-input"
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.status}
                      onChange={e => setEditFormData({...editFormData!, status: e.target.value})}
                    >
                      <option value="Activo">{t("status_active", "Activo")}</option>
                      <option value="Vacaciones">{t("status_vacation", "Vacaciones")}</option>
                      <option value="Inactivo">{t("status_inactive", "Inactivo")}</option>
                    </select>
                  ) : (
                    <span className={`badge ${
                      emp.status === 'Activo' ? 'badge-success' : 
                      emp.status === 'Vacaciones' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {emp.status === 'Activo' ? t('status_active', 'Activo') : emp.status === 'Vacaciones' ? t('status_vacation', 'Vacaciones') : t('status_inactive', 'Inactivo')}
                    </span>
                  )}
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  {editingId === emp.id ? (
                    <button 
                      className="btn-action" 
                      onClick={handleSave}
                      title={t("btn_save", "Guardar")}
                      style={{ cursor: 'pointer', color: 'var(--success)', borderColor: 'var(--success)' }}
                    >
                      <SaveIcon />
                    </button>
                  ) : (
                    <button 
                      className="btn-action" 
                      onClick={() => handleEditClick(emp)}
                      title={t("emp_btn_edit", "Editar empleado")}
                      style={{ cursor: 'pointer' }}
                    >
                      <EditIcon />
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <div className="modal-overlay" onClick={() => setShowAddModal(false)}>
          <div className="modal-content" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("emp_btn_new", "+ Nuevo Empleado")}</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t("emp_col_name", "Nombre")}</label>
                <input
                  className="form-input"
                  value={newForm.name}
                  onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder={t("emp_col_name", "Nombre")}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>{t("emp_col_role", "Cargo")}</label>
                <input
                  className="form-input"
                  value={newForm.role}
                  onChange={e => setNewForm({ ...newForm, role: e.target.value })}
                  placeholder={t("emp_col_role", "Cargo")}
                />
              </div>
              <div className="form-group">
                <label>{t("emp_col_dept", "Departamento")}</label>
                <input
                  className="form-input"
                  value={newForm.department}
                  onChange={e => setNewForm({ ...newForm, department: e.target.value })}
                  placeholder={t("emp_col_dept", "Departamento")}
                />
              </div>
              <div className="form-group">
                <label>{t("emp_col_status", "Estado")}</label>
                <select
                  className="form-input"
                  value={newForm.status}
                  onChange={e => setNewForm({ ...newForm, status: e.target.value })}
                >
                  <option value="Activo">{t("status_active", "Activo")}</option>
                  <option value="Vacaciones">{t("status_vacation", "Vacaciones")}</option>
                  <option value="Inactivo">{t("status_inactive", "Inactivo")}</option>
                </select>
              </div>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
                onClick={() => setShowAddModal(false)}
              >
                {t("btn_cancel", "Cancelar")}
              </button>
              <button
                className="btn-primary"
                style={{ width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
                onClick={handleAddSubmit}
                disabled={!newForm.name.trim()}
              >
                {t("btn_save", "Guardar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
