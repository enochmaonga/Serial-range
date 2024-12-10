// import { TextField } from "@mui/material";
// import { useState } from "react";

// const App = () => {
//   const [number, setNumber] = useState(100000);

//   const handleNumberChange = (event) => {
//     const value = event.target.value.replace(/,/g, ""); // Remove commas for calculation
//     const formattedValue = Number(value).toLocaleString(); // Format with commas
//     setNumber(value ? formattedValue : ""); // Update state
//   };

//   return (
//     <div>
//       <TextField
//         label="Formatted Number"
//         value={number}
//         onChange={handleNumberChange}
//         variant="outlined"
//         fullWidth
//       />
//     </div>
//   );
// };

// export default App;

import React from "react";
import Button from "@mui/material/Button"; // if using Material-UI

function InactiveButton({ text, isActive }) {
  return (
    <Button disabled={!isActive} variant="contained">
      {text}
    </Button>
  );
}

export default function App() {
  return (
    <div>
      <InactiveButton text="Inactive Button" isActive={false} />
      <InactiveButton text="Active Button" isActive={true} />
    </div>
  );
}
