export default function Logo() {
  return (
    <span className="flex items-center gap-2.5 font-display text-xl font-extrabold tracking-tight">
      <span
        className="relative grid h-8 w-8 place-items-center rounded-lg border-2 border-ink bg-sky text-base shadow-pop-sm"
        aria-hidden="true"
      >
        J
        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full border-2 border-ink bg-pop" />
      </span>
      JobTrack
    </span>
  );
}
