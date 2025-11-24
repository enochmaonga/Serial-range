import {
  Box,
  Button,
  Container,
  CssBaseline,
  Stack,
  ThemeProvider,
  Typography,
  createTheme,
  styled,
  useMediaQuery,
  useTheme,
} from "@mui/material";
import React from "react";
import NextLink from "next/link";
import Image from "next/image";

const theme = createTheme({
  palette: {
    background: {
      default: "#F5F5F5",
    },
  },
});

const ActionButton = styled(Button)(({ theme }) => ({
  borderRadius: 12,
  paddingLeft: 32,
  paddingRight: 32,
  textTransform: "none",
  fontWeight: 600,
  borderWidth: 2,
  "&:hover": {
    borderWidth: 2,
  },
}));

export default function Home() {
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down("md"));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />

      <Container
        maxWidth="md"
        sx={{
          minHeight: "100vh",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          textAlign: "center",
          py: 6,
        }}
      >
        <Box sx={{ mb: 4 }}>
          <Image
            src="/safaricom-logo1.png"
            width={300}
            height={60}
            alt="Retail System Logo"
          />
        </Box>
        <Typography
          variant={isMobile ? "h5" : "h4"}
          fontWeight={700}
          sx={{ mb: 1 }}
        >
          Retail Operations Efficiency Tools
        </Typography>

        <Typography
          variant={isMobile ? "body1" : "h6"}
          sx={{ color: "text.secondary", mb: 6, px: 2 }}
        >
          Simple. Fast. Reliable Retail Tools for Daily Operations.
        </Typography>
        <Stack
          spacing={3}
          direction={isMobile ? "column" : "row"}
          sx={{ width: isMobile ? "100%" : "auto" }}
        >
          <NextLink href="/invoice-generator" passHref>
            <ActionButton
              variant="outlined"
              size={isMobile ? "medium" : "large"}
              sx={{ borderColor: "#1B5E20", color: "#1B5E20" }}
              fullWidth={isMobile}
            >
              Proforma Invoice
            </ActionButton>
          </NextLink>

          <NextLink href="/useSerials" passHref>
            <ActionButton
              variant="outlined"
              size={isMobile ? "medium" : "large"}
              sx={{ borderColor: "#1B5E20", color: "#1B5E20" }}
              fullWidth={isMobile}
            >
              Entry Form
            </ActionButton>
          </NextLink>

          <NextLink href="/login" passHref>
            <ActionButton
              variant="outlined"
              size={isMobile ? "medium" : "large"}
              sx={{ borderColor: "#1B5E20", color: "#1B5E20" }}
              fullWidth={isMobile}
            >
              Admin
            </ActionButton>
          </NextLink>
        </Stack>
      </Container>
    </ThemeProvider>
  );
}
