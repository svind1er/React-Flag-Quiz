import React from "react";

const Button = ({ variant = "primary", size = "lg", text, onClick, className = "" }) => {
  // Base styles for the button
  const baseStyles = "font-semibold rounded-2xl focus:outline-none";

  // Variant styles for different button states
  const variantStyles = {
    primary: "bg-gray-300 text-gray-800",
    wrong: "bg-red-500 text-white",
    correct: "bg-green-500 text-white",
    active: "bg-blue-500 text-white",
  };

  // Size styles for different button sizes
  const sizeStyles = {
    sm: "px-3 py-1 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
  };

  // Return the button element
  return (
    <button
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.primary} ${sizeStyles[size] || sizeStyles.lg} ${className}`}
      onClick={onClick}
      aria-label={text}
    >
      {text}
    </button>
  );
};

export default Button;
