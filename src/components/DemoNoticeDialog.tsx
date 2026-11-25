"use client";
/* The one dialog behind every Subscribe button. Hackable is a hackathon demo and takes no email addresses, so this
   points to the author's other projects and the LinkedIn post. Nothing is stored or sent. */

import { ArrowUpRight, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { demoNoticeLinks, LINKEDIN_POST_URL } from "@/lib/site-config";
import { ModalDialog } from "./ModalDialog";
import "./demo-notice-dialog.css";

type DemoNotice = { open: (opener?: HTMLElement | null) => void };

const DemoNoticeContext = createContext<DemoNotice | null>(null);

export function useDemoNotice(): DemoNotice {
  const ctx = useContext(DemoNoticeContext);
  if (!ctx) throw new Error("useDemoNotice needs a DemoNoticeProvider above it");
  return ctx;
}

/* Holds the single open state and renders the dialog once, so every opener shares it. */
export function DemoNoticeProvider({ children }: { children: ReactNode }) {
  const [shown, setShown] = useState(false);
  const opener = useRef<HTMLElement | null>(null);
  const open = useCallback((from?: HTMLElement | null) => {
    opener.current = from ?? (document.activeElement instanceof HTMLElement ? document.activeElement : null);
    setShown(true);
  }, []);
  const close = useCallback(() => {
    setShown(false);
    const back = opener.current;
    opener.current = null;
    /* The dialog is still in the top layer for this frame; focus goes back once it has closed. */
    if (back?.isConnected) requestAnimationFrame(() => back.focus());
  }, []);
  const value = useMemo(() => ({ open }), [open]);
  return (
    <DemoNoticeContext.Provider value={value}>
      {children}
      <DemoNoticeDialog shown={shown} onClose={close} />
    </DemoNoticeContext.Provider>
  );
}

function DemoNoticeDialog({ shown, onClose }: { shown: boolean; onClose: () => void }) {
  const links = demoNoticeLinks();
  return (
    <ModalDialog shown={shown} onClose={onClose} titleId="demo-notice-title" className="demo-notice">
      <div className="demo-notice-panel">
        <button type="button" className="demo-notice-close" aria-label="Close" onClick={onClose}>
          <X size={20} aria-hidden="true" />
        </button>
        <h2 id="demo-notice-title">Hackable is a hackathon demo</h2>
        <p>
          {LINKEDIN_POST_URL.trim() !== ""
            ? "We're not taking emails yet. Here's more I've made, and the LinkedIn post about this project, where a comment would be a big help."
            : "We're not taking emails yet. Here's more I've made in the meantime."}
        </p>
        <div className="demo-notice-links">
          {links.map((l) => (
            <a key={l.href} className="pill" href={l.href} target="_blank" rel="noopener noreferrer">
              {l.label}
              <ArrowUpRight size={18} aria-hidden="true" />
            </a>
          ))}
        </div>
      </div>
    </ModalDialog>
  );
}

/* A button that opens the dialog; it keeps its own place so focus can come back to it. */
export function DemoNoticeButton({ className, children }: { className?: string; children: ReactNode }) {
  const { open } = useDemoNotice();
  return (
    <button type="button" className={className} onClick={(e) => open(e.currentTarget)}>
      {children}
    </button>
  );
}
