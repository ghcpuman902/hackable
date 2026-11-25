"use client";

import { useEffect, useRef, type KeyboardEvent, type MouseEvent, type ReactNode } from "react";

export function ModalDialog({ shown, onClose, titleId, className, children }: {
  shown: boolean;
  onClose: () => void;
  titleId: string;
  className: string;
  children: ReactNode;
}) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (shown && !dialog.open) dialog.showModal();
    if (!shown && dialog.open) dialog.close();
  }, [shown]);

  const onKeyDown = (event: KeyboardEvent<HTMLDialogElement>) => {
    if (event.key !== "Tab") return;
    const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>("button, a[href]"));
    if (!items.length) return;
    const [first] = items;
    const last = items.at(-1)!;
    const active = document.activeElement;
    if (event.shiftKey && (active === first || !event.currentTarget.contains(active))) { event.preventDefault(); last.focus(); }
    else if (!event.shiftKey && (active === last || !event.currentTarget.contains(active))) { event.preventDefault(); first.focus(); }
  };

  const onBackdrop = (event: MouseEvent<HTMLDialogElement>) => {
    if (event.target === event.currentTarget) onClose();
  };

  return <dialog ref={ref} className={className} aria-labelledby={titleId} aria-modal="true"
    onKeyDown={onKeyDown} onClick={onBackdrop} onCancel={(event) => { event.preventDefault(); onClose(); }} onClose={() => { if (shown) onClose(); }}>
    {children}
  </dialog>;
}
