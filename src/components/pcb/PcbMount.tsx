"use client";

import { forwardRef, useEffect, useImperativeHandle, useRef } from "react";
import type { PcbHandle } from "./pcbScene";

export type PcbMountRef = {
  setSelected: (id: string | null) => void;
  triggerEject: (id: string) => void;
};

export const PcbMount = forwardRef<PcbMountRef, { onSelect: (id: string) => void; onHover: (id: string | null) => void }>(
  function PcbMount({ onSelect, onHover }, ref) {
    const mountRef = useRef<HTMLDivElement>(null);
    const handleRef = useRef<PcbHandle | null>(null);
    const onSelectRef = useRef(onSelect);
    const onHoverRef = useRef(onHover);
    onSelectRef.current = onSelect;
    onHoverRef.current = onHover;

    useImperativeHandle(ref, () => ({
      setSelected: (id) => handleRef.current?.setSelected(id),
      triggerEject: (id) => handleRef.current?.triggerEject(id),
    }));

    useEffect(() => {
      const mount = mountRef.current;
      if (!mount) return;
      let cancelled = false;
      import("./pcbScene").then(({ initPcbScene }) => {
        if (cancelled || !mount) return;
        handleRef.current = initPcbScene(mount, {
          onSelect: (id) => onSelectRef.current(id),
          onHover: (id) => onHoverRef.current(id),
        });
      });
      return () => {
        cancelled = true;
        handleRef.current?.destroy();
        handleRef.current = null;
      };
    }, []);

    return <div ref={mountRef} style={{ width: "100%", height: "100%", touchAction: "none" }} />;
  }
);
