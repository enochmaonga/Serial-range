import React, { useState, useMemo, useEffect } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import {
  Box,
  Card,
  CardContent,
  Container,
  TextField,
  Button,
  Typography,
  Stack,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Paper,
} from "@mui/material";
import { useRouter } from "next/router";
import Image from "next/image";
import Link from "next/link";
import { SERVER_URL } from "@/config";
import { HiCheckCircle, HiArrowUpTray } from "react-icons/hi2";
import { FaMoneyBillWave, FaListOl, FaHome } from "react-icons/fa";
import { IoLockClosedOutline } from "react-icons/io5";

const QUICK_DENOMINATIONS = ["20", "50", "100", "200", "500", "1000"];

const UploadSerials = () => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [isSuccess, setIsSuccess] = useState(false);
  const [accessDenied, setAccessDenied] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
    const userRole = typeof window !== "undefined" ? localStorage.getItem("userType") : null;

    if (!token) {
      router.push("/login");
      return;
    }

    if (userRole && userRole.toLowerCase() !== "admin") {
      setAccessDenied(true);
    }
  }, [router]);

  const formik = useFormik({
    initialValues: {
      denomination: "50",
      startSerial: "",
      endSerial: "",
    },
    validationSchema: Yup.object({
      denomination: Yup.string().required("Denomination is required"),
      startSerial: Yup.string()
        .required("Start serial is required")
        .matches(/^\d{10,16}$/, "Serial must be numeric and up to 16 digits"),
      endSerial: Yup.string()
        .required("End serial is required")
        .matches(/^\d{10,16}$/, "Serial must be numeric and up to 16 digits"),
    }),
    onSubmit: async (values, { resetForm }) => {
      let start, end;
      try {
        start = BigInt(values.startSerial);
        end = BigInt(values.endSerial);
      } catch (e) {
        setDialogTitle("Invalid Input");
        setDialogContent("Serial numbers must be valid numeric values.");
        setIsSuccess(false);
        setDialogOpen(true);
        return;
      }

      if (start > end) {
        setDialogTitle("Invalid Range");
        setDialogContent("Start serial must be less than or equal to end serial.");
        setIsSuccess(false);
        setDialogOpen(true);
        return;
      }

      const totalCount = Number(end - start + 1n);
      if (totalCount > 1000) {
        setDialogTitle("Batch Limit Exceeded");
        setDialogContent("Maximum allowed batch upload per request is 1,000 serials.");
        setIsSuccess(false);
        setDialogOpen(true);
        return;
      }

      const padLen = Math.max(values.startSerial.length, values.endSerial.length);
      const generatedSerials = [];
      for (let i = start; i <= end; i++) {
        generatedSerials.push(i.toString().padStart(padLen, "0"));
      }

      setLoading(true);
      const authToken = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      try {
        const response = await fetch(`${SERVER_URL}/generateSerials`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            ...(authToken ? { Authorization: `Bearer ${authToken}` } : {}),
          },
          body: JSON.stringify({
            denomination: values.denomination,
            serials: generatedSerials,
          }),
        });

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        if (response.status === 403) {
          setAccessDenied(true);
          return;
        }

        const data = await response.json();

        if (response.ok && data.success) {
          setIsSuccess(true);
          setDialogTitle("Upload Successful");
          setDialogContent(data.message || `Successfully generated and uploaded ${totalCount} serials!`);
          resetForm();
          setDialogOpen(true);
        } else {
          setIsSuccess(false);
          setDialogTitle("Upload Failed");
          setDialogContent(data.message || "Failed to upload serials to server.");
          setDialogOpen(true);
        }
      } catch (error) {
        console.error("Upload error:", error);
        setIsSuccess(false);
        setDialogTitle("Network Error");
        setDialogContent("Failed to reach server. Please check backend connection.");
        setDialogOpen(true);
      } finally {
        setLoading(false);
      }
    },
  });

  // Calculate live preview batch count
  const batchCount = useMemo(() => {
    try {
      if (formik.values.startSerial && formik.values.endSerial) {
        const s = BigInt(formik.values.startSerial);
        const e = BigInt(formik.values.endSerial);
        if (e >= s) {
          return Number(e - s + 1n);
        }
      }
    } catch {
      return null;
    }
    return null;
  }, [formik.values.startSerial, formik.values.endSerial]);

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
              Serial uploading and batch generation is restricted to administrators only. You can issue airtime using the serial issuance screen.
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
                size="small"
                startIcon={<FaHome size={13} />}
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
              <Button variant="outlined" size="small" sx={{ color: "#107C41", borderColor: "#107C41" }}>
                Issue Airtime
              </Button>
            </Link>
            <Link href="/seriallist" passHref style={{ textDecoration: "none" }}>
              <Button variant="outlined" size="small" sx={{ color: "#107C41", borderColor: "#107C41" }}>
                Audit Report
              </Button>
            </Link>
          </Stack>
        </Stack>

        {/* Upload Card */}
        <Card
          elevation={3}
          sx={{
            borderRadius: 3,
            overflow: "hidden",
            border: "1px solid #E2E8F0",
          }}
        >
          {/* Card Banner */}
          <Box
            sx={{
              background: "linear-gradient(135deg, #107C41 0%, #0B532B 100%)",
              color: "white",
              px: 4,
              py: 3,
            }}
          >
            <Typography variant="h5" fontWeight={700}>
              Batch Upload Airtime Serials
            </Typography>
            <Typography variant="body2" sx={{ opacity: 0.9, mt: 0.5 }}>
              Generate ranges of serial numbers into the inventory pool for agent distribution.
            </Typography>
          </Box>

          <CardContent sx={{ p: { xs: 3, md: 4 } }}>
            {/* Quick Denomination Picker */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" fontWeight={600} color="text.secondary" sx={{ mb: 1.5 }}>
                SELECT DENOMINATION (Ksh)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {QUICK_DENOMINATIONS.map((d) => {
                  const isSelected = formik.values.denomination === d;
                  return (
                    <Chip
                      key={d}
                      label={`Ksh ${d}`}
                      color={isSelected ? "success" : "default"}
                      variant={isSelected ? "filled" : "outlined"}
                      onClick={() => formik.setFieldValue("denomination", d)}
                      sx={{
                        fontWeight: 700,
                        cursor: "pointer",
                        bgcolor: isSelected ? "#107C41" : "#F8FAFC",
                        color: isSelected ? "#FFFFFF" : "#1E293B",
                        borderColor: isSelected ? "#107C41" : "#CBD5E1",
                      }}
                    />
                  );
                })}
              </Stack>
            </Box>

            <form onSubmit={formik.handleSubmit}>
              <Stack spacing={3}>
                <TextField
                  fullWidth
                  id="denomination"
                  name="denomination"
                  label="Denomination Value"
                  value={formik.values.denomination}
                  onChange={formik.handleChange}
                  error={Boolean(formik.touched.denomination && formik.errors.denomination)}
                  helperText={formik.touched.denomination && formik.errors.denomination}
                  InputProps={{
                    startAdornment: <FaMoneyBillWave style={{ marginRight: 10, color: "#107C41" }} />,
                  }}
                />

                <TextField
                  fullWidth
                  id="startSerial"
                  name="startSerial"
                  label="Start Serial Number"
                  placeholder="e.g. 2604130027333680"
                  value={formik.values.startSerial}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.startSerial && formik.errors.startSerial)}
                  helperText={
                    (formik.touched.startSerial && formik.errors.startSerial) ||
                    "Enter the first serial in the batch range (up to 16 digits)"
                  }
                  InputProps={{
                    startAdornment: <FaListOl style={{ marginRight: 10, color: "#107C41" }} />,
                  }}
                />

                <TextField
                  fullWidth
                  id="endSerial"
                  name="endSerial"
                  label="End Serial Number"
                  placeholder="e.g. 2604130027333759"
                  value={formik.values.endSerial}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  error={Boolean(formik.touched.endSerial && formik.errors.endSerial)}
                  helperText={
                    (formik.touched.endSerial && formik.errors.endSerial) ||
                    "Enter the last serial in the batch range (up to 16 digits)"
                  }
                  InputProps={{
                    startAdornment: <FaListOl style={{ marginRight: 10, color: "#107C41" }} />,
                  }}
                />

                {/* Batch Preview Info */}
                {batchCount !== null && (
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2,
                      bgcolor: "#F0FDF4",
                      borderColor: "#BBF7D0",
                      borderRadius: 2,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Typography variant="body2" fontWeight={600} color="#166534">
                      Batch Size: <strong>{batchCount.toLocaleString()}</strong> serials will be created
                    </Typography>
                    <Chip
                      size="small"
                      label={`Total: Ksh ${(batchCount * Number(formik.values.denomination || 0)).toLocaleString()}`}
                      color="success"
                      sx={{ fontWeight: 700 }}
                    />
                  </Paper>
                )}

                <Button
                  type="submit"
                  variant="contained"
                  size="large"
                  disabled={loading}
                  startIcon={<HiArrowUpTray />}
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
                    "Upload & Generate Batch"
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
          {isSuccess ? (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center" }}>
              <HiCheckCircle size={56} color="#107C41" />
              <Typography variant="h6" fontWeight={700} sx={{ mt: 1 }}>
                {dialogTitle}
              </Typography>
            </Box>
          ) : (
            <Typography variant="h6" color="error.main" fontWeight={700}>
              {dialogTitle}
            </Typography>
          )}
        </DialogTitle>
        <DialogContent sx={{ textAlign: "center" }}>
          {isSuccess ? (
            <Alert severity="success" sx={{ mt: 1 }}>
              {dialogContent}
            </Alert>
          ) : (
            <Alert severity="error" sx={{ mt: 1 }}>
              {dialogContent}
            </Alert>
          )}
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
            OK
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default UploadSerials;
