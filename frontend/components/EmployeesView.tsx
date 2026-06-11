import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { useTableControls } from "../lib/useTableControls";
import { TableToolbar, TablePagination, SortHeader } from "./TableControls";

export type Employee = { id: string; name: string; role: string; department: string; status: string };

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

const EMPTY_EMP = { name: "", role: "", department: "", status: "Active" };

type EmpForm = Omit<Employee, "id">;

type EmpErrors = Partial<Record<"name" | "role" | "department", string>>;

const fieldErrorStyle = { color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' };

function EmpModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
  serverError,
}: {
  title: string;
  form: EmpForm;
  onChange: (f: EmpForm) => void;
  onClose: () => void;
  onSubmit: () => void;
  serverError?: string;
}) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<EmpErrors>({});

  const update = (patch: Partial<EmpForm>) => {
    onChange({ ...form, ...patch });
    setErrors(prev => {
      const next = { ...prev };
      for (const key of Object.keys(patch)) delete next[key as keyof EmpErrors];
      return next;
    });
  };

  const handleSave = () => {
    const next: EmpErrors = {};
    if (!form.name.trim()) next.name = t("emp_err_name_required", "Name is required");
    if (!form.role.trim()) next.role = t("emp_err_role_required", "Position is required");
    if (!form.department.trim()) next.department = t("emp_err_dept_required", "Department is required");
    if (Object.keys(next).length > 0) {
      setErrors(next);
      return;
    }
    onSubmit();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{title}</h2>
          <button className="btn-close" onClick={onClose}><CloseIcon /></button>
        </div>
        <div className="modal-body">
          {serverError && (
            <div style={{ background: 'var(--error-bg, rgba(220,38,38,0.1))', color: 'var(--error)', border: '1px solid var(--error)', borderRadius: '0.5rem', padding: '0.6rem 0.85rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
              {serverError}
            </div>
          )}
          <div className="form-group">
            <label>{t("emp_col_name", "Name")}</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => update({ name: e.target.value })}
              placeholder={t("emp_col_name", "Name")}
              style={errors.name ? { borderColor: 'var(--error)' } : undefined}
              autoFocus
            />
            {errors.name && <span style={fieldErrorStyle}>{errors.name}</span>}
          </div>
          <div className="form-group">
            <label>{t("emp_col_role", "Role")}</label>
            <input
              className="form-input"
              value={form.role}
              onChange={e => update({ role: e.target.value })}
              placeholder={t("emp_col_role", "Role")}
              style={errors.role ? { borderColor: 'var(--error)' } : undefined}
            />
            {errors.role && <span style={fieldErrorStyle}>{errors.role}</span>}
          </div>
          <div className="form-group">
            <label>{t("emp_col_dept", "Department")}</label>
            <input
              className="form-input"
              value={form.department}
              onChange={e => update({ department: e.target.value })}
              placeholder={t("emp_col_dept", "Department")}
              style={errors.department ? { borderColor: 'var(--error)' } : undefined}
            />
            {errors.department && <span style={fieldErrorStyle}>{errors.department}</span>}
          </div>
          <div className="form-group">
            <label>{t("emp_col_status", "Status")}</label>
            <select
              className="form-input"
              value={form.status}
              onChange={e => update({ status: e.target.value })}
            >
              <option value="Active">{t("status_active", "Active")}</option>
              <option value="On Vacation">{t("status_vacation", "On Vacation")}</option>
              <option value="Inactive">{t("status_inactive", "Inactive")}</option>
            </select>
          </div>
        </div>
        <div className="modal-footer">
          <button
            className="btn-primary"
            style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
            onClick={onClose}
          >
            {t("btn_cancel", "Cancel")}
          </button>
          <button
            className="btn-primary"
            style={{ width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
            onClick={handleSave}
          >
            {t("btn_save", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function EmployeesView({
  employees,
  setEmployees,
  readOnly = false,
  workspaceId,
  token,
}: {
  employees: Employee[];
  setEmployees: (emps: Employee[]) => void;
  readOnly?: boolean;
  workspaceId: string;
  token: string;
}) {
  const { t } = useTranslation();

  const table = useTableControls(employees, {
    searchFields: ["name", "role", "department", "status"],
    statusField: "status",
  });

  const statusOptions = [
    { value: "Active", label: t("status_active", "Active") },
    { value: "On Vacation", label: t("status_vacation", "On Vacation") },
    { value: "Inactive", label: t("status_inactive", "Inactive") },
  ];

  const [addForm, setAddForm] = useState<EmpForm>(EMPTY_EMP);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState("");

  const [editTarget, setEditTarget] = useState<Employee | null>(null);
  const [editForm, setEditForm] = useState<EmpForm>(EMPTY_EMP);
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Employee | null>(null);

  const handleAddNew = () => {
    setAddForm(EMPTY_EMP);
    setAddError("");
    setShowAddModal(true);
  };

  const handleAddSubmit = async () => {
    setAddError("");
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/employees`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(addForm),
      });
      const data = await res.json();
      if (data.success) {
        setEmployees([data.data, ...employees]);
        setShowAddModal(false);
      } else {
        setAddError(data.message || t("save_error", "Could not save changes. Please try again."));
      }
    } catch {
      setAddError(t("server_connection_error", "Could not connect to the server"));
    }
  };

  const handleEditClick = (emp: Employee) => {
    setEditTarget(emp);
    setEditError("");
    setEditForm({ name: emp.name, role: emp.role, department: emp.department, status: emp.status });
  };

  const handleEditSubmit = async () => {
    if (!editTarget) return;
    setEditError("");
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/employees/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify(editForm),
      });
      const data = await res.json();
      if (data.success) {
        setEmployees(employees.map(e => e.id === editTarget.id ? data.data : e));
        setEditTarget(null);
      } else {
        setEditError(data.message || t("save_error", "Could not save changes. Please try again."));
      }
    } catch {
      setEditError(t("server_connection_error", "Could not connect to the server"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/employees/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setEmployees(employees.filter(e => e.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          <h1>{t("emp_title", "Employee Directory")}</h1>
        </div>
        <p>{t("emp_desc", "Manage your team's information and status.")}</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>{t("emp_list_title", "Staff List")}</h2>
          {!readOnly && (
            <button className="btn-primary" onClick={handleAddNew} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>
              {t("emp_btn_new", "+ New Employee")}
            </button>
          )}
        </div>
        <TableToolbar
          query={table.query}
          onQueryChange={table.setQuery}
          statusFilter={table.statusFilter}
          onStatusChange={table.setStatusFilter}
          statusOptions={statusOptions}
        />
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label={t("emp_col_name", "Name")} columnKey="name" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label={t("emp_col_role", "Role")} columnKey="role" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label={t("emp_col_dept", "Department")} columnKey="department" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label={t("emp_col_status", "Status")} columnKey="status" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              {!readOnly && <th style={{ width: '80px', textAlign: 'center' }}>{t("col_actions", "Actions")}</th>}
            </tr>
          </thead>
          <tbody>
            {table.total === 0 && (
              <tr>
                <td colSpan={readOnly ? 4 : 5} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem' }}>
                  {t("tbl_no_results", "No results")}
                </td>
              </tr>
            )}
            {table.paged.map((emp) => (
              <tr key={emp.id}>
                <td style={{ fontWeight: 500 }}>{emp.name}</td>
                <td>{emp.role}</td>
                <td>{emp.department}</td>
                <td>
                  <span className={`badge ${
                    emp.status === 'Active' ? 'badge-success' :
                    emp.status === 'On Vacation' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {emp.status === 'Active' ? t('status_active', 'Active') : emp.status === 'On Vacation' ? t('status_vacation', 'On Vacation') : t('status_inactive', 'Inactive')}
                  </span>
                </td>
                {!readOnly && (
                  <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      className="btn-action"
                      onClick={() => handleEditClick(emp)}
                      title={t("emp_btn_edit", "Edit employee")}
                      style={{ cursor: 'pointer' }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="btn-action"
                      onClick={() => setDeleteTarget(emp)}
                      title={t("btn_delete", "Delete")}
                      style={{ cursor: 'pointer', color: 'var(--error)', borderColor: 'var(--error)' }}
                    >
                      <TrashIcon />
                    </button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        <TablePagination
          page={table.page}
          pageCount={table.pageCount}
          pageSize={table.pageSize}
          onPageSizeChange={table.setPageSize}
          onPrev={() => table.setPage(table.page - 1)}
          onNext={() => table.setPage(table.page + 1)}
        />
      </div>

      {showAddModal && (
        <EmpModal
          title={t("emp_btn_new", "+ New Employee")}
          form={addForm}
          onChange={setAddForm}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
          serverError={addError}
        />
      )}

      {editTarget && (
        <EmpModal
          title={t("emp_btn_edit", "Edit employee")}
          form={editForm}
          onChange={setEditForm}
          onClose={() => setEditTarget(null)}
          onSubmit={handleEditSubmit}
          serverError={editError}
        />
      )}

      {deleteTarget && (
        <div className="modal-overlay" onClick={() => setDeleteTarget(null)}>
          <div className="modal-content" style={{ maxWidth: '420px' }} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h2>{t("delete_confirm_title", "Confirm Deletion")}</h2>
              <button className="btn-close" onClick={() => setDeleteTarget(null)}><CloseIcon /></button>
            </div>
            <div className="modal-body">
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                {t("emp_delete_confirm", "Are you sure you want to delete {{name}}? This action cannot be undone.", { name: deleteTarget.name })}
              </p>
            </div>
            <div className="modal-footer">
              <button
                className="btn-primary"
                style={{ background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--border-color)', width: 'auto', margin: 0, padding: '0.5rem 1.25rem' }}
                onClick={() => setDeleteTarget(null)}
              >
                {t("btn_cancel", "Cancel")}
              </button>
              <button
                className="btn-primary"
                style={{ width: 'auto', margin: 0, padding: '0.5rem 1.25rem', background: 'var(--error)', boxShadow: 'none' }}
                onClick={handleDeleteConfirm}
              >
                {t("btn_delete", "Delete")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
