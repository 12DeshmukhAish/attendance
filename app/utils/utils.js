import React from "react";

export function capitalize(str) {
  // Log the input value to debug
  console.log("Input to capitalize:", str);
  
  // Check if str is a string
  if (typeof str !== "string") {
    console.error("Expected a string but received:", typeof str);
    return "";
  }

  // Perform the capitalization
  return str.charAt(0).toUpperCase() + str.slice(1);
}
