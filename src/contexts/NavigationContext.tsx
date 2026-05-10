"use client";

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { Box } from "@mui/material";

const NavigationContext = createContext<{ setNavigating: (v: boolean) => void } | null>(null);

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  return ctx?.setNavigating ?? (() => {});
}

export function NavigationProvider({ children }: { children: React.ReactNode }) {
  const [isNavigating, setIsNavigating] = useState(false);
  const pathname = usePathname();
  const prevPathname = useRef(pathname);

  const setNavigating = useCallback((v: boolean) => {
    setIsNavigating(v);
  }, []);

  useEffect(() => {
    if (pathname !== prevPathname.current) {
      prevPathname.current = pathname;
      setIsNavigating(false);
    }
  }, [pathname]);

  return (
    <NavigationContext.Provider value={{ setNavigating }}>
      {children}
      {isNavigating && (
        <Box
          sx={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            height: 3,
            bgcolor: "primary.main",
            zIndex: 9999,
            animation: "nav-progress 1.2s ease-in-out infinite",
            "@keyframes nav-progress": {
              "0%": { transform: "translateX(-100%)" },
              "50%": { transform: "translateX(0%)" },
              "100%": { transform: "translateX(100%)" },
            },
          }}
        />
      )}
    </NavigationContext.Provider>
  );
}
