import React, { useState, useEffect, useCallback } from "react";
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  CircularProgress,
  MenuItem,
  Select,
  InputLabel,
  FormControl,
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
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SERVER_URL } from "@/config";
import { HiCheckCircle, HiArrowPath, HiClipboardDocumentCheck } from "react-icons/hi2";
import { FaSimCard, FaPhoneAlt, FaMoneyBillWave } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";

const SerialsRegistry = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [fetchingStock, setFetchingStock] = useState(false);
  const [denominations, setDenominations] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [assignedResult, setAssignedResult] = useState(null);
  const [dialogError, setDialogError] = useState("");
  const [copied, setCopied] = useState(false);

  const fetchDenominations = useCallback(async () => {
    const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    if (!authToken) {
      router.push("/login");
      return;
    }

    setFetchingStock(true);
    try {
      const response = await fetch(`${SERVER_URL}/serial`, {
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
      });
      if (response.status === 401) {
        router.push("/login");
        return;
      }
      if (response.ok) {
        const data = await response.json();
        setDenominations(data.denominations || []);
      }
    } catch (error) {
      console.error("Error fetching denominations:", error);
    } finally {
      setFetchingStock(false);
    }
  }, [router]);

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
      setLoading(true);
      setDialogError("");
      setAssignedResult(null);

      const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      try {
        const response = await fetch(`${SERVER_URL}/newCars`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            denomination: values.denomination,
            phoneNumber: values.phoneNumber.trim(),
          }),
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        const result = await response.json();

        if (response.ok && result.success) {
          setAssignedResult(result.data);
          resetForm();
          // Refresh stock count immediately
          fetchDenominations();
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

  const selectedDenomData = denominations.find(
    (item) => String(item.denomination) === String(formik.values.denomination)
  );
  const availableCount = selectedDenomData?.serials?.length || 0;

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
        >
          <Link href="/" passHref style={{ textDecoration: "none" }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
              <Image
                src="/safaricom-logo1.png"
                alt="Safaricom Logo"
                width={160}
                height={34}
                priority
              />
            </Box>
          </Link>
          <Stack direction="row" spacing={1}>
            <Link href="/seriallist" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="small" sx={{ color: "#107C41", borderColor: "#107C41" }}>
                Reports & Audit
              </Button>
            </Link>
            <Link href="/upload" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="small" sx={{ color: "#107C41", borderColor: "#107C41" }}>
                Upload Serials
              </Button>
            </Link>
          </Stack>
        </Stack>

        {/* Main Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
          }}
        >
          {/* Top Banner */}
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
              Select denomination to automatically consume and assign an available serial number.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* Live Inventory Stock Pills */}
            <Box sx={{ mb: 4 }}>
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                sx={{ mb: 1.5 }}
              >
                <Typography variant="subtitle2" fontWeight={600} color="text.secondary">
                  AVAILABLE STOCK IN POOL
                </Typography>
                <Tooltip title="Refresh available stock counts">
                  <IconButton
                    size="small"
                    onClick={fetchDenominations}
                    disabled={fetchingStock}
                  >
                    <HiArrowPath
                      style={{
                        animation: fetchingStock ? "spin 1s linear infinite" : "none",
                      }}
                    />
                  </IconButton>
                </Tooltip>
              </Stack>

              {denominations.length === 0 ? (
                <Alert severity="warning" sx={{ borderRadius: 2 }}>
                  No serials available in database. Please{" "}
                  <Link href="/upload" style={{ color: "#107C41", fontWeight: 600 }}>
                    upload serial batches
                  </Link>{" "}
                  first.
                </Alert>
              ) : (
                <Stack direction="row" spacing={1.5} flexWrap="wrap" useFlexGap>
                  {denominations.map((denom) => {
                    const count = denom.serials?.length || 0;
                    const isSelected = String(formik.values.denomination) === String(denom.denomination);
                    return (
                      <Chip
                        key={denom.denomination}
                        label={`Ksh ${denom.denomination} (${count} left)`}
                        color={isSelected ? "success" : "default"}
                        variant={isSelected ? "filled" : "outlined"}
                        onClick={() => formik.setFieldValue("denomination", String(denom.denomination))}
                        sx={{
                          fontWeight: 600,
                          cursor: "pointer",
                          borderColor: isSelected ? "#107C41" : "#CBD5E1",
                          bgcolor: isSelected ? "#107C41" : "#F8FAFC",
                          color: isSelected ? "#FFFFFF" : "#1E293B",
                        }}
                      />
                    );
                  })}
                </Stack>
              )}
            </Box>

            {/* Entry Form */}
            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                {/* Denomination Select */}
                <FormControl
                  fullWidth
                  error={Boolean(formik.touched.denomination && formik.errors.denomination)}
                >
                  <InputLabel id="denom-label">Denomination (Ksh)</InputLabel>
                  <Select
                    labelId="denom-label"
                    id="denomination"
                    name="denomination"
                    label="Denomination (Ksh)"
                    value={formik.values.denomination}
                    onChange={(e) => formik.setFieldValue("denomination", e.target.value)}
                    startAdornment={<FaMoneyBillWave style={{ marginRight: 10, color: "#107C41" }} />}
                  >
                    {denominations.map((denom) => (
                      <MenuItem key={denom.denomination} value={String(denom.denomination)}>
                        Ksh {denom.denomination}{" "}
                        <Typography component="span" variant="caption" sx={{ ml: 1, color: "text.secondary" }}>
                          ({denom.serials?.length || 0} available)
                        </Typography>
                      </MenuItem>
                    ))}
                  </Select>
                  {formik.touched.denomination && formik.errors.denomination && (
                    <Typography variant="caption" color="error" sx={{ mt: 0.5, ml: 1.5 }}>
                      {formik.errors.denomination}
                    </Typography>
                  )}
                </FormControl>

                {/* Phone Number Input */}
                <TextField
                  fullWidth
                  id="phoneNumber"
                  name="phoneNumber"
                  label="Recipient Phone Number"
                  placeholder="e.g. 0712345678"
                  value={formik.values.phoneNumber}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.phoneNumber && formik.errors.phoneNumber)}
                  helperText={
                    (formik.touched.phoneNumber && formik.errors.phoneNumber) ||
                    "Enter Kenyan phone number (Saf/Airtel: 07..., 01..., or 254...)"
                  }
                  InputProps={{
                    startAdornment: <FaPhoneAlt style={{ marginRight: 10, color: "#107C41" }} />,
                  }}
                />

                {/* Stock Indicator Banner */}
                {formik.values.denomination && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: availableCount > 0 ? "#F0FDF4" : "#FEF2F2",
                      borderColor: availableCount > 0 ? "#BBF7D0" : "#FECACA",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
                      <FaSimCard color={availableCount > 0 ? "#107C41" : "#DC2626"} size={20} />
                      <Typography variant="body2" fontWeight={600} color={availableCount > 0 ? "#166534" : "#991B1B"}>
                        {availableCount > 0
                          ? `Ready to issue: Next available serial from Ksh ${formik.values.denomination} pool`
                          : `Pool Empty: No serials remaining for Ksh ${formik.values.denomination}`}
                      </Typography>
                    </Box>
                    <Chip
                      size="small"
                      label={`${availableCount} in stock`}
                      color={availableCount > 0 ? "success" : "error"}
                      sx={{ fontWeight: 700 }}
                    />
                  </Paper>
                )}

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading || availableCount === 0 || !formik.values.denomination}
                  sx={{
                    bgcolor: "#107C41",
                    "&:hover": { bgcolor: "#0B532B" },
                    py: 1.5,
                    fontWeight: 700,
                    borderRadius: 2,
                  }}
                >
                  {loading ? (
                    <CircularProgress size={24} color="inherit" />
                  ) : (
                    "Assign & Issue Airtime Serial"
                  )}
                </Button>
              </Stack>
            </form>
          </CardContent>
        </Card>
      </Container>

      {/* Result Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={() => setDialogOpen(false)}
        maxWidth="xs"
        fullWidth
        PaperProps={{ sx: { borderRadius: 3, p: 1 } }}
      >
        <DialogTitle sx={{ textAlign: "center", pt: 3 }}>
          {dialogError ? (
            <Typography variant="h6" color="error.main" fontWeight={700}>
              Issuance Failed
            </Typography>
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <HiCheckCircle size={56} color="#107C41" />
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                Serial Successfully Issued!
              </Typography>
            </Box>
          )}
        </DialogTitle>

        <DialogContent sx={{ textAlign: "center" }}>
          {dialogError ? (
            <Alert severity="error" sx={{ mt: 1 }}>
              {dialogError}
            </Alert>
          ) : assignedResult ? (
            <Stack spacing={2} sx={{ mt: 1 }}>
              <Paper
                variant="outlined"
                sx={{
                  p: 2,
                  bgcolor: "#F8FAFC",
                  borderRadius: 2,
                  textAlign: "center",
                }}
              >
                <Typography variant="caption" color="text.secondary" fontWeight={600}>
                  ASSIGNED SERIAL NUMBER
                </Typography>
                <Typography
                  variant="h6"
                  fontWeight={800}
                  sx={{ letterSpacing: 1.5, color: "#107C41", my: 0.5 }}
                >
                  {assignedResult.serial}
                </Typography>
                <Button
                  size="small"
                  variant="text"
                  startIcon={<HiClipboardDocumentCheck />}
                  onClick={handleCopySerial}
                  sx={{ color: copied ? "#107C41" : "text.secondary" }}
                >
                  {copied ? "Copied!" : "Copy Serial"}
                </Button>
              </Paper>

              <Box sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Recipient Phone:
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  {assignedResult.phoneNumber}
                </Typography>
              </Box>

              <Box sx={{ display: "flex", justifyContent: "space-between", px: 2 }}>
                <Typography variant="body2" color="text.secondary">
                  Denomination:
                </Typography>
                <Typography variant="body2" fontWeight={700}>
                  Ksh {assignedResult.denomination}
                </Typography>
              </Box>
            </Stack>
          ) : null}
        </DialogContent>

        <DialogActions sx={{ justifyContent: "center", pb: 2 }}>
          <Button
            variant="contained"
            onClick={() => setDialogOpen(false)}
            sx={{
              bgcolor: "#107C41",
              "&:hover": { bgcolor: "#0B532B" },
              borderRadius: 2,
              px: 4,
            }}
          >
            Done
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SerialsRegistry;
