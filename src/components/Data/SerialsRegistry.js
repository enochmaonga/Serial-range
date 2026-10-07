import React, { useState, useEffect, useCallback, useMemo } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
  Alert,
  IconButton,
  Tooltip,
  Paper,
  Container,
  InputAdornment,
  Grid,
  Skeleton,
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SERVER_URL } from "@/config";
import {
  HiCheckCircle,
  HiArrowPath,
  HiClipboardDocumentCheck,
  HiMagnifyingGlass,
} from "react-icons/hi2";
import { FaSimCard, FaPhoneAlt, FaCheck } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

const SerialsRegistry = () => {
  const [initialLoading, setInitialLoading] = useState(true);
  const [loading, setLoading] = useState(false);
  const [fetchingStock, setFetchingStock] = useState(false);
  const [fetchingDenomSerials, setFetchingDenomSerials] = useState(false);
  const [denominations, setDenominations] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState("");
  const [serialSearch, setSerialSearch] = useState("");
  const [serverSearchResults, setServerSearchResults] = useState(null);
  const [searchingServer, setSearchingServer] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignedResult, setAssignedResult] = useState(null);
  const [dialogError, setDialogError] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch available denominations overview and preview serials from the pool
  const fetchDenominations = useCallback(async (silent = false) => {
    if (!silent) setFetchingStock(true);
    try {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "application/json" };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const response = await fetch(`${SERVER_URL}/serial`, { headers });
      if (response.ok) {
        const data = await response.json();
        setDenominations(data.denominations || []);
      }
    } catch (error) {
      console.error("Error fetching available serials:", error);
    } finally {
      if (!silent) setFetchingStock(false);
      setInitialLoading(false);
    }
  }, []);

  // Fetch live serials on demand for a specific denomination
  const fetchSerialsForDenomination = useCallback(async (denom, silent = false) => {
    if (!denom) return;
    if (!silent) setFetchingDenomSerials(true);
    try {
      const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const headers = { "Content-Type": "application/json" };
      if (authToken) {
        headers["Authorization"] = `Bearer ${authToken}`;
      }

      const res = await fetch(
        `${SERVER_URL}/serial?denomination=${encodeURIComponent(denom)}&limit=50`,
        { headers }
      );
      if (res.ok) {
        const data = await res.json();
        setDenominations((prev) =>
          prev.map((d) => {
            if (String(d.denomination) === String(denom)) {
              return {
                ...d,
                count: data.total !== undefined ? data.total : d.count,
                serials: data.serials || [],
              };
            }
            return d;
          })
        );
      }
    } catch (err) {
      console.error("Error fetching serials for denomination:", err);
    } finally {
      if (!silent) setFetchingDenomSerials(false);
    }
  }, []);

  // Initial fetch on component mount
  useEffect(() => {
    fetchDenominations(false);
  }, [fetchDenominations]);

  const formik = useFormik({
    initialValues: {
      denomination: "",
      phoneNumber: "",
    },
    validationSchema: Yup.object({
      denomination: Yup.string().required("Please select a denomination"),
      phoneNumber: Yup.string()
        .required("Phone number is required")
        .matches(
          /^(\+?254|0)[17]\d{8}$|^\d{9,13}$/,
          "Enter a valid phone number (e.g., 0712345678 or 254712345678)"
        ),
    }),
    onSubmit: async (values, { resetForm }) => {
      if (!selectedSerial) {
        setDialogError("Please click and select an available serial number from the list above before issuing.");
        setDialogOpen(true);
        return;
      }

      setLoading(true);
      setDialogError("");
      setAssignedResult(null);

      const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const payload = {
        denomination: values.denomination,
        phoneNumber: values.phoneNumber.trim(),
        serial: selectedSerial,
      };

      try {
        const response = await fetch(`${SERVER_URL}/newCars`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify(payload),
        });

        const result = await response.json();

        if (response.ok && result.success) {
          const issuedSerial = result.data?.serial || selectedSerial;
          const issuedDenom = values.denomination;

          // Optimistically knock out serial and decrement count immediately
          setDenominations((prevDenoms) =>
            prevDenoms.map((d) => {
              if (String(d.denomination) === String(issuedDenom)) {
                return {
                  ...d,
                  count: Math.max(0, (d.count !== undefined ? d.count : (d.serials?.length || 0)) - 1),
                  serials: (d.serials || []).filter((s) => s !== issuedSerial),
                };
              }
              return d;
            })
          );

          setAssignedResult(result.data);
          resetForm();
          setSelectedSerial("");
          setDialogOpen(true);

          // Silent background sync
          fetchDenominations(true);
        } else {
          setDialogError(result.message || "Failed to assign serial.");
          setDialogOpen(true);
        }
      } catch (error) {
        console.error("Error submitting form:", error);
        setDialogError("Network error. Please check backend connection.");
        setDialogOpen(true);
      } finally {
        setLoading(false);
      }
    },
  });

  // Automatically select first denomination if none is selected
  const { setFieldValue } = formik;
  useEffect(() => {
    if (!formik.values.denomination && denominations.length > 0) {
      setFieldValue("denomination", String(denominations[0].denomination));
    }
  }, [denominations, formik.values.denomination, setFieldValue]);

  // Fetch live serials whenever selected denomination changes
  useEffect(() => {
    if (formik.values.denomination && !initialLoading) {
      fetchSerialsForDenomination(formik.values.denomination, true);
    }
  }, [formik.values.denomination, fetchSerialsForDenomination, initialLoading]);

  // Option 1 Real-time Sync: Tab Focus, Visibility Change, and Background Polling
  useEffect(() => {
    const handleSync = () => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchDenominations(true);
        if (formik.values.denomination && !serialSearch.trim()) {
          fetchSerialsForDenomination(formik.values.denomination, true);
        }
      }
    };

    window.addEventListener("focus", handleSync);
    document.addEventListener("visibilitychange", handleSync);

    // Silent background polling every 8 seconds
    const pollInterval = setInterval(() => {
      if (typeof document !== "undefined" && document.visibilityState === "visible") {
        fetchDenominations(true);
        if (formik.values.denomination && !serialSearch.trim()) {
          fetchSerialsForDenomination(formik.values.denomination, true);
        }
      }
    }, 8000);

    return () => {
      window.removeEventListener("focus", handleSync);
      document.removeEventListener("visibilitychange", handleSync);
      clearInterval(pollInterval);
    };
  }, [fetchDenominations, fetchSerialsForDenomination, formik.values.denomination, serialSearch]);

  // Current denomination data & list of serials
  const currentDenomData = useMemo(() => {
    return denominations.find(
      (item) => String(item.denomination) === String(formik.values.denomination)
    );
  }, [denominations, formik.values.denomination]);

  const currentDenomCount = useMemo(() => {
    return currentDenomData?.count !== undefined
      ? currentDenomData.count
      : (currentDenomData?.serials?.length || 0);
  }, [currentDenomData]);

  const availableSerials = useMemo(() => {
    return currentDenomData?.serials || [];
  }, [currentDenomData]);

  // Filter available preview serials locally
  const filteredSerials = useMemo(() => {
    if (!serialSearch.trim()) return availableSerials;
    return availableSerials.filter((s) =>
      String(s).toLowerCase().includes(serialSearch.trim().toLowerCase())
    );
  }, [availableSerials, serialSearch]);

  // Deep search query to server if user searches a specific pattern (3+ characters)
  useEffect(() => {
    const query = serialSearch.trim();
    if (query.length < 3 || !formik.values.denomination) {
      setServerSearchResults(null);
      return;
    }

    const timer = setTimeout(async () => {
      setSearchingServer(true);
      try {
        const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
        const res = await fetch(
          `${SERVER_URL}/serial?denomination=${encodeURIComponent(
            formik.values.denomination
          )}&search=${encodeURIComponent(query)}&limit=50`,
          {
            headers: {
              "Content-Type": "application/json",
              ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
            },
          }
        );
        if (res.ok) {
          const data = await res.json();
          setServerSearchResults(data.serials || []);
        }
      } catch (err) {
        console.error("Search serial error:", err);
      } finally {
        setSearchingServer(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [serialSearch, formik.values.denomination]);

  const displayedSerials = useMemo(() => {
    if (serverSearchResults !== null) return serverSearchResults;
    return filteredSerials;
  }, [serverSearchResults, filteredSerials]);

  // Reset selected serial if user switches denomination and serial doesn't belong
  useEffect(() => {
    if (selectedSerial && !displayedSerials.includes(selectedSerial)) {
      setSelectedSerial("");
    }
  }, [formik.values.denomination, displayedSerials, selectedSerial]);

  const handleCopySerial = () => {
    if (assignedResult?.serial) {
      navigator.clipboard.writeText(assignedResult.serial);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: { xs: 2, md: 3 } }}>
      <Container maxWidth="md">
        {/* Header Navigation */}
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ mb: 2 }}
          flexWrap="wrap"
          gap={1.5}
        >
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Image
                src="/safaricom-logo1.png"
                alt="Safaricom Logo"
                width={150}
                height={32}
                priority
              />
            </Box>
          </Link>
          <Stack direction="row" spacing={1.5}>
            <Link href="/getserials" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="small" sx={{ color: "#107C41", borderColor: "#107C41" }}>
                Stock Inventory
              </Button>
            </Link>
            <Link href="/login" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="small" sx={{ color: "#64748B", borderColor: "#CBD5E1" }}>
                Admin Portal
              </Button>
            </Link>
          </Stack>
        </Stack>

        {/* Main Issuance Card */}
        <Card
          elevation={2}
          sx={{
            borderRadius: 2.5,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #107C41 0%, #0B532B 100%)",
              color: "white",
              px: { xs: 2.5, md: 3 },
              py: 1.5,
            }}
          >
            <Typography variant="h6" fontWeight={700} sx={{ fontSize: "1.1rem" }}>
              Airtime Serial Issuance
            </Typography>
            <Typography variant="caption" sx={{ opacity: 0.9, display: "block" }}>
              Select an available serial number below and enter the customer number.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 2, md: 2.5 }, "&:last-child": { pb: 2.5 } }}>
            {/* Step 1: Available Denominations Stock */}
            <Box sx={{ mb: 2 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1 }}
              >
                <Typography variant="caption" fontWeight={700} color="#475569" letterSpacing={0.5}>
                  1. SELECT DENOMINATION
                </Typography>
                <Tooltip title="Refresh stock from database">
                  <IconButton
                    size="small"
                    onClick={() => {
                      fetchDenominations(false);
                      if (formik.values.denomination) {
                        fetchSerialsForDenomination(formik.values.denomination, false);
                      }
                    }}
                    disabled={fetchingStock || fetchingDenomSerials}
                    sx={{ p: 0.5 }}
                  >
                    <HiArrowPath
                      style={{
                        animation:
                          fetchingStock || fetchingDenomSerials
                            ? "spin 1s linear infinite"
                            : "none",
                        color: "#107C41",
                      }}
                      size={16}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>

              {initialLoading || denominations.length === 0 ? (
                <Stack direction="row" spacing={1.5} alignItems="center" flexWrap="wrap" useFlexGap sx={{ py: 0.5 }}>
                  {[1, 2, 3, 4].map((item) => (
                    <Skeleton
                      key={item}
                      variant="rounded"
                      width={130}
                      height={34}
                      sx={{ borderRadius: 4 }}
                    />
                  ))}
                  <CircularProgress size={18} sx={{ color: "#107C41" }} />
                </Stack>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {denominations.map((denom) => {
                    const count = denom.count !== undefined ? denom.count : (denom.serials?.length || 0);
                    const isSelected = String(formik.values.denomination) === String(denom.denomination);
                    return (
                      <Chip
                        key={denom.denomination}
                        label={`Ksh ${denom.denomination} (${count.toLocaleString()} in stock)`}
                        color={isSelected ? "success" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => {
                          formik.setFieldValue("denomination", String(denom.denomination));
                          setSelectedSerial("");
                        }}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.8rem",
                          py: 1.2,
                          px: 0.5,
                          cursor: "pointer",
                          borderColor: isSelected ? "#107C41" : "#CBD5E1",
                          bgcolor: isSelected ? "#107C41" : "#F8FAFC",
                          color: isSelected ? "#FFFFFF" : "#1E293B",
                          boxShadow: isSelected ? "0 2px 8px rgba(16, 124, 65, 0.25)" : "none",
                        }}
                      />
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Step 2: Available Serials Picker */}
            {initialLoading || denominations.length === 0 ? (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                  border: "1px solid #E2E8F0",
                }}
              >
                <Stack direction="row" justifyContent="space-between" sx={{ mb: 1.5 }}>
                  <Skeleton variant="text" width={220} height={20} />
                  <Skeleton variant="text" width={110} height={20} />
                </Stack>
                <Skeleton variant="rounded" width="100%" height={38} sx={{ mb: 1, borderRadius: 1 }} />
                <Grid container spacing={0.8}>
                  {[1, 2, 3, 4, 5, 6].map((i) => (
                    <Grid item xs={12} sm={6} md={4} key={i}>
                      <Skeleton variant="rounded" width="100%" height={34} sx={{ borderRadius: 1.5 }} />
                    </Grid>
                  ))}
                </Grid>
              </Box>
            ) : currentDenomCount > 0 ? (
              <Box
                sx={{
                  mb: 2,
                  p: 1.5,
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                  border: "1px solid #E2E8F0",
                }}
              >
                <Stack
                  direction="row"
                  justifyContent="space-between"
                  alignItems="center"
                  sx={{ mb: 1 }}
                  flexWrap="wrap"
                  gap={1}
                >
                  <Typography variant="caption" fontWeight={700} color="#475569" letterSpacing={0.5}>
                    2. SELECT SERIAL NUMBER (KSH {formik.values.denomination})
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#64748B", fontWeight: 600, display: "flex", alignItems: "center" }}
                  >
                    {searchingServer || fetchingDenomSerials ? (
                      <>
                        <CircularProgress size={12} sx={{ color: "#107C41", mr: 0.8 }} />
                        {searchingServer ? "Searching database..." : "Refreshing serials..."}
                      </>
                    ) : (
                      `Showing ${displayedSerials.length} of ${currentDenomCount.toLocaleString()} available`
                    )}
                  </Typography>
                </Stack>

                {/* Search box for serials */}
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Filter or search serial numbers..."
                  value={serialSearch}
                  onChange={(e) => setSerialSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HiMagnifyingGlass color="#94A3B8" size={16} />
                      </InputAdornment>
                    ),
                    endAdornment: searchingServer ? (
                      <InputAdornment position="end">
                        <CircularProgress size={14} sx={{ color: "#107C41" }} />
                      </InputAdornment>
                    ) : null,
                  }}
                  sx={{
                    mb: 1,
                    bgcolor: "#FFFFFF",
                    borderRadius: 1,
                    "& .MuiInputBase-input": { py: 0.7, fontSize: "0.85rem" },
                  }}
                />

                {/* Serials Scrollable Grid - compact maxHeight */}
                <Box
                  sx={{
                    maxHeight: 130,
                    overflowY: "auto",
                    p: 1,
                    bgcolor: "#FFFFFF",
                    borderRadius: 1.5,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {displayedSerials.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={1.5}>
                      {serialSearch ? `No serials match "${serialSearch}"` : "No serials available in preview"}
                    </Typography>
                  ) : (
                    <Grid container spacing={0.8}>
                      {displayedSerials.map((s) => {
                        const isPicked = selectedSerial === s;
                        return (
                          <Grid item xs={12} sm={6} md={4} key={s}>
                            <Box
                              onClick={() => setSelectedSerial(s)}
                              sx={{
                                p: 0.75,
                                px: 1,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                border: `1.5px solid ${isPicked ? "#107C41" : "#E2E8F0"}`,
                                bgcolor: isPicked ? "#ECFDF5" : "#FFFFFF",
                                color: isPicked ? "#0B532B" : "#1E293B",
                                fontFamily: "monospace",
                                fontSize: "0.8rem",
                                fontWeight: isPicked ? 700 : 500,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "space-between",
                                transition: "all 0.15s ease",
                                "&:hover": {
                                  borderColor: "#107C41",
                                  bgcolor: isPicked ? "#ECFDF5" : "#F8FAFC",
                                },
                              }}
                            >
                              <span>{s}</span>
                              {isPicked ? (
                                <Chip
                                  size="small"
                                  icon={<FaCheck size={9} style={{ color: "#FFFFFF" }} />}
                                  label="Selected"
                                  sx={{
                                    height: 18,
                                    fontSize: "0.65rem",
                                    fontWeight: 700,
                                    bgcolor: "#107C41",
                                    color: "#FFFFFF",
                                    "& .MuiChip-label": { px: 0.5 },
                                  }}
                                />
                              ) : (
                                <Typography variant="caption" sx={{ color: "#94A3B8", fontSize: "0.7rem" }}>
                                  Pick
                                </Typography>
                              )}
                            </Box>
                          </Grid>
                        );
                      })}
                    </Grid>
                  )}
                </Box>

                {/* Selected Indicator */}
                <Box
                  sx={{
                    mt: 1,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    flexWrap: "wrap",
                    gap: 1,
                  }}
                >
                  <Typography
                    variant="caption"
                    sx={{ color: selectedSerial ? "#107C41" : "#D97706", fontWeight: 700 }}
                  >
                    {selectedSerial ? (
                      <>
                        ✓ Selected: <strong style={{ letterSpacing: 0.5 }}>{selectedSerial}</strong> (will be knocked out upon issue)
                      </>
                    ) : (
                      "⚠️ Click any serial number above to select it."
                    )}
                  </Typography>
                  {selectedSerial && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => setSelectedSerial("")}
                      sx={{ textTransform: "none", fontSize: "0.7rem", py: 0, color: "#EF4444", fontWeight: 600 }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </Box>
              </Box>
            ) : null}

            {/* Step 3: Recipient Form - Compact Side-by-side layout */}
            <form onSubmit={formik.handleSubmit}>
              <Typography
                variant="caption"
                fontWeight={700}
                color="#475569"
                letterSpacing={0.5}
                sx={{ display: "block", mb: 1 }}
              >
                3. RECIPIENT PHONE NUMBER & ISSUANCE
              </Typography>

              <Grid container spacing={1.5} alignItems="flex-start">
                <Grid item xs={12} sm={7} md={8}>
                  <TextField
                    fullWidth
                    size="small"
                    id="phoneNumber"
                    name="phoneNumber"
                    label="Recipient Phone Number"
                    placeholder="e.g. 0712345678 or 254712345678"
                    value={formik.values.phoneNumber}
                    onChange={formik.handleChange}
                    onBlur={formik.handleBlur}
                    error={Boolean(formik.touched.phoneNumber && formik.errors.phoneNumber)}
                    helperText={
                      (formik.touched.phoneNumber && formik.errors.phoneNumber) ||
                      "Enter Kenyan mobile number (07XX / 01XX / 254...)"
                    }
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <FaPhoneAlt color="#107C41" size={14} />
                        </InputAdornment>
                      ),
                    }}
                    sx={{
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                        "&.Mui-focused fieldset": { borderColor: "#107C41" },
                      },
                    }}
                  />
                </Grid>

                <Grid item xs={12} sm={5} md={4}>
                  <Button
                    type="submit"
                    variant="contained"
                    fullWidth
                    disabled={loading || !selectedSerial || displayedSerials.length === 0}
                    startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FaSimCard />}
                    sx={{
                      bgcolor: "#107C41",
                      fontWeight: 700,
                      fontSize: "0.95rem",
                      py: 1.05,
                      borderRadius: 2,
                      textTransform: "none",
                      boxShadow: "0 2px 8px rgba(16, 124, 65, 0.3)",
                      "&:hover": { bgcolor: "#0B532B" },
                      "&.Mui-disabled": { bgcolor: "#CBD5E1", color: "#64748B" },
                    }}
                  >
                    {loading
                      ? "Issuing Airtime..."
                      : !selectedSerial
                        ? "Pick a Serial to Issue"
                        : `Issue Serial`}
                  </Button>
                </Grid>
              </Grid>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Success / Error Result Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          {dialogError ? (
            <Box sx={{ color: "#EF4444" }}>
              <Typography variant="h6" fontWeight={700}>
                Issuance Notice
              </Typography>
            </Box>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <HiCheckCircle size={56} style={{ color: "#107C41", marginBottom: 8 }} />
              <Typography variant="h6" fontWeight={800} color="#1E293B">
                Airtime Successfully Issued!
              </Typography>
            </Box>
          )}
        </DialogTitle>

        <DialogContent>
          {dialogError ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {dialogError}
            </Alert>
          ) : (
            <Box sx={{ textAlign: "center", mt: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                The serial number has been assigned and knocked out of available inventory:
              </Typography>

              {/* Mono serial highlight card */}
              <Paper
                elevation={0}
                sx={{
                  p: 2,
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                  border: "1.5px dashed #107C41",
                  mb: 2,
                }}
              >
                <Typography variant="caption" color="text.secondary" display="block">
                  ASSIGNED SERIAL NUMBER
                </Typography>
                <Typography
                  variant="h6"
                  sx={{
                    fontFamily: "monospace",
                    fontWeight: 800,
                    color: "#107C41",
                    letterSpacing: 1.5,
                    my: 0.5,
                    wordBreak: "break-all",
                  }}
                >
                  {assignedResult?.serial}
                </Typography>
                <Typography variant="caption" color="text.secondary">
                  Denomination: Ksh {assignedResult?.denomination} | Phone: {assignedResult?.phoneNumber}
                </Typography>
              </Paper>

              <Button
                variant="outlined"
                size="small"
                onClick={handleCopySerial}
                startIcon={<HiClipboardDocumentCheck />}
                sx={{
                  borderColor: "#107C41",
                  color: "#107C41",
                  textTransform: "none",
                  fontWeight: 600,
                  "&:hover": { bgcolor: "rgba(16, 124, 65, 0.05)" },
                }}
              >
                {copied ? "Copied to Clipboard!" : "Copy Serial Number"}
              </Button>
            </Box>
          )}
        </DialogContent>

        <DialogActions sx={{ pb: 2, px: 3, justifyContent: "center" }}>
          <Button
            variant="contained"
            fullWidth
            onClick={() => setDialogOpen(false)}
            sx={{
              bgcolor: dialogError ? "#64748B" : "#107C41",
              textTransform: "none",
              fontWeight: 700,
              borderRadius: 2,
              "&:hover": { bgcolor: dialogError ? "#475569" : "#0B532B" },
            }}
          >
            {dialogError ? "Close" : "Issue Another Serial"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SerialsRegistry;
