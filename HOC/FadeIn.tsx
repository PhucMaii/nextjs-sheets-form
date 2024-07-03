import React, { ReactNode, useEffect, useState } from 'react';

export default function FadeIn({ children }: { children: ReactNode }) {
  const [fadeIn, setFadeIn] = useState<boolean>(false);

  useEffect(() => {
    setFadeIn(true);
  });

  return (
    <div
      className={`transition-opacity duration-700 ease-in ${
        fadeIn ? 'opacity-100' : 'opacity-0'
      }`}
    >
      {children}
    </div>
  );
}
