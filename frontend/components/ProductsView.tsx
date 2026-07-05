import { useState } from "react";
import { useTranslation } from "react-i18next";
import { API_BASE } from "../lib/api";
import { useTableControls } from "../lib/useTableControls";
import { TableToolbar, TablePagination, SortHeader } from "./TableControls";
import { exportCsv } from "../lib/exportCsv";
import ImportModal from "./ImportModal";

export type Product = { id: string; name: string; category: string; price: string; stock: string; status: string };

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

const EMPTY_PROD = { name: "", category: "", price: "", stock: "", status: "Normal" };

type ProdForm = Omit<Product, "id">;

function normalizePrice(price: string) {
  return price && !price.startsWith('$') ? '$' + price : price;
}

const fieldErrorStyle = { color: 'var(--error)', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' };

/** Valida precio (opcional, número >= 0, admite $ y miles) y stock (entero >= 0). */
function validatePriceClient(raw: string): boolean {
  if (!raw.trim()) return true;
  const cleaned = raw.replace(/[$\s,]/g, "");
  const num = Number(cleaned);
  return Number.isFinite(num) && num >= 0;
}
function validateStockClient(raw: string): boolean {
  if (!raw.trim()) return true;
  return /^\d+$/.test(raw.replace(/[\s,]/g, ""));
}

function ProdModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
  serverError,
}: {
  title: string;
  form: ProdForm;
  onChange: (f: ProdForm) => void;
  onClose: () => void;
  onSubmit: () => void;
  serverError?: string;
}) {
  const { t } = useTranslation();
  const [errors, setErrors] = useState<{ price?: string; stock?: string }>({});

  const handleSave = () => {
    const next: { price?: string; stock?: string } = {};
    if (!validatePriceClient(form.price)) next.price = t("prod_err_price", "Price must be a number ≥ 0");
    if (!validateStockClient(form.stock)) next.stock = t("prod_err_stock", "Stock must be a whole number ≥ 0");
    if (Object.keys(next).length > 0) { setErrors(next); return; }
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
            <label>{t("prod_col_name", "Product/Service Name")}</label>
            <input
              className="form-input"
              value={form.name}
              onChange={e => onChange({ ...form, name: e.target.value })}
              placeholder={t("prod_col_name", "Product/Service Name")}
              autoFocus
            />
          </div>
          <div className="form-group">
            <label>{t("prod_col_category", "Category")}</label>
            <input
              className="form-input"
              value={form.category}
              onChange={e => onChange({ ...form, category: e.target.value })}
              placeholder={t("prod_col_category", "Category")}
            />
          </div>
          <div className="form-group">
            <label>{t("prod_col_price", "Price")}</label>
            <input
              className="form-input"
              value={form.price}
              onChange={e => { onChange({ ...form, price: e.target.value }); setErrors(p => ({ ...p, price: undefined })); }}
              placeholder="$0.00"
              style={errors.price ? { borderColor: 'var(--error)' } : undefined}
            />
            {errors.price && <span style={fieldErrorStyle}>{errors.price}</span>}
          </div>
          <div className="form-group">
            <label>{t("prod_col_stock", "Stock")}</label>
            <input
              className="form-input"
              value={form.stock}
              onChange={e => { onChange({ ...form, stock: e.target.value }); setErrors(p => ({ ...p, stock: undefined })); }}
              placeholder={t("prod_col_stock", "Stock")}
              style={errors.stock ? { borderColor: 'var(--error)' } : undefined}
            />
            {errors.stock && <span style={fieldErrorStyle}>{errors.stock}</span>}
          </div>
          <div className="form-group">
            <label>{t("prod_col_status", "Status")}</label>
            <select
              className="form-input"
              value={form.status}
              onChange={e => onChange({ ...form, status: e.target.value })}
            >
              <option value="Normal">{t("status_normal", "Normal")}</option>
              <option value="Low">{t("status_low", "Low")}</option>
              <option value="Out of Stock">{t("status_out", "Out of Stock")}</option>
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
            disabled={!form.name.trim()}
          >
            {t("btn_save", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsView({
  products,
  setProducts,
  readOnly = false,
  workspaceId,
  token,
}: {
  products: Product[];
  setProducts: (prods: Product[]) => void;
  readOnly?: boolean;
  workspaceId: string;
  token: string;
}) {
  const { t } = useTranslation();

  const table = useTableControls(products, {
    searchFields: ["name", "category", "status"],
    statusField: "status",
    numericFields: ["price", "stock"],
  });

  const statusOptions = [
    { value: "Normal", label: t("status_normal", "Normal") },
    { value: "Low", label: t("status_low", "Low") },
    { value: "Out of Stock", label: t("status_out", "Out of Stock") },
  ];

  const searchColumnOptions = [
    { value: "name", label: t("prod_col_name", "Product/Service Name") },
    { value: "category", label: t("prod_col_category", "Category") },
  ];

  const csvColumns: { key: keyof Product; label: string }[] = [
    { key: "name", label: t("prod_col_name", "Product/Service Name") },
    { key: "category", label: t("prod_col_category", "Category") },
    { key: "price", label: t("prod_col_price", "Price") },
    { key: "stock", label: t("prod_col_stock", "Stock") },
    { key: "status", label: t("prod_col_status", "Status") },
  ];

  const [addForm, setAddForm] = useState<ProdForm>(EMPTY_PROD);
  const [showAddModal, setShowAddModal] = useState(false);
  const [addError, setAddError] = useState("");
  const [showImport, setShowImport] = useState(false);

  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProdForm>(EMPTY_PROD);
  const [editError, setEditError] = useState("");

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleAddNew = () => {
    setAddForm(EMPTY_PROD);
    setAddError("");
    setShowAddModal(true);
  };

  const handleAddSubmit = async () => {
    if (!addForm.name.trim()) return;
    setAddError("");
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/products`, {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...addForm, price: normalizePrice(addForm.price) }),
      });
      const data = await res.json();
      if (data.success) { setProducts([data.data, ...products]); setShowAddModal(false); }
      else setAddError(data.message || t("save_error", "Could not save changes. Please try again."));
    } catch {
      setAddError(t("server_connection_error", "Could not connect to the server"));
    }
  };

  const handleEditClick = (prod: Product) => {
    setEditTarget(prod);
    setEditError("");
    setEditForm({ name: prod.name, category: prod.category, price: prod.price, stock: prod.stock, status: prod.status });
  };

  const handleEditSubmit = async () => {
    if (!editTarget || !editForm.name.trim()) return;
    setEditError("");
    try {
      const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/products/${editTarget.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...editForm, price: normalizePrice(editForm.price) }),
      });
      const data = await res.json();
      if (data.success) { setProducts(products.map(p => p.id === editTarget.id ? data.data : p)); setEditTarget(null); }
      else setEditError(data.message || t("save_error", "Could not save changes. Please try again."));
    } catch {
      setEditError(t("server_connection_error", "Could not connect to the server"));
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deleteTarget) return;
    const res = await fetch(`${API_BASE}/workspaces/${workspaceId}/products/${deleteTarget.id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (data.success) setProducts(products.filter(p => p.id !== deleteTarget.id));
    setDeleteTarget(null);
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          <h1>{t("prod_title", "Products & Stock")}</h1>
        </div>
        <p>{t("prod_desc", "Monitor prices and inventory of your products or services.")}</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>{t("prod_list_title", "Current Inventory")}</h2>
          {!readOnly && (
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button className="btn-primary" onClick={() => setShowImport(true)} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem', background: 'transparent', color: 'var(--accent)', border: '1px solid var(--accent)', boxShadow: 'none' }}>
                {t("import_btn", "Import")}
              </button>
              <button className="btn-primary" onClick={handleAddNew} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>
                {t("prod_btn_new", "+ New Product")}
              </button>
            </div>
          )}
        </div>
        <TableToolbar
          query={table.query}
          onQueryChange={table.setQuery}
          statusFilter={table.statusFilter}
          onStatusChange={table.setStatusFilter}
          statusOptions={statusOptions}
          searchColumn={table.searchColumn as string}
          onSearchColumnChange={table.setSearchColumn}
          searchColumnOptions={searchColumnOptions}
          onExport={() => exportCsv("products.csv", csvColumns, table.rows)}
        />
        <table className="data-table">
          <thead>
            <tr>
              <SortHeader label={t("prod_col_name", "Product/Service Name")} columnKey="name" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label={t("prod_col_category", "Category")} columnKey="category" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label={t("prod_col_price", "Price")} columnKey="price" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label={t("prod_col_stock", "Stock")} columnKey="stock" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              <SortHeader label={t("prod_col_status", "Status")} columnKey="status" sortKey={table.sortKey as string | null} sortDir={table.sortDir} onSort={table.toggleSort} />
              {!readOnly && <th style={{ width: '80px', textAlign: 'center' }}>{t("col_actions", "Actions")}</th>}
            </tr>
          </thead>
          <tbody>
            {table.total === 0 && (
              <tr>
                <td colSpan={readOnly ? 5 : 6} style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '1.5rem' }}>
                  {t("tbl_no_results", "No results")}
                </td>
              </tr>
            )}
            {table.paged.map((prod) => (
              <tr key={prod.id}>
                <td style={{ fontWeight: 500 }}>{prod.name}</td>
                <td>{prod.category}</td>
                <td>{prod.price}</td>
                <td>{prod.stock}</td>
                <td>
                  <span className={`badge ${
                    prod.status === 'Normal' ? 'badge-success' :
                    prod.status === 'Low' ? 'badge-warning' : 'badge-error'
                  }`}>
                    {prod.status === 'Normal' ? t('status_normal', 'Normal') : prod.status === 'Low' ? t('status_low', 'Low') : t('status_out', 'Out of Stock')}
                  </span>
                </td>
                {!readOnly && (
                  <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                    <button
                      className="btn-action"
                      onClick={() => handleEditClick(prod)}
                      title={t("prod_btn_edit", "Edit product")}
                      style={{ cursor: 'pointer' }}
                    >
                      <EditIcon />
                    </button>
                    <button
                      className="btn-action"
                      onClick={() => setDeleteTarget(prod)}
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
        <ProdModal
          title={t("prod_btn_new", "+ New Product")}
          form={addForm}
          onChange={setAddForm}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
          serverError={addError}
        />
      )}

      {showImport && (
        <ImportModal<Product>
          title={t("import_title_prod", "Import products")}
          endpoint={`/workspaces/${workspaceId}/products/import`}
          token={token}
          templateColumns={csvColumns}
          templateFilename="products-template.csv"
          onImported={(created) => setProducts([...created, ...products])}
          onClose={() => setShowImport(false)}
        />
      )}

      {editTarget && (
        <ProdModal
          title={t("prod_btn_edit", "Edit product")}
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
                {t("prod_delete_confirm", "Are you sure you want to delete {{name}}? This action cannot be undone.", { name: deleteTarget.name })}
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
