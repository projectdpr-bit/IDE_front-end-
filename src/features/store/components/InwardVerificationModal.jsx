import { useState, useEffect } from "react";
import { UploadCloud, CheckCircle2, Edit3, X, Loader2, Save, AlertCircle, Plus, Trash2, FileText, Image as ImageIcon } from "lucide-react";
import apiClient from "@/lib/axios";
import { EXTRACT_INVOICE_IMAGES_API, STORE_STOCK_INWARD_API, GET_STORE_PO_BOQ_ITEMS_API } from "@/utils/ApiHelper";
import { useAuthStore } from "@/store/useAuthStore";

export default function InwardVerificationModal({ isOpen, onClose, selectedPO, onSuccess }) {
  const { user } = useAuthStore();
  const [step, setStep] = useState("UPLOAD"); // UPLOAD, LOADING, VERIFY
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [extractError, setExtractError] = useState(null);

  const [boqItems, setBoqItems] = useState([]);

  // Reset state when modal opens or selected PO changes
  useEffect(() => {
    if (isOpen) {
      const reset = setTimeout(() => {
        setStep("UPLOAD");
        setSelectedFiles([]);
        setFormData(null);
        setIsEditing(false);
        setExtractError(null);
        setSubmitting(false);
      }, 0);
      return () => clearTimeout(reset);
    }
  }, [isOpen, selectedPO]);

  useEffect(() => {
    const fetchBoqItems = async () => {
      const poId = selectedPO?.po_id || formData?.po_id;
      if (poId) {
        try {
          const res = await apiClient.get(GET_STORE_PO_BOQ_ITEMS_API(poId));
          if (res.data?.success) {
            const validItems = (res.data.data?.boq_items || []).filter(item => (item.remaining_qty > 0 || item.remaining_quantity > 0));
            setBoqItems(validItems);
          }
        } catch (err) {
          console.error("Error fetching BOQ items:", err);
        }
      }
    };
    
    // Always fetch if we have a poId, don't wait for isEditing
    fetchBoqItems();
  }, [selectedPO?.po_id, selectedPO?.id, formData?.po_id]);


  if (!isOpen) return null;

  const handleFileChange = (e) => {
    if (e.target.files?.length > 0) {
      const newFiles = Array.from(e.target.files);
      setSelectedFiles(prev => {
        const existingNames = new Set(prev.map(f => f.name));
        const uniqueNewFiles = newFiles.filter(f => !existingNames.has(f.name));
        return [...prev, ...uniqueNewFiles];
      });
    }
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;
    setStep("LOADING");
    setExtractError(null);

    const form = new FormData();
    selectedFiles.forEach((file) => {
      form.append("Images", file);
    });

    try {
      const res = await apiClient.post(EXTRACT_INVOICE_IMAGES_API, form, {
        headers: { "Content-Type": "multipart/form-data" }
      });

      if (res.data?.success) {
        const data = res.data.data || {};

        // Mismatch check across images
        const invoiceNumbersFound = new Set();
        if (Array.isArray(data.extracted_data)) {
          data.extracted_data.forEach(ext => {
            if (ext?.header?.invoice_number) invoiceNumbersFound.add(String(ext.header.invoice_number).trim());
          });
        } else if (data.extracted_data?.header?.invoice_number) {
          const invNo = data.extracted_data.header.invoice_number;
          if (Array.isArray(invNo)) invNo.forEach(n => invoiceNumbersFound.add(String(n).trim()));
          else if (typeof invNo === "string") invoiceNumbersFound.add(invNo.trim());
        }

        if (Array.isArray(data.invoices)) {
          data.invoices.forEach(inv => {
            const num = inv.invoice_number || inv.header?.invoice_number;
            if (num) invoiceNumbersFound.add(String(num).trim());
          });
        }

        if (Array.isArray(data.invoice_numbers) && data.invoice_numbers.length > 0) {
          data.invoice_numbers.forEach(n => invoiceNumbersFound.add(String(n).trim()));
        }

        if (data.has_mismatched_invoices || data.multiple_invoices || data.has_different_invoices) {
          invoiceNumbersFound.add("INV-1");
          invoiceNumbersFound.add("INV-2");
        }

        if (invoiceNumbersFound.size > 1) {
          const listStr = Array.from(invoiceNumbersFound).join(", ");
          setExtractError(`Different Invoice Numbers detected (${listStr}). All uploaded images must belong to the same invoice. Please upload again.`);
          setSelectedFiles([]);
          setStep("UPLOAD");
          return;
        }

        const { extracted_data, matched_vendor, matched_po, image_urls, items: rootItems } = data;
        const header = extracted_data?.header || {};
        const financials = extracted_data?.financials || {};

        const rawItems = (Array.isArray(rootItems) && rootItems.length > 0)
          ? rootItems
          : (Array.isArray(extracted_data?.items) ? extracted_data.items : []);

        const cleanInvoiceNo = header.invoice_number ? header.invoice_number.replace(/[^a-zA-Z0-9]/g, '') : '01';

        setFormData({
          store_id: selectedPO?.store_id || user?.store_id || 1,
          vendor_id: matched_vendor?.vendor_id || header.vendor?.vendor_id || 6,
          po_id: matched_po?.po_id || selectedPO?.po_id || selectedPO?.id || null,
          invoice_number: header.invoice_number || "",
          invoice_date: header.invoice_date || "",
          eway_bill_no: header.eway_bill_no || "",

          subtotal: financials.subtotal ?? 0,
          cgst_amount: financials.cgst ?? 0,
          sgst_amount: financials.sgst ?? 0,
          igst_amount: financials.igst ?? 0,
          round_off: financials.round_off ?? 0,
          grand_total: financials.grand_total ?? 0,

          image_urls: image_urls || [],
          remarks: `Stock inward created from invoice ${header.invoice_number || ''} OCR scan`,

          items: rawItems.map((item, idx) => ({
            material_id: item.matched_material_id || item.material_id || (idx + 1),
            description: item.extracted_description || item.description || item.matched_material_name || "",
            hsn_sac: item.hsn_sac || "",
            unit: item.unit || "CIL",
            batch_number: item.batch_number || `BATCH-${cleanInvoiceNo}-0${idx + 1}`,
            quantity: item.quantity ?? 0,
            unit_price: item.rate ?? item.unit_price ?? 0
          }))
        });
        setStep("VERIFY");
      } else {
        setExtractError(res.data?.message || "Extraction failed. Invalid invoice images.");
        setSelectedFiles([]);
        setStep("UPLOAD");
      }
    } catch (err) {
      console.error("Error extracting invoices:", err);
      setExtractError(err.response?.data?.message || "Error extracting invoice images. Please upload again.");
      setSelectedFiles([]);
      setStep("UPLOAD");
    }
  };

  const handleInputChange = (field, value) => {
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
      
      let val = value;
      if (field === 'quantity' && newItems[index].max_qty !== undefined) {
        const numVal = parseFloat(value) || 0;
        if (numVal > newItems[index].max_qty) {
          val = newItems[index].max_qty;
        }
      }

      newItems[index] = { ...newItems[index], [field]: val };

      // Recalculate subtotal & grand total if quantity or unit_price changes
      const newSubtotal = newItems.reduce((acc, item) => {
        const q = parseFloat(item.quantity) || 0;
        const r = parseFloat(item.unit_price) || 0;
        return acc + (q * r);
      }, 0);
      const roundSubtotal = Math.round(newSubtotal * 100) / 100;

      const cgst = parseFloat(prev.cgst_amount) || 0;
      const sgst = parseFloat(prev.sgst_amount) || 0;
      const igst = parseFloat(prev.igst_amount) || 0;
      const roundOff = parseFloat(prev.round_off) || 0;
      const newGrandTotal = Math.round((roundSubtotal + cgst + sgst + igst + roundOff) * 100) / 100;

      return {
        ...prev,
        items: newItems,
        subtotal: roundSubtotal,
        grand_total: newGrandTotal
      };
    });
  };

  const handleBoqItemSelect = (index, boqItemId) => {
    const selectedBoq = boqItems.find(b => b.boq_item_id === Number(boqItemId) || b.po_item_id === Number(boqItemId));
    if (!selectedBoq) return;

    setFormData(prev => {
      const newItems = [...prev.items];
      const maxQty = selectedBoq.remaining_qty ?? selectedBoq.remaining_quantity ?? 0;
      const defaultQty = maxQty > 0 ? 1 : 0;
      
      newItems[index] = {
        ...newItems[index],
        description: selectedBoq.boq_item_name || selectedBoq.item_name || "Unknown Item",
        material_id: selectedBoq.material_id || "",
        unit: selectedBoq.unit || "CIL",
        unit_price: selectedBoq.unit_price || 0,
        quantity: defaultQty,
        max_qty: maxQty,
        hsn_sac: selectedBoq.item_code || "",
        boq_item_id: selectedBoq.boq_item_id,
        po_item_id: selectedBoq.po_item_id
      };

      const newSubtotal = newItems.reduce((acc, item) => {
        const q = parseFloat(item.quantity) || 0;
        const r = parseFloat(item.unit_price) || 0;
        return acc + (q * r);
      }, 0);
      const roundSubtotal = Math.round(newSubtotal * 100) / 100;
      const cgst = parseFloat(prev.cgst_amount) || 0;
      const sgst = parseFloat(prev.sgst_amount) || 0;
      const igst = parseFloat(prev.igst_amount) || 0;
      const roundOff = parseFloat(prev.round_off) || 0;
      const newGrandTotal = Math.round((roundSubtotal + cgst + sgst + igst + roundOff) * 100) / 100;

      return {
        ...prev,
        items: newItems,
        subtotal: roundSubtotal,
        grand_total: newGrandTotal
      };
    });
  };

  const handleAddItem = () => {
    setFormData(prev => {
      const newItem = {
        isNew: true,
        material_id: "",
        description: "",
        hsn_sac: "",
        unit: "",
        batch_number: `BATCH-0${prev.items.length + 1}`,
        quantity: 1,
        unit_price: 0
      };
      return {
        ...prev,
        items: [...prev.items, newItem]
      };
    });
  };

  const handleRemoveItem = (index) => {
    setFormData(prev => {
      const newItems = prev.items.filter((_, i) => i !== index);
      const newSubtotal = newItems.reduce((acc, item) => {
        const q = parseFloat(item.quantity) || 0;
        const r = parseFloat(item.unit_price) || 0;
        return acc + (q * r);
      }, 0);
      const roundSubtotal = Math.round(newSubtotal * 100) / 100;
      const cgst = parseFloat(prev.cgst_amount) || 0;
      const sgst = parseFloat(prev.sgst_amount) || 0;
      const igst = parseFloat(prev.igst_amount) || 0;
      const roundOff = parseFloat(prev.round_off) || 0;
      const newGrandTotal = Math.round((roundSubtotal + cgst + sgst + igst + roundOff) * 100) / 100;

      return {
        ...prev,
        items: newItems,
        subtotal: roundSubtotal,
        grand_total: newGrandTotal
      };
    });
  };

  const handleBack = () => {
    if (isEditing) {
      setIsEditing(false);
    } else {
      setStep("UPLOAD");
    }
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const payload = {
        store_id: Number(formData.store_id) || 1,
        vendor_id: Number(formData.vendor_id) || null,
        po_id: formData.po_id ? Number(formData.po_id) : null,
        invoice_number: formData.invoice_number || "",
        invoice_date: formData.invoice_date || "",
        eway_bill_no: formData.eway_bill_no || "",
        subtotal: Number(formData.subtotal) || 0,
        cgst_amount: Number(formData.cgst_amount) || 0,
        sgst_amount: Number(formData.sgst_amount) || 0,
        igst_amount: Number(formData.igst_amount) || 0,
        round_off: Number(formData.round_off) || 0,
        grand_total: Number(formData.grand_total) || 0,
        image_urls: formData.image_urls || [],
        remarks: formData.remarks || "",
        items: formData.items.map(item => ({
          material_id: item.material_id ? Number(item.material_id) : null,
          description: item.description || "",
          hsn_sac: item.hsn_sac || "",
          unit: item.unit || "",
          batch_number: item.batch_number || "",
          quantity: Number(item.quantity) || 0,
          unit_price: Number(item.unit_price) || 0
        }))
      };

      const res = await apiClient.post(STORE_STOCK_INWARD_API, payload);
      if (res.data?.success) {
        alert("Inward created successfully!");
        onSuccess();
        onClose();
      } else {
        alert(res.data?.message || "Failed to save inward data.");
      }
    } catch (err) {
      console.error("Error saving inward:", err);
      alert(err.response?.data?.message || "Error saving inward data.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-(--) overflow-y-auto">
      <div className="bg-white rounded-(--) shadow-2xl w-full max-w-5xl max-h-[92vh] flex flex-col overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between p-(--) border-b border-(--) bg-slate-50">
          <div>
            <h2 className="text-(--) font-bold text-slate-800">
              Inward Stock Verification
            </h2>
            <p className="text-(--) text-slate-500">Verify extracted fields matching store/stock/inward API payload</p>
          </div>
          <button onClick={onClose} className="p-(--) text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors cursor-pointer">
            <X className="w-(--) h-(--)" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-(--)">
          {step === "UPLOAD" && (
            <div className="flex flex-col items-center justify-center py-(--) text-center">
              {extractError && (
                <div className="mb-(--) w-full max-w-md mx-auto p-(--) bg-red-50 border border-red-200 rounded-(--) flex items-start gap-(--) text-left shadow-sm">
                  <AlertCircle className="w-(--) h-(--) text-red-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-(--) font-bold text-red-800">Invoice Extraction Error</h4>
                    <p className="text-(--) text-red-700 mt-(--)">{extractError}</p>
                  </div>
                </div>
              )}

              <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mb-(--)">
                <UploadCloud className="w-10 h-10 text-slate-400" />
              </div>
              <h3 className="text-(--) font-bold text-slate-700 mb-(--)">Upload Invoice Images</h3>
              <p className="text-(--) text-slate-500 mb-(--) max-w-md">
                Upload supplier invoices. AI OCR will extract invoice details to create stock inward.
              </p>
              
              <input
                type="file"
                id="invoice-upload"
                multiple
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              
              <div className="flex items-center gap-(--)">
                <label
                  htmlFor="invoice-upload"
                  className="btn-3d-secondary px-(--) h-(--) rounded-(--) text-(--) font-medium cursor-pointer inline-flex items-center"
                >
                  Select Files
                </label>
                {selectedFiles.length > 0 && (
                  <button
                    onClick={handleUpload}
                    className="btn-3d-primary px-(--) h-(--) rounded-(--) text-(--) font-medium cursor-pointer inline-flex items-center"
                  >
                    Extract Data
                  </button>
                )}
              </div>
              
              {selectedFiles.length > 0 && (
                <div className="mt-(--) w-full max-w-sm mx-auto flex flex-col gap-(--) text-left">
                  <p className="text-(--) font-bold text-slate-500 uppercase tracking-wider mb-(--) text-center">Selected Files</p>
                  {selectedFiles.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-white border border-(--) shadow-sm rounded-(--) px-(--) py-(--)">
                      <span className="text-(--) text-slate-700 truncate font-medium mr-(--)" title={file.name}>{file.name}</span>
                      <button
                        onClick={() => {
                          const newFiles = [...selectedFiles];
                          newFiles.splice(index, 1);
                          setSelectedFiles(newFiles);
                        }}
                        className="text-slate-400 hover:text-red-500 hover:bg-red-50 p-1 rounded-full transition-colors flex-shrink-0 cursor-pointer"
                        title="Remove file"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {step === "LOADING" && (
            <div className="flex flex-col items-center justify-center py-(--)">
              <Loader2 className="w-12 h-12 animate-spin text-(--) mb-(--)" />
              <h3 className="text-(--) font-bold text-slate-700">AI is analyzing your invoice...</h3>
              <p className="text-(--) text-slate-500 mt-(--)">Extracting line items and stock inward fields.</p>
            </div>
          )}

          {step === "VERIFY" && formData && (
            <div className="space-y-(--) animate-in fade-in slide-in-from-bottom-4 duration-500">
              
              {/* Top Banner */}
              <div className="flex items-center justify-between bg-green-50 text-green-700 px-(--) py-(--) rounded-(--) border border-green-200 shadow-sm">
                <div className="flex items-center gap-(--)">
                  <CheckCircle2 className="w-(--) h-(--) text-green-600" />
                  <div>
                    <span className="text-(--) font-bold">Invoice Extracted Successfully</span>
                    {formData.image_urls?.length > 0 && (
                      <span className="text-(--) text-green-600 ml-2">({formData.image_urls.length} images)</span>
                    )}
                  </div>
                </div>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-(--) text-(--) font-bold uppercase tracking-wide hover:text-green-800 transition-colors bg-white px-(--) py-[var(--space-1.5)] rounded-(--) border border-green-200 shadow-xs cursor-pointer"
                  >
                    <Edit3 className="w-(--) h-(--)" /> Edit Details
                  </button>
                )}
              </div>

              {/* Form Grid: Inward Header (50%), Tax & Financials (50%) and Remarks & Images (100%) */}
              <div className="space-y-(--)">
                
                {/* 50-50 Split Row */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-(--)">
                  
                  {/* 1. Header Details (50%) */}
                  <div className="bg-slate-50 p-(--) rounded-(--) border border-(--) space-y-(--)">
                    <h4 className="text-(--) font-bold text-slate-500 uppercase tracking-wider mb-(--) border-b border-slate-200 pb-(--) flex items-center justify-between">
                      <span>Inward Header</span>
                      <FileText className="w-3.5 h-3.5 text-slate-400" />
                    </h4>
                    
                    <div>
                      <label className="text-(--) font-medium text-slate-600 block mb-(--)">Invoice Number</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.invoice_number}
                          onChange={e => handleInputChange('invoice_number', e.target.value)}
                          className="w-full h-8 px-2 rounded border border-(--) bg-white text-xs font-semibold focus:border-(--) outline-none"
                        />
                      ) : (
                        <div className="text-(--) font-semibold text-slate-800">{formData.invoice_number || "—"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-(--) font-medium text-slate-600 block mb-(--)">Invoice Date</label>
                      {isEditing ? (
                        <input
                          type="date"
                          value={formData.invoice_date}
                          onChange={e => handleInputChange('invoice_date', e.target.value)}
                          className="w-full h-8 px-2 rounded border border-(--) bg-white text-xs focus:border-(--) outline-none"
                        />
                      ) : (
                        <div className="text-(--) font-medium text-slate-800">{formData.invoice_date || "—"}</div>
                      )}
                    </div>

                    <div>
                      <label className="text-(--) font-medium text-slate-600 block mb-(--)">E-Way Bill No.</label>
                      {isEditing ? (
                        <input
                          type="text"
                          value={formData.eway_bill_no}
                          onChange={e => handleInputChange('eway_bill_no', e.target.value)}
                          className="w-full h-8 px-2 rounded border border-(--) bg-white text-xs focus:border-(--) outline-none"
                        />
                      ) : (
                        <div className="text-(--) font-medium text-slate-800">{formData.eway_bill_no || "N/A"}</div>
                      )}
                    </div>

                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-slate-200">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Store ID</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.store_id}
                            onChange={e => handleInputChange('store_id', e.target.value)}
                            className="w-full h-7 px-1.5 rounded border text-xs bg-white"
                          />
                        ) : (
                          <div className="text-xs font-semibold text-slate-700">{formData.store_id || 1}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">Vendor ID</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.vendor_id}
                            onChange={e => handleInputChange('vendor_id', e.target.value)}
                            className="w-full h-7 px-1.5 rounded border text-xs bg-white"
                          />
                        ) : (
                          <div className="text-xs font-semibold text-slate-700">{formData.vendor_id || "—"}</div>
                        )}
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block uppercase">PO ID</label>
                        {isEditing ? (
                          <input
                            type="number"
                            value={formData.po_id || ""}
                            onChange={e => handleInputChange('po_id', e.target.value)}
                            className="w-full h-7 px-1.5 rounded border text-xs bg-white"
                            placeholder="null"
                          />
                        ) : (
                          <div className="text-xs font-semibold text-slate-700">{formData.po_id || "null"}</div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 2. Tax & Financials (50%) */}
                  <div className="bg-slate-50 p-(--) rounded-(--) border border-(--) space-y-(--)">
                    <h4 className="text-(--) font-bold text-slate-500 uppercase tracking-wider mb-(--) border-b border-slate-200 pb-(--)">
                      Tax & Financials (₹)
                    </h4>

                    <div className="grid grid-cols-2 gap-[var(--space-2.5)]">
                      <div>
                        <label className="text-(--) font-medium text-slate-600 block mb-0.5">Subtotal</label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.subtotal}
                            onChange={e => handleInputChange('subtotal', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 px-2 rounded border text-xs bg-white outline-none"
                          />
                        ) : (
                          <div className="text-(--) font-semibold text-slate-800">₹{Number(formData.subtotal || 0).toLocaleString('en-IN')}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-(--) font-medium text-slate-600 block mb-0.5">Grand Total</label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.grand_total}
                            onChange={e => handleInputChange('grand_total', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 px-2 rounded border text-xs font-bold text-(--) bg-white outline-none"
                          />
                        ) : (
                          <div className="text-(--) font-bold text-(--)">₹{Number(formData.grand_total || 0).toLocaleString('en-IN')}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-(--) font-medium text-slate-600 block mb-0.5">CGST</label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.cgst_amount}
                            onChange={e => handleInputChange('cgst_amount', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 px-2 rounded border text-xs bg-white outline-none"
                          />
                        ) : (
                          <div className="text-(--) text-slate-700">₹{formData.cgst_amount || 0}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-(--) font-medium text-slate-600 block mb-0.5">SGST</label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.sgst_amount}
                            onChange={e => handleInputChange('sgst_amount', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 px-2 rounded border text-xs bg-white outline-none"
                          />
                        ) : (
                          <div className="text-(--) text-slate-700">₹{formData.sgst_amount || 0}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-(--) font-medium text-slate-600 block mb-0.5">IGST</label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.igst_amount}
                            onChange={e => handleInputChange('igst_amount', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 px-2 rounded border text-xs bg-white outline-none"
                          />
                        ) : (
                          <div className="text-(--) text-slate-700">₹{formData.igst_amount || 0}</div>
                        )}
                      </div>

                      <div>
                        <label className="text-(--) font-medium text-slate-600 block mb-0.5">Round Off</label>
                        {isEditing ? (
                          <input
                            type="number"
                            step="0.01"
                            value={formData.round_off}
                            onChange={e => handleInputChange('round_off', parseFloat(e.target.value) || 0)}
                            className="w-full h-7 px-2 rounded border text-xs bg-white outline-none"
                          />
                        ) : (
                          <div className="text-(--) text-slate-700">₹{formData.round_off || 0}</div>
                        )}
                      </div>
                    </div>
                  </div>

                </div>

                {/* Full Width Row: Remarks & Images (100%) */}
                <div className="bg-slate-50 p-(--) rounded-(--) border border-(--) space-y-(--) w-full">
                  <h4 className="text-(--) font-bold text-slate-500 uppercase tracking-wider mb-(--) border-b border-slate-200 pb-(--)">
                    Remarks & Images
                  </h4>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-(--)">
                    <div>
                      <label className="text-(--) font-medium text-slate-600 block mb-(--)">Remarks</label>
                      {isEditing ? (
                        <textarea
                          rows={2}
                          value={formData.remarks}
                          onChange={e => handleInputChange('remarks', e.target.value)}
                          className="w-full p-2 rounded border border-(--) bg-white text-xs focus:border-(--) outline-none resize-none"
                        />
                      ) : (
                        <p className="text-(--) text-slate-700 italic bg-white p-2 rounded border border-slate-200">{formData.remarks || "No remarks"}</p>
                      )}
                    </div>

                    {formData.image_urls && formData.image_urls.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 text-(--) font-semibold text-slate-600 mb-1">
                          <ImageIcon className="w-3.5 h-3.5 text-slate-400" />
                          <span>Uploaded Images ({formData.image_urls.length})</span>
                        </div>
                        <div className="flex flex-wrap gap-1.5 pt-1">
                          {formData.image_urls.map((url, idx) => (
                            <a
                              key={idx}
                              href={url}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 bg-white border border-blue-200 px-2.5 py-1 rounded-md hover:bg-blue-50 transition-colors inline-flex items-center gap-1 shadow-2xs font-medium"
                            >
                              URL #{idx + 1}
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

              </div>

              {/* Items Table */}
              <div>
                <div className="flex items-center justify-between mb-(--)">
                  <div>
                    <h4 className="text-(--) font-bold text-slate-800">Items List ({formData.items.length})</h4>
                    <p className="text-(--) text-slate-500">Matching payload fields: material_id, description, hsn_sac, unit, batch_number, quantity, unit_price</p>
                  </div>
                </div>

                <div className="overflow-x-auto rounded-(--) border border-(--) bg-white shadow-xs">
                  <table className="w-full text-left text-(--) min-w-[800px]">
                    <thead className="bg-slate-50 text-(--) font-semibold text-slate-500 uppercase border-b border-(--)">
                      <tr>
                        <th className="px-(--) py-(--) w-10 text-center">#</th>
                        <th className="px-(--) py-(--) w-24">Material ID</th>
                        <th className="px-(--) py-(--)">Description</th>
                        <th className="px-(--) py-(--) w-24">HSN/SAC</th>
                        <th className="px-(--) py-(--) w-20">Unit</th>
                        <th className="px-(--) py-(--) w-32">Batch Number</th>
                        <th className="px-(--) py-(--) w-20 text-right">Qty</th>
                        <th className="px-(--) py-(--) w-24 text-right">Unit Price</th>
                        <th className="px-(--) py-(--) w-28 text-right">Amount (₹)</th>
                        {isEditing && <th className="px-(--) py-(--) w-12 text-right">Action</th>}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-(--)">
                      {formData.items.map((item, idx) => {
                        const amt = Math.round(((parseFloat(item.quantity) || 0) * (parseFloat(item.unit_price) || 0)) * 100) / 100;

                        return (
                          <tr key={idx} className="bg-white hover:bg-slate-50/50 transition-colors">
                            <td className="px-(--) py-(--) text-center text-(--) text-slate-400 font-semibold">
                              {idx + 1}
                            </td>
                            <td className="px-(--) py-(--)">
                              {isEditing ? (
                                <input
                                  type="number"
                                  value={item.material_id || ""}
                                  onChange={e => handleItemChange(idx, 'material_id', e.target.value)}
                                  className="w-full h-8 px-2 border border-(--) rounded text-xs focus:border-(--) outline-none font-medium"
                                />
                              ) : (
                                <span className="font-semibold text-slate-700 text-xs">{item.material_id || "—"}</span>
                              )}
                            </td>
                            <td className="px-(--) py-(--) font-medium text-slate-700 max-w-xs">
                              {isEditing ? (
                                item.isNew ? (
                                  <select 
                                    className="w-full h-8 px-2 border border-(--) rounded text-xs focus:border-(--) outline-none"
                                    onChange={(e) => handleBoqItemSelect(idx, e.target.value)}
                                    value={item.boq_item_id || item.po_item_id || ""}
                                  >
                                    <option value="">Select BOQ Item</option>
                                    {boqItems.map(boq => (
                                      <option key={boq.boq_item_id || boq.po_item_id} value={boq.boq_item_id || boq.po_item_id}>
                                        {boq.boq_item_name || boq.item_name || "Unknown Item"} (Rem: {boq.remaining_qty ?? boq.remaining_quantity})
                                      </option>
                                    ))}
                                  </select>
                                ) : (
                                  <input
                                    type="text"
                                    value={item.description}
                                    onChange={e => handleItemChange(idx, 'description', e.target.value)}
                                    className="w-full h-8 px-2 border border-(--) rounded text-xs focus:border-(--) outline-none"
                                    placeholder="Description"
                                  />
                                )
                              ) : (
                                <div className="text-(--) font-medium text-slate-800">{item.description || "—"}</div>
                              )}
                            </td>
                            <td className="px-(--) py-(--)">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={item.hsn_sac}
                                  onChange={e => handleItemChange(idx, 'hsn_sac', e.target.value)}
                                  className="w-full h-8 px-2 border rounded text-xs font-mono"
                                />
                              ) : (
                                <span className="font-mono text-slate-600 text-(--)">{item.hsn_sac || "—"}</span>
                              )}
                            </td>
                            <td className="px-(--) py-(--)">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={item.unit}
                                  onChange={e => handleItemChange(idx, 'unit', e.target.value)}
                                  className="w-full h-8 px-2 border rounded text-xs"
                                />
                              ) : (
                                <span className="text-slate-600 text-(--)">{item.unit || "CIL"}</span>
                              )}
                            </td>
                            <td className="px-(--) py-(--)">
                              {isEditing ? (
                                <input
                                  type="text"
                                  value={item.batch_number}
                                  onChange={e => handleItemChange(idx, 'batch_number', e.target.value)}
                                  className="w-full h-8 px-2 border rounded text-xs font-mono"
                                />
                              ) : (
                                <span className="font-mono text-slate-700 text-xs bg-slate-100 px-1.5 py-0.5 rounded">{item.batch_number || "—"}</span>
                              )}
                            </td>
                            <td className="px-(--) py-(--) text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="any"
                                  value={item.quantity}
                                  onChange={e => handleItemChange(idx, 'quantity', parseFloat(e.target.value) || 0)}
                                  className="w-full h-8 px-2 border rounded text-xs text-right font-bold"
                                />
                              ) : (
                                <span className="font-bold text-slate-900">{item.quantity}</span>
                              )}
                            </td>
                            <td className="px-(--) py-(--) text-right">
                              {isEditing ? (
                                <input
                                  type="number"
                                  step="any"
                                  value={item.unit_price}
                                  onChange={e => handleItemChange(idx, 'unit_price', parseFloat(e.target.value) || 0)}
                                  className={`w-full h-8 px-2 border rounded text-xs text-right font-medium ${item.isNew ? 'bg-slate-100 text-slate-500 cursor-not-allowed' : ''}`}
                                  readOnly={item.isNew}
                                />
                              ) : (
                                <span className="text-slate-700 font-medium">₹{Number(item.unit_price || 0).toLocaleString('en-IN')}</span>
                              )}
                            </td>
                            <td className="px-(--) py-(--) text-right font-bold text-slate-900">
                              ₹{Number(amt).toLocaleString('en-IN')}
                            </td>
                            {isEditing && (
                              <td className="px-(--) py-(--) text-right">
                                <button
                                  type="button"
                                  onClick={() => handleRemoveItem(idx)}
                                  className="p-1 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded transition-colors cursor-pointer"
                                  title="Remove item"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </td>
                            )}
                          </tr>
                        );
                      })}
                      {isEditing && (
                        <tr className="bg-slate-50/70">
                          <td colSpan={10} className="px-(--) py-(--) text-center">
                            <button
                              type="button"
                              onClick={handleAddItem}
                              className="btn-3d-secondary px-(--) h-(--) rounded-(--) text-(--) font-semibold inline-flex items-center gap-1.5 text-(--) border-(--)/30 hover:bg-orange-50 cursor-pointer shadow-xs"
                            >
                              <Plus className="w-3.5 h-3.5" />
                              <span>Add Item</span>
                            </button>
                          </td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="bg-slate-50 font-bold border-t border-(--)">
                      <tr>
                        <td colSpan={6} className="px-(--) py-(--) text-right text-(--) uppercase text-slate-500">
                          Total Items Subtotal:
                        </td>
                        <td className="px-(--) py-(--) text-right font-bold text-slate-900">
                          {formData.items.reduce((acc, curr) => acc + (parseFloat(curr.quantity) || 0), 0)}
                        </td>
                        <td className="px-(--) py-(--)"></td>
                        <td className="px-(--) py-(--) text-right font-bold text-(--)">
                          ₹{Number(formData.subtotal || 0).toLocaleString('en-IN')}
                        </td>
                        {isEditing && <td className="px-(--) py-(--)"></td>}
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>

            </div>
          )}
        </div>

        {/* Footer */}
        {step === "VERIFY" && (
          <div className="p-(--) border-t border-(--) bg-white flex justify-end gap-(--)">
            <button
              onClick={handleBack}
              className="btn-3d-secondary px-(--) h-(--) rounded-(--) text-(--) font-medium cursor-pointer"
            >
              Back
            </button>
            {isEditing && (
              <button
                onClick={() => setIsEditing(false)}
                className="bg-blue-600 hover:bg-blue-700 text-white px-(--) h-(--) rounded-(--) text-(--) font-medium shadow-sm cursor-pointer"
              >
                Done Editing
              </button>
            )}
            <button
              onClick={handleSubmit}
              disabled={submitting || isEditing}
              className={`
                btn-3d-primary px-(--) h-(--) rounded-(--) text-(--) font-medium flex items-center gap-2 cursor-pointer
                ${isEditing ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            >
              {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {submitting ? "Saving Inward..." : "Submit Inward"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
