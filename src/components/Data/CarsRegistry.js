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
} from "@mui/material";
import { useRouter } from "next/router";
import { HiMiniCheckCircle } from "react-icons/hi2";
import Image from "next/image";
// import { SERVER_URL } from "@/config";

const CarsRegistry = () => {
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
      carRegistration: "",
      phoneNumber: "",
    },
    validationSchema: Yup.object({
      name: Yup.string().required("Name is required"),
      carRegistration: Yup.string().required("Car Registration is required"),
      phoneNumber: Yup.string().required("Phone Number is required"),
    }),
    onSubmit: async (values) => {
      setLoading(true);
      try {
        await handleNewEntry(values);
      } catch (error) {
        console.error("Error submitting form:", error);
      } finally {
        setLoading(false);
      }
    },
  });

  const handleDialogOpen = () => {
    setDialogTitle("Success!");
    setDialogContent(`You have successfully submitted your car info. ${serverResponse}`);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
  };

  const handleNewEntry = async (allFormValues) => {
    try {
      const response = await fetch(`${backendUrl}/newCars`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(allFormValues),
      });

      if (!response.ok) {
        throw new Error("Network response was not ok");
      }

      const data = await response.json();
      console.log("server response:", data);

      if (data.error) {
        setServerResponse(data.error);
      } else {
        setServerResponse("Car info submitted successfully!");
      }

      handleDialogOpen();
    } catch (error) {
      console.error("There was a problem with the fetch operation:", error);
      setServerResponse("Failed to submit car info.");
      handleDialogOpen();
    }
  };

  const handleHome = () => {
    router.push("/");
  };

  return (
    <Box style={{ backgroundColor: "#EEEEEE", overflow: "hidden" }}>
      <Grid
        sx={{
          textAlign: "center", // Center the form horizontally
          marginLeft: "auto",
          marginRight: "auto", // Set margin left and right to "auto" for centering
          maxWidth: "60%",
        }}
      >
        <Grid item md={2} sx={{ mt: 8 }}>
          <Image src={"/logo.png"} width={80} height={80} alt="church Logo" />
        </Grid>
        <Grid item md={10}>
          <Typography
            style={{
              alignContent: "center",
              textAlign: "center",
            }}
            variant="h6"
          >
            Seventh Day Adventist Church
          </Typography>
          <Typography
            style={{
              alignContent: "center",
              textAlign: "center",
              marginTop: "5px",
            }}
            variant="h6"
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
            Car Registration Form
          </Typography>
        </Grid>
      </Grid>
      <form onSubmit={formik.handleSubmit}>
        <Typography
          variant="h6"
          style={{
            alignContent: "center",
            textAlign: "center",
            marginTop: "10px",
          }}
        >
          Kindly fill in the required details below and submit.
        </Typography>
        <Typography
          style={{
            marginLeft: "5%",
          }}
        >
          Disclaimer:{" "}
        </Typography>

        <div>
          <Typography
            paragraph
            style={{
              marginTop: "5px",
              marginLeft: "5%",
            }}
          >
            We value your privacy and are committed to protecting your personal
            data. This disclaimer outlines how we handle and protect the car
            registration details you provide for church parking management
            purposes in accordance with the Kenya Data Protection Act, 2019.
          </Typography>
          <Typography
            paragraph
            style={{
              marginTop: "5px",
              marginLeft: "5%",
            }}
          >
            Purpose of Data Collection:
          </Typography>
          <Typography
            paragraph
            style={{
              marginTop: "5px",
              marginLeft: "5%",
              marginRight: "auto",
            }}
          >
            The car registration details collected are solely for the purpose of
            managing church parking facilities. This information helps us ensure
            the security and organization of our parking areas.
          </Typography>
        </div>

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
          <Grid item xs={12} sm={12}>
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
                label="Car Registration"
                id="standard-textarea"
                name="carRegistration"
                variant="standard"
                required
                value={formik.values.carRegistration}
                onChange={formik.handleChange}
                error={
                  formik.touched.carRegistration &&
                  Boolean(formik.errors.carRegistration)
                }
                helperText={
                  formik.touched.carRegistration &&
                  formik.errors.carRegistration
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
        <Grid container spacing={2} justifyContent="center" sx={{ mt: 8 }}>
          <Grid item>
            <Button
              type="submit"
              variant="contained"
              color="primary"
              sx={{ borderRadius: 4, backgroundColor: "#357a38" }}
            >
              Submit
            </Button>
          </Grid>
          <Grid item>
            <Button
              variant="contained"
              color="primary"
              onClick={handleHome}
              sx={{ borderRadius: 4, backgroundColor: "#357a38" }}
            >
              Home
            </Button>
          </Grid>
        </Grid>
      </form>
      
      <Grid container justifyContent="center" sx={{ mt: 8, mb: 8 }}></Grid>
      
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
          </Grid>
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default CarsRegistry;