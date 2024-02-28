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
        }}
      >
        <Card style={{ margin: "20px", height: "60px" }}>
          Here is where you come
        </Card>
        <List>
          <ListItem button>
            <Link href="/users" passHref style={{ textDecoration: 'none' }}>
            <Typography component="div" >
              <ListItemText primary="User Management" />
            </Typography>
            </Link>
          </ListItem>
          <ListItem button>
            <Link href="/" passHref style={{ textDecoration: 'none' }}>
              <ListItemText primary="Home" />
            </Link>
          </ListItem>
          <ListItem button>
            <Link href="view-data" passHref style={{ textDecoration: 'none' }}>
              <ListItemText primary="View Data" />
            </Link>
          </ListItem>
          <ListItem button>
            <Link href="view-data" passHref style={{ textDecoration: 'none' }}>
              <ListItemText primary="Contact" />
            </Link>
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default Sidebar;
