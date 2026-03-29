import React, { useState } from 'react';
import Button from '@mui/material/Button';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown';

const DropdownMenu = ({ label, menuItems }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const [subMenuAnchor, setSubMenuAnchor] = useState(null);
  const [subSubMenuAnchor, setSubSubMenuAnchor] = useState(null);

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSubMenuAnchor(null);
    setSubSubMenuAnchor(null);
  };

  const handleSubMenuOpen = (event) => {
    setSubMenuAnchor(event.currentTarget);
  };

  const handleSubMenuClose = () => {
    setSubMenuAnchor(null);
  };

  const handleSubSubMenuOpen = (event) => {
    setSubSubMenuAnchor(event.currentTarget);
  };

  const handleSubSubMenuClose = () => {
    setSubSubMenuAnchor(null);
  };

  const renderMenuItems = (items) => {
    return items.map((item, index) => {
      if (item.subMenu) {
        return (
          <MenuItem key={index} onClick={handleSubMenuOpen}>
            {item.label}
            <Menu
              anchorEl={subMenuAnchor}
              open={Boolean(subMenuAnchor)}
              onClose={handleSubMenuClose}
            >
              {renderMenuItems(item.subMenu)}
            </Menu>
          </MenuItem>
        );
      } else if (item.subSubMenu) {
        return (
          <MenuItem key={index} onClick={handleSubSubMenuOpen}>
            {item.label}
            <Menu
              anchorEl={subSubMenuAnchor}
              open={Boolean(subSubMenuAnchor)}
              onClose={handleSubSubMenuClose}
            >
              {renderMenuItems(item.subSubMenu)}
            </Menu>
          </MenuItem>
        );
      } else {
        return (
          <MenuItem key={index} onClick={handleMenuClose}>
            {item.label}
          </MenuItem>
        );
      }
    });
  };

  return (
    <>
      <Button
        color="inherit"
        endIcon={<ArrowDropDownIcon />}
        onClick={handleMenuOpen}
      >
        {label}
      </Button>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        {renderMenuItems(menuItems)}
      </Menu>
    </>
  );
};

export default DropdownMenu;