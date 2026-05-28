import { useState } from "react";
import { useTranslation } from "react-i18next";

export type Product = { id: number; name: string; category: string; price: string; stock: string; status: string };

export const INITIAL_PRODUCTS: Product[] = [
  { id: 1, name: "Licencia Software Básico", category: "Servicios", price: "$150.00", stock: "Ilimitado", status: "Normal" },
  { id: 2, name: "Licencia Software Pro", category: "Servicios", price: "$300.00", stock: "Ilimitado", status: "Normal" },
  { id: 3, name: "Servidor Dedicado Tipo A", category: "Hardware", price: "$1,200.00", stock: "5", status: "Bajo" },
  { id: 4, name: "Soporte Técnico Premium 1 Año", category: "Servicios", price: "$500.00", stock: "Ilimitado", status: "Normal" },
  { id: 5, name: "Router Empresarial", category: "Hardware", price: "$250.00", stock: "0", status: "Agotado" },
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

const EMPTY_PROD = { name: "", category: "", price: "", stock: "", status: "Normal" };

export default function ProductsView({ products, setProducts }: { products: Product[], setProducts: (prods: Product[]) => void }) {
  const { t } = useTranslation();

  const [editingId, setEditingId] = useState<number | null>(null);
  const [editFormData, setEditFormData] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newForm, setNewForm] = useState<Omit<Product, "id">>(EMPTY_PROD);

  const handleEditClick = (prod: Product) => {
    setEditingId(prod.id);
    setEditFormData({ ...prod });
  };

  const handleAddNew = () => {
    setNewForm(EMPTY_PROD);
    setShowAddModal(true);
  };

  const handleAddSubmit = () => {
    if (!newForm.name.trim()) return;
    let price = newForm.price;
    if (price && !price.startsWith('$')) price = '$' + price;
    setProducts([{ id: Date.now(), ...newForm, price }, ...products]);
    setShowAddModal(false);
  };

  const handleSave = () => {
    if (editFormData) {
      setProducts(products.map(prod => prod.id === editFormData.id ? editFormData : prod));
      setEditingId(null);
    }
  };

  return (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z"/><path d="m3.3 7 8.7 5 8.7-5"/><path d="M12 22V12"/></svg>
          <h1>{t("prod_title", "Productos y Stock")}</h1>
        </div>
        <p>{t("prod_desc", "Monitoriza los precios y el inventario de tus productos o servicios.")}</p>
      </div>

      <div className="table-container">
        <div className="table-header">
          <h2>{t("prod_list_title", "Inventario Actual")}</h2>
          <button className="btn-primary" onClick={handleAddNew} style={{ width: 'auto', margin: 0, padding: '0.5rem 1rem' }}>{t("prod_btn_new", "+ Nuevo Producto")}</button>
        </div>
        <table className="data-table">
          <thead>
            <tr>
              <th>{t("prod_col_name", "Nombre del Producto/Servicio")}</th>
              <th>{t("prod_col_category", "Categoría")}</th>
              <th>{t("prod_col_price", "Precio")}</th>
              <th>{t("prod_col_stock", "Stock")}</th>
              <th>{t("prod_col_status", "Estado")}</th>
              <th style={{ width: '80px', textAlign: 'center' }}>{t("col_actions", "Acciones")}</th>
            </tr>
          </thead>
          <tbody>
            {products.map((prod) => (
              <tr key={prod.id}>
                <td style={{ fontWeight: 500 }}>
                  {editingId === prod.id ? (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.name} 
                      onChange={e => setEditFormData({...editFormData!, name: e.target.value})}
                    />
                  ) : (
                    prod.name
                  )}
                </td>
                <td>
                  {editingId === prod.id ? (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.category} 
                      onChange={e => setEditFormData({...editFormData!, category: e.target.value})}
                    />
                  ) : (
                    prod.category
                  )}
                </td>
                <td>
                  {editingId === prod.id ? (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.price} 
                      onChange={e => {
                        let val = e.target.value;
                        if (val && !val.startsWith('$')) val = '$' + val;
                        setEditFormData({...editFormData!, price: val});
                      }}
                    />
                  ) : (
                    prod.price
                  )}
                </td>
                <td>
                  {editingId === prod.id ? (
                    <input 
                      className="form-input" 
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.stock} 
                      onChange={e => setEditFormData({...editFormData!, stock: e.target.value})}
                    />
                  ) : (
                    prod.stock
                  )}
                </td>
                <td>
                  {editingId === prod.id ? (
                    <select 
                      className="form-input"
                      style={{ padding: '0.25rem 0.5rem', margin: 0 }}
                      value={editFormData?.status}
                      onChange={e => setEditFormData({...editFormData!, status: e.target.value})}
                    >
                      <option value="Normal">{t("status_normal", "Normal")}</option>
                      <option value="Bajo">{t("status_low", "Bajo")}</option>
                      <option value="Agotado">{t("status_out", "Agotado")}</option>
                    </select>
                  ) : (
                    <span className={`badge ${
                      prod.status === 'Normal' ? 'badge-success' :
                      prod.status === 'Bajo' ? 'badge-warning' : 'badge-error'
                    }`}>
                      {prod.status === 'Normal' ? t('status_normal', 'Normal') : prod.status === 'Bajo' ? t('status_low', 'Bajo') : t('status_out', 'Agotado')}
                    </span>
                  )}
                </td>
                <td style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center' }}>
                  {editingId === prod.id ? (
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
                      onClick={() => handleEditClick(prod)}
                      title={t("prod_btn_edit", "Editar producto")}
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
              <h2>{t("prod_btn_new", "+ Nuevo Producto")}</h2>
              <button className="btn-close" onClick={() => setShowAddModal(false)}>
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="form-group">
                <label>{t("prod_col_name", "Nombre del Producto/Servicio")}</label>
                <input
                  className="form-input"
                  value={newForm.name}
                  onChange={e => setNewForm({ ...newForm, name: e.target.value })}
                  placeholder={t("prod_col_name", "Nombre del Producto/Servicio")}
                  autoFocus
                />
              </div>
              <div className="form-group">
                <label>{t("prod_col_category", "Categoría")}</label>
                <input
                  className="form-input"
                  value={newForm.category}
                  onChange={e => setNewForm({ ...newForm, category: e.target.value })}
                  placeholder={t("prod_col_category", "Categoría")}
                />
              </div>
              <div className="form-group">
                <label>{t("prod_col_price", "Precio")}</label>
                <input
                  className="form-input"
                  value={newForm.price}
                  onChange={e => setNewForm({ ...newForm, price: e.target.value })}
                  placeholder="$0.00"
                />
              </div>
              <div className="form-group">
                <label>{t("prod_col_stock", "Stock")}</label>
                <input
                  className="form-input"
                  value={newForm.stock}
                  onChange={e => setNewForm({ ...newForm, stock: e.target.value })}
                  placeholder={t("prod_col_stock", "Stock")}
                />
              </div>
              <div className="form-group">
                <label>{t("prod_col_status", "Estado")}</label>
                <select
                  className="form-input"
                  value={newForm.status}
                  onChange={e => setNewForm({ ...newForm, status: e.target.value })}
                >
                  <option value="Normal">{t("status_normal", "Normal")}</option>
                  <option value="Bajo">{t("status_low", "Bajo")}</option>
                  <option value="Agotado">{t("status_out", "Agotado")}</option>
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
