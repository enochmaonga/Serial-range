import {
  Box,
  Button,
  Container,
  CssBaseline,
  Grid,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React, { useEffect, useState } from "react";
import NextLink from "next/link";
import PageSection from "@/components/PageSection";
import PageContainer from "@/components/PageContainer";
import Image from "next/image";

const theme = createTheme({
  palette: {
    background: {
      default: "#EEEEEE", // Set your desired background color here
    },
  },
});

const StyledTypographyHeading = styled(Typography)(() => ({
  marginBottom: 20,
  marginTop: 30,
  textAlign: "center",
  [theme.breakpoints.down("md")]: {
    fontSize: 30,
  },
}));

const StyledTypographyContent = styled(Typography)(({ theme }) => ({
  fontSize: 24,
  textAlign: "center",

  [theme.breakpoints.down("md")]: {
    fontSize: 14,
    marginLeft: "40px",
    marginRight: "40px",
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
  const [message, setMessage] = useState("");

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <PageSection component="section">
        <PageContainer
          sx={(theme) => ({
            mt: 5,
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
            <Grid item xs={12} md={2} sx={{ mt: 10 }}>
              <Image
                src={"/safaricom-logo1.png"}
                width={320}
                height={60}
                alt="church Logo"
              />
            </Grid>
          </Grid>

          <Grid container spacing={2}>
            <Grid item lg={3} />
            <Grid item lg={6} xl={6} sm={12} xs={12}>
              {/* <StyledTypographyHeading variant="h3" color="#1B5E20">
                Welcome to Safaricom Kisii
              </StyledTypographyHeading>
              <StyledTypographyContent variant="body1">
                The mission of the Seventh-day Adventist Church:{" "}
                <StyledTypographyItalic
                  variant="body1"
                  color="#1B5E20"
                  component="span"
                >
                  to call all people to become disciples of Jesus Christ,
                </StyledTypographyItalic>{" "}
                to proclaim the everlasting gospel embraced by the three
                angels&apos; messages{" "}
                <StyledTypographyItalic
                  variant="body1"
                  color="#1B5E20"
                  component="span"
                >
                  (Revelation 14:6-12),
                </StyledTypographyItalic>{" "}
                and to prepare the world{" "}
                <StyledTypographyItalic
                  variant="body1"
                  color="#1B5E20"
                  component="span"
                >
                  for Christ&apos;s
                </StyledTypographyItalic>{" "}
                soon return.
              </StyledTypographyContent> */}
              <SectionOneButtonWrapper>
                <Stack direction="row" spacing={5}>
                  <NextLink href="/useSerials" passHref>
                    <Button
                      variant="outlined"
                      size={isMobile ? "small" : "large"}
                      style={{ color: "#1B5E20" }}
                    >
                      Entry Form
                    </Button>
                  </NextLink>
                  <NextLink href="/login" passHref>
                    <Button
                      variant="outlined"
                      size={isMobile ? "small" : "large"}
                      style={{ color: "#1B5E20" }}
                    >
                      Admin
                    </Button>
                  </NextLink>
                </Stack>
              </SectionOneButtonWrapper>
            </Grid>
          </Grid>
        </PageContainer>
      </PageSection>
    </ThemeProvider>
  );
}

export default Home;
