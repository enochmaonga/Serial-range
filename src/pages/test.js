import Sidebar from "@/components/Dashboard/SideBar";
import { Box, Card, Grid } from "@mui/material";

const Dashboard = () => {
  return (
    <div>
      <Sidebar /> left
      <Grid container>
        <Grid item xs={12} sm={12} md={12}>
          <Card
            sx={{
              height: "100px",
              marginLeft: "220px",
              border: "1px solid",
              mr: 3,
            }}
          >
            {" "}
            Inside
          </Card>
        </Grid>
      </Grid>
      <Grid container>
        <Grid item xs={12} sm={12} md={12}>
          <Card
            sx={{
              marginLeft: "220px",
              border: "1px solid",
              mt: 3,
              mr: 3,
            }}
          >
            <Grid container spacing={2} sx={{ padding: 2 }}>
              <Grid item xs={12} sm={12} md={6}>
                <Card sx={{ height: "100px" }}> A</Card>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                {" "}
                <Card sx={{ height: "100px" }}> B</Card>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                {" "}
                <Card sx={{ height: "100px" }}> C</Card>
              </Grid>
              <Grid item xs={12} sm={12} md={6}>
                {" "}
                <Card sx={{ height: "100px" }}> D</Card>
              </Grid>
              <Grid container sx={{mt: 3, marginLeft: 2}}>
                <Grid item xs={12} sm={12} md={6} >
                  <Card
                    sx={{
                      height: "300px",
                      border: "1px solid",
                      mr: 1,
                    }}
                  >
                    {" "}
                    Inside
                  </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Card
                    sx={{
                      height: "300px",
                     
                      border: "1px solid",
                      ml: 1,
                    }}
                  >
                    {" "}
                    Next
                  </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={3}>
                  <Card
                    sx={{
                      height: "300px",
                   
                      border: "1px solid",
                      ml: 2,
                    }}
                  >
                    {" "}
                    Out Side
                  </Card>
                </Grid>
              </Grid>
            </Grid>
          </Card>
        </Grid>
      </Grid>
    </div>
  );
};

export default Dashboard;
