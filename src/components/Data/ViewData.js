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
} from "@mui/material";
import { v4 as uuidv4 } from "uuid";
import { SERVER_URL } from "@/config";
import Image from "next/image";

const BoldTableCell = styled(TableCell)({
  fontWeight: "bold",
  backgroundColor: "#8bc34a",
});

const DataTable = () => {
  const [data, setData] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log("Fetching data from the server...");
        const response = await fetch(`${SERVER_URL}/formcontent`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
          },
        });
        console.log("Server response status:", response.status);

        if (response.status === 200) {
          const responseData = await response.json();
          console.log("Response data from the server:", responseData);

          if (Array.isArray(responseData.body)) {
            if (responseData.body.length > 0) {
              const fetchedItems = responseData.body.map((item) => ({
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

  return (
    <>
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
          marginLeft: "auto",
          marginRight: "auto",
          maxWidth: "90%",
        }}
      >
        <Table>
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
    </>
  );
};

export default DataTable;