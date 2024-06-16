import React from "react";
import { styled } from "@mui/material/styles";
import Box from "@mui/material/Box";

const StyledPageSection = styled(Box)(({ theme }) => ({
  display: "flex",
  marginLeft: -24,
  marginRight: -24,
  [theme.breakpoints.down("md")]: {
    marginLeft: -16,
    marginRight: -16,
  },
}));

// eslint-disable-next-line react/display-name
const PageSection = React.forwardRef(
  ({ component = "section", ...rest }, ref) => (
    <StyledPageSection component={component} {...rest} ref={ref} />
  )
);

export default PageSection;