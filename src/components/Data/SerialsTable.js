import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Box,
  Typography,
  Grid,
  Button,
  TablePagination,
  TextField,
  Chip,
  Card,
  CardContent,
  Stack,
  InputAdornment,
  CircularProgress,
  Container,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { SERVER_URL } from "@/config";
import Image from "next/image";
import Link from "next/link";
import { Parser } from "json2csv";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { useRouter } from "next/router";
import { IoSearchOutline, IoDownloadOutline, IoAddCircleOutline, IoLockClosedOutline } from "react-icons/io5";
import { FaMoneyBillWave, FaPhoneAlt, FaSimCard, FaHome } from "react-icons/fa";

const SerialsTable = () => {
  const router = useRouter();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedDenom, setSelectedDenom] = useState("ALL");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [error, setError] = useState("");
  const [accessDenied, setAccessDenied] = useState(false);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError("");
    setAccessDenied(false);

    const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userRole = typeof window !== "undefined" ? localStorage.getItem("userType") : null;

    if (!authToken) {
      router.push("/login");
      return;
    }

    if (userRole && userRole.toLowerCase() !== "admin") {
      setAccessDenied(true);
      setLoading(false);
      return;
    }

    try {
      const headers = {
        "Content-Type": "application/json",
        Authorization: `Bearer ${authToken}`,
      };

      const response = await fetch(`${SERVER_URL}/cars`, {
        method: "GET",
        headers,
      });

      if (response.status === 401) {
        router.push("/login");
        return;
      }

      if (response.status === 403) {
        setAccessDenied(true);
        return;
      }

      if (response.ok) {
        const responseData = await response.json();
        if (Array.isArray(responseData)) {
          const fetchedItems = responseData.map((item) => ({
            id: item._id || uuidv4(),
            serial: item.serial,
            denomination: item.denomination,
            phoneNumber: item.phoneNumber,
            createdAt: item.createdAt,
          }));
          setData(fetchedItems);
        }
      } else {
        setError(`Failed to load data (${response.status})`);
      }
    } catch (err) {
      console.error("Error fetching data:", err);
      setError("Network error while connecting to server.");
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Filtered dataset
  const filteredData = useMemo(() => {
    return data.filter((item) => {
      const matchesSearch =
        (item.serial && item.serial.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (item.phoneNumber && item.phoneNumber.includes(searchQuery));

      const matchesDenom =
        selectedDenom === "ALL" || String(item.denomination) === String(selectedDenom);

      return matchesSearch && matchesDenom;
    });
  }, [data, searchQuery, selectedDenom]);

  // Unique denominations present in data
  const denominationsList = useMemo(() => {
    const denoms = Array.from(new Set(data.map((d) => String(d.denomination)).filter(Boolean)));
    return denoms.sort((a, b) => Number(a) - Number(b));
  }, [data]);

  // Aggregate Metrics
  const totalValue = useMemo(() => {
    return data.reduce((acc, curr) => acc + (Number(curr.denomination) || 0), 0);
  }, [data]);

  const uniquePhones = useMemo(() => {
    return new Set(data.map((d) => d.phoneNumber)).size;
  }, [data]);

  const downloadCSV = () => {
    try {
      const fields = ["denomination", "serial", "phoneNumber", "createdAt"];
      const opts = { fields };
      const parser = new Parser(opts);
      const csv = parser.parse(filteredData);

      const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `issued_serials_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error("CSV Export error:", err);
    }
  };

  const downloadPDF = async () => {
    try {
      const doc = new jsPDF();

      // Load Safaricom logo
      const img = new window.Image();
      img.src = "/safaricom-logo1.png";
      await new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.onload = () => resolve();
          img.onerror = () => resolve();
        }
      });

      let startY = 15;
      if (img.complete && img.naturalWidth > 0) {
        // Logo dimensions: width 48mm, proportional height
        const logoWidth = 48;
        const logoHeight = (img.naturalHeight / img.naturalWidth) * logoWidth;
        doc.addImage(img, "PNG", 14, 10, logoWidth, logoHeight);

        const textStartY = 10 + logoHeight + 7;
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 124, 65); // Safaricom green
        doc.text("Safaricom Kisii, Customer Delight Airtime Report", 14, textStartY);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Generated: ${new Date().toLocaleString()} | Total Records: ${filteredData.length}`,
          14,
          textStartY + 6
        );

        startY = textStartY + 12;
      } else {
        doc.setFontSize(16);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(16, 124, 65);
        doc.text("Safaricom Kisii, Customer Delight Airtime Report", 14, 15);

        doc.setFontSize(9);
        doc.setFont("helvetica", "normal");
        doc.setTextColor(100, 116, 139);
        doc.text(
          `Generated: ${new Date().toLocaleString()} | Total Records: ${filteredData.length}`,
          14,
          22
        );

        startY = 28;
      }

      const tableData = filteredData.map((row) => [
        row.denomination ? `Ksh ${row.denomination}` : "-",
        row.serial || "-",
        row.phoneNumber || "-",
        row.createdAt ? new Date(row.createdAt).toLocaleString() : "-",
      ]);

      autoTable(doc, {
        head: [["Denomination", "Serial Number", "Phone Number", "Date Issued"]],
        body: tableData,
        startY: startY,
        headStyles: { fillColor: [16, 124, 65] },
        styles: { fontSize: 8 },
      });

      doc.save(
        `safaricom_issued_serials_${new Date().toISOString().slice(0, 10)}.pdf`
      );
    } catch (err) {
      console.error("PDF Export error:", err);
    }
  };

  if (accessDenied) {
    return (
      <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 8 }}>
        <Container maxWidth="sm">
          <Card elevation={2} sx={{ p: 4, textAlign: "center", borderRadius: 3, border: "1px solid #E2E8F0" }}>
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "#FEF2F2",
                color: "#EF4444",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mx: "auto",
                mb: 2,
              }}
            >
              <IoLockClosedOutline size={32} />
            </Box>
            <Typography variant="h5" sx={{ fontWeight: 800, color: "#1E293B", mb: 1 }}>
              Administrator Privileges Required
            </Typography>
            <Typography variant="body2" sx={{ color: "#64748B", mb: 3 }}>
              Audit reports and entered airtime records can only be viewed by administrators. You can issue airtime using the serial issuance screen.
            </Typography>
            <Stack direction="row" spacing={2} justifyContent="center">
              <Button
                variant="contained"
                onClick={() => router.push("/useSerials")}
                sx={{
                  bgcolor: "#107C41",
                  textTransform: "none",
                  fontWeight: 700,
                  "&:hover": { bgcolor: "#0B532B" },
                }}
              >
                Go to Airtime Issuance
              </Button>
              <Button
                variant="outlined"
                onClick={() => router.push("/login")}
                sx={{ textTransform: "none", fontWeight: 600, color: "#64748B", borderColor: "#CBD5E1" }}
              >
                Switch Account
              </Button>
            </Stack>
          </Card>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
      <Container maxWidth="lg">
        {/* Top Navigation */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 4 }}
          flexWrap="wrap"
          gap={2}
        >
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/safaricom-logo1.png"
                alt="Safaricom Logo"
                width={160}
                height={34}
                priority
              />
            </Box>
          </Link>
          <Stack direction="row" spacing={1.5} alignItems="center">
            <Link href="/" passHref style={{ textDecoration: "none" }}>
              <Button
                variant="outlined"
                startIcon={<FaHome size={15} />}
                sx={{
                  color: "#0F172A",
                  borderColor: "#CBD5E1",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { borderColor: "#107C41", color: "#107C41" },
                }}
              >
                Home
              </Button>
            </Link>
            <Link href="/useSerials" passHref style={{ textDecoration: "none" }}>
              <Button
                variant="contained"
                startIcon={<IoAddCircleOutline />}
                sx={{ bgcolor: "#107C41", "&:hover": { bgcolor: "#0B532B" }, textTransform: "none" }}
              >
                Issue Serial
              </Button>
            </Link>
            <Link href="/upload" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" sx={{ color: "#107C41", borderColor: "#107C41", textTransform: "none" }}>
                Upload Serials
              </Button>
            </Link>
          </Stack>
        </Stack>

        {/* Report Header Title */}
        <Box sx={{ mb: 3 }}>
          <Typography
            variant="h5"
            sx={{
              fontWeight: 800,
              color: "#0F172A",
              letterSpacing: "-0.02em",
            }}
          >
            Safaricom Kisii, Customer Delight Airtime Report
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
            Audit log and issuance records of all allocated airtime serials.
          </Typography>
        </Box>

        {/* Metric Cards */}
        <Grid container spacing={2.5} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={1} sx={{ borderRadius: 2.5, border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: "#ECFDF5",
                    p: 1.5,
                    borderRadius: 2,
                    color: "#107C41",
                    display: "flex",
                  }}
                >
                  <FaSimCard size={28} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL SERIALS ISSUED
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A">
                    {data.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={1} sx={{ borderRadius: 2.5, border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: "#F0FDF4",
                    p: 1.5,
                    borderRadius: 2,
                    color: "#166534",
                    display: "flex",
                  }}
                >
                  <FaMoneyBillWave size={28} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    TOTAL AIRTIME VALUE
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A">
                    Ksh {totalValue.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={4}>
            <Card elevation={1} sx={{ borderRadius: 2.5, border: "1px solid #E2E8F0" }}>
              <CardContent sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <Box
                  sx={{
                    bgcolor: "#F8FAFC",
                    p: 1.5,
                    borderRadius: 2,
                    color: "#475569",
                    display: "flex",
                  }}
                >
                  <FaPhoneAlt size={28} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    UNIQUE RECIPIENTS
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A">
                    {uniquePhones}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search, Filters, and Export Toolbar */}
        <Paper
          elevation={1}
          sx={{
            p: 2.5,
            mb: 3,
            borderRadius: 2.5,
            border: "1px solid #E2E8F0",
          }}
        >
          <Stack
            direction={{ xs: "column", md: "row" }}
            justifyContent="space-between"
            alignItems={{ xs: "stretch", md: "center" }}
            spacing={2}
          >
            {/* Search Input */}
            <TextField
              size="small"
              placeholder="Search by serial or phone number..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ minWidth: { md: 320 } }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <IoSearchOutline color="#94A3B8" size={18} />
                  </InputAdornment>
                ),
              }}
            />

            {/* Denomination Filter Chips */}
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap alignItems="center">
              <Typography variant="caption" color="text.secondary" fontWeight={600}>
                FILTER:
              </Typography>
              <Chip
                size="small"
                label="All"
                color={selectedDenom === "ALL" ? "success" : "default"}
                onClick={() => setSelectedDenom("ALL")}
                sx={{
                  fontWeight: 600,
                  bgcolor: selectedDenom === "ALL" ? "#107C41" : undefined,
                  color: selectedDenom === "ALL" ? "#FFFFFF" : undefined,
                }}
              />
              {denominationsList.map((denom) => (
                <Chip
                  key={denom}
                  size="small"
                  label={`Ksh ${denom}`}
                  color={selectedDenom === denom ? "success" : "default"}
                  onClick={() => setSelectedDenom(denom)}
                  sx={{
                    fontWeight: 600,
                    bgcolor: selectedDenom === denom ? "#107C41" : undefined,
                    color: selectedDenom === denom ? "#FFFFFF" : undefined,
                  }}
                />
              ))}
            </Stack>

            {/* Export Buttons */}
            <Stack direction="row" spacing={1}>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IoDownloadOutline />}
                onClick={downloadCSV}
                disabled={filteredData.length === 0}
                sx={{ color: "#107C41", borderColor: "#107C41" }}
              >
                CSV
              </Button>
              <Button
                variant="outlined"
                size="small"
                startIcon={<IoDownloadOutline />}
                onClick={downloadPDF}
                disabled={filteredData.length === 0}
                sx={{ color: "#107C41", borderColor: "#107C41" }}
              >
                PDF
              </Button>
            </Stack>
          </Stack>
        </Paper>

        {/* Data Table */}
        <TableContainer
          component={Paper}
          elevation={1}
          sx={{ borderRadius: 2.5, border: "1px solid #E2E8F0", overflow: "hidden" }}
        >
          <Table>
            <TableHead sx={{ bgcolor: "#107C41" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>#</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Denomination</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Serial Number</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Recipient Phone</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Date Issued</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: "#107C41" }} />
                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                      Loading issued serials...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      No serials found matching criteria
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {data.length === 0
                        ? "No serials have been issued yet. Use the Entry Form to issue airtime."
                        : "Try adjusting your search or filters."}
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row, index) => (
                    <TableRow key={row.id} hover sx={{ "&:last-child td, &:last-child th": { border: 0 } }}>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {page * rowsPerPage + index + 1}
                      </TableCell>
                      <TableCell>
                        <Chip
                          size="small"
                          label={`Ksh ${row.denomination}`}
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#ECFDF5",
                            color: "#107C41",
                            border: "1px solid #BBF7D0",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontFamily: "monospace", fontWeight: 600, letterSpacing: 0.5 }}>
                        {row.serial}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>{row.phoneNumber}</TableCell>
                      <TableCell sx={{ color: "text.secondary", fontSize: "0.85rem" }}>
                        {row.createdAt ? new Date(row.createdAt).toLocaleString() : "-"}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25, 50]}
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, newPage) => setPage(newPage)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </TableContainer>
      </Container>
    </Box>
  );
};

export default SerialsTable;
