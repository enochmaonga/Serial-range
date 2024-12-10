import React, { useState, useEffect } from "react";
import {
  Box,
  Card,
  Grid,
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
} from "@mui/material";
import { useFormik } from "formik";
import * as Yup from "yup";
import { SERVER_URL } from "@/config";
import { HiMiniCheckCircle } from "react-icons/hi2";

const SerialsRegistry = () => {
  const [loading, setLoading] = useState(false);
  const [denominations, setDenominations] = useState([]);
  const [serials, setSerials] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMessage, setDialogMessage] = useState("");

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchDenominations = async () => {
      try {
        const response = await fetch(`${backendUrl}/serial`);
        const data = await response.json();
        setDenominations(data.denominations || []);
      } catch (error) {
        console.error("Error fetching denominations:", error);
      }
    };
    fetchDenominations();
  }, []);

  const handleDenominationChange = (event) => {
    const selectedDenomination = event.target.value;
    formik.setFieldValue("denomination", selectedDenomination);

    // Find the corresponding serials for the selected denomination
    const selectedData = denominations.find(
      (item) => item.denomination === selectedDenomination
    );
    setSerials(selectedData?.serials || []);
    formik.setFieldValue("serial", ""); // Clear previously selected serial when denomination changes
  };

  const handleSerialChange = (event) => {
    const selectedSerial = event.target.value;
    formik.setFieldValue("serial", selectedSerial);
  };

  const formik = useFormik({
    initialValues: {
      denomination: "",
      serial: "",
      phoneNumber: "",
    },
    validationSchema: Yup.object({
      denomination: Yup.string().required("Denomination is required"),
      serial: Yup.string().required("Serial is required"),
      phoneNumber: Yup.string().required("Phone Number is required"),
    }),
    onSubmit: async (values, { resetForm }) => {
      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/newCars`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(values),
        });
        const result = await response.json();
        if (response.ok) {
          setDialogMessage("Serial submitted successfully!");
          resetForm();
          setSerials([]);
        } else {
          setDialogMessage(result.message || "Submission failed.");
        }
        setDialogOpen(true);
      } catch (error) {
        setDialogMessage("An error occurred during submission.");
        setDialogOpen(true);
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  return (
    <>
      <Box sx={{ maxWidth: "50%", margin: "auto", mt: 5 }}>
        <Typography variant="h4">Serial Management</Typography>
      </Box>
      <Box sx={{ mt: 8 }}>
        <form onSubmit={formik.handleSubmit}>
          <Grid
            container
            spacing={2}
            direction="column"
            sx={{ maxWidth: "50%", margin: "auto" }}
          >
            <FormControl variant="outlined" fullWidth>
              <InputLabel>Denomination</InputLabel>
              <Select
                value={formik.values.denomination}
                onChange={handleDenominationChange}
              >
                {denominations.map((denom, index) => (
                  <MenuItem key={index} value={denom.denomination}>
                    {denom.denomination}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl variant="outlined" fullWidth sx={{ mt: 4 }}>
              <InputLabel>Serial</InputLabel>
              <Select
                value={formik.values.serial}
                onChange={handleSerialChange}
                name="serial"
                disabled={serials.length === 0}
              >
                {serials.map((serial, index) => (
                  <MenuItem key={index} value={serial}>
                    {serial}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <TextField
              label="Phone Number"
              name="phoneNumber"
              variant="outlined"
              value={formik.values.phoneNumber}
              onChange={formik.handleChange}
              style={{ marginTop: "40px" }}
              error={Boolean(
                formik.touched.phoneNumber && formik.errors.phoneNumber
              )}
              helperText={
                formik.touched.phoneNumber && formik.errors.phoneNumber
              }
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              disabled={loading}
              sx={{ borderRadius: 4, backgroundColor: "#1B5E20", mt: 5 }}
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          </Grid>
        </form>

        <Dialog open={dialogOpen} onClose={handleDialogClose}>
          <DialogTitle>Submission Status</DialogTitle>
          <DialogContent>
            <HiMiniCheckCircle
              style={{
                width: "40px",
                height: "40px",
                color: "green",
                marginBottom: "10px",
              }}
            />
            <Typography>{dialogMessage}</Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleDialogClose} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
};

export default SerialsRegistry;
