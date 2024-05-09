import React, { useEffect, useState } from "react";
import {
  Container,
  Typography,
  Table,
  TableHead,
  TableBody,
  TableRow,
  TableCell,
  IconButton,
  Card,
  styled,
  TextField,
  InputAdornment,
  Grid,
  Button,
  TablePagination,
  Box,
  createTheme,
  ThemeProvider,
  CssBaseline,
} from "@mui/material";

import { CiSearch } from "react-icons/ci";
import { SERVER_URL } from "@/config";
import UserShimmer from "../components/Dashboard/UserShimmers";
import CreateUserDialog from "@/components/Dashboard/CreateUserDialog";
import Sidebar from "@/components/Dashboard/SideBar";
import DropdownMenu from "@/components/DropdownMenu";

const BoldTableCell = styled(TableCell)({
  fontWeight: "bold",
  backgroundColor: "#689f38",
  color: "white",
});

const theme = createTheme({
  palette: {
    background: {
      default: "#8bc34a", // Set your desired background color here
    },
  },
});

function Users() {
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [users, setUsers] = useState([]); // Change the state name to "users" to avoid confusion
  const userData = users || [];

  const [currentPage, setCurrentPage] = useState(0); // Track the current page
  const usersPerPage = 5; // Number of users to display per page

  // Menu state variables
  const [anchorEl, setAnchorEl] = useState(null);

  const handleOpenCreateDialog = () => {
    setCreateDialogOpen(true);
  };

  const handleCloseCreateDialog = () => {
    setCreateDialogOpen(false);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`${backendUrl}/fetchusers`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });

        if (response.status === 200) {
          const responseData = await response.json();

          if (Array.isArray(responseData)) {
            if (responseData.length > 0) {
              setUsers(responseData);
            } else {
              console.log("No data received from the server");
            }
          } else {
            console.error(
              "Data from the server is not an array:",
              responseData
            );
          }
        } else {
          console.error("Server error:", response.status);
        }
      } catch (error) {
        console.error("Error:", error);
      }
    };

    fetchData();
  }, []);
  console.log("OBJECT:", users);

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const startIndex = currentPage * usersPerPage;
  const endIndex = startIndex + usersPerPage;

  return (
    <Grid container justifyContent="center">
      <Grid item xs={12} sm={12} sx={{ml:32}}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <Sidebar />
          <Container maxWidth="xl">
            <Typography
              variant="h4"
              component="div"
              sx={{
                display: "flex",
                justifyContent: "left",
                mt: 2,
                mb: 4,
                ml: 5,
                color: "white",
              }}
            >
              Users
            </Typography>
            <Card
              sx={{
                height: "100px",
                marginLeft: "40px",
                width: "100%",
              }}
            >
              <Grid container>
                <Grid item xs={12} sm={6} md={8} xl={8} sx={{ padding: 3 }}>
                  <TextField
                    id="search-bar"
                    className="text"
                    label="search by username"
                    variant="outlined"
                    placeholder="Enter username"
                    sx={{ minWidth: "90%" }}
                    // onChange={handleSearch}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <CiSearch style={{ fill: "blue" }} />
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={4} xl={2} sx={{ padding: 3 }}>
                  <Button
                    variant="contained"
                    sx={{ borderRadius: 5, mt: 1, backgroundColor: "#689f38" }}
                    onClick={handleOpenCreateDialog}
                  >
                    Create User
                  </Button>
                  <CreateUserDialog
                    open={isCreateDialogOpen}
                    onClose={handleCloseCreateDialog}
                  />
                </Grid>
              </Grid>
            </Card>
            <Grid sx={{ width: "100%", mt: 3, marginLeft: "40px" }}>
              {/* <Card> */}
              <Table>
                <TableHead>
                  <TableRow>
                    <BoldTableCell>id</BoldTableCell>
                    <BoldTableCell>User Name</BoldTableCell>
                    <BoldTableCell>First Name</BoldTableCell>
                    <BoldTableCell>Middle Name</BoldTableCell>
                    <BoldTableCell>Last Name</BoldTableCell>
                    <BoldTableCell>Phone Number</BoldTableCell>
                    <BoldTableCell>Email</BoldTableCell>
                    <BoldTableCell>User Type</BoldTableCell>
                    <BoldTableCell>Action</BoldTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {Array.isArray(users)
                    ? users.slice(startIndex, endIndex).map((user) => (
                        <TableRow key={user._id}>
                          <TableCell>{user._id}</TableCell>
                          <TableCell>{user.username}</TableCell>
                          <TableCell>{user.firstName}</TableCell>
                          <TableCell>{user.middleName}</TableCell>
                          <TableCell>{user.lastName}</TableCell>
                          <TableCell>{user.phoneNumber}</TableCell>
                          <TableCell>{user.email}</TableCell>
                          <TableCell>{user.userType}</TableCell>

                          <TableCell>
                            <DropdownMenu userId={user._id} />
                          </TableCell>
                        </TableRow>
                      ))
                    : [1, 2, 3, 4, 5].map((index) => (
                        <UserShimmer key={index} />
                      ))}
                </TableBody>
              </Table>
              <Box
                sx={{
                  display: "flex",
                  alignContent: "center",
                  justifyContent: "center",
                }}
              >
                <TablePagination
                  component="div"
                  count={users.length}
                  page={currentPage}
                  onPageChange={handlePageChange}
                  rowsPerPage={usersPerPage}
                  rowsPerPageOptions={[]}
                />
              </Box>
              {/* </Card> */}
            </Grid>

            {/* <DeleteUserDialog
      open={isDeleteDialogOpen}
      onClose={handleCloseDeleteDialog}
      onDelete={handleConfirmDelete} // Pass the delete function
    /> */}
          </Container>
        </ThemeProvider>
      </Grid>
    </Grid>
  );
}

export default Users;
