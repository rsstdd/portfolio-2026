import { MoonMark, SunMark, SystemMark } from "@/components/ui";

/**
 * CSS owns the visible theme switch. The inline script only restores and stores
 * the choice, which keeps this a Server Component with no hydration boundary.
 * It starts in the document head, then observes the parser long enough to align
 * the checked radio before the browser can render the control.
 */
const THEME_STORAGE_KEY = "theme";

export const THEME_SCRIPT = `(() => {
  const root = document.documentElement;

  try {
    const theme = localStorage.getItem("${THEME_STORAGE_KEY}");
    if (theme === "light" || theme === "dark") {
      root.dataset.theme = theme;
    } else {
      root.removeAttribute("data-theme");
      localStorage.removeItem("${THEME_STORAGE_KEY}");
    }
  } catch {}

  const syncControl = () => {
    const restoredTheme = root.dataset.theme;
    const restoredId = restoredTheme === "light" || restoredTheme === "dark"
      ? \`theme-\${restoredTheme}\`
      : "theme-system";
    const restoredInput = document.getElementById(restoredId);
    if (!(restoredInput instanceof HTMLInputElement)) return false;
    restoredInput.checked = true;
    return true;
  };

  if (!syncControl()) {
    const observer = new MutationObserver(() => {
      if (syncControl()) observer.disconnect();
    });
    observer.observe(document, { childList: true, subtree: true });
    document.addEventListener("DOMContentLoaded", () => observer.disconnect(), { once: true });
  }

  document.addEventListener("change", (event) => {
    const input = event.target;
    if (!(input instanceof HTMLInputElement) || input.name !== "theme") return;

    const theme = input.value;
    if (theme === "light" || theme === "dark") {
      root.dataset.theme = theme;
    } else if (theme === "system") {
      root.removeAttribute("data-theme");
    } else {
      return;
    }

    try {
      if (theme === "system") localStorage.removeItem("${THEME_STORAGE_KEY}");
      else localStorage.setItem("${THEME_STORAGE_KEY}", theme);
    } catch {}
  });
})();`;

// These IDs are selectors in design-tokens.css.
const THEMES = [
  { id: "theme-system", value: "system", label: "System", Mark: SystemMark },
  { id: "theme-light", value: "light", label: "Light", Mark: SunMark },
  { id: "theme-dark", value: "dark", label: "Dark", Mark: MoonMark },
] as const;

export function ThemeControl() {
  return (
    <fieldset className="flex items-center gap-x-1 border-0 p-0">
      <legend className="sr-only">Theme</legend>

      {THEMES.map(({ id, value, label, Mark }) => (
        <span key={id}>
          <input
            type="radio"
            name="theme"
            value={value}
            id={id}
            defaultChecked={value === "system"}
            suppressHydrationWarning
            className="peer sr-only"
          />
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
