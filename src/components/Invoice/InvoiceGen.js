import React, { useRef, useState } from "react";
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
} from "@mui/material";
import jsPDF from "jspdf";
import html2canvas from "html2canvas";

const formatCurrency = (value) => `KES ${Number(value).toLocaleString()}`;

const generateInvoiceNo = () => {
    const today = new Date();
    return `INV/${today.getFullYear()}/${String(today.getMonth() + 1).padStart(
        2,
        "0"
    )}${String(today.getDate()).padStart(2, "0")}`;
};

const generateDate = () => new Date().toLocaleDateString("en-GB");

const ProformaInvoice = ({
    vatNo = "011324A",
    pinNo = "P0511298820X",
    supplier = "Safaricom PLC",
    logoUrl = "/safaricom-logo1.png",
    companyContact = "Safaricom PLC, Safaricom House, Waiyaki Way, Nairobi, Kenya. Tel: +254 722 003272",
    terms = "Payment in courtesy of Safaricom PLC. This Proforma Invoice is valid for 14 days from the date of issue.",
}) => {
    const invoiceRef = useRef(null);
    const invoiceNo = generateInvoiceNo();
    const date = generateDate();
    const [customer, setCustomer] = useState("");
    const [contactname, setContactName] = useState("");
    const [contactphone, setContactPhone] = useState("");
    const [shop, setShop] = useState("Safaricom Shop "); 

    const [items, setItems] = useState([]);
    const [formData, setFormData] = useState({
        description: "",
        quantity: "",
        unitPrice: "",
    });

    const total = items.reduce((sum, item) => sum + item.value, 0);
    const handleAddItem = () => {
        const { description, quantity, unitPrice } = formData;

        if (!description || !quantity || !unitPrice) {
            alert("Fill all item fields!");
            return;
        }

        const value = Number(quantity) * Number(unitPrice);

        setItems([
            ...items,
            { description, quantity, unitPrice: Number(unitPrice), value },
        ]);

        setFormData({ description: "", quantity: "", unitPrice: "" });
    };
    const handleDownloadPDF = async () => {
        const canvas = await html2canvas(invoiceRef.current, { scale: 2 });
        const imgData = canvas.toDataURL("image/png");
        const pdf = new jsPDF("p", "mm", "a4");

        const imgProps = pdf.getImageProperties(imgData);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;

        pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight);
        pdf.save(`${invoiceNo}.pdf`);
    };
    const handlePrint = () => {
        const printWindow = window.open("", "", "width=800,height=600");

        printWindow.document.write(`
      <html>
        <head><title>Print Invoice</title></head>
        <body>${invoiceRef.current.innerHTML}</body>
      </html>
    `);

        printWindow.document.close();
        printWindow.print();
    };

    return (
        <Box>
            <Paper sx={{ p: 3, maxWidth: 800, margin: "auto", mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                    Invoice Form
                </Typography>

                <Grid container spacing={2}>
                    <Grid item xs={12}>
                        <TextField
                            label="Shop Name"
                            fullWidth
                            value={shop}
                            onChange={(e) => setShop(e.target.value)}
                        />
                    </Grid>

                    <Grid item xs={12}>
                        <TextField
                            label="Customer Name"
                            fullWidth
                            value={customer}
                            onChange={(e) => setCustomer(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <Grid container spacing={2}>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Contact Name"
                                    fullWidth
                                    value={contactname}
                                    onChange={(e) => setContactName(e.target.value)}
                                />
                            </Grid>

                            <Grid item xs={12} sm={6}>
                                <TextField
                                    label="Contact Phone"
                                    fullWidth
                                    value={contactphone}
                                    onChange={(e) => setContactPhone(e.target.value)}
                                />
                            </Grid>
                        </Grid>
                    </Grid>
                    <Grid item xs={6}>
                        <TextField
                            label="Description"
                            fullWidth
                            value={formData.description}
                            onChange={(e) =>
                                setFormData({ ...formData, description: e.target.value })
                            }
                        />
                    </Grid>

                    <Grid item xs={2}>
                        <TextField
                            label="Qty"
                            type="number"
                            fullWidth
                            value={formData.quantity}
                            onChange={(e) =>
                                setFormData({ ...formData, quantity: e.target.value })
                            }
                        />
                    </Grid>

                    <Grid item xs={4}>
                        <TextField
                            label="Unit Price (KES)"
                            type="number"
                            fullWidth
                            value={formData.unitPrice}
                            onChange={(e) =>
                                setFormData({ ...formData, unitPrice: e.target.value })
                            }
                        />
                    </Grid>

                    <Grid item xs={12} sx={{ textAlign: "right" }}>
                        <Button variant="contained" onClick={handleAddItem}>
                            Add Item
                        </Button>
                    </Grid>
                </Grid>
            </Paper>
            <Paper
                ref={invoiceRef}
                sx={{
                    p: 4,
                    maxWidth: 800,
                    margin: "auto",
                    position: "relative",
                    minHeight: "1123px",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between"
                }}
            >
                <Typography
                    sx={{
                        position: "absolute",
                        top: "40%",
                        left: "20%",
                        transform: "rotate(-30deg)",
                        fontSize: "3rem",
                        color: "rgba(200,200,200,0.2)",
                    }}
                >
                    PROFORMA INVOICE
                </Typography>

                <Typography variant="h5" align="center" gutterBottom>
                    PROFORMA INVOICE
                </Typography>
                <Box sx={{ mb: 2 }}>
                    <Typography>VAT No: {vatNo}</Typography>
                    <Typography>PIN No: {pinNo}</Typography>
                    <Typography>Date: {date}</Typography>
                    <Typography>Invoice No: {invoiceNo}</Typography>
                </Box>
                <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle1">Shop Name: {shop}</Typography>
                    <Typography variant="subtitle1">CUSTOMER: {customer}</Typography>
                    <Typography>Contact: {contactname}</Typography>
                    <Typography>Contact: {contactphone}</Typography>
                </Box>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Description</TableCell>
                            <TableCell>Qty</TableCell>
                            <TableCell>Unit Price(inclusive of 16% VAT)</TableCell>
                            <TableCell>Value</TableCell>
                        </TableRow>
                    </TableHead>

                    <TableBody>
                        {items.map((item, i) => (
                            <TableRow key={i}>
                                <TableCell>{item.description}</TableCell>
                                <TableCell>{item.quantity}</TableCell>
                                <TableCell>{formatCurrency(item.unitPrice)}</TableCell>
                                <TableCell>{formatCurrency(item.value)}</TableCell>
                            </TableRow>
                        ))}

                        <TableRow>
                            <TableCell colSpan={3} align="right">
                                <strong>Total</strong>
                            </TableCell>
                            <TableCell>
                                <strong>{formatCurrency(total)}</strong>
                            </TableCell>
                        </TableRow>
                    </TableBody>
                </Table>
                <Box sx={{ mt: 4 }}>
                    <Typography>Authorized Stamp: ________________________</Typography>
                </Box>
                <Box sx={{ mt: 4 }}>
                    <Box sx={{ borderTop: "1px solid #ccc", pt: 2 }}>
                        {logoUrl && (
                            <Box sx={{ textAlign: "center", mb: 1 }}>
                                <img src={logoUrl} alt="Footer Logo" style={{ maxHeight: "40px", opacity: 0.8 }} />
                            </Box>
                        )}
                        <Typography variant="body2" align="center">
                            {companyContact}
                        </Typography>
                        <Typography variant="caption" display="block" align="center" sx={{ mt: 1 }}>
                            {terms}
                        </Typography>
                    </Box>
                </Box>
            </Paper>
            <Box sx={{ textAlign: "center", mt: 2 }}>
                <Button variant="contained" onClick={handleDownloadPDF} sx={{ mr: 2 }}>
                    Download as PDF
                </Button>
                <Button variant="outlined" onClick={handlePrint}>
                    Print
                </Button>
            </Box>
        </Box>
    );
};

export default ProformaInvoice;
