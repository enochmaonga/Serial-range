import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import { Typography } from "@mui/material";
import { createTheme, ThemeProvider } from "@mui/material/styles";
import Link from "next/link";
import { AiOutlineHome } from "react-icons/ai";
import { TbUsers } from "react-icons/tb";
import { RiAdminLine } from "react-icons/ri";
import { RiDatabaseLine } from "react-icons/ri";
import { FaCloudUploadAlt } from "react-icons/fa";

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
      <Drawer variant="permanent" anchor="left">
        <div
          style={{
            backgroundColor: "#EEEEEE",
            height: "100%",
            display: "flex",
            flexDirection: "column",
            // marginRight:
          }}
        >
          <List style={{ marginTop: "100px" }}>
            <ListItem>
              <Link
                href="/dashboard"
                passHref
                style={{ textDecoration: "none" }}
              >
                <Typography
                  style={{
                    color: "white",
                    padding: "16px",
                    color: "grey",
                  }}
                >
                  <RiAdminLine style={{ marginRight: "5px" }} />
                  Admin Panel
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link href="/users" passHref style={{ textDecoration: "none" }}>
                <Typography
                  style={{
                    color: "white",
                    padding: "16px",
                    color: "grey",
                  }}
                >
                  <TbUsers style={{ marginRight: "5px" }} />
                  User Management
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link href="/" passHref style={{ textDecoration: "none" }}>
                <Typography
                  style={{
                    color: "white",
                    padding: "16px",
                    color: "grey",
                  }}
                >
                  <AiOutlineHome style={{ marginRight: "5px" }} />
                  Home
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link
                href="/seriallist"
                passHref
                style={{ textDecoration: "none" }}
              >
                <Typography
                  style={{
                    color: "white",
                    padding: "16px",
                    color: "grey",
                  }}
                >
                  <RiDatabaseLine style={{ marginRight: "5px" }} />
                  Entered Data
                </Typography>
              </Link>
            </ListItem>
            <ListItem>
              <Link href="/upload" passHref style={{ textDecoration: "none" }}>
                <Typography
                  style={{
                    color: "white",
                    padding: "16px",
                    color: "grey",
                  }}
                >
                  <FaCloudUploadAlt style={{ marginRight: "5px" }} />
                  Upload Serials
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
