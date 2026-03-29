"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const light = [
  "#FFFFFF", // Soft Pink
  "#fdeef3", // Soft Rose
  "#f5f0fc", // Soft Lavender
  "#edf7ff", // Soft Sky Blue
  "#eaf7ed", // Soft Mint Green
  "#fff4ec", // Soft Peach
  "#fff5f5", // Soft Pink (repeat)
];

const dark = [
  "#1F1315", // Deep Burgundy
  "#1F121B", // Deep Maroon
  "#1B141D", // Deep Eggplant
  "#0F1720", // Deep Navy
  "#0D1912", // Deep Forest Green
  "#1F1206", // Deep Brown
  "#1F1315", // Deep Burgundy (repeat)
];

const useScrollBackgroundColor = () => {
  // const themeMode = useSelector((state) => state.app.mode);
  const themeMode = 'light'; //
  const colors = themeMode === "dark" ? dark : light;

  const [bgColor, setBgColor] = useState(colors[0]);

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const scrollHeight =
        document.documentElement.scrollHeight - window.innerHeight;
      const scrollFraction = scrollTop / scrollHeight;
      const colorIndex = Math.min(
        Math.floor(scrollFraction * colors.length),
        colors.length - 1
      );
      setBgColor(colors[colorIndex]);
    };

    window.addEventListener("scroll", handleScroll);

    // Apply the background color and smooth transition effect to the body
    document.body.style.transition = "background-color 1.5s ease";
    document.body.style.backgroundColor = bgColor;

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [bgColor, colors, themeMode]); // Re-run whenever bgColor or colors change

  useEffect(() => {
    setBgColor(colors[0]);
  }, [themeMode]);

  return bgColor;
};

export default useScrollBackgroundColor;
