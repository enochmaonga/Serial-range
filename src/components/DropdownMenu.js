import * as React from 'react';
import IconButton from '@mui/material/IconButton';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import { SERVER_URL } from '@/config';
import { useState } from 'react';

const options = [
  'Delete',
  'Deactivate',
  'Activate',
  
];

const ITEM_HEIGHT = 48;

function DropdownMenu({userId}) {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);
  const [selectedMenuOption, setSelectedMenuOption] = useState(null);


  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleMenuOptionClick = (option) => {
    setSelectedMenuOption(option);
  
    //Close the menuafter an option is selected
    setAnchorEl(null);
    // Perform action based on selected option
    // Implement logic for delete, deactivate, and activate as per your requirements
    switch (option) {
      case "Delete":
        if (userId) {
            handleConfirmDelete(userId)
        } else {
            console.error("No user selected");
            console.log("SelectedUser", userId);
        }
      
        break;
      case "Deactivate":
        if (userId) {
            handleDeactivateUser(userId);
        } else {
            console.error("No user Selected");
        }
        break;
      case "Activate":
        // handle activate logic
        break;
      default:
        break;
    }
  };

  const handleConfirmDelete = async (userId) => {
    try {
      // Send a request to delete the user using the selectedUserId
      const response = await fetch(`${SERVER_URL}/delete/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        console.log("User deleted successfully");
        // Refresh the user list or update the UI here
      } else {
        console.error("User deletion failed");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const handleDeactivateUser = async (userId) => {
    try {
      const response = await fetch(`${SERVER_URL}/deactivate/${userId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      if (response.status === 200) {
        console.log("User deactivated successfully");
        // Refresh the user list or update the UI here
      } else {
        console.error("User deactivation failed");
      }
    } catch (error) {
      console.error("Error deactivating user:", error);
    }
  };

  return (
    <div>
      <IconButton
        aria-label="more"
        id="long-button"
        aria-controls={open ? 'long-menu' : undefined}
        aria-expanded={open ? 'true' : undefined}
        aria-haspopup="true"
        onClick={handleClick}
      >
        <MoreVertIcon />
      </IconButton>
      <Menu
        id="long-menu"
        MenuListProps={{
          'aria-labelledby': 'long-button',
        }}
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          style: {
            maxHeight: ITEM_HEIGHT * 4.5,
            width: '20ch',
          },
        }}
      >
        {options.map((option) => (
          <MenuItem key={option} onClick={() => handleMenuOptionClick(option)}>
            {option}
          </MenuItem>
        ))}
      </Menu>
    </div>
  );
}
export default DropdownMenu;