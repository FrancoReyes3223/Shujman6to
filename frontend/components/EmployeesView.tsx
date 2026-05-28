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

const CloseIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
  </svg>
);

const TrashIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
  </svg>
);

const EMPTY_EMP = { name: "", role: "", department: "", status: "Activo" };

type EmpForm = Omit<Employee, "id">;

function EmpModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  title: string;
  form: EmpForm;
  onChange: (f: EmpForm) => void;
  onClose: () => void;
  onSubmit: () => void;
}) {
  const { t } = useTranslation();
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="modal-body">
          <div className="form-group">
            <label>{t("emp_col_name", "Nombre")}</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => onChange({ ...form, name: e.target.value })}
              placeholder={t("emp_col_name", "Nombre")}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>{t("emp_col_role", "Cargo")}</label>
            <input
              className="form-input"
              value={form.role}
              onChange={e => onChange({ ...form, role: e.target.value })}
              placeholder={t("emp_col_role", "Cargo")}
            />
          </div>
          <div className="form-group">
            <label>{t("emp_col_dept", "Departamento")}</label>
            <input
              className="form-input"
              value={form.department}
              onChange={e => onChange({ ...form, department: e.target.value })}
              placeholder={t("emp_col_dept", "Departamento")}
            />
          </div>
          <div className="form-group">
            <label>{t("emp_col_status", "Estado")}</label>
            <select
              className="form-input"
              value={form.status}
              onChange={e => onChange({ ...form, status: e.target.value })}
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
            onClick={onClose}
          >
            {t("btn_cancel", "Cancelar")}
          </button>
          <button
            className="btn-primary"
            style={{ width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
            onClick={onSubmit}
            disabled={!form.name.trim()}
          >
            {t("btn_save", "Guardar")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesView({ employees, setEmployees }: { employees: Employee[], setEmployees: (emps: Employee[]) => void }) {
  const { t } = useTranslation();

  const [addForm, setAddForm] = useState<EmpForm>(EMPTY_EMP);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EmpForm>(EMPTY_EMP);

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const handleAddNew = () => {
    setAddForm(EMPTY_EMP);
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    if (!addForm.name.trim()) return;
    setEmployees([{ id: Date.now(), ...addForm }, ...employees]);
    setShowAddModal(false);
  };

  const handleEditClick = (emp: Employee) => {
    setEditTarget(emp);
    setEditForm({ name: emp.name, role: emp.role, department: emp.department, status: emp.status });
  };

  const handleEditSubmit = () => {
    if (!editTarget || !editForm.name.trim()) return;
    setEmployees(employees.map(e => e.id === editTarget.id ? { ...editTarget, ...editForm } : e));
    setEditTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setEmployees(employees.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
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
          <button className="btn-primary" onClick={handleAddNew} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>
            {t("emp_btn_new", "+ Nuevo Empleado")}
          </button>
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
                <td style={{ fontWeight: 500 }}>{emp.name}</td>
                <td>{emp.role}</td>
                <td>{emp.department}</td>
                <td>
                  <span className={`badge ${
                    emp.status === 'Activo' ? 'badge-success' :
                    emp.status === 'Vacaciones' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {emp.status === 'Activo' ? t('status_active', 'Activo') : emp.status === 'Vacaciones' ? t('status_vacation', 'Vacaciones') : t('status_inactive', 'Inactivo')}
                  </span>
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  <button
                    className="btn-action"
                    onClick={() => handleEditClick(emp)}
                    title={t("emp_btn_edit", "Editar empleado")}
                    style={{ cursor: 'pointer' }}
                  >
                    <EditIcon />
                  </button>
                  <button
                    className="btn-action"
                    onClick={() => setDeleteTarget(emp)}
                    title={t("btn_delete", "Eliminar")}
                    style={{ cursor: 'pointer', color: 'var(--error)', borderColor: 'var(--error)' }}
                  >
                    <TrashIcon />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <EmpModal
          title={t("emp_btn_new", "+ Nuevo Empleado")}
          form={addForm}
          onChange={setAddForm}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
        />
      )}

      {editTarget && (
        <EmpModal
          title={t("emp_btn_edit", "Editar empleado")}
          form={editForm}
          onChange={setEditForm}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEditSubmit}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("delete_confirm_title", "Confirmar eliminación")}</h2>
              <button className="btn-close" onClick={() => setDeleteTarget(null)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t("emp_delete_confirm", "¿Estás seguro de que querés eliminar a {{name}}? Esta acción no se puede deshacer.", { name: deleteTarget.name })}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
                onClick={() => setDeleteTarget(null)}
              >
                {t("btn_cancel", "Cancelar")}
              </button>
              <button
                className="btn-primary"
                style={{ width: 'auto', margin: 0, padding: '0.5rem 1.25rem', background: 'var(--error)', boxShadow: 'none' }}
                onClick={handleDeleteConfirm}
              >
                {t("btn_delete", "Eliminar")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
