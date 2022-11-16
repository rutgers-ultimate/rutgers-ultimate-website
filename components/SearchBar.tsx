import React, { useState } from "react";
import { Container, IconButton, Stack, TextField } from "@mui/material";
import { Search } from "@mui/icons-material";

export default function SearchBar(props: {
  label?: string;
  onSubmit?: (value: string) => void;
  onChange?: (value: string) => void;
}): React.ReactElement {
  const [searchValue, setSearchValue] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchValue(e.target.value);
    if (props.onChange) {
      props.onChange(e.target.value);
    }
  };

  const handleSubmit = () => {
    if (props.onSubmit) {
      props.onSubmit(searchValue);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit();
    }
  };

  return (
    <Container sx={{ padding: 2 }}>
      <Stack direction={"row"} spacing={1}>
        <TextField
          label={props.label ?? "Search"}
          onKeyDown={handleKeyDown}
          onChange={handleChange}
          value={searchValue}
          fullWidth
        />
        {props.onSubmit && (
          <IconButton sx={{ minWidth: 55 }} onClick={handleSubmit}>
            <Search />
          </IconButton>
        )}
      </Stack>
    </Container>
  );
}
