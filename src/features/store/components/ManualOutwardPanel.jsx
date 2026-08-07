import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";
import { authStorage } from "@/utils/authStorage";
import {
  GET_STORE_STORES_API,
  GET_SITES_API,
  GET_STORE_BOQ_ITEMS_API,
  STORE_STOCK_OUTWARD_API,
  GET_HR_API
} from "@/utils/ApiHelper";

export default function ManualOutwardPanel({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [sites, setSites] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [boqItems, setBoqItems] = useState([]);
  
  const initialFormState = {
    store_id: "",
    site_id: "",
    issued_to: "",
    remarks: "",
    items: []
  };

  const [formData, setFormData] = useState(initialFormState);

  useEffect(() => {
    if (isOpen) {
      fetchDropdowns();
      setFormData(initialFormState);
    }
  }, [isOpen]);

  const fetchDropdowns = async () => {
    try {
      const [storesRes, sitesRes, boqRes, employeesRes] = await Promise.all([
        apiClient.get(GET_STORE_STORES_API),
        apiClient.get(GET_SITES_API),
        apiClient.get(GET_STORE_BOQ_ITEMS_API),
        apiClient.get(GET_HR_API)
      ]);
      if (storesRes.data?.success) setStores(storesRes.data.data);
      if (sitesRes.data?.success) setSites(sitesRes.data.data);
      if (boqRes.data?.success) setBoqItems(boqRes.data.data);
      if (employeesRes.data?.success) setEmployees(employeesRes.data.data);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      return { ...prev, items: newItems };
    });
  };
  
  const handleBoqItemSelect = (index, boqId) => {
    const selected = boqItems.find(b => b.boq_item_id === Number(boqId));
    if (!selected) return;
    
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = {
        ...newItems[index],
        boq_item_id: selected.boq_item_id,
        description: selected.boq_item_name || selected.name || "",
      };
      return { ...prev, items: newItems };
    });
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [
        ...prev.items,
        {
          boq_item_id: "",
          description: "",
          quantity: 1,
          batch_number: ""
        }
      ]
    }));
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      return { ...prev, items: newItems };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.store_id) {
      alert("Please select a store");
      return;
    }
    if (formData.items.length === 0) {
      alert("Please add at least one item to issue");
      return;
    }
    
    if (!formData.issued_to) {
      alert("Please select who the materials are issued to");
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        store_id: Number(formData.store_id),
        issued_to: Number(formData.issued_to),
        site_id: formData.site_id ? Number(formData.site_id) : null,
        remarks: formData.remarks,
        items: formData.items.map(item => ({
          boq_item_id: Number(item.boq_item_id),
          quantity: Number(item.quantity),
          batch_number: item.batch_number || null
        }))
      };
      
      const res = await apiClient.post(STORE_STOCK_OUTWARD_API, payload);
      if (res.data?.success) {
        onSuccess();
        onClose();
      } else {
        alert(res.data?.message || "Error submitting form");
      }
    } catch (err) {
      console.error(err);
      alert(err.response?.data?.message || "Submission failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div 
        className={`fixed inset-0 z-40 bg-black/30 transition-opacity flex justify-end ${isOpen ? "opacity-100" : "opacity-0 pointer-events-none"}`} 
        onClick={onClose}
      >
        <div 
          className={`w-[90vw] md:w-[60vw] max-w-2xl bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-[var(--card-padding)] border-b border-[var(--color-layout-border)] bg-slate-50 shrink-0">
            <div>
              <h2 className="text-[var(--text-base)] font-semibold text-slate-800">New Stock Outward</h2>
              <p className="text-[var(--text-xs)] text-slate-500 mt-1">Issue materials to a site or engineer</p>
            </div>
            <button onClick={onClose} className="p-[var(--space-2)] hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-[var(--card-padding)] scrollbar-thin scrollbar-thumb-slate-300">
            <form id="manual-outward-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Outward Details */}
              <div className="bg-white p-4 rounded-xl border border-[var(--color-layout-border)] shadow-sm space-y-4">
                <h3 className="text-[var(--text-sm)] font-bold text-slate-700 border-b border-[var(--color-layout-border)] pb-2">Outward Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Store *</label>
                    <select 
                      value={formData.store_id} 
                      onChange={e => handleChange('store_id', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-slate-50 text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                      required
                    >
                      <option value="">Select Store</option>
                      {stores.map(s => (
                        <option key={s.store_id} value={s.store_id}>{s.store_name} ({s.store_code})</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Site (Optional)</label>
                    <select 
                      value={formData.site_id} 
                      onChange={e => handleChange('site_id', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-slate-50 text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    >
                      <option value="">Select Site</option>
                      {sites.map(s => (
                        <option key={s.site_id} value={s.site_id}>{s.site_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Issued To *</label>
                    <select 
                      value={formData.issued_to} 
                      onChange={e => handleChange('issued_to', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-slate-50 text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                      required
                    >
                      <option value="">Select Employee</option>
                      {employees.map(e => (
                        <option key={e.employee_id || e.id} value={e.employee_id || e.id}>{e.full_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div className="md:col-span-2">
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Remarks</label>
                    <input 
                      type="text" 
                      value={formData.remarks} 
                      onChange={e => handleChange('remarks', e.target.value)}
                      placeholder="Enter remarks or reason for issuance"
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white p-4 rounded-xl border border-[var(--color-layout-border)] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-layout-border)] pb-2">
                  <h3 className="text-[var(--text-sm)] font-bold text-slate-700">Materials to Issue</h3>
                  <button type="button" onClick={handleAddItem} className="flex items-center gap-1 text-[var(--text-xs)] bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-slate-200 transition cursor-pointer">
                    <Plus className="w-3.5 h-3.5" /> Add Material
                  </button>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[500px]">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="p-2 w-64">BOQ Item</th>
                        <th className="p-2 w-32">Batch Number</th>
                        <th className="p-2 w-24">Quantity</th>
                        <th className="p-2 w-10"></th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[var(--color-layout-border)]">
                      {formData.items.map((item, idx) => (
                        <tr key={idx}>
                          <td className="p-2">
                            <select 
                              value={item.boq_item_id} 
                              onChange={e => handleBoqItemSelect(idx, e.target.value)}
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                              required
                            >
                              <option value="">Select Item</option>
                              {boqItems.map(b => (
                                <option key={b.boq_item_id} value={b.boq_item_id}>{b.boq_item_name}</option>
                              ))}
                            </select>
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={item.batch_number} 
                              onChange={e => handleItemChange(idx, 'batch_number', e.target.value)}
                              placeholder="Optional"
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              step="1"
                              value={item.quantity} 
                              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                              required
                            />
                          </td>
                          <td className="p-2 text-center">
                            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-red-500 hover:bg-red-50 p-1.5 rounded-[var(--radius-md)] cursor-pointer">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {formData.items.length === 0 && (
                        <tr>
                          <td colSpan={4} className="p-4 text-center text-slate-400 text-[var(--text-sm)]">No items added to issue.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </form>
          </div>
          
          {/* Footer */}
          <div className="p-[var(--card-padding)] border-t border-[var(--color-layout-border)] bg-white flex justify-end gap-3 shrink-0">
            <button type="button" onClick={onClose} className="btn-3d-secondary px-6 h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium">
              Cancel
            </button>
            <button 
              type="submit" 
              form="manual-outward-form"
              disabled={loading}
              className="btn-3d-primary px-6 h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Issue Materials
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
