import React from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import { Card, Typography } from "@mui/material";
import { makeStyles } from "@mui/styles";
import Link from "next/link";

const useStyles = makeStyles((theme) => ({
  drawerPaper: {
    border: "none",
  },
}));

const Sidebar = () => {
  const classes = useStyles();

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      classes={{
        paper: classes.drawerPaper,
      }}
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
                View Data
              </Typography>
            </Link>
          </ListItem>
          <ListItem>
            <Link href="/login" passHref style={{ textDecoration: "none" }}>
              <Typography
                variant="h6"
                style={{
                  color: "white",
                  padding: "16px",
                  backgroundColor: "#7cb342",
                  borderRadius: "15px",
                }}
              >
                Feedback
              </Typography>
            </Link>
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default Sidebar;
