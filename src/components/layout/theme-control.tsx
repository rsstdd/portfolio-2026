/**
 * The theme control: system, light, dark.
 *
 * A Server Component like everything else here. Three radio inputs, hidden but
 * focusable, read by `:root:has(#theme-dark:checked)` in design-tokens.css.
 * No `"use client"`, no `usePathname`, no storage API, no hydration.
 *
 * Radios rather than the single checkbox this replaces, because a checkbox can
 * only express "force dark". Someone whose operating system is set to dark had
 * no way back to light, and the system preference was ignored entirely.
 *
 * The limitation, stated on /colophon rather than left for someone to find: CSS
 * has nowhere to persist a choice. An explicit selection survives navigation
 * within a session and resets to "system" on reload. Fixing that needs
 * localStorage, which needs a client component, which costs more than the
 * defect does.
 *
 * Each input is wrapped with its own label rather than laid out as six flat
 * siblings. `peer-checked:` compiles to a general sibling combinator, so a flat
 * list would let the first checked radio style every label after it.
 */
const THEMES = [
  { id: "theme-system", label: "System" },
  { id: "theme-light", label: "Light" },
  { id: "theme-dark", label: "Dark" },
] as const;

export function ThemeControl() {
  return (
    <fieldset className="flex items-center gap-x-3 border-0 p-0">
      <legend className="sr-only">Theme</legend>

      {THEMES.map((theme) => (
        <span key={theme.id}>
          <input
            type="radio"
            name="theme"
            id={theme.id}
            defaultChecked={theme.id === "theme-system"}
            className="peer sr-only"
          />
          {/*
            The label is the visible control, so it carries the focus ring the
            visually hidden input would otherwise take with it offscreen.
          */}
          <label
            htmlFor={theme.id}
            className="cursor-pointer text-overline uppercase text-muted transition-colors duration-(--duration-fast) peer-checked:text-accent-text peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus hover:text-ink"
          >
            {theme.label}
          </label>
        </span>
      ))}
    </fieldset>
  );
}
