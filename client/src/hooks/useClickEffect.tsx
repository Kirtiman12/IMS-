import { useState } from "react";

const useClickEffect = (
  animationType: "click-press" | "press-mobile" = "click-press"
) => {
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 200); // Matches 0.2s animation
  };

  return {
    isClicked,
    handleClick,
    clickClass: isClicked ? animationType : "",
  };
};

export default useClickEffect;

// This hook manages a click effect animation. It provides a function to trigger the animation and a class name to apply the animation style. The animation lasts for 0.2 seconds, after which the state resets.
