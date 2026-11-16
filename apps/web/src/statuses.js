// Tailwind only generates classes it can see written out in full, so each style is spelled out.
// Sticker style: a pastel fill per status. The navy border and text come from StatusBadge.
// These are the only colourful things on screen, so colour always means a status.
export const STATUS_STYLES = {
  Saved: "bg-slate-100",
  Applied: "bg-sky/50",
  Assessment: "bg-amber-200",
  Interview: "bg-violet-200",
  Offer: "bg-emerald-300",
  Rejected: "bg-red-200",
  Withdrawn: "bg-stone-200",
};
