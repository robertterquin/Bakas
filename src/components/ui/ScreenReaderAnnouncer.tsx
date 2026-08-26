import React from 'react';

interface ScreenReaderAnnouncerProps {
  announcement: string | null;
}

/**
 * Accessible ARIA Live Region for screen readers
 * Non-visual, announces dynamic spatial events, sync status, and hazard reports.
 */
export const ScreenReaderAnnouncer: React.FC<ScreenReaderAnnouncerProps> = ({ announcement }) => {
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {announcement}
    </div>
  );
};
