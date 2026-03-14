# Research: Dark Tech UI Upgrade

## R1: shadcn/ui with Tailwind CSS v4 and Next.js 15

**Decision**: Use shadcn/ui with the new Tailwind v4 compatible setup (canary/v4 support).

**Rationale**: shadcn/ui is the most popular component library for Next.js + Tailwind projects. It provides copy-paste components that can be fully customized. As of 2025, shadcn/ui has full Tailwind CSS v4 support via the `npx shadcn@latest init` CLI which auto-detects the Tailwind version.

**Alternatives considered**:
- Radix UI primitives only — too low-level, would require extensive styling from scratch
- Headless UI — smaller component set, less community support
- Mantine / Chakra — heavier libraries that don't align with the Tailwind-first approach

**Key integration notes**:
- shadcn/ui v4 uses CSS variables natively (perfect for theme switching)
- Components are installed at `src/components/ui/` by convention
- Requires `cn()` utility from `class-variance-authority` + `clsx` + `tailwind-merge`
- components.json config file at project root

## R2: Theme Switching with next-themes

**Decision**: Use `next-themes` for dark/light mode switching.

**Rationale**: next-themes is the de facto standard for Next.js theme management. It handles SSR hydration, localStorage persistence, system preference detection, and FOUC prevention via a script injection. It integrates seamlessly with shadcn/ui's CSS variable approach.

**Alternatives considered**:
- Custom React Context — requires manual handling of hydration, FOUC, and localStorage
- CSS-only prefers-color-scheme — no user toggle, only system preference
- Tailwind dark: variant only — no runtime switching without class manipulation

**Key integration notes**:
- Wrap app in `<ThemeProvider>` in layout.tsx
- Uses `attribute="class"` strategy for Tailwind's `dark:` variant
- `defaultTheme="dark"` for dark-first default
- `enableSystem` for OS preference detection

## R3: Animation Library

**Decision**: Use `framer-motion` (now `motion`) for rich animations.

**Rationale**: framer-motion is the most mature and feature-rich animation library for React. It provides declarative animations, layout transitions, gesture support, and AnimatePresence for mount/unmount animations. Perfect for the rich animation requirements.

**Alternatives considered**:
- CSS transitions/keyframes only — limited to simple state changes, no mount/unmount
- react-spring — good physics-based animations but less declarative API
- @formkit/auto-animate — too simple for the requirements
- Tailwind CSS animate plugin — limited to predefined animations

**Key integration notes**:
- `motion` package (renamed from framer-motion)
- `AnimatePresence` for conditional rendering animations (mode switching)
- `motion.div` wrappers for component animations
- `useReducedMotion()` hook for accessibility
- Layout animations for smooth reflows

## R4: Dark Tech Color Palette

**Decision**: Define a custom dark tech palette extending shadcn/ui's CSS variable system.

**Rationale**: The Vercel/Linear aesthetic uses specific dark tones with selective neon accents. shadcn/ui's CSS variable system is designed to be extended with custom palettes.

**Color System**:
- **Dark mode background**: `hsl(0 0% 3.9%)` (#0a0a0a) — near-black
- **Dark mode card**: `hsl(0 0% 6%)` (#111111) — slightly lighter
- **Dark mode border**: `hsl(0 0% 14.9%)` (#262626) — subtle borders
- **Primary accent**: `hsl(172 66% 50%)` — cyan/teal neon
- **Secondary accent**: `hsl(142 71% 45%)` — green neon
- **Text primary**: `hsl(0 0% 98%)` — near-white
- **Text muted**: `hsl(0 0% 63.9%)` — gray for secondary text

**Light mode** will use inverted values maintaining the same hue relationships.

## R5: Streamdown Theme Compatibility

**Decision**: Override Streamdown CSS variables to match the active theme.

**Rationale**: Streamdown uses its own CSS variables for styling. These need to be remapped to the app's theme variables to ensure consistent appearance during theme switches.

**Key integration notes**:
- Override Streamdown's `--sd-*` variables in globals.css within `:root` and `.dark` selectors
- Code block backgrounds should use the card background color
- Syntax highlighting theme should switch between dark/light variants

## R6: Reduced Motion Support

**Decision**: Use `prefers-reduced-motion` media query + framer-motion's `useReducedMotion` hook.

**Rationale**: Accessibility requirement (FR-012). Both CSS-level and JS-level detection needed for comprehensive coverage.

**Implementation approach**:
- Global CSS: `@media (prefers-reduced-motion: reduce)` to disable CSS transitions
- framer-motion: `useReducedMotion()` to conditionally skip JS animations
- Provide a motion wrapper component that respects this setting
