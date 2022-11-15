import React from "react";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Link from "next/link";

export default function MdPages(props: {
  pages: string[];
  handleCloseNavMenu: () => void;
}): React.ReactElement {
  return (
    <Box sx={{ flexGrow: 1, display: { xs: "none", md: "flex" } }}>
      {props.pages.map((page) => (
        <Button
          key={page}
          onClick={props.handleCloseNavMenu}
          sx={{ my: 2, color: "white", display: "block" }}
        >
          <Link href={`/${page.toLowerCase()}`}>{page}</Link>
        </Button>
      ))}
    </Box>
  );
}
