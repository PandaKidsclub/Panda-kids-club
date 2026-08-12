"use client";

import { useState } from "react";

export function ProfileButton() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="profile-control">
      <button
        className="profile-button"
        type="button"
        aria-label="Open profile placeholder"
        aria-expanded={isOpen}
        aria-controls="profile-placeholder-status"
        onBlur={() => setIsOpen(false)}
        onClick={() => setIsOpen((current) => !current)}
        onKeyDown={(event) => {
          if (event.key === "Escape") {
            setIsOpen(false);
          }
        }}
      >
        <span className="profile-button__avatar" aria-hidden="true" />
      </button>
      {isOpen ? (
        <span id="profile-placeholder-status" className="profile-control__status" role="status">
          Coming Soon
        </span>
      ) : null}
    </div>
  );
}
