

import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import Container from "@mui/material/Container";

export default function TopBar() {
  return (
    <AppBar component="nav" position="relative" sx={{ boxShadow:'none', maxHeight: 40 }}>
      <Container>
        <Toolbar disableGutters>

        </Toolbar>
      </Container>
    </AppBar>
  );
}
