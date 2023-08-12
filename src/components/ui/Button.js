import { IconButton } from "@mui/material";

export const Button = ({ onClick, Icon, disabled }) => (
  <IconButton onClick={onClick} disabled={disabled}>
    <Icon
      style={{
        color: disabled ? "#ccc" : "black",
        fontSize: 42,
      }}
    />
  </IconButton>
);
