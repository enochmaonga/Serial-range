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
import { FaSimCard, FaPhoneAlt, FaMoneyBillWave, FaCheck } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";

const SerialsRegistry = () => {
  const [loading, setLoading] = useState(false);
  const [fetchingStock, setFetchingStock] = useState(false);
  const [denominations, setDenominations] = useState([]);
  const [selectedSerial, setSelectedSerial] = useState("");
  const [serialSearch, setSerialSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignedResult, setAssignedResult] = useState(null);
  const [dialogError, setDialogError] = useState("");
  const [copied, setCopied] = useState(false);

  // Fetch available denominations and their serials from the pool
  const fetchDenominations = useCallback(async () => {
    setFetchingStock(true);
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
      setFetchingStock(false);
    }
  }, []);

  useEffect(() => {
    fetchDenominations();
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
          setAssignedResult(result.data);
          resetForm();
          setSelectedSerial("");
          // Knock out serial in real time by refreshing inventory from server
          await fetchDenominations();
          setDialogOpen(true);
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
  useEffect(() => {
    if (!formik.values.denomination && denominations.length > 0) {
      formik.setFieldValue("denomination", String(denominations[0].denomination));
    }
  }, [denominations, formik]);

  // Current denomination data & list of serials
  const currentDenomData = useMemo(() => {
    return denominations.find(
      (item) => String(item.denomination) === String(formik.values.denomination)
    );
  }, [denominations, formik.values.denomination]);

  const availableSerials = useMemo(() => {
    return currentDenomData?.serials || [];
  }, [currentDenomData]);

  // Filter available serials by user search query
  const filteredSerials = useMemo(() => {
    if (!serialSearch.trim()) return availableSerials;
    return availableSerials.filter((s) =>
      String(s).toLowerCase().includes(serialSearch.trim().toLowerCase())
    );
  }, [availableSerials, serialSearch]);

  // Reset selected serial if user switches denomination and serial doesn't belong
  useEffect(() => {
    if (selectedSerial && !availableSerials.includes(selectedSerial)) {
      setSelectedSerial("");
    }
  }, [formik.values.denomination, availableSerials, selectedSerial]);

  const handleCopySerial = () => {
    if (assignedResult?.serial) {
      navigator.clipboard.writeText(assignedResult.serial);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#F8FAFC", py: 5 }}>
      <Container maxWidth="md">
        {/* Header Navigation */}
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
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
            bgcolor: "#FFFFFF",
          }}
        >
          <Box
            sx={{
              background: "linear-gradient(135deg, #107C41 0%, #0B532B 100%)",
              color: "white",
              px: 4,
              py: 3,
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              Airtime Serial Issuance
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Browse and select an available serial number from the list to issue directly to a recipient.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* Step 1: Available Denominations Stock */}
            <Box sx={{ mb: 3.5 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle2" fontWeight={700} color="#334155">
                  1. SELECT DENOMINATION
                </Typography>
                <Tooltip title="Refresh available stock from database">
                  <IconButton
                    size="small"
                    onClick={fetchDenominations}
                    disabled={fetchingStock}
                  >
                    <HiArrowPath
                      style={{
                        animation: fetchingStock ? "spin 1s linear infinite" : "none",
                        color: "#107C41",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>

              {denominations.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  No serials are currently available in the database. Please{" "}
                  <Link href="/upload" style={{ color: "#107C41", fontWeight: 700 }}>
                    upload a batch of serials
                  </Link>{" "}
                  to begin issuance.
                </Alert>
              ) : (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {denominations.map((denom) => {
                    const count = denom.serials?.length || 0;
                    const isSelected = String(formik.values.denomination) === String(denom.denomination);
                    return (
                      <Chip
                        key={denom.denomination}
                        label={`Ksh ${denom.denomination} (${count} in stock)`}
                        color={isSelected ? "success" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => {
                          formik.setFieldValue("denomination", String(denom.denomination));
                          setSelectedSerial("");
                        }}
                        sx={{
                          fontWeight: 700,
                          fontSize: "0.85rem",
                          py: 2.2,
                          px: 0.5,
                          cursor: "pointer",
                          borderColor: isSelected ? "#107C41" : "#CBD5E1",
                          bgcolor: isSelected ? "#107C41" : "#F8FAFC",
                          color: isSelected ? "#FFFFFF" : "#1E293B",
                          boxShadow: isSelected ? "0 4px 10px rgba(16, 124, 65, 0.25)" : "none",
                        }}
                      />
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Step 2: Available Serials Picker */}
            {availableSerials.length > 0 && (
              <Box sx={{ mb: 3.5, p: 2.5, bgcolor: "#F8FAFC", borderRadius: 2.5, border: "1px solid #E2E8F0" }}>
                <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 1.5 }} flexWrap="wrap" gap={1}>
                  <Typography variant="subtitle2" fontWeight={700} color="#334155">
                    2. SELECT SERIAL NUMBER (KSH {formik.values.denomination})
                  </Typography>
                  <Typography variant="caption" sx={{ color: "#64748B", fontWeight: 600 }}>
                    Showing {filteredSerials.length} of {availableSerials.length} available
                  </Typography>
                </Stack>

                {/* Search box for serials */}
                <TextField
                  size="small"
                  fullWidth
                  placeholder="Search available serial numbers..."
                  value={serialSearch}
                  onChange={(e) => setSerialSearch(e.target.value)}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <HiMagnifyingGlass color="#94A3B8" />
                      </InputAdornment>
                    ),
                  }}
                  sx={{ mb: 2, bgcolor: "#FFFFFF", borderRadius: 1 }}
                />

                {/* Serials Scrollable Grid */}
                <Box
                  sx={{
                    maxHeight: 230,
                    overflowY: "auto",
                    p: 1.5,
                    bgcolor: "#FFFFFF",
                    borderRadius: 2,
                    border: "1px solid #E2E8F0",
                  }}
                >
                  {filteredSerials.length === 0 ? (
                    <Typography variant="body2" color="text.secondary" textAlign="center" py={2}>
                      No serials match &quot;{serialSearch}&quot;
                    </Typography>
                  ) : (
                    <Grid container spacing={1}>
                      {filteredSerials.map((s) => {
                        const isPicked = selectedSerial === s;
                        return (
                          <Grid item xs={12} sm={6} key={s}>
                            <Box
                              onClick={() => setSelectedSerial(s)}
                              sx={{
                                p: 1.2,
                                borderRadius: 1.5,
                                cursor: "pointer",
                                border: `1.5px solid ${isPicked ? "#107C41" : "#E2E8F0"}`,
                                bgcolor: isPicked ? "#ECFDF5" : "#FFFFFF",
                                color: isPicked ? "#0B532B" : "#1E293B",
                                fontFamily: "monospace",
                                fontSize: "0.85rem",
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
                                  icon={<FaCheck size={10} style={{ color: "#FFFFFF" }} />}
                                  label="Selected"
                                  sx={{
                                    height: 20,
                                    fontSize: "0.7rem",
                                    fontWeight: 700,
                                    bgcolor: "#107C41",
                                    color: "#FFFFFF",
                                  }}
                                />
                              ) : (
                                <Typography variant="caption" sx={{ color: "#94A3B8" }}>
                                  Click to pick
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
                <Box sx={{ mt: 1.5, display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 1 }}>
                  <Typography variant="body2" sx={{ color: selectedSerial ? "#107C41" : "#D97706", fontWeight: 700 }}>
                    {selectedSerial ? (
                      <>✓ Picked Serial: <strong style={{ letterSpacing: 0.5 }}>{selectedSerial}</strong> (will be knocked out)</>
                    ) : (
                      "⚠️ Please click any serial number above to select it."
                    )}
                  </Typography>
                  {selectedSerial && (
                    <Button
                      size="small"
                      color="inherit"
                      onClick={() => setSelectedSerial("")}
                      sx={{ textTransform: "none", fontSize: "0.75rem", color: "#EF4444", fontWeight: 600 }}
                    >
                      Clear Selection
                    </Button>
                  )}
                </Box>
              </Box>
            )}

            {/* Step 3: Recipient Form */}
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <Typography variant="subtitle2" fontWeight={700} color="#334155">
                  3. RECIPIENT PHONE NUMBER
                </Typography>

                <TextField
                  fullWidth
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
                        <FaPhoneAlt color="#107C41" />
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

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || !selectedSerial || availableSerials.length === 0}
                  startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <FaSimCard />}
                  sx={{
                    bgcolor: "#107C41",
                    fontWeight: 700,
                    fontSize: "1.05rem",
                    py: 1.6,
                    borderRadius: 2,
                    textTransform: "none",
                    boxShadow: "0 4px 14px rgba(16, 124, 65, 0.4)",
                    "&:hover": { bgcolor: "#0B532B" },
                    "&.Mui-disabled": { bgcolor: "#CBD5E1", color: "#64748B" },
                  }}
                >
                  {loading
                    ? "Issuing Airtime..."
                    : availableSerials.length === 0
                    ? "No Serials in Stock"
                    : !selectedSerial
                    ? "Select a Serial Number Above"
                    : `Issue Serial (${selectedSerial})`}
                </Button>
              </Stack>
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
