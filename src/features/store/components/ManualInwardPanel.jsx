import React, { useState, useEffect } from "react";
import { X, Plus, Trash2, Save, Loader2 } from "lucide-react";
import apiClient from "@/lib/axios";
import {
  GET_STORE_STORES_API,
  GET_STORE_VENDORS_API,
  GET_STORE_BOQ_ITEMS_API,
  POST_STORE_STOCK_INWARD_MANUAL_API
} from "@/utils/ApiHelper";

export default function ManualInwardPanel({ isOpen, onClose, onSuccess }) {
  const [loading, setLoading] = useState(false);
  const [stores, setStores] = useState([]);
  const [vendors, setVendors] = useState([]);
  const [boqItems, setBoqItems] = useState([]);
  
  const initialFormState = {
    store_id: "",
    vendor_id: "",
    invoice_number: "",
    invoice_date: "",
    eway_bill_no: "",
    buyer_order_no: "",
    destination: "",
    terms_of_delivery: "",
    payment_terms: "",
    subtotal: 0,
    cgst_amount: 0,
    sgst_amount: 0,
    igst_amount: 0,
    round_off: 0,
    grand_total: 0,
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
      const [storesRes, vendorsRes, boqRes] = await Promise.all([
        apiClient.get(GET_STORE_STORES_API),
        apiClient.get(GET_STORE_VENDORS_API),
        apiClient.get(GET_STORE_BOQ_ITEMS_API)
      ]);
      if (storesRes.data?.success) setStores(storesRes.data.data);
      if (vendorsRes.data?.success) setVendors(vendorsRes.data.data);
      if (boqRes.data?.success) setBoqItems(boqRes.data.data);
    } catch (err) {
      console.error("Error fetching dropdowns:", err);
    }
  };

  const handleChange = (field, value) => {
    setFormData(prev => {
      const updated = { ...prev, [field]: value };
      if (['subtotal', 'cgst_amount', 'sgst_amount', 'igst_amount', 'round_off'].includes(field)) {
        const sub = parseFloat(field === 'subtotal' ? value : updated.subtotal) || 0;
        const cgst = parseFloat(field === 'cgst_amount' ? value : updated.cgst_amount) || 0;
        const sgst = parseFloat(field === 'sgst_amount' ? value : updated.sgst_amount) || 0;
        const igst = parseFloat(field === 'igst_amount' ? value : updated.igst_amount) || 0;
        const round = parseFloat(field === 'round_off' ? value : updated.round_off) || 0;
        updated.grand_total = Math.round((sub + cgst + sgst + igst + round) * 100) / 100;
      }
      return updated;
    });
  };

  const handleItemChange = (index, field, value) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      
      if (field === 'quantity' || field === 'unit_price' || field === 'tax_rate') {
        const q = parseFloat(newItems[index].quantity) || 0;
        const r = parseFloat(newItems[index].unit_price) || 0;
        const taxRate = parseFloat(newItems[index].tax_rate) || 0;
        const lineTotal = q * r;
        newItems[index].line_total = Math.round(lineTotal * 100) / 100;
        
        const taxAmount = (lineTotal * taxRate) / 100;
        newItems[index].cgst_amount = Math.round((taxAmount / 2) * 100) / 100;
        newItems[index].sgst_amount = Math.round((taxAmount / 2) * 100) / 100;
      }
      
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
        unit: selected.unit || "Nos",
        hsn_sac: selected.item_code || "85446020"
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
          hsn_sac: "",
          quantity: 1,
          unit: "Nos",
          unit_price: 0,
          tax_rate: 18,
          cgst_amount: 0,
          sgst_amount: 0,
          line_total: 0
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

  const calculateTotalsFromItems = () => {
    const sub = formData.items.reduce((acc, item) => acc + (parseFloat(item.line_total) || 0), 0);
    const cgst = formData.items.reduce((acc, item) => acc + (parseFloat(item.cgst_amount) || 0), 0);
    const sgst = formData.items.reduce((acc, item) => acc + (parseFloat(item.sgst_amount) || 0), 0);
    const grand = sub + cgst + sgst + (parseFloat(formData.igst_amount) || 0) + (parseFloat(formData.round_off) || 0);
    
    setFormData(prev => ({
      ...prev,
      subtotal: Math.round(sub * 100) / 100,
      cgst_amount: Math.round(cgst * 100) / 100,
      sgst_amount: Math.round(sgst * 100) / 100,
      grand_total: Math.round(grand * 100) / 100
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.store_id || !formData.vendor_id || !formData.invoice_number) {
      alert("Please fill required fields (Store, Vendor, Invoice No)");
      return;
    }
    
    try {
      setLoading(true);
      const payload = {
        ...formData,
        store_id: Number(formData.store_id),
        vendor_id: Number(formData.vendor_id),
        subtotal: Number(formData.subtotal),
        cgst_amount: Number(formData.cgst_amount),
        sgst_amount: Number(formData.sgst_amount),
        igst_amount: Number(formData.igst_amount),
        round_off: Number(formData.round_off),
        grand_total: Number(formData.grand_total),
        items: formData.items.map(item => ({
          ...item,
          boq_item_id: Number(item.boq_item_id),
          quantity: Number(item.quantity),
          unit_price: Number(item.unit_price),
          tax_rate: Number(item.tax_rate),
          cgst_amount: Number(item.cgst_amount),
          sgst_amount: Number(item.sgst_amount),
          line_total: Number(item.line_total)
        }))
      };
      
      const res = await apiClient.post(POST_STORE_STOCK_INWARD_MANUAL_API, payload);
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
          className={`w-[90vw] md:w-[70vw] lg:w-[50vw] max-w-4xl bg-white h-full shadow-2xl flex flex-col transition-transform duration-300 ${isOpen ? "translate-x-0" : "translate-x-full"}`}
          onClick={e => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-[var(--card-padding)] border-b border-[var(--color-layout-border)] bg-slate-50 shrink-0">
            <div>
              <h2 className="text-[var(--text-base)] font-semibold text-slate-800">Manual Stock Inward</h2>
              <p className="text-[var(--text-xs)] text-slate-500 mt-1">Create a new manual stock inward entry</p>
            </div>
            <button onClick={onClose} className="p-[var(--space-2)] hover:bg-slate-200 rounded-full text-slate-500 cursor-pointer">
              <X className="w-5 h-5" />
            </button>
          </div>
          
          {/* Body */}
          <div className="flex-1 overflow-y-auto p-[var(--card-padding)] scrollbar-thin scrollbar-thumb-slate-300">
            <form id="manual-inward-form" onSubmit={handleSubmit} className="space-y-6">
              
              {/* Header Details */}
              <div className="bg-white p-4 rounded-xl border border-[var(--color-layout-border)] shadow-sm space-y-4">
                <h3 className="text-[var(--text-sm)] font-bold text-slate-700 border-b border-[var(--color-layout-border)] pb-2">Inward Details</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
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
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Vendor *</label>
                    <select 
                      value={formData.vendor_id} 
                      onChange={e => handleChange('vendor_id', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] bg-slate-50 text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                      required
                    >
                      <option value="">Select Vendor</option>
                      {vendors.map(v => (
                        <option key={v.vendor_id} value={v.vendor_id}>{v.vendor_name}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Invoice Number *</label>
                    <input 
                      type="text" 
                      value={formData.invoice_number} 
                      onChange={e => handleChange('invoice_number', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                      required
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Invoice Date</label>
                    <input 
                      type="date" 
                      value={formData.invoice_date} 
                      onChange={e => handleChange('invoice_date', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">E-Way Bill No</label>
                    <input 
                      type="text" 
                      value={formData.eway_bill_no} 
                      onChange={e => handleChange('eway_bill_no', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Buyer Order No</label>
                    <input 
                      type="text" 
                      value={formData.buyer_order_no} 
                      onChange={e => handleChange('buyer_order_no', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Destination</label>
                    <input 
                      type="text" 
                      value={formData.destination} 
                      onChange={e => handleChange('destination', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Remarks</label>
                    <input 
                      type="text" 
                      value={formData.remarks} 
                      onChange={e => handleChange('remarks', e.target.value)}
                      className="w-full h-[var(--input-height)] px-[var(--space-3)] rounded-[var(--radius-lg)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Items */}
              <div className="bg-white p-4 rounded-xl border border-[var(--color-layout-border)] shadow-sm space-y-4">
                <div className="flex items-center justify-between border-b border-[var(--color-layout-border)] pb-2">
                  <h3 className="text-[var(--text-sm)] font-bold text-slate-700">Items List</h3>
                  <div className="flex gap-2">
                    <button type="button" onClick={calculateTotalsFromItems} className="text-[var(--text-xs)] text-[var(--color-primary-top)] font-semibold border border-[var(--color-primary-top)] px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-orange-50 transition cursor-pointer">
                      Calculate Totals
                    </button>
                    <button type="button" onClick={handleAddItem} className="flex items-center gap-1 text-[var(--text-xs)] bg-slate-100 text-slate-700 font-semibold px-3 py-1.5 rounded-[var(--radius-md)] hover:bg-slate-200 transition cursor-pointer">
                      <Plus className="w-3.5 h-3.5" /> Add Item
                    </button>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full text-left min-w-[800px]">
                    <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                      <tr>
                        <th className="p-2 w-48">BOQ Item</th>
                        <th className="p-2 w-48">Description</th>
                        <th className="p-2 w-20">HSN</th>
                        <th className="p-2 w-20">Qty</th>
                        <th className="p-2 w-24">Unit Price</th>
                        <th className="p-2 w-16">Tax %</th>
                        <th className="p-2 w-24 text-right">Line Total</th>
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
                              value={item.description} 
                              onChange={e => handleItemChange(idx, 'description', e.target.value)}
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="text" 
                              value={item.hsn_sac} 
                              onChange={e => handleItemChange(idx, 'hsn_sac', e.target.value)}
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              step="0.01"
                              value={item.quantity} 
                              onChange={e => handleItemChange(idx, 'quantity', e.target.value)}
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              step="0.01"
                              value={item.unit_price} 
                              onChange={e => handleItemChange(idx, 'unit_price', e.target.value)}
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                            />
                          </td>
                          <td className="p-2">
                            <input 
                              type="number" 
                              value={item.tax_rate} 
                              onChange={e => handleItemChange(idx, 'tax_rate', e.target.value)}
                              className="w-full h-[var(--input-height)] px-2 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-xs)] outline-none"
                            />
                          </td>
                          <td className="p-2 text-right font-medium text-[var(--text-sm)] text-slate-800">
                            ₹{item.line_total}
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
                          <td colSpan={8} className="p-4 text-center text-slate-400 text-[var(--text-sm)]">No items added.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Financials */}
              <div className="bg-slate-50 p-4 rounded-xl border border-[var(--color-layout-border)] shadow-sm space-y-4">
                <h3 className="text-[var(--text-sm)] font-bold text-slate-700 border-b border-[var(--color-layout-border)] pb-2">Financials</h3>
                <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Subtotal</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.subtotal} 
                      onChange={e => handleChange('subtotal', e.target.value)}
                      className="w-full h-[var(--input-height)] px-3 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">CGST</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.cgst_amount} 
                      onChange={e => handleChange('cgst_amount', e.target.value)}
                      className="w-full h-[var(--input-height)] px-3 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">SGST</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.sgst_amount} 
                      onChange={e => handleChange('sgst_amount', e.target.value)}
                      className="w-full h-[var(--input-height)] px-3 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-xs)] font-semibold text-slate-600 mb-1">Round Off</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.round_off} 
                      onChange={e => handleChange('round_off', e.target.value)}
                      className="w-full h-[var(--input-height)] px-3 rounded-[var(--radius-md)] border border-[var(--color-secondary-border)] text-[var(--text-sm)] focus:border-[var(--color-primary-top)] outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-[var(--text-xs)] font-bold text-[var(--color-primary-top)] mb-1">Grand Total</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={formData.grand_total} 
                      onChange={e => handleChange('grand_total', e.target.value)}
                      className="w-full h-[var(--input-height)] px-3 rounded-[var(--radius-md)] border border-[var(--color-primary-top)] bg-orange-50 font-bold text-slate-800 focus:outline-none"
                    />
                  </div>
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
              form="manual-inward-form"
              disabled={loading}
              className="btn-3d-primary px-6 h-[var(--btn-height-md)] rounded-[var(--radius-lg)] text-[var(--text-sm)] font-medium flex items-center gap-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Inward
            </button>
          </div>
          
        </div>
      </div>
    </>
  );
}
