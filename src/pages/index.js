import { Box, Button, Container, Grid, Stack, Typography, styled, useMediaQuery, useTheme } from "@mui/material";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import PageSection from "@/components/PageSection";
import PageContainer from "@/components/PageContainer";
import Image from "next/image";
// import PageSection from "./PageSection";
// import PageContainer from "./PageContainer";


const StyledTypographyHeading = styled(Typography)(() => ({
  marginBottom: 20,
  textAlign: "center",
}));

const StyledTypographyContent = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  textAlign: "center",
  [theme.breakpoints.down("md")]: {
    fontSize: 14,
  },
}));

const StyledTypographyItalic = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  fontStyle: "italic",
  [theme.breakpoints.down("md")]: {
    fontSize: 14,
  },
}));

const SectionOneButtonWrapper = styled(Box)(() => ({
  display: "flex",
  justifyContent: "center",
  paddingLeft: 24,
  paddingRight: 24,
  marginTop: 50,
}));
function Home() {
  const themeDefinitions = useTheme();
  const isMobile = useMediaQuery(themeDefinitions.breakpoints.down("md"));
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Make an API call to your Node.js server
    fetch('http://localhost:3001/api/someEndpoint')
      .then((response) => response.json())
      .then((data) => {
        setMessage(data.message);
      })
      .catch((error) => {
        console.error('Error fetching data:', error);
      });
  }, []);
  return (
    <PageSection component="section">
    <PageContainer
      sx={(theme) => ({
        mt: 15,
        mb: 30,
        pt: 0,
        pb: 0,
        [theme.breakpoints.down("md")]: {
          mt: 5,
          mb: 8,
        },
      })}
    >
       <Grid
        sx={{
          textAlign: "center", // Center the form horizontally
          marginLeft: "auto",
          marginRight: "auto", // Set margin left and right to "auto" for centering
          maxWidth: "40%",
        }}
      >
        <Grid item md={2} sx={{ mt: 0 }}>
          <Image src={"/logo.png"} width={80} height={80} alt="church Logo" />
        </Grid>
        <Grid item md={10}>
          <Typography
            style={{
              alignContent: "center",
              textAlign: "center",
            }}
            variant="h6"
          >
            Seventh Day Adventist Church
          </Typography>
          <Typography
            style={{
              alignContent: "center",
              textAlign: "center",
              marginTop: "5px",
            }}
            variant="h6"
          >
            Kisii Central
          </Typography>
          
        </Grid>
      </Grid>
  
    <Grid container spacing={2}>
      <Grid item lg={3} />
      <Grid item lg={6} xl={6} sm={12} xs={12}>
        <StyledTypographyHeading variant="h1" color="#283593">
          Welcome to Kisii Central SDA Church
        </StyledTypographyHeading>
        <StyledTypographyContent variant="body1">
        The mission of the Seventh-day Adventist Church:{" "}
          <StyledTypographyItalic
            variant="body1"
            color="primary"
            component="span"
          >
            to call all people to become disciples of Jesus Christ, 
          </StyledTypographyItalic>{" "}
          to proclaim the everlasting gospel embraced by the three angels&apos; messages {" "}
          <StyledTypographyItalic
            variant="body1"
            color="primary"
            component="span"
          >
          (Revelation 14:6-12),
          </StyledTypographyItalic>{" "}
          and to prepare the world{" "}
          <StyledTypographyItalic
            variant="body1"
            color="primary"
            component="span"
          >
       for Christ&apos;s
          </StyledTypographyItalic>{" "}
          soon return.
        </StyledTypographyContent>
        <SectionOneButtonWrapper>
          <Stack direction="row" spacing={5}>
          <NextLink href="/cars" passHref>
            <Button
              variant="outlined"
              size={isMobile ? "small" : "large"}
            >
             Car Registration
            </Button>
          </NextLink>
          <NextLink href="/form" passHref>
            <Button
              variant="outlined"
              size={isMobile ? "small" : "large"}
            >
             Regular Registration
            </Button>
          </NextLink>
        </Stack>
      </SectionOneButtonWrapper>
    </Grid>
    </Grid>
 </PageContainer>
 </PageSection>
  )
}

export default Home;