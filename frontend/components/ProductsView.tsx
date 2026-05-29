import { useState } from "react";
import { useTranslation } from "react-i18next";

export type Product = { id: number; name: string; category: string; price: string; stock: string; status: string };

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Licencia Software Básico", category: "Servicios", price: "$150.00", stock: "Ilimitado", status: "Normal" },
  { id: 2, name: "Licencia Software Pro", category: "Servicios", price: "$300.00", stock: "Ilimitado", status: "Normal" },
  { id: 3, name: "Servidor Dedicado Tipo A", category: "Hardware", price: "$1,200.00", stock: "5", status: "Low" },
  { id: 4, name: "Soporte Técnico Premium 1 Año", category: "Servicios", price: "$500.00", stock: "Ilimitado", status: "Normal" },
  { id: 5, name: "Router Empresarial", category: "Hardware", price: "$250.00", stock: "0", status: "Out of Stock" },
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

const EMPTY_PROD = { name: "", category: "", price: "", stock: "", status: "Normal" };

type ProdForm = Omit<Product, "id">;

function normalizePrice(price: string) {
  return price && !price.startsWith('$') ? '$' + price : price;
}

function ProdModal({
  title,
  form,
  onChange,
  onClose,
  onSubmit,
}: {
  title: string;
  form: ProdForm;
  onChange: (f: ProdForm) => void;
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
              onChange={e => onChange({ ...form, price: e.target.value })}
              placeholder="$0.00"
            />
          </div>
          <div className="form-group">
            <label>{t("prod_col_stock", "Stock")}</label>
            <input
              className="form-input"
              value={form.stock}
              onChange={e => onChange({ ...form, stock: e.target.value })}
              placeholder={t("prod_col_stock", "Stock")}
            />
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
            onClick={onSubmit}
            disabled={!form.name.trim()}
          >
            {t("btn_save", "Save")}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ProductsView({ products, setProducts }: { products: Product[], setProducts: (prods: Product[]) => void }) {
  const { t } = useTranslation();

  const [addForm, setAddForm] = useState<ProdForm>(EMPTY_PROD);
  const [showAddModal, setShowAddModal] = useState(false);

  const [editTarget, setEditTarget] = useState<Product | null>(null);
  const [editForm, setEditForm] = useState<ProdForm>(EMPTY_PROD);

  const [deleteTarget, setDeleteTarget] = useState<Product | null>(null);

  const handleAddNew = () => {
    setAddForm(EMPTY_PROD);
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    if (!addForm.name.trim()) return;
    setProducts([{ id: Date.now(), ...addForm, price: normalizePrice(addForm.price) }, ...products]);
    setShowAddModal(false);
  };

  const handleEditClick = (prod: Product) => {
    setEditTarget(prod);
    setEditForm({ name: prod.name, category: prod.category, price: prod.price, stock: prod.stock, status: prod.status });
  };

  const handleEditSubmit = () => {
    if (!editTarget || !editForm.name.trim()) return;
    setProducts(products.map(p => p.id === editTarget.id ? { ...editTarget, ...editForm, price: normalizePrice(editForm.price) } : p));
    setEditTarget(null);
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    setProducts(products.filter(p => p.id !== deleteTarget.id));
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
          <button className="btn-primary" onClick={handleAddNew} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>
            {t("prod_btn_new", "+ New Product")}
          </button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("prod_col_name", "Product/Service Name")}</th>
              <th>{t("prod_col_category", "Category")}</th>
              <th>{t("prod_col_price", "Price")}</th>
              <th>{t("prod_col_stock", "Stock")}</th>
              <th>{t("prod_col_status", "Status")}</th>
              <th style={{ width: '80px', textAlign: 'center' }}>{t("col_actions", "Actions")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
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
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showAddModal && (
        <ProdModal
          title={t("prod_btn_new", "+ New Product")}
          form={addForm}
          onChange={setAddForm}
          onClose={() => setShowAddModal(false)}
          onSubmit={handleAddSubmit}
        />
      )}

      {editTarget && (
        <ProdModal
          title={t("prod_btn_edit", "Edit product")}
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
