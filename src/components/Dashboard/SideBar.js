import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles"; 
import Link from "next/link";

// Define your custom theme
const theme = createTheme({
  overrides: {
    MuiDrawer: {
      paper: {
        border: "none",
      },
    },
  },
});

const Sidebar = () => {
  return (
    <ThemeProvider theme={theme}> 
      <Drawer
        variant="permanent"
        anchor="left"
      >
        <div
          style={{
            backgroundColor: "#8bc34a",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            // marginRight:
          }}
        >
          <List style={{ marginTop: "100px" }}>
            <ListItem>
              <Link href="/dashboard" passHref style={{ textDecoration: "none" }}>
                <Typography
                  variant="h6"
                  style={{
                    color: "white",
                    padding: "16px",
                    backgroundColor: "#7cb342",
                    borderRadius: "15px",
                  }}
                >
                  Admin Panel
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link href="/users" passHref style={{ textDecoration: "none" }}>
                <Typography
                  variant="h6"
                  style={{
                    color: "white",
                    padding: "16px",
                    backgroundColor: "#7cb342",
                    borderRadius: "15px",
                  }}
                >
                  User Management
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link href="/" passHref style={{ textDecoration: "none" }}>
                <Typography
                  variant="h6"
                  style={{
                    color: "white",
                    padding: "16px",
                    backgroundColor: "#7cb342",
                    borderRadius: "15px",
                  }}
                >
                  Home
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link href="/view-data" passHref style={{ textDecoration: "none" }}>
                <Typography
                  variant="h6"
                  style={{
                    color: "white",
                    padding: "16px",
                    backgroundColor: "#7cb342",
                    borderRadius: "15px",
                  }}
                >
                  Reg Data
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link href="/carlist" passHref style={{ textDecoration: "none" }}>
                <Typography
                  variant="h6"
                  style={{
                    color: "white",
                    padding: "16px",
                    backgroundColor: "#7cb342",
                    borderRadius: "15px",
                  }}
                >
                  Cars
                </Typography>
              </Link>
            </ListItem>
          </List>
        </div>
      </Drawer>
    </ThemeProvider>
  );
};

export default Sidebar;
