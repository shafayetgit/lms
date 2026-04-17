import { useState } from "react";
import { Menu, MenuItem, Button } from "@mui/material";
import { ArrowDropDown, KeyboardArrowDown } from "@mui/icons-material";
import CButton from "@/components/ui/CButton";

const NestedMenu = ({ items, anchorEl, handleClose, open }) => {
  return (
    <Menu anchorEl={anchorEl} open={open} onClose={handleClose}>
      {items.map((item, index) => (
        <MenuItemWithChildren key={index} item={item} handleClose={handleClose} />
      ))}
    </Menu>
  );
};

const MenuItemWithChildren = ({ item, handleClose }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleCloseSubmenu = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <MenuItem onClick={item.children ? handleOpen : handleClose}>
        {item.label}
      </MenuItem>
      {item.children && (
        <NestedMenu items={item.children} anchorEl={anchorEl} handleClose={handleCloseSubmenu} open={open} />
      )}
    </>
  );
};

const ReusableMenu = ({ menuItems, buttonLabel = "Menu" }) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <>
      <CButton label={buttonLabel} onClick={handleClick} endIcon={<KeyboardArrowDown />} />
      <NestedMenu items={menuItems} anchorEl={anchorEl} handleClose={handleClose} open={open} />
    </>
  );
};

export default ReusableMenu;


// example:
// const menuItems = [
//   { label: "Item 1" },
//   {
//     label: "Item 2",
//     children: [
//       { label: "Subitem 2.1" },
//       {
//         label: "Subitem 2.2",
//         children: [{ label: "Subitem 2.2.1" }, { label: "Subitem 2.2.2" }],
//       },
//     ],
//   },
// ];

// <DropdownMenu menuItems={menuItems} buttonLabel="Test" />