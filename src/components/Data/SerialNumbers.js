import React, { useEffect, useState, useMemo } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
  Box,
  Card,
  CardContent,
  Grid,
  Chip,
  Paper,
  Stack,
  TextField,
  InputAdornment,
  Button,
  CircularProgress,
} from "@mui/material";
import { SERVER_URL } from "@/config";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";
import { IoSearchOutline } from "react-icons/io5";
import { FaSimCard, FaBoxes } from "react-icons/fa";

function SerialNumbers() {
  const router = useRouter();
  const [denominations, setDenominations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const fetchSerialNumbers = async () => {
    const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const headers = { "Content-Type": "application/json" };
    if (authToken) {
      headers["Authorization"] = `Bearer ${authToken}`;
    }

    setLoading(true);
    try {
      const response = await fetch(`${SERVER_URL}/serial`, { headers });
      if (response.ok) {
        const data = await response.json();
        setDenominations(data.denominations || []);
      }
    } catch (error) {
      console.error("Failed to fetch serial numbers:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSerialNumbers();
  }, []);

  // Total serials count across all denominations
  const totalStockCount = useMemo(() => {
    return denominations.reduce((acc, d) => acc + (d.serials?.length || 0), 0);
  }, [denominations]);

  // Filtered denominations
  const filteredData = useMemo(() => {
    if (!searchQuery.trim()) return denominations;
    const query = searchQuery.toLowerCase();
    return denominations.filter((item) => {
      const denomMatch = String(item.denomination).includes(query);
      const serialMatch = item.serials?.some((s) => s.toLowerCase().includes(query));
      return denomMatch || serialMatch;
    });
  }, [denominations, searchQuery]);

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 4 }}>
      <Container maxWidth="lg">
        {/* Top Header */}
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
          <Stack direction="row" spacing={1.5}>
            <Link href="/useSerials" passHref style={{ textDecoration: "none" }}>
              <Button variant="contained" sx={{ bgcolor: "#107C41", "&:hover": { bgcolor: "#0B532B" } }}>
                Issue Airtime
              </Button>
            </Link>
            <Link href="/upload" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" sx={{ color: "#107C41", borderColor: "#107C41" }}>
                Upload Serials
              </Button>
            </Link>
          </Stack>
        </Stack>

        {/* Metric Cards */}
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} sm={6}>
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
                  <FaBoxes size={28} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    DENOMINATIONS IN POOL
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A">
                    {denominations.length}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12} sm={6}>
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
                  <FaSimCard size={28} />
                </Box>
                <Box>
                  <Typography variant="caption" color="text.secondary" fontWeight={600}>
                    AVAILABLE SERIALS FOR ISSUANCE
                  </Typography>
                  <Typography variant="h5" fontWeight={800} color="#0F172A">
                    {totalStockCount.toLocaleString()}
                  </Typography>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        </Grid>

        {/* Search Toolbar */}
        <Paper elevation={1} sx={{ p: 2, mb: 3, borderRadius: 2.5, border: "1px solid #E2E8F0" }}>
          <TextField
            size="small"
            fullWidth
            placeholder="Search by denomination or serial number..."
            value={searchQuery}
            onChange={(e) => {
              setSearchQuery(e.target.value);
              setPage(0);
            }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <IoSearchOutline color="#94A3B8" size={18} />
                </InputAdornment>
              ),
            }}
          />
        </Paper>

        {/* Inventory Table */}
        <Paper elevation={1} sx={{ borderRadius: 2.5, border: "1px solid #E2E8F0", overflow: "hidden" }}>
          <Table>
            <TableHead sx={{ bgcolor: "#107C41" }}>
              <TableRow>
                <TableCell sx={{ color: "white", fontWeight: 700, width: "20%" }}>Denomination</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700, width: "15%" }}>Available Count</TableCell>
                <TableCell sx={{ color: "white", fontWeight: 700 }}>Serial Numbers Preview</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <CircularProgress size={32} sx={{ color: "#107C41" }} />
                    <Typography variant="body2" sx={{ mt: 1, color: "text.secondary" }}>
                      Loading inventory stock...
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : filteredData.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} align="center" sx={{ py: 6 }}>
                    <Typography variant="body1" fontWeight={600} color="text.secondary">
                      No serial stock found
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      Upload serial batches to populate inventory.
                    </Typography>
                  </TableCell>
                </TableRow>
              ) : (
                filteredData
                  .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                  .map((row) => (
                    <TableRow key={row.denomination} hover>
                      <TableCell>
                        <Chip
                          label={`Ksh ${row.denomination}`}
                          sx={{
                            fontWeight: 700,
                            bgcolor: "#ECFDF5",
                            color: "#107C41",
                            border: "1px solid #BBF7D0",
                          }}
                        />
                      </TableCell>
                      <TableCell sx={{ fontWeight: 700, fontSize: "1rem" }}>
                        {row.serials?.length || 0}
                      </TableCell>
                      <TableCell>
                        <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap sx={{ maxHeight: 120, overflowY: "auto" }}>
                          {row.serials?.slice(0, 15).map((serial, i) => (
                            <Chip
                              key={i}
                              size="small"
                              label={serial}
                              sx={{
                                fontFamily: "monospace",
                                fontSize: "0.75rem",
                                bgcolor: "#F1F5F9",
                              }}
                            />
                          ))}
                          {row.serials?.length > 15 && (
                            <Typography variant="caption" sx={{ alignSelf: "center", color: "text.secondary" }}>
                              +{row.serials.length - 15} more
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
          <TablePagination
            component="div"
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
          />
        </Paper>
      </Container>
    </Box>
  );
}

export default SerialNumbers;
