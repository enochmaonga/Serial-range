import Sidebar from "@/components/Dashboard/SideBar";
import {
  Card,
  CssBaseline,
  Grid,
  IconButton,
  InputAdornment,
  TextField,
  ThemeProvider,
  Typography,
  createTheme,
} from "@mui/material";
import { IoSearchOutline } from "react-icons/io5";
import Avatar from "@mui/material/Avatar";

const theme = createTheme({
  palette: {
    background: {
      default: "#8bc34a", // Set your desired background color here
    },
  },
});

const avatarStyle = {
  width: "40px",
  height: "40px",
  backgroundColor: "grey",
  color: "white",
};

const Dashboard = () => {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <div>
        <Sidebar />
        <Grid container>
          <Grid item xs={12} sm={12} md={12}>
            <Card
              sx={{
                height: "100px",
                marginLeft: "220px",
                mr: 3,
                mt: 3,
              }}
            >
              {" "}
              <Grid container>
                <Grid item xs={12} sm={6} md={10}>
                  <TextField
                    variant="filled"
                    placeholder="Search Here"
                    sx={{
                      width: "40%",
                      marginTop: "20px",
                      marginLeft: "50px",
                      borderRadius: "30px",
                    }}
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <IconButton type="button" aria-label="search">
                            <IoSearchOutline />
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>

                <Grid
                  item
                  xs={12}
                  sm={6}
                  md={2}
                  sx={{
                    mt: 3.5,
                    display: "flex",
                    justifyContent: "flex-end",
                    paddingRight: 2,
                  }}
                >
                  <Avatar alt="User Avatar" src="/me.jpg" style={avatarStyle} />
                </Grid>
              </Grid>
            </Card>
          </Grid>
        </Grid>
        <Grid container>
          <Grid item xs={12} sm={12} md={12}>
            <Card
              sx={{
                marginLeft: "220px",
                mt: 3,
                mr: 3,
              }}
            >
              <Grid
                container
                spacing={2}
                sx={{
                  padding: 2,
                }}
              >
                <Grid item xs={12} sm={12} md={6}>
                  <Card
                    sx={{
                      height: "150px",
                      backgroundColor: "#c8e6c9",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h4">Total Entries</Typography>
                    <Typography variant="h3">56,000</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <Card
                    sx={{
                      height: "150px",
                      backgroundColor: "#1de9b6",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h4">Total Entries</Typography>
                    <Typography variant="h3">56,000</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <Card
                    sx={{
                      height: "150px",
                      backgroundColor: "#90caf9",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h4">Total Entries</Typography>
                    <Typography variant="h3">56,000</Typography>
                  </Card>
                </Grid>
                <Grid item xs={12} sm={12} md={6}>
                  <Card
                    sx={{
                      height: "150px",
                      backgroundColor: "#2196f3",
                      textAlign: "center",
                      display: "flex",
                      flexDirection: "column",
                      justifyContent: "center",
                      alignItems: "center",
                    }}
                  >
                    <Typography variant="h4">Total Entries</Typography>
                    <Typography variant="h3">56,000</Typography>
                  </Card>
                </Grid>
                <Grid container sx={{ mt: 3, marginLeft: 2 }}>
                  <Grid item xs={12} sm={12} md={6}>
                    <Card
                      sx={{
                        height: "300px",
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
    </ThemeProvider>
  );
};

export default Dashboard;
