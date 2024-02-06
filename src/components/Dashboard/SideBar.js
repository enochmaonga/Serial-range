import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Card } from '@mui/material';

const Sidebar = () => {
  return (
    <Drawer
      variant="permanent"
      anchor="left"
    >
        <Card style={{margin: "20px"}}> Here is where you come</Card>
      <List>
        <ListItem button>
          <ListItemText primary="Home" />
        </ListItem>
        <ListItem button>
          <ListItemText primary="About" />
        </ListItem>
        <ListItem button>
          <ListItemText primary="Contact" />
        </ListItem>
      </List>
    </Drawer>
  );
};

export default Sidebar;