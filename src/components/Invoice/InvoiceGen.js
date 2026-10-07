import React, { useRef, useState, useEffect, useCallback } from "react";
import {
  Box,
  Typography,
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  Paper,
  Button,
  TextField,
  Grid,
  IconButton,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Divider,
  Container,
  InputAdornment,
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";
import { SERVER_URL } from "@/config";
import Link from "next/link";
import Image from "next/image";
import {
  FaFilePdf,
  FaPrint,
  FaSave,
  FaPlus,
  FaTrash,
  FaEdit,
  FaHistory,
  FaCheck,
  FaTimes,
  FaFileInvoice,
  FaHome,
} from "react-icons/fa";
import { HiArrowPath } from "react-icons/hi2";

const formatCurrency = (value) => `KES ${Number(value || 0).toLocaleString()}`;

const generateFallbackDocNo = () => "R24-01";

const ProformaInvoice = ({
  vatNoDefault = "011324A",
  pinNoDefault = "P051129820X",
  companyContact = "Safaricom PLC, Safaricom House, Waiyaki Way, Nairobi, Kenya. Tel: +254 722 003272",
  termsDefault = "",
}) => {
  const invoiceRef = useRef(null);

  // Invoice Header & Info States
  const [documentNo, setDocumentNo] = useState("R24-01");
  const [loadingDocNo, setLoadingDocNo] = useState(false);
  const [date, setDate] = useState("");
  const [shop, setShop] = useState("Safaricom Shop Kisii");
  const [customer, setCustomer] = useState("");
  const [contactname, setContactName] = useState("");
  const [contactphone, setContactPhone] = useState("");
  const [vatNo, setVatNo] = useState(vatNoDefault);
  const [pinNo, setPinNo] = useState(pinNoDefault);
  const [terms, setTerms] = useState(termsDefault);
  const [bankDetails, setBankDetails] = useState("");

  // Items State
  const [items, setItems] = useState([]);
  const [formData, setFormData] = useState({
    id: null,
    description: "",
    quantity: "",
    unitPrice: "",
  });
  const [editingItemId, setEditingItemId] = useState(null);

  // Status & Persistence States
  const [saving, setSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "success" });

  // History Dialog States
  const [historyOpen, setHistoryOpen] = useState(false);
  const [historyInvoices, setHistoryInvoices] = useState([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  // Fetch next sequential document number from server (R24-01, R24-02, etc.)
  const fetchNextDocNo = useCallback(async () => {
    setLoadingDocNo(true);
    try {
      const res = await fetch(`${SERVER_URL}/invoices/next-number`);
      if (res.ok) {
        const data = await res.json();
        if (data.documentNo) {
          setDocumentNo(data.documentNo);
          return;
        }
      }
      setDocumentNo(generateFallbackDocNo());
    } catch (err) {
      console.error("Error fetching next document number:", err);
      setDocumentNo(generateFallbackDocNo());
    } finally {
      setLoadingDocNo(false);
    }
  }, []);

  // Initialize date and document number on mount
  useEffect(() => {
    setDate(new Date().toLocaleDateString("en-GB"));
    fetchNextDocNo();
  }, [fetchNextDocNo]);

  // Total calculation
  const total = items.reduce((sum, item) => sum + (Number(item.value) || 0), 0);

  // Add or Update an item
  const handleSaveItem = () => {
    const { description, quantity, unitPrice } = formData;

    if (!description.trim() || !quantity || !unitPrice) {
      setSnackbar({
        open: true,
        message: "Please fill in Description, Quantity, and Unit Price.",
        severity: "warning",
      });
      return;
    }

    const qtyNum = Number(quantity);
    const priceNum = Number(unitPrice);
    const valueNum = qtyNum * priceNum;

    if (editingItemId) {
      // Update existing item
      setItems((prev) =>
        prev.map((item) =>
          item.id === editingItemId
            ? { ...item, description: description.trim(), quantity: qtyNum, unitPrice: priceNum, value: valueNum }
            : item
        )
      );
      setEditingItemId(null);
      setSnackbar({ open: true, message: "Item updated.", severity: "info" });
    } else {
      // Add new item
      const newItem = {
        id: Date.now() + Math.random().toString(36).substr(2, 4),
        description: description.trim(),
        quantity: qtyNum,
        unitPrice: priceNum,
        value: valueNum,
      };
      setItems((prev) => [...prev, newItem]);
      setSnackbar({ open: true, message: "Item added.", severity: "success" });
    }

    setFormData({ id: null, description: "", quantity: "", unitPrice: "" });
    setSavedSuccess(false);
  };

  // Start editing an item
  const handleEditItem = (item) => {
    setEditingItemId(item.id);
    setFormData({
      id: item.id,
      description: item.description,
      quantity: item.quantity,
      unitPrice: item.unitPrice,
    });
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingItemId(null);
    setFormData({ id: null, description: "", quantity: "", unitPrice: "" });
  };

  // Delete an item
  const handleDeleteItem = (id) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    if (editingItemId === id) {
      handleCancelEdit();
    }
    setSavedSuccess(false);
    setSnackbar({ open: true, message: "Item removed.", severity: "info" });
  };

  // Save Document to Database
  const saveInvoiceToDB = async (showToast = true) => {
    if (!documentNo.trim()) {
      setSnackbar({ open: true, message: "Document Number is required.", severity: "error" });
      return false;
    }

    if (!customer.trim()) {
      setSnackbar({ open: true, message: "Please specify a Customer Name.", severity: "warning" });
      return false;
    }

    if (items.length === 0) {
      setSnackbar({ open: true, message: "Please add at least one line item.", severity: "warning" });
      return false;
    }

    setSaving(true);
    try {
      const payload = {
        documentNo: documentNo.trim(),
        date: date.trim(),
        shop: shop.trim(),
        customer: customer.trim(),
        contactName: contactname.trim(),
        contactPhone: contactphone.trim(),
        vatNo: vatNo.trim(),
        pinNo: pinNo.trim(),
        items,
        total,
        terms: terms.trim(),
        bankDetails: bankDetails.trim(),
      };

      const response = await fetch(`${SERVER_URL}/invoices`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (response.ok && result.success) {
        setSavedSuccess(true);
        if (showToast) {
          setSnackbar({
            open: true,
            message: `Invoice ${documentNo} saved successfully!`,
            severity: "success",
          });
        }
        return true;
      } else {
        setSnackbar({
          open: true,
          message: result.message || "Failed to save invoice.",
          severity: "error",
        });
        return false;
      }
    } catch (err) {
      console.error("Error saving invoice:", err);
      setSnackbar({
        open: true,
        message: "Network error saving invoice. Check server.",
        severity: "error",
      });
      return false;
    } finally {
      setSaving(false);
    }
  };

  // Fetch saved invoices history
  const fetchInvoicesHistory = async () => {
    setLoadingHistory(true);
    setHistoryOpen(true);
    try {
      const res = await fetch(`${SERVER_URL}/invoices?limit=25`);
      if (res.ok) {
        const data = await res.json();
        setHistoryInvoices(data.invoices || []);
      }
    } catch (err) {
      console.error("Error fetching invoices history:", err);
    } finally {
      setLoadingHistory(false);
    }
  };

  // Load a saved invoice from history into editor
  const handleLoadInvoice = (inv) => {
    setDocumentNo(inv.documentNo || generateFallbackDocNo());
    setDate(inv.date || new Date().toLocaleDateString("en-GB"));
    setShop(inv.shop || "Safaricom Shop Kisii");
    setCustomer(inv.customer || "");
    setContactName(inv.contactName || "");
    setContactPhone(inv.contactPhone || "");
    setVatNo(inv.vatNo || vatNoDefault);
    setPinNo(inv.pinNo || pinNoDefault);
    setTerms(inv.terms || termsDefault);
    setBankDetails(inv.bankDetails || "");
    setItems(Array.isArray(inv.items) ? inv.items : []);
    setSavedSuccess(true);
    setHistoryOpen(false);
    setSnackbar({
      open: true,
      message: `Loaded invoice ${inv.documentNo}.`,
      severity: "info",
    });
  };

  // PDF Download (Auto-saves to DB first)
  const handleDownloadPDF = async () => {
    await saveInvoiceToDB(false);

    try {
      const canvas = await html2canvas(invoiceRef.current, { scale: 2, useCORS: true });
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF("p", "mm", "a4");

      const imgProps = pdf.getImageProperties(imgData);
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
      pdf.save(`${documentNo || "Proforma_Invoice"}.pdf`);
    } catch (err) {
      console.error("Error generating PDF:", err);
      setSnackbar({ open: true, message: "Error generating PDF file.", severity: "error" });
    }
  };

  // Browser Print (Auto-saves to DB first)
  const handlePrint = async () => {
    await saveInvoiceToDB(false);

    const printWindow = window.open("", "", "width=850,height=900");
    if (printWindow) {
      printWindow.document.write(`
        <html>
          <head>
            <title>Proforma Invoice - ${documentNo}</title>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 15px; color: #1E293B; }
              @media print { body { padding: 0; } }
            </style>
          </head>
          <body>${invoiceRef.current.innerHTML}</body>
        </html>
      `);
      printWindow.document.close();
      printWindow.focus();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 2 }}>
      <Container maxWidth="lg">
        {/* Compact Top Header Navigation */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 1.5 }}
          flexWrap="wrap"
          gap={1.5}
        >
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/safaricom-logo1.png"
                alt="Safaricom Logo"
                width={130}
                height={28}
                priority
              />
            </Box>
          </Link>
          <Stack direction="row" spacing={1} alignItems="center">
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<FaHome size={13} />}
                sx={{
                  color: "#0F172A",
                  borderColor: "#CBD5E1",
                  textTransform: "none",
                  fontWeight: 600,
                  py: 0.4,
                  fontSize: "0.8rem",
                  "&:hover": { borderColor: "#107C41", color: "#107C41" },
                }}
              >
                Home
              </Button>
            </Link>
            <Button
              variant="outlined"
              size="small"
              startIcon={<FaHistory size={13} />}
              onClick={fetchInvoicesHistory}
              sx={{ color: "#107C41", borderColor: "#107C41", textTransform: "none", fontWeight: 700, py: 0.4, fontSize: "0.8rem" }}
            >
              History
            </Button>
            <Link href="/useSerials" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="small" sx={{ color: "#64748B", borderColor: "#CBD5E1", textTransform: "none", py: 0.4, fontSize: "0.8rem" }}>
                Airtime Issuance
              </Button>
            </Link>
          </Stack>
        </Stack>

        {/* Section 1: Compact Proforma Invoice Editor */}
        <Paper
          elevation={1}
          sx={{
            p: 2,
            mb: 2.5,
            borderRadius: 2,
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
          }}
        >
          <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }}>
            <Box>
              <Typography variant="subtitle1" fontWeight={800} color="#0F172A" sx={{ lineHeight: 1.2 }}>
                Proforma Invoice Editor
              </Typography>
              <Typography variant="caption" color="text.secondary">
                Edit document details and line items before saving, downloading, or printing.
              </Typography>
            </Box>
            {savedSuccess && (
              <Chip
                icon={<FaCheck size={11} />}
                label="Saved ✓"
                color="success"
                size="small"
                sx={{ fontWeight: 700, height: 22, fontSize: "0.75rem" }}
              />
            )}
          </Stack>

          <Divider sx={{ mb: 1.5 }} />

          <Grid container spacing={1.2}>
            {/* ROW 1: Doc no, Issue Date, Shop/branch, VAT no, Pin No */}
            {/* Document Number Generation & Editable Input: R24-01, R24-02 etc */}
            <Grid item xs={6} sm={4} md={2.4}>
              <TextField
                label="Doc No."
                fullWidth
                size="small"
                value={documentNo}
                onChange={(e) => {
                  setDocumentNo(e.target.value);
                  setSavedSuccess(false);
                }}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <FaFileInvoice color="#107C41" size={12} />
                    </InputAdornment>
                  ),
                  endAdornment: (
                    <InputAdornment position="end">
                      <Tooltip title="Generate next number (R24-01, R24-02...)">
                        <IconButton
                          size="small"
                          onClick={fetchNextDocNo}
                          disabled={loadingDocNo}
                          sx={{ p: 0.2 }}
                        >
                          <HiArrowPath
                            size={14}
                            style={{
                              animation: loadingDocNo ? "spin 1s linear infinite" : "none",
                              color: "#107C41",
                            }}
                          />
                        </IconButton>
                      </Tooltip>
                    </InputAdornment>
                  ),
                }}
              />
            </Grid>

            {/* Date */}
            <Grid item xs={6} sm={4} md={2.4}>
              <TextField
                label="Issue Date"
                fullWidth
                size="small"
                value={date}
                onChange={(e) => {
                  setDate(e.target.value);
                  setSavedSuccess(false);
                }}
              />
            </Grid>

            {/* Shop Name */}
            <Grid item xs={12} sm={4} md={2.4}>
              <TextField
                label="Shop / Branch"
                fullWidth
                size="small"
                value={shop}
                onChange={(e) => {
                  setShop(e.target.value);
                  setSavedSuccess(false);
                }}
              />
            </Grid>

            {/* VAT Number */}
            <Grid item xs={6} sm={6} md={2.4}>
              <TextField
                label="VAT No."
                fullWidth
                size="small"
                value={vatNo}
                onChange={(e) => {
                  setVatNo(e.target.value);
                  setSavedSuccess(false);
                }}
              />
            </Grid>

            {/* PIN Number */}
            <Grid item xs={6} sm={6} md={2.4}>
              <TextField
                label="PIN No."
                fullWidth
                size="small"
                value={pinNo}
                onChange={(e) => {
                  setPinNo(e.target.value);
                  setSavedSuccess(false);
                }}
              />
            </Grid>

            {/* ROW 2: Customer, Contact Phone, Contact Person */}
            {/* Customer Name */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Customer / Company *"
                fullWidth
                size="small"
                required
                value={customer}
                onChange={(e) => {
                  setCustomer(e.target.value);
                  setSavedSuccess(false);
                }}
                placeholder="e.g. Apex Enterprises Ltd"
              />
            </Grid>

            {/* Contact Phone */}
            <Grid item xs={12} sm={6} md={4}>
              <TextField
                label="Contact Phone"
                fullWidth
                size="small"
                value={contactphone}
                onChange={(e) => {
                  setContactPhone(e.target.value);
                  setSavedSuccess(false);
                }}
                placeholder="e.g. 0712345678"
              />
            </Grid>

            {/* Contact Person Name */}
            <Grid item xs={12} sm={12} md={4}>
              <TextField
                label="Contact Person"
                fullWidth
                size="small"
                value={contactname}
                onChange={(e) => {
                  setContactName(e.target.value);
                  setSavedSuccess(false);
                }}
                placeholder="e.g. John Doe"
              />
            </Grid>
          </Grid>

          {/* Commanding Separation Between Metadata and Line Items */}
          <Divider sx={{ mt: 3.5, mb: 2.5, borderColor: "#CBD5E1" }} />

          {/* Line Items Entry & Editing Section */}
          <Box
            sx={{
              p: 2,
              bgcolor: "#F8FAFC",
              borderRadius: 2,
              border: "1px solid #E2E8F0",
              borderLeft: "4px solid #107C41",
              boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
            }}
          >
            <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", mb: 1.5 }}>
              <Typography
                variant="caption"
                fontWeight={800}
                color="#0F172A"
                sx={{
                  fontSize: "0.78rem",
                  letterSpacing: 0.6,
                  display: "flex",
                  alignItems: "center",
                  gap: 0.8,
                }}
              >
                {editingItemId ? (
                  <>
                    <FaEdit color="#0284C7" size={13} /> EDIT INVOICE ITEM
                  </>
                ) : (
                  <>
                    <FaPlus color="#107C41" size={12} /> Add Items here
                  </>
                )}
              </Typography>
              {editingItemId && (
                <Chip
                  label="Editing in progress"
                  size="small"
                  color="warning"
                  variant="outlined"
                  sx={{ height: 20, fontSize: "0.68rem", fontWeight: 600 }}
                />
              )}
            </Box>

            <Grid container spacing={1} alignItems="center">
              <Grid item xs={12} md={6}>
                <TextField
                  label="Description"
                  fullWidth
                  size="small"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="e.g. Safaricom Airtime Scratch Cards Ksh 1000"
                />
              </Grid>

              <Grid item xs={6} md={2}>
                <TextField
                  label="Qty"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.quantity}
                  onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                  placeholder="Qty"
                  inputProps={{ min: 1 }}
                />
              </Grid>

              <Grid item xs={6} md={2.5}>
                <TextField
                  label="Unit Price (KES)"
                  type="number"
                  fullWidth
                  size="small"
                  value={formData.unitPrice}
                  onChange={(e) => setFormData({ ...formData, unitPrice: e.target.value })}
                  placeholder="Unit Price"
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} md={1.5}>
                <Stack direction="row" spacing={0.5}>
                  <Button
                    variant="contained"
                    fullWidth
                    size="small"
                    onClick={handleSaveItem}
                    startIcon={editingItemId ? <FaCheck size={12} /> : <FaPlus size={12} />}
                    sx={{
                      bgcolor: "#107C41",
                      "&:hover": { bgcolor: "#0B532B" },
                      textTransform: "none",
                      fontWeight: 700,
                      py: 0.8,
                    }}
                  >
                    {editingItemId ? "Update" : "Add"}
                  </Button>
                  {editingItemId && (
                    <Button
                      variant="outlined"
                      size="small"
                      onClick={handleCancelEdit}
                      sx={{ minWidth: 32, px: 0.5, color: "#EF4444", borderColor: "#EF4444" }}
                    >
                      <FaTimes size={12} />
                    </Button>
                  )}
                </Stack>
              </Grid>
            </Grid>

            {/* Staged items compact table */}
            {items.length > 0 && (
              <Box sx={{ mt: 1.5 }}>
                <Table size="small" sx={{ bgcolor: "#FFFFFF", borderRadius: 1, overflow: "hidden", "& td, & th": { py: 0.5, px: 1 } }}>
                  <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 700, width: "5%" }}>#</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: "50%" }}>Description</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: "10%" }} align="center">Qty</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: "15%" }} align="right">Unit Price</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: "12%" }} align="right">Value (KES)</TableCell>
                      <TableCell sx={{ fontWeight: 700, width: "8%" }} align="center">Edit/Del</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {items.map((item, index) => (
                      <TableRow
                        key={item.id}
                        sx={{
                          bgcolor: editingItemId === item.id ? "#ECFDF5" : "inherit",
                          "&:hover": { bgcolor: "#F8FAFC" },
                        }}
                      >
                        <TableCell>{index + 1}</TableCell>
                        <TableCell sx={{ fontWeight: 600 }}>{item.description}</TableCell>
                        <TableCell align="center">{item.quantity}</TableCell>
                        <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                        <TableCell align="right" sx={{ fontWeight: 700, color: "#107C41" }}>
                          {formatCurrency(item.value)}
                        </TableCell>
                        <TableCell align="center">
                          <Tooltip title="Edit item">
                            <IconButton size="small" onClick={() => handleEditItem(item)} sx={{ color: "#0284C7", p: 0.3 }}>
                              <FaEdit size={13} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Remove item">
                            <IconButton size="small" onClick={() => handleDeleteItem(item.id)} sx={{ color: "#EF4444", p: 0.3 }}>
                              <FaTrash size={13} />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                    <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                      <TableCell colSpan={4} align="right" sx={{ fontWeight: 800 }}>
                        Total:
                      </TableCell>
                      <TableCell align="right" sx={{ fontWeight: 800, color: "#107C41" }}>
                        {formatCurrency(total)}
                      </TableCell>
                      <TableCell />
                    </TableRow>
                  </TableBody>
                </Table>
              </Box>
            )}
          </Box>

          {/* Action Buttons: Save, Download PDF, Print */}
          <Stack direction={{ xs: "column", sm: "row" }} spacing={1} justifyContent="flex-end" sx={{ mt: 2 }}>
            <Button
              variant="contained"
              size="small"
              onClick={() => saveInvoiceToDB(true)}
              disabled={saving}
              startIcon={saving ? <CircularProgress size={14} color="inherit" /> : <FaSave size={13} />}
              sx={{
                bgcolor: "#107C41",
                "&:hover": { bgcolor: "#0B532B" },
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                py: 0.6,
              }}
            >
              {saving ? "Saving..." : "Save"}
            </Button>
            <Button
              variant="contained"
              size="small"
              onClick={handleDownloadPDF}
              startIcon={<FaFilePdf size={13} />}
              sx={{
                bgcolor: "#0369A1",
                "&:hover": { bgcolor: "#075985" },
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                py: 0.6,
              }}
            >
              Download PDF
            </Button>
            <Button
              variant="outlined"
              size="small"
              onClick={handlePrint}
              startIcon={<FaPrint size={13} />}
              sx={{
                color: "#475569",
                borderColor: "#CBD5E1",
                textTransform: "none",
                fontWeight: 700,
                px: 2,
                py: 0.6,
              }}
            >
              Print
            </Button>
          </Stack>
        </Paper>

        {/* Section 2: Compact Printable Proforma Invoice Preview Document */}
        <Typography variant="caption" fontWeight={700} color="#64748B" letterSpacing={0.5} sx={{ mb: 1, display: "block" }}>
          LIVE PRINT / PDF PREVIEW
        </Typography>

        <Paper
          ref={invoiceRef}
          elevation={1}
          sx={{
            p: { xs: 2.5, md: 3.5 },
            maxWidth: 740,
            margin: "auto",
            position: "relative",
            minHeight: "720px",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            bgcolor: "#FFFFFF",
            borderRadius: 1.5,
            border: "1px solid #E2E8F0",
          }}
        >
          {/* Subtle Watermark */}
          <Typography
            sx={{
              position: "absolute",
              top: "40%",
              left: "18%",
              transform: "rotate(-30deg)",
              fontSize: "1.5rem",
              fontWeight: 900,
              color: "rgba(16, 124, 65, 0.04)",
              userSelect: "none",
              pointerEvents: "none",
            }}
          >
            PROFORMA INVOICE
          </Typography>

          <Box>
            {/* Invoice Top Header with Safaricom Logo and Document Header */}
            <Stack direction="row" justifyContent="space-between" alignItems="flex-start" sx={{ mb: 2 }}>
              <Box>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src="/safaricom-logo1.png"
                  alt="Safaricom Logo"
                  style={{ maxHeight: "30px", objectFit: "contain" }}
                />
                <Typography variant="caption" display="block" color="text.secondary" sx={{ mt: 0.3, fontWeight: 600 }}>
                  {shop || "Safaricom Shop"}
                </Typography>
              </Box>
              <Box sx={{ textAlign: "right" }}>
                <Typography
                  sx={{
                    fontWeight: 500,
                    color: "#107C41",
                    letterSpacing: 0.5,
                    lineHeight: 1.1,
                  }}
                >
                  PROFORMA INVOICE
                </Typography>
                <Typography variant="body2" sx={{ fontWeight: 800, color: "#1E293B", mt: 0.5 }}>
                  Doc No: {documentNo || "PENDING"}
                </Typography>
                <Typography variant="caption" display="block" color="text.secondary">
                  Date: {date}
                </Typography>
              </Box>
            </Stack>

            <Divider sx={{ mb: 1.5, borderColor: "#107C41", borderWidth: 1.2 }} />

            {/* Two-Column Information Box: Supplier Tax Details & Customer Details */}
            <Grid container spacing={1.5} sx={{ mb: 2 }}>
              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 1.2, bgcolor: "#F8FAFC", borderRadius: 1.5, border: "1px solid #E2E8F0" }}>
                  <Typography variant="body2" fontWeight={800} color="#0F172A">
                    Safaricom PLC
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    Branch: <strong>{shop}</strong>
                  </Typography>
                  <Typography variant="caption" display="block" color="text.secondary">
                    VAT No: <strong>{vatNo}</strong> | PIN No: <strong>{pinNo}</strong>
                  </Typography>
                </Paper>
              </Grid>

              <Grid item xs={12} sm={6}>
                <Paper variant="outlined" sx={{ p: 1.2, bgcolor: "#F8FAFC", borderRadius: 1.5, border: "1px solid #E2E8F0" }}>
                  <Typography variant="caption" fontWeight={800} color="#107C41" letterSpacing={0.5}>
                    INVOICE TO
                  </Typography>
                  <Typography variant="body2" fontWeight={800} color="#0F172A" sx={{ mt: 0.3 }}>
                    {customer || "—"}
                  </Typography>
                  {contactname && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Attn: <strong>{contactname}</strong>
                    </Typography>
                  )}
                  {contactphone && (
                    <Typography variant="caption" display="block" color="text.secondary">
                      Tel: <strong>{contactphone}</strong>
                    </Typography>
                  )}
                </Paper>
              </Grid>
            </Grid>

            {/* Line Items Table */}
            <Table
              sx={{
                mb: 2,
                border: "1px solid #E2E8F0",
                "& .MuiTableCell-head": { bgcolor: "#107C41", color: "white", fontWeight: 700, fontSize: "0.8rem", py: 0.8, px: 1 },
                "& .MuiTableCell-body": { fontSize: "0.8rem", py: 0.7, px: 1 },
              }}
            >
              <TableHead>
                <TableRow>
                  <TableCell sx={{ width: "6%" }}>#</TableCell>
                  <TableCell sx={{ width: "50%" }}>Item Description</TableCell>
                  <TableCell align="center" sx={{ width: "12%" }}>Qty</TableCell>
                  <TableCell align="right" sx={{ width: "16%" }}>Unit Price (Incl. VAT)</TableCell>
                  <TableCell align="right" sx={{ width: "16%" }}>Value (KES)</TableCell>
                </TableRow>
              </TableHead>

              <TableBody>
                {items.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} align="center" sx={{ py: 3, color: "#94A3B8" }}>
                      No items added yet. Use the editor above to add line items.
                    </TableCell>
                  </TableRow>
                ) : (
                  items.map((item, i) => (
                    <TableRow key={item.id || i} sx={{ "&:nth-of-type(even)": { bgcolor: "#F8FAFC" } }}>
                      <TableCell>{i + 1}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{item.description}</TableCell>
                      <TableCell align="center">{item.quantity}</TableCell>
                      <TableCell align="right">{formatCurrency(item.unitPrice)}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(item.value)}
                      </TableCell>
                    </TableRow>
                  ))
                )}

                {/* Total Row */}
                <TableRow sx={{ bgcolor: "#F8FAFC" }}>
                  <TableCell colSpan={4} align="right" sx={{ fontWeight: 800, fontSize: "0.85rem" }}>
                    TOTAL AMOUNT (KES):
                  </TableCell>
                  <TableCell align="right" sx={{ fontWeight: 900, fontSize: "0.95rem", color: "#107C41" }}>
                    {formatCurrency(total)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>

            {/* Note & Terms Section Below Table */}
            <Box
              sx={{
                mt: 1.5,
                mb: 2,
                p: 1.5,
                bgcolor: "#F8FAFC",
                borderRadius: 1.5,
                border: "1px solid #E2E8F0",
              }}
            >
              <Typography
                variant="caption"
                fontWeight={800}
                color="#0F172A"
                sx={{ display: "block", mb: 0.3, fontSize: "0.75rem" }}
              >
                Note:
              </Typography>
              <Typography variant="caption" display="block" color="#334155" sx={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                Terms &amp; Conditions Apply
              </Typography>
              <Typography variant="caption" display="block" color="#334155" sx={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                Prices are subject to change any time, kindly confirm the prices before payment.
              </Typography>
              <Typography variant="caption" display="block" color="#334155" sx={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                Safaricom Shops sell original devices directly from manufacturers.
              </Typography>
              <Typography variant="caption" display="block" color="#334155" sx={{ fontSize: "0.72rem", lineHeight: 1.45 }}>
                All our devices come with Manufacturer’s Warranty of 1 Year.
              </Typography>
              <Typography variant="caption" display="block" color="#334155" sx={{ fontSize: "0.72rem", lineHeight: 1.45, mt: 0.8 }}>
                Payment terms include EFT, Cash and Cheques (Cheques have to clear before stock is released).
              </Typography>

              {/* Structured Bank Account Details */}
              <Box sx={{ mt: 1, pt: 0.8, borderTop: "1px dashed #CBD5E1" }}>
                <Typography
                  variant="caption"
                  fontWeight={800}
                  color="#0F172A"
                  sx={{ display: "block", mb: 0.5, fontSize: "0.74rem" }}
                >
                  Bank Account Details:
                </Typography>
                <Box sx={{ display: "flex", flexDirection: "column", gap: 0.2, mt: 0.3 }}>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    Account Name:{" "}
                    <Typography component="span" variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.72rem" }}>
                      Safaricom PLC
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    Bank:{" "}
                    <Typography component="span" variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.72rem" }}>
                      Standard Chartered Bank Kenya Limited
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    Branch:{" "}
                    <Typography component="span" variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.72rem" }}>
                      Westlands
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    Bank Code:{" "}
                    <Typography component="span" variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.72rem" }}>
                      02
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    Branch Code:{" "}
                    <Typography component="span" variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.72rem" }}>
                      070
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    Account No:{" "}
                    <Typography component="span" variant="caption" fontWeight={800} color="#107C41" sx={{ fontSize: "0.72rem", fontFamily: "monospace", letterSpacing: 0.5 }}>
                      0106094643702
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    S/Code:{" "}
                    <Typography component="span" variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.72rem", fontFamily: "monospace" }}>
                      SCBLKENXXXX
                    </Typography>
                  </Typography>
                  <Typography variant="caption" sx={{ fontSize: "0.72rem", color: "#334155", lineHeight: 1.45 }}>
                    Currency:{" "}
                    <Typography component="span" variant="caption" fontWeight={700} color="#0F172A" sx={{ fontSize: "0.72rem" }}>
                      Kes
                    </Typography>
                  </Typography>
                </Box>
              </Box>
            </Box>

            {/* Stamp & Authorized Signature */}
            <Box sx={{ mt: 3, pt: 1.5, display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: 2 }}>
              <Box>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Authorized Stamp & Signature:
                </Typography>
                <Box
                  sx={{
                    mt: 0.5,
                    width: 200,
                    height: 40,
                    borderBottom: "1.5px dashed #94A3B8",
                  }}
                />
              </Box>

              <Box sx={{ textAlign: { xs: "left", sm: "right" } }}>
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  Issued By:
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {shop || "Safaricom PLC"}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Date: {date}
                </Typography>
              </Box>
            </Box>
          </Box>

          {/* Compact Document Footer */}
          <Box sx={{ borderTop: "1px solid #E2E8F0", pt: 1.5, mt: 2.5 }}>
            <Typography variant="caption" align="center" display="block" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
              {companyContact}
            </Typography>
          </Box>
        </Paper>

        {/* Section 3: Saved Invoices History Dialog */}
        <Dialog open={historyOpen} onClose={() => setHistoryOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle sx={{ fontWeight: 800, bgcolor: "#F8FAFC", borderBottom: "1px solid #E2E8F0", py: 1.5 }}>
            📂 Saved Proforma Invoices History
          </DialogTitle>
          <DialogContent sx={{ p: 2 }}>
            {loadingHistory ? (
              <Box sx={{ textAlign: "center", py: 4 }}>
                <CircularProgress size={28} sx={{ color: "#107C41" }} />
                <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                  Loading saved documents...
                </Typography>
              </Box>
            ) : historyInvoices.length === 0 ? (
              <Typography variant="body2" color="text.secondary" align="center" sx={{ py: 4 }}>
                No proforma invoices saved in the database yet.
              </Typography>
            ) : (
              <Table size="small" sx={{ "& td, & th": { py: 0.6, px: 1 } }}>
                <TableHead sx={{ bgcolor: "#F1F5F9" }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Doc Number</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Customer</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Shop</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="right">Total</TableCell>
                    <TableCell sx={{ fontWeight: 700 }} align="center">Action</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {historyInvoices.map((inv) => (
                    <TableRow key={inv._id || inv.documentNo} hover>
                      <TableCell sx={{ fontWeight: 700, color: "#107C41" }}>{inv.documentNo}</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{inv.customer}</TableCell>
                      <TableCell>{inv.shop}</TableCell>
                      <TableCell>{inv.date}</TableCell>
                      <TableCell align="right" sx={{ fontWeight: 700 }}>
                        {formatCurrency(inv.total)}
                      </TableCell>
                      <TableCell align="center">
                        <Button
                          size="small"
                          variant="outlined"
                          onClick={() => handleLoadInvoice(inv)}
                          sx={{ textTransform: "none", fontSize: "0.75rem", py: 0.2 }}
                        >
                          Load
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </DialogContent>
          <DialogActions sx={{ px: 2, pb: 1.5 }}>
            <Button onClick={() => setHistoryOpen(false)} size="small" sx={{ textTransform: "none" }}>
              Close
            </Button>
          </DialogActions>
        </Dialog>

        {/* Global Feedback Snackbar */}
        <Snackbar
          open={snackbar.open}
          autoHideDuration={3500}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        >
          <Alert
            severity={snackbar.severity}
            onClose={() => setSnackbar({ ...snackbar, open: false })}
            sx={{ width: "100%", boxShadow: 3, fontWeight: 600 }}
          >
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Container>
    </Box>
  );
};

export default ProformaInvoice;
