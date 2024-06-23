import { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  styled,
  Box,
  Typography,
  Grid,
  useMediaQuery,
  useTheme,
  TablePagination,
  // ListItemText,
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
// import { SERVER_URL } from "@/config";
import Image from "next/image";
import { useRouter } from "next/router";
import Link from "next/link";
import Sidebar from "../Dashboard/SideBar";

const BoldTableCell = styled(TableCell)({
  fontWeight: "bold",
  backgroundColor: "#EEEEEE",
});

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

const DataTable = () => {
  const [data, setData] = useState([]);
  const [filteredData, setFilteredData] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10); // Rows per page
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  // const [isAdmin, setIsAdmin] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from the server...");
        const authToken = localStorage.getItem("token");
        if (!authToken) {
          throw new Error("No authentication token found.");
        }
        const response = await fetch(`${backendUrl}/content`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${authToken}`,
          },
        });
        console.log("Server response status:", response.status);

        if (response.status === 200) {
          const responseData = await response.json();
          // setIsAdmin(role === 'admin' || "user");
          console.log("Response data from the server:", responseData);

          if (Array.isArray(responseData)) {
            if (responseData.length > 0) {
              const fetchedItems = responseData.map((item) => ({
                id: uuidv4(),
                name: item.name,
                homeChurch: item.homeChurch,
                department: item.department,
                phoneNumber: item.phoneNumber,
                createdAt: item.createdAt,
              }));
              setData(fetchedItems);
            } else {
              console.log("No data received from the server");
            }
          } else {
            console.error(
              "Data from the server is not an array:",
              responseData.body
            );
            setError("Data from the server is not in the expected format");
          }
        } else if (response.status === 401) {
          // Unauthorized access, redirect to login
          router.push("/login");
        } else {
          console.error("Server error:", response.status);
          setError("Server error. Please tryagain later");
        }
      } catch (error) {
        console.error("Error:", error);
        setError("An erro occurred while fetching data");
      }
    };
    fetchData();
  }, [router]);

  useEffect(() => {
    setFilteredData(
      data.filter((car) =>
        car.carRegistration.toLowerCase().includes(searchQuery.toLowerCase())
      )
    );
    setPage(0);
  }, [searchQuery, data]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  return (
    <>
    {!isMobile && (
      <Box
        style={{
          backgroundColor: "#EEEEEE",
          width: "200px",
          height: "100%",
          position: "fixed",
          left: 0,
          top: 0,
        }}
      >
        {/* Admin content goes here */}
        <Link href="/dashboard" passHref style={{textDecoration: 'none'}}>
        <Typography variant="h6" style={{ color: "white", padding: "16px" }}>
          Admin Panel
        </Typography>
        </Link>
        <Sidebar />
      </Box>
    )}
      <Grid
        sx={{
          textAlign: "center", // Center the form horizontally
          marginLeft: isMobile ? "15%" : "auto",
          marginRight: "auto", // Set margin left and right to "auto" for centering
          maxWidth: isMobile ? "250px" : "40%",
        }}
      >
        <Grid item xs={12} sx={{ mt: 2 }}>
          <Image src={"/logo.png"} width={100} height={100} alt="church Logo" />
        </Grid>
        <Grid item xs={12}>
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
            Registration Details
          </Typography>
        </Grid>
      </Grid>
      <Typography
        variant="h6"
        style={{
          alignContent: "center",
          textAlign: "center",
          marginTop: "20px",
        }}
      >
        Below is the data that has been received.
      </Typography>
      <TableContainer
        component={Paper}
        sx={{
          textAlign: "center",
          marginLeft: isMobile ? "0" : "240px",
          marginRight: "50px",
          maxWidth: isMobile ? "100%" : "85%",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              <BoldTableCell>Id</BoldTableCell>
              <BoldTableCell>Name</BoldTableCell>
              <BoldTableCell>Department</BoldTableCell>
              <BoldTableCell>Home Church</BoldTableCell>
              <BoldTableCell>Phone Number</BoldTableCell>
              <BoldTableCell>Date</BoldTableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.id}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>{row.department}</TableCell>
                <TableCell>{row.homeChurch}</TableCell>
                <TableCell>{row.phoneNumber}</TableCell>
                <TableCell>{row.createdAt}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        style={{
          marginLeft: isMobile ? "0" : "240px",
          marginRight: "50px",
          maxWidth: isMobile ? "100%" : "85%",
        }}
        />
    </>
  );
};

export default DataTable;
