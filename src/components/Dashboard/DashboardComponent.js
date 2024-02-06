import React, { useState } from 'react';
import { Button, Card, Container, CssBaseline, Grid, Typography } from '@mui/material';
import Sidebar from './SideBar';

function DashboardComponent() {


 
  return (
    <>
    <CssBaseline />
    <Container disableGutters>
        <Grid container spacing={2}>
            <Grid item md={10}>
            <Card style={{marginLeft: "20px"}}> Top component</Card>
        </Grid>
    
        <Grid item md={2}>
          <Sidebar />
          </Grid>
          </Grid>
      </Container>
      </>
  );
};

export default DashboardComponent;