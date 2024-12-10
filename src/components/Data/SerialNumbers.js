import React, { useEffect, useState } from "react";
import {
  Container,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TablePagination,
  TableRow,
  Typography,
} from "@mui/material";
import { SERVER_URL } from "@/config";

function SerialNumbers() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredData, setFilteredData] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);

  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL;

  useEffect(() => {
    const fetchSerialNumbers = async () => {
      try {
        console.log("Fetching serial numbers from server...");
        const response = await fetch(`${backendUrl}/serial`);

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`);
        }

        const data = await response.json();
        console.log("Fetched data:", data);

        // Directly set data as it is already an array
        setData(data);
      } catch (error) {
        console.error("Failed to fetch serial numbers:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchSerialNumbers();
  }, []);

  useEffect(() => {
    console.log("Filtering data based on search query:", searchQuery);
    const filtered =
      data &&
      data.filter((item) =>
        item.serialNumbers.some((serial) =>
          serial.toLowerCase().includes(searchQuery.toLowerCase())
        )
      );
    console.log("Filtered data:", filtered);
    setFilteredData(filtered);
    setPage(0);
  }, [searchQuery, data]);

  const handleChangePage = (event, newPage) => {
    console.log("Changing page to:", newPage);
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    const newRowsPerPage = parseInt(event.target.value, 10);
    console.log("Changing rows per page to:", newRowsPerPage);
    setRowsPerPage(newRowsPerPage);
    setPage(0);
  };

  return (
    <>
      <Container>
        <Typography variant="h4" gutterBottom>
          Serial Numbers
        </Typography>
        {loading ? (
          <Typography variant="body1">Loading...</Typography>
        ) : (
          <Table stickyHeader>
            <TableHead>
              <TableRow>
                <TableCell>Denomination</TableCell>
                <TableCell>Serial Numbers</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredData
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => (
                  <TableRow key={row._id}>
                    <TableCell>{row.denomination}</TableCell>
                    <TableCell>{row.serialNumbers.join(", ")}</TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
        )}
      </Container>
      <TablePagination
        component="div"
        count={filteredData.length}
        page={page}
        onPageChange={handleChangePage}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={handleChangeRowsPerPage}
      />
    </>
  );
}

export default SerialNumbers;
