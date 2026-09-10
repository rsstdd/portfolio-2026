import { MoonMark, SunMark, SystemMark } from "@/components/ui";

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
 *
 * The ids are load-bearing and must not be renamed. `design-tokens.css` selects
 * on `#theme-dark:checked` and `#theme-system:checked` directly, so a rename
 * would leave a control that looks correct and switches nothing.
 *
 * The visible label used to be the word, and the word was therefore also the
 * radio's accessible name. Now that the visible part is a glyph, the word stays
 * in the DOM as `sr-only`: without it these would be three unnamed radios, and
 * a sun is only obvious to someone who can see it.
 */
const THEMES = [
  { id: "theme-system", label: "System", Mark: SystemMark },
  { id: "theme-light", label: "Light", Mark: SunMark },
  { id: "theme-dark", label: "Dark", Mark: MoonMark },
] as const;

export function ThemeControl() {
  return (
    <fieldset className="flex items-center gap-x-1 border-0 p-0">
      <legend className="sr-only">Theme</legend>

      {THEMES.map(({ id, label, Mark }) => (
        <span key={id}>
          <input
            type="radio"
            name="theme"
            id={id}
            defaultChecked={id === "theme-system"}
            className="peer sr-only"
          />
          {/*
            The label is the visible control, so it carries the focus ring the
            visually hidden input would otherwise take with it offscreen.

            The padding is a hit area rather than spacing: a 20px glyph is under
            the comfortable touch target, and padding reaches it without pushing
            the glyphs apart, which is why the fieldset gap tightened to match.
          */}
          <label
            htmlFor={id}
            className="flex cursor-pointer items-center rounded-xs p-1 text-muted transition-colors duration-(--duration-fast) peer-checked:text-accent-text peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus hover:text-ink"
          >
            <Mark />
            <span className="sr-only">{label}</span>
          </label>
        </span>
      ))}
    </fieldset>
  );
}
