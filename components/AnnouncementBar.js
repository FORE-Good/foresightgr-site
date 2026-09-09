"use client";

import { useEffect, useState } from "react";

const ANNOUNCEMENT_DISMISS_KEY = "foresight-announcement-dismissed";

export default function AnnouncementBar() {
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    try {
      if (localStorage.getItem(ANNOUNCEMENT_DISMISS_KEY) === "true") {
        setVisible(false);
      }
    } catch {
      /* ignore */
    }
  }, []);

  function dismiss() {
    setVisible(false);
    try {
      localStorage.setItem(ANNOUNCEMENT_DISMISS_KEY, "true");
    } catch {
      /* ignore */
    }
  }

  if (!visible) return null;

  return (
    <div className="announcement-bar" id="announcementBar">
      <div className="wrap announcement-inner">
        <span>
          The FOREsight Intelligence Tool is in development - try it free until
          Oct 31 and help shape it.
        </span>
        <a
          className="announcement-link"
          href="https://app.foresightgr.com.au/"
          target="_blank"
          rel="noopener"
        >
          Try it now
        </a>
        <button
          className="announcement-close"
          id="announcementClose"
          aria-label="Dismiss"
          onClick={dismiss}
          type="button"
        >
          &times;
        </button>
      </div>
    </div>
  );
}
