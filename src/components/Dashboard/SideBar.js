import React, { useEffect, useState } from "react";
import Drawer from "@mui/material/Drawer";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import { Box, Typography, Chip, Button, Divider, Avatar } from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/router";
import { AiOutlineHome } from "react-icons/ai";
import { TbUsers } from "react-icons/tb";
import { RiAdminLine, RiDatabaseLine } from "react-icons/ri";
import { FaCloudUploadAlt, FaSimCard, FaBoxes } from "react-icons/fa";
import { IoLogOutOutline } from "react-icons/io5";
import { getUser, logout } from "@/utils/auth";

const DRAWER_WIDTH = 250;

const ALL_NAV_ITEMS = [
  { label: "Home", href: "/", icon: <AiOutlineHome size={20} />, adminOnly: false },
  { label: "Issue Airtime", href: "/useSerials", icon: <FaSimCard size={18} />, adminOnly: false },
  { label: "Upload Serials", href: "/upload", icon: <FaCloudUploadAlt size={20} />, adminOnly: true },
  { label: "Stock Inventory", href: "/getserials", icon: <FaBoxes size={18} />, adminOnly: false },
  { label: "Audit Reports", href: "/seriallist", icon: <RiDatabaseLine size={20} />, adminOnly: true },
  { label: "Admin Panel", href: "/dashboard", icon: <RiAdminLine size={20} />, adminOnly: true },
  { label: "User Management", href: "/users", icon: <TbUsers size={20} />, adminOnly: true },
];

const Sidebar = () => {
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState(null);

  useEffect(() => {
    setCurrentUser(getUser());
  }, []);

  const handleLogout = () => {
    logout(router);
  };

  const isAdmin = currentUser?.isAdmin;

  // Filter items: only admin can see adminOnly items; regular users see others
  const visibleNavItems = ALL_NAV_ITEMS.filter((item) => {
    if (item.adminOnly) {
      return isAdmin;
    }
    return true;
  });

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      sx={{
        width: DRAWER_WIDTH,
        flexShrink: 0,
        "& .MuiDrawer-paper": {
          width: DRAWER_WIDTH,
          boxSizing: "border-box",
          bgcolor: "#0F172A",
          color: "#94A3B8",
          borderRight: "1px solid #1E293B",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
        },
      }}
    >
      <Box>
        {/* Brand Header */}
        <Box sx={{ p: 3, borderBottom: "1px solid #1E293B", display: "flex", alignItems: "center", gap: 1.5 }}>
          <Image
            src="/safaricom-logo1.png"
            alt="Safaricom Logo"
            width={150}
            height={32}
            style={{ filter: "brightness(0) invert(1)" }}
            priority
          />
        </Box>

        {/* Nav Links */}
        <List sx={{ px: 1.5, py: 2 }}>
          {visibleNavItems.map((item) => {
            const isActive = router.pathname === item.href;
            return (
              <ListItem key={item.href} disablePadding sx={{ mb: 0.5 }}>
                <Link href={item.href} passHref style={{ width: "100%", textDecoration: "none" }}>
                  <ListItemButton
                    sx={{
                      borderRadius: 2,
                      py: 1.2,
                      px: 2,
                      bgcolor: isActive ? "#107C41" : "transparent",
                      color: isActive ? "#FFFFFF" : "#94A3B8",
                      "&:hover": {
                        bgcolor: isActive ? "#0B532B" : "#1E293B",
                        color: "#FFFFFF",
                      },
                    }}
                  >
                    <ListItemIcon
                      sx={{
                        minWidth: 36,
                        color: isActive ? "#FFFFFF" : "#64748B",
                      }}
                    >
                      {item.icon}
                    </ListItemIcon>
                    <ListItemText
                      primary={item.label}
                      primaryTypographyProps={{
                        fontSize: "0.875rem",
                        fontWeight: isActive ? 700 : 500,
                      }}
                    />
                  </ListItemButton>
                </Link>
              </ListItem>
            );
          })}
        </List>
      </Box>

      {/* User Session Footer */}
      <Box sx={{ p: 2, borderTop: "1px solid #1E293B", bgcolor: "#0A0F1D" }}>
        {currentUser ? (
          <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
            <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
              <Avatar
                sx={{
                  width: 36,
                  height: 36,
                  bgcolor: isAdmin ? "#107C41" : "#0284C7",
                  fontSize: "0.9rem",
                  fontWeight: 700,
                }}
              >
                {currentUser.username ? currentUser.username[0].toUpperCase() : "U"}
              </Avatar>
              <Box sx={{ overflow: "hidden", flex: 1 }}>
                <Typography
                  variant="subtitle2"
                  sx={{ color: "#FFFFFF", fontWeight: 700, whiteSpace: "nowrap", textOverflow: "ellipsis", overflow: "hidden" }}
                >
                  {currentUser.username}
                </Typography>
                <Chip
                  label={isAdmin ? "ADMIN" : "ISSUER"}
                  size="small"
                  sx={{
                    height: 18,
                    fontSize: "0.65rem",
                    fontWeight: 700,
                    bgcolor: isAdmin ? "rgba(16, 124, 65, 0.2)" : "rgba(2, 132, 199, 0.2)",
                    color: isAdmin ? "#4ADE80" : "#38BDF8",
                    border: `1px solid ${isAdmin ? "rgba(16, 124, 65, 0.4)" : "rgba(2, 132, 199, 0.4)"}`,
                  }}
                />
              </Box>
            </Box>
            <Button
              variant="outlined"
              size="small"
              fullWidth
              onClick={handleLogout}
              startIcon={<IoLogOutOutline />}
              sx={{
                borderColor: "#334155",
                color: "#94A3B8",
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.8rem",
                "&:hover": {
                  borderColor: "#EF4444",
                  color: "#EF4444",
                  bgcolor: "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              Sign Out
            </Button>
          </Box>
        ) : (
          <Button
            variant="contained"
            fullWidth
            component={Link}
            href="/login"
            sx={{
              bgcolor: "#107C41",
              textTransform: "none",
              fontWeight: 700,
              "&:hover": { bgcolor: "#0B532B" },
            }}
          >
            Sign In
          </Button>
        )}
      </Box>
    </Drawer>
  );
};

export default Sidebar;
