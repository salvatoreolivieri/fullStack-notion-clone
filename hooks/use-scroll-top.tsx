import { useState, useEffect } from "react";

export const useScrollTop = (threshold = 10) => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    // Setter based on window scroll position
    const handleScroll = () =>
      window.scrollY > threshold ? setScrolled(true) : setScrolled(false);

    // Window listeners
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }),
    [threshold];

  return scrolled;
};
