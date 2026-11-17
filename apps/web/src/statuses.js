// Tailwind only generates classes it can see written out in full, so each style is spelled out.
// A soft fill, a darker text colour, and a thin ring. These are the only colourful
// things on screen, so colour always means a status.
export const STATUS_STYLES = {
  Saved: "bg-slate-100 text-slate-700 ring-slate-300",
  Applied: "bg-sky-100 text-sky-800 ring-sky-300",
  Assessment: "bg-amber-50 text-amber-800 ring-amber-300",
  Interview: "bg-violet-50 text-violet-700 ring-violet-300",
  Offer: "bg-emerald-50 text-emerald-700 ring-emerald-300",
  Rejected: "bg-red-50 text-red-700 ring-red-300",
  Withdrawn: "bg-stone-100 text-stone-600 ring-stone-300",
};
