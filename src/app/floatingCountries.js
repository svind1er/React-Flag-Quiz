"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const countries = [
  "Afghanistan", "Albania", "Algeria", "Argentina", "Australia",
  "Austria", "Bangladesh", "Belgium", "Brazil", "Canada", "China",
  "Denmark", "Egypt", "France", "Germany", "India", "Indonesia",
  "Ireland", "Italy", "Japan", "Kenya", "Malaysia", "Mexico",
  "Netherlands", "Nigeria", "Norway", "Pakistan", "Philippines",
  "Poland", "Portugal", "Russia", "South Africa", "Spain",
  "Sweden", "Switzerland", "Thailand", "Turkey", "United Kingdom",
  "United States", "Vietnam", "Zambia", "Zimbabwe"
];

export default function FloatingCountries() {
  const [positions, setPositions] = useState([]);

  useEffect(() => {
    setPositions(
      countries.map(() => ({
        top: `${Math.random() * 100}vh`,
        left: `${Math.random() * 100}vw`,
        duration: Math.random() * 10 + 5,
      }))
    );
  }, []);

  return (
    <div className="floating-container">
      {positions.length > 0 &&
        countries.map((country, index) => (
          <motion.div
            key={index}
            className="floating-text"
            initial={{ opacity: 0 }}
            animate={{
              opacity: 1,
              x: [0, Math.random() * 100 - 50, 0],
              y: [0, Math.random() * 100 - 50, 0],
            }}
            transition={{
              duration: positions[index].duration,
              repeat: Infinity,
              repeatType: "mirror",
              ease: "easeInOut",
            }}
            style={{
              position: "absolute",
              top: positions[index].top,
              left: positions[index].left,
            }}
          >
            {country}
          </motion.div>
        ))}
    </div>
  );
}
