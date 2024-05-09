import React, { useState } from "react";
import { useFormik } from "formik";
import * as Yup from "yup";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import { SERVER_URL } from "@/config";
import {
  Box,
  Card,
  Dialog,
  DialogContent,
  Grid,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { HiMiniCheckCircle } from "react-icons/hi2";
import Image from "next/image";

const Form = () => {
  const [loading, setLoading] = useState(false);
  const [serverResponse, setServerResponse] = useState(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogTitle, setDialogTitle] = useState("");
  const [dialogContent, setDialogContent] = useState("");
  const router = useRouter();

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  const formik = useFormik({
    initialValues: {
      name: "",
      department: "",
      homeChurch: "",
      phoneNumber: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      department: Yup.string().required("Department is required"),
      homeChurch: Yup.string().required("Home Church is required"),
      phoneNumber: Yup.string().required("Phone Number is required"),
    }),
  });

  const handleDialogOpen = () => {
    setDialogTitle("Success!");
    setDialogContent(
      "You have successully submitted your info"
      // serverResponse
    );
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleNewEntry = (allFormValues) => {
    // Send a POST request to the server
    fetch(`${backendUrl}/newEntry`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(allFormValues),
    })
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok");
        }
        const data = await response.json();
        console.log("server response:", data);

        if (data.error) {
          setServerResponse(data.error);
        }
        handleDialogOpen();
      })
      .catch((error) => {
        console.error("There was a problem with the fetch operation:", error);
        handleDialogOpen();
      });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      // if (formik.isValid) {
      await formik.validateForm();
      if (Object.keys(formik.errors).length === 0) {
        const allFormValues = { ...formik.values };
        await handleNewEntry(allFormValues);
      } else {
        console.log("form is notvalid, please ill all fields");
      }
    } catch (error) {
      console.error("error Submitting form", error);
    } finally {
      setLoading(false);
    }
    console.log("Submitted:", formik.values);
  };

  const handleViewData = () => {
    router.push("/login");
  };

  const handleCancel = () => {
    // Implement cancel logic here
    handleDialogClose(); // Close the dialog when cancel is clicked
  };

  return (
    <Box style={{ backgroundColor: "#8bc34a", overflow: "hidden" }}>
      <Grid
        sx={{
          textAlign: "center", // Center the form horizontally
          marginLeft: "auto",
          marginRight: "auto", // Set margin left and right to "auto" for centering
          maxWidth: "40%",
        }}
      >
        <Grid item md={2} sx={{ mt: 8 }}>
          <Image src={"/logo.png"} width={100} height={100} alt="church Logo" />
        </Grid>
        <Grid item md={10}>
          <Typography
            style={{
              alignContent: "center",
              textAlign: "center",
            }}
            variant="h5"
          >
            Seventh Day Adventist Church
          </Typography>
          <Typography
            style={{
              alignContent: "center",
              textAlign: "center",
              marginTop: "5px",
            }}
            variant="h5"
          >
            Kisii Central
          </Typography>
          <Typography
            style={{
              alignContent: "center",
              textAlign: "center",
              marginTop: "5px",
            }}
            variant="h6"
          >
            Registration Form
          </Typography>
        </Grid>
      </Grid>
      <form onSubmit={formik.handleSubmit}>
        <Typography
          variant="h6"
          style={{
            alignContent: "center",
            textAlign: "center",
            marginTop: "5px",
            color: "white",
          }}
        >
          Kindly fill in the required details below and submit.
        </Typography>
        <Grid
          container
          spacing={3}
          direction={"column"}
          sx={{
            mt: 1,
            textAlign: "center", // Center the form horizontally
            marginLeft: "auto",
            marginRight: "auto", // Set margin left and right to "auto" for centering
            maxWidth: "50%",
            marginTop: "-10px",
          }}
        >
          <Grid item>
            <Card style={{ height: "100px" }}>
              <TextField
                id="standard-textarea"
                label="Name"
                name="name"
                required
                variant="standard"
                value={formik.values.name}
                onChange={formik.handleChange}
                error={formik.touched.name && Boolean(formik.errors.name)}
                helperText={formik.touched.name && formik.errors.name}
                style={{ width: "90%", marginTop: "20px" }}
              />
            </Card>
          </Grid>
          <Grid item>
            <Card style={{ height: "100px" }}>
              <TextField
                label="Department"
                id="standard-textarea"
                name="department"
                variant="standard"
                required
                value={formik.values.department}
                onChange={formik.handleChange}
                error={
                  formik.touched.department && Boolean(formik.errors.department)
                }
                helperText={
                  formik.touched.department && formik.errors.department
                }
                style={{ width: "90%", marginTop: "20px" }}
              />
            </Card>
          </Grid>
          <Grid item>
            <Card style={{ height: "100px" }}>
              <TextField
                label="Home Church"
                id="standard-textarea"
                name="homeChurch"
                variant="standard"
                required
                value={formik.values.homeChurch}
                onChange={formik.handleChange}
                error={
                  formik.touched.homeChurch && Boolean(formik.errors.homeChurch)
                }
                helperText={
                  formik.touched.homeChurch && formik.errors.homeChurch
                }
                style={{ width: "90%", marginTop: "20px" }}
              />
            </Card>
          </Grid>
          <Grid item>
            <Card style={{ height: "100px" }}>
              <TextField
                label="Phone Number"
                id="standard-textarea"
                name="phoneNumber"
                variant="standard"
                required
                value={formik.values.phoneNumber}
                onChange={formik.handleChange}
                error={
                  formik.touched.phoneNumber &&
                  Boolean(formik.errors.phoneNumber)
                }
                helperText={
                  formik.touched.phoneNumber && formik.errors.phoneNumber
                }
                style={{ width: "90%", marginTop: "20px" }}
              />
            </Card>
          </Grid>
        </Grid>
        <Grid container justifyContent="center" sx={{ mt: 8 }}>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            sx={{ borderRadius: 4, backgroundColor: "#357a38" }}
          >
            Submit
          </Button>
        </Grid>
      </form>
      <Grid container justifyContent="center" sx={{ mt: 8, mb: 8 }}>
        <Grid item>
          <Button
            variant="contained"
            onClick={handleViewData}
            sx={{ borderRadius: 4, backgroundColor: "#357a38" }}
          >
            View Data
          </Button>
        </Grid>
      </Grid>
      {/* Dialog */}
      <Dialog
        open={dialogOpen}
        onClose={handleDialogClose}
        aria-labelledby="form-dialog-title"
        PaperProps={{
          style: {
            width: "400px", // set your desired width
            height: "200px", // set your desired height
            borderRadius: "15px", // set your desired border radius
          },
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
          <Grid>
            {/* <Grid item md={6}> */}
            <Button
              onClick={handleDialogClose}
              variant="contained"
              color="primary"
              style={{
                marginTop: "15px",
                borderRadius: "30px",
                backgroundColor: "#357a38",
                width: "100%",
              }} // Adjust the margin as needed
            >
              Close
            </Button>
            {/* </Grid> */}
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default Form;
