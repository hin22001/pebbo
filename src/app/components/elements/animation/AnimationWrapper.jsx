import React from "react";

export function useOnScreen(ref) {
  const [isIntersecting, setIntersecting] = React.useState(false);

  React.useEffect(() => {
    if (typeof IntersectionObserver === "undefined" || !ref?.current) return;
    const observer = new IntersectionObserver(([entry]) =>
      setIntersecting(entry?.isIntersecting ?? false),
    );
    observer.observe(ref.current);
    return () => observer.disconnect();
  }, [ref]);

  return isIntersecting;
}

export default function AnimationWrapper(props) {
  const { children, animationTrue, animationFalse } = props;

  const ref = React.useRef(null);
  const isVisible = useOnScreen(ref);
  const [isShownOnce, setIsShownOnce] = React.useState(false);

  React.useEffect(() => {
    if (isVisible && !isShownOnce) setIsShownOnce(true);
  }, [isVisible, isShownOnce]);

  return (
    <div ref={ref}>
      <div
        className={
          "animate__animated " +
          (isVisible || isShownOnce
            ? animationTrue || "animate__fadeIn"
            : animationFalse || "animate__fadeOut")
        }
      >
        {children}
      </div>
    </div>
  );
}
