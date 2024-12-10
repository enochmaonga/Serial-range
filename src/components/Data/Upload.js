import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import {
  Box,
  Card,
  Dialog,
  DialogContent,
  Grid,
  Typography,
  List,
  ListItem,
} from "@mui/material";
import { useRouter } from "next/router";
import { HiMiniCheckCircle } from "react-icons/hi2";
import Image from "next/image";
import CircularProgress from "@mui/material/CircularProgress";
import { SERVER_URL } from "@/config";

const UploadSerials = () => {
  const [loading, setLoading] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const [serials, setSerials] = useState([]);
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const formik = useFormik({
    initialValues: {
      denomination: "",
      startSerial: "",
      endSerial: "",
    },
    validationSchema: Yup.object({
      denomination: Yup.string().required("Denomination is required"),
      startSerial: Yup.string()
        .required("Start serial is required")
        .matches(/^\d{17}$/, "Serial must be 17 digits long"),
      endSerial: Yup.string()
        .required("End serial is required")
        .matches(/^\d{17}$/, "Serial must be 17 digits long"),
    }),
    onSubmit: async (values) => {
      const start = BigInt(values.startSerial);
      const end = BigInt(values.endSerial);

      // Validation for 17-digit serial range
      if (
        start > end ||
        values.startSerial.length !== 17 ||
        values.endSerial.length !== 17
      ) {
        setDialogTitle("Error");
        setDialogContent(
          "Invalid serial range. Ensure start and end serials are exactly 17 digits long and start serial is less than or equal to end serial."
        );
        setDialogOpen(true);
        return;
      }

      // Generate serial numbers as strings, padded to 17 digits
      const generatedSerials = [];
      for (let i = start; i <= end; i++) {
        generatedSerials.push(i.toString().padStart(17, "0"));
      }
      setSerials(generatedSerials); // Store generated serials in state

      setLoading(true);
      try {
        const response = await fetch(`${backendUrl}/generateSerials`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            ...values,
            serials: generatedSerials, // Send generated serials to server
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(errorText || "Failed to upload serials.");
        }

        const data = await response.json();
        setDialogTitle("Success");
        setDialogContent("Serials uploaded successfully!");
        setDialogOpen(true);
      } catch (error) {
        setDialogTitle("Error");
        setDialogContent(error.message || "Failed to upload serials.");
        setDialogOpen(true);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleDialogClose = () => {
    setDialogOpen(false);
    setSerials([]);
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <Box style={{ backgroundColor: "#EEEEEE", overflow: "hidden" }}>
      <Grid
        container
        sx={{ textAlign: "center", maxWidth: "40%", margin: "auto" }}
      >
        <Grid item sx={{ mt: 8 }}>
          <Image
            src={"/safaricom-logo1.png"}
            width={300}
            height={50}
            alt="Safaricom Logo"
          />
        </Grid>
      </Grid>

      <form onSubmit={formik.handleSubmit}>
        <Typography
          variant="h6"
          style={{ textAlign: "center", marginTop: "10px" }}
        >
          Kindly fill in the required details below and submit.
        </Typography>

        <Grid
          container
          spacing={3}
          direction="column"
          sx={{ maxWidth: "50%", margin: "auto", mt: 2 }}
        >
          <Grid item xs={12}>
            <Card>
              <TextField
                label="Denomination"
                name="denomination"
                required
                variant="standard"
                fullWidth
                value={formik.values.denomination}
                onChange={formik.handleChange}
                error={
                  formik.touched.denomination &&
                  Boolean(formik.errors.denomination)
                }
                helperText={
                  formik.touched.denomination && formik.errors.denomination
                }
                style={{ marginTop: "20px" }}
              />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <TextField
                label="Start Serial"
                name="startSerial"
                required
                variant="standard"
                type="text"
                fullWidth
                value={formik.values.startSerial}
                onChange={formik.handleChange}
                error={
                  formik.touched.startSerial &&
                  Boolean(formik.errors.startSerial)
                }
                helperText={
                  formik.touched.startSerial && formik.errors.startSerial
                }
                style={{ marginTop: "20px" }}
              />
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <TextField
                label="End Serial"
                name="endSerial"
                required
                variant="standard"
                type="text"
                fullWidth
                value={formik.values.endSerial}
                onChange={formik.handleChange}
                error={
                  formik.touched.endSerial && Boolean(formik.errors.endSerial)
                }
                helperText={formik.touched.endSerial && formik.errors.endSerial}
                style={{ marginTop: "20px" }}
              />
            </Card>
          </Grid>
        </Grid>

        <Grid container spacing={2} justifyContent="center" sx={{ mt: 8 }}>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 4, backgroundColor: "#1B5E20" }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : "Submit"}
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleHome}
              sx={{ borderRadius: 4, backgroundColor: "#1B5E20" }}
            >
              Home
            </Button>
          </Grid>
        </Grid>
      </form>

      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        PaperProps={{
          style: { width: "400px", height: "300px", borderRadius: "15px" },
        }}
      >
        <DialogContent
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HiMiniCheckCircle
            style={{
              width: "40px",
              height: "40px",
              color: "green",
              marginBottom: "10px",
            }}
          />
          <Typography variant="h6">{dialogTitle}</Typography>
          <Typography>{dialogContent}</Typography>
          <List sx={{ maxHeight: 100, overflow: "auto", width: "100%" }}>
            {serials.map((serial) => (
              <ListItem key={serial}>{serial}</ListItem>
            ))}
          </List>
          <Button
            onClick={handleDialogClose}
            variant="contained"
            color="primary"
            style={{
              marginTop: "15px",
              borderRadius: "30px",
              backgroundColor: "#1B5E20",
              width: "100%",
            }}
          >
            Close
          </Button>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default UploadSerials;
