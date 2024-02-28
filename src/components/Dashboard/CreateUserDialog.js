import React, { useEffect, useState } from "react";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import {
  Grid,
  IconButton,
  InputAdornment,
  MenuItem,
  Select,
} from "@mui/material";
import { Visibility, VisibilityOff } from "@mui/icons-material";
import PropTypes from "prop-types";
import { SERVER_URL } from "@/config";

const initialFormData = {
  username: "",
  password: "",
  firstName: "",
  middleName: "",
  lastName: "",
  phoneNumber: "",
  email: "",
  userType: "",
};

const userTypeOptions = ["User", "Admin", "Church Clark"];

const CreateUserDialog = ({ open, onClose, onSave }) => {
  const [formData, setFormData] = useState(initialFormData);
  const [response, setResponse] = useState(null);
  const [mainDialogOpen, setMainDialogOpen] = useState(true);
  const [errors, setErrors] = useState({});
  const [users, setUsers] = useState([]);

  const [showPassword, setShowPassword] = useState(false);

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const createUser = async () => {
    try {
      const response = await fetch(`${SERVER_URL}/users`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });
      console.log("SERVER", response);

      if (response.status === 201) {
        // User created successfully
        setResponse({ type: "success", message: "User created successfully" });
      } else {
        // Handle server error or validation errors
        const responseData = await response.json();
        setResponse({
          type: "error",
          message: responseData.message || "An error has occurred",
        });
      }
    } catch (error) {
      console.error("Error:", error);
      setResponse({
        type: "error",
        message: "Failed to create user. Please try again later",
      });
    } finally {
      // Close the main dialog after saving, regardless of success or error
      setMainDialogOpen(false);
    }
  };

  const handleSave = () => {
    // Validate form data before creating the user
    const validationErrors = {};
    if (!formData.firstName) {
      validationErrors.firstName = "Name is required";
    }
    if (!formData.middleName) {
      validationErrors.middleName = "Name is required";
    }
    if (!formData.lastName) {
      validationErrors.lastName = "Name is required";
    }
    if (!formData.username) {
      validationErrors.username = "Username is required";
    }
    if (!formData.password) {
      validationErrors.password = "Password is required";
    }
    if (!formData.phoneNumber) {
      validationErrors.phoneNumber = "phoneNumber is required";
    }
    if (!formData.email) {
      validationErrors.email = "Email is required";
    }
    if (!formData.userType) {
      validationErrors.userType = "User type is required";
    }
    console.log("Data Entry", formData);

    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      const formDataArray = Object.values(formData);

      //log the array
      console.log("Data Entry Array", formDataArray);
      createUser();
    } else {
      // There are validation errors, do not proceed with saving
      setResponse({ type: "error", message: "Please fix validation errors" });
    }
  };

  const handleCloseResponse = () => {
    setResponse(null);
    onClose();
    // Reopen the main dialog when closing the response dialog
    setMainDialogOpen(true);
  };

  return (
    <>
      {mainDialogOpen && (
        <Dialog
          open={open}
          onClose={handleCloseResponse}
          PaperProps={{
            style: {
              borderRadius: "20px",
            },
          }}
        >
          <DialogTitle>Create User</DialogTitle>
          <DialogContent>
            <TextField
              name="username"
              label="User Name"
              fullWidth
              value={formData.username}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.username}
              helperText={errors.username}
            />
            <TextField
              name="password"
              label="Password"
              fullWidth
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.password}
              helperText={errors.password}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton onClick={togglePasswordVisibility} edge="end">
                      {showPassword ? <Visibility /> : <VisibilityOff />}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
            />
            <TextField
              name="firstName"
              label="First Name"
              fullWidth
              value={formData.firstName}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.firstName}
              helperText={errors.firstName}
            />
            <TextField
              name="middleName"
              label="Middle Name"
              fullWidth
              value={formData.middleName}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.middleName}
              helperText={errors.middleName}
            />
            <TextField
              name="lastName"
              label="Last Name"
              fullWidth
              value={formData.lastName}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.lastName}
              helperText={errors.lastName}
            />
            <TextField
              name="phoneNumber"
              label="phone Number"
              type="tel"
              fullWidth
              value={formData.phoneNumber}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.phoneNumber}
              helperText={errors.phoneNumber}
            />
            <TextField
              name="email"
              label="Email"
              type="email"
              fullWidth
              value={formData.email}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.email}
              helperText={errors.email}
            />
            <Select
              name="userType"
              label="User Type"
              // placeholder="User Type"
              fullWidth
              value={formData.userType}
              onChange={handleChange}
              style={{ marginBottom: 6, marginTop: 6 }}
              error={errors.userType}
              helperText={errors.userType}
            >
              {userTypeOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </Select>
          </DialogContent>

          <DialogActions>
            <Grid
              container
              spacing={2}
              justify="center"
              justifyContent="center"
            >
              <Grid item md={3}>
                <Button
                  onClick={handleCloseResponse}
                  color="primary"
                  style={{
                    backgroundColor: "red",
                    borderRadius: "20px",
                    width: "100%",
                    color: "white",
                  }}
                >
                  Close
                </Button>
              </Grid>
              <Grid item md={3}>
                <Button
                  onClick={handleSave}
                  color="primary"
                  style={{
                    backgroundColor: "#8bc34a",
                    borderRadius: "20px",
                    width: "100%",
                    color: "white",
                  }}
                >
                  Create
                </Button>
              </Grid>
            </Grid>
          </DialogActions>
        </Dialog>
      )}
      {response && (
        <Dialog
          open={!!response}
          onClose={handleCloseResponse}
          PaperProps={{
            style: {
              borderRadius: "20px",
            },
          }}
        >
          <DialogContent>
            <div style={{ textAlign: "center" }}>
              {/* {response.type === "success" ? (
                <CheckCircleIcon style={{ color: "green", fontSize: 60 }} />
              ) : (
                <div style={{ color: "red" }}>Error has occurred</div>
              )} */}
              <div>{response.message}</div>
            </div>
          </DialogContent>
          <DialogActions style={{ justifyContent: 'center' }}>
            <Button
              onClick={handleCloseResponse}
              color="secondary"
              style={{
                backgroundColor: "#8bc34a",
                borderRadius: "20px",
                width: "50%",
                color: "white",
               
              }}
            >
              Close
            </Button>
          </DialogActions>
        </Dialog>
      )}
    </>
  );
};

CreateUserDialog.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onSave: PropTypes.func.isRequired,
};

export default CreateUserDialog;
