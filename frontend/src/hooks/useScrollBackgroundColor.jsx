"use client";

import { useState, useEffect } from "react";
import { useSelector } from "react-redux";

const light = [
  "#FFFFFF", // Pure White
  "#F0F4F8", // Soft Cool Blue-Gray
  "#E8F0FE", // Very Light Professional Blue
  "#F3F0FF", // Very Light Lavender
  "#FDF6E3", // Soft Warm Cream
  "#F0FAF5", // Refreshing Light Mint
  "#FFFFFF", // Pure White (repeat)
];

const dark = [
  "#0A0A0A", // Obsidian Black
  "#121826", // Deep Navy
  "#1A1625", // Deep Royal Charcoal
  "#201A18", // Deep Warm Charcoal
  "#12201D", // Deep Forest Black
  "#0D1117", // Rich GitHub Dark
  "#0A0A0A", // Obsidian Black (repeat)
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
