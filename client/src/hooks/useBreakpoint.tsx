import { useState, useEffect } from "react";

const useBreakpoint = (breakpoint = 768) => {
  const [isAboveBreakpoint, setIsAboveBreakpoint] = useState(
    window.innerWidth > breakpoint
  );

  useEffect(() => {
    const handleResize = () =>
      setIsAboveBreakpoint(window.innerWidth > breakpoint);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [breakpoint]);

  return isAboveBreakpoint;
};

export default useBreakpoint;
