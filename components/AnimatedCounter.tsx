'use client';

import { useEffect, useRef, useState } from 'react';

type AnimatedCounterProps = {
  value: number;
  duration?: number;
  formatterAction?: (value: number) => string;
};

export default function AnimatedCounter({
  value,
  duration = 1000,
  formatterAction,
}: AnimatedCounterProps) {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const initialTargetRef = useRef(Math.max(0, value));

  useEffect(() => {
    const startTime = performance.now();
    const startValue = 0;
    const targetValue = initialTargetRef.current;
    let frameId = 0;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - startTime;
      const progress = Math.min(elapsed / duration, 1);
      const currentValue = Math.round(startValue + (targetValue - startValue) * progress);
      setDisplayValue(currentValue);

      if (progress < 1) {
        frameId = requestAnimationFrame(animate);
      } else {
        setDisplayValue(targetValue);
        setHasAnimated(true);
      }
    };

    frameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(frameId);
    };
  }, [duration]);

  const resolvedValue = hasAnimated ? Math.max(0, value) : displayValue;
  const output = formatterAction ? formatterAction(resolvedValue) : resolvedValue.toString();

  return <span>{output}</span>;
}
