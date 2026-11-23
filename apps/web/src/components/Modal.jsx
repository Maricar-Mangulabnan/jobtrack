import { useEffect, useId } from "react";

export default function Modal({
  title,
  onClose,
  closeOnBackdrop = true,
  width = "max-w-2xl",
  children,
}) {
  const titleId = useId(); // for aria-labelledby, so screen readers know what the title is
  // Close on Escape, and stop the page behind from scrolling while the modal is open.
  useEffect(() => {
    const onKey = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      // Cleanup: undo everything when the modal closes.
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = previous;
    };
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-ink/40">
      {/* min-h-full: centres the box when it is short, and grows with it when it is tall. */}
      <div
        className="flex min-h-full items-center justify-center p-4 sm:p-8"
        // mousedown, not click: dragging to select text and releasing outside should not close it.
        onMouseDown={(e) => {
          if (closeOnBackdrop && e.target === e.currentTarget) onClose();
        }}
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby={titleId}
          className={`card w-full ${width} p-6 shadow-xl`}
        >
          <div className="mb-4 flex items-center justify-between">
            <h2 id={titleId} className="text-xl font-semibold">
              {title}
            </h2>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close"
              className="rounded-md px-2 py-1 text-ink-soft hover:bg-paper hover:text-ink"
            >
              ✕
            </button>
          </div>
          {children}
        </div>
      </div>
    </div>
  );
}
