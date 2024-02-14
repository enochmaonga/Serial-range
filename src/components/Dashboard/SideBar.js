import React from 'react';
import Drawer from '@mui/material/Drawer';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import { Card } from '@mui/material';
import { makeStyles } from '@mui/styles';
import NextLink from 'next/link';

const useStyles = makeStyles((theme) => ({
    drawerPaper: {
      border: 'none',
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
      <div style={{ backgroundColor: '#8bc34a',  height: '100%', display: 'flex', flexDirection: 'column' }}>
        <Card style={{ margin: '20px', height: '60px' }}>Here is where you come</Card>
        <List>
        <ListItem button>
            <NextLink href="/users" passHref>
            <ListItemText primary="Users" />
            </NextLink>
          </ListItem>
          <ListItem button>
          <NextLink href="/" passHref>
            <ListItemText primary="Home" />
            </NextLink>
          </ListItem>
          <ListItem button>
            <NextLink href="view-data" passHref>
            <ListItemText primary="View Data" />
            </NextLink>
          </ListItem>
          <ListItem button>
            <ListItemText primary="Contact" />
          </ListItem>
        </List>
      </div>
    </Drawer>
  );
};

export default Sidebar;