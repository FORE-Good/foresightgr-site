"use client";

import { useEffect, useState } from "react";

const ANNOUNCEMENT_DISMISS_KEY = "foresight-announcement-dismissed-gr101";
const WEBINAR_LINK =
  "https://events.humanitix.com/government-relations-101-what-every-for-purpose-leader-needs-to-know";

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
          Free webinar: Government Relations 101 for for-purpose leaders
        </span>
        <a
          className="announcement-link"
          href={WEBINAR_LINK}
          target="_blank"
          rel="noopener"
        >
          Register free
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
