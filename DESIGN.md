# Design System (West African Government Standard)

This `DESIGN.md` is the single source of truth for all UI/UX decisions within the application. It enforces a strict, neat, and highly accessible institutional aesthetic — drawn from the official flags and government portals of **Ghana**, **Guinea**, and **Côte d'Ivoire**.

## 1. Core Principles
- **Accessibility First**: WCAG AA contrast minimums, clear focus rings, unambiguous states.
- **Clarity over Flourish**: No glassmorphism, no soft gradients, no excessive drop shadows. Solid colors, distinct 1px borders.
- **Regional Authority**: Deep Sahel green communicates institutional trust common to all three nations; saffron gold provides warmth that bridges Ghana's gold, Côte d'Ivoire's orange, and Guinea's yellow.

## 2. Typography
- **Primary Font**: `Public Sans` (or fallback to `Inter` if unavailable, but strictly configured for high legibility).
- **Monospace Font**: `IBM Plex Mono` for data and code.
- **Hierarchy**:
  - `H1` - `H3`: Tight letter spacing, bold weight.
  - `Body`: Standard tracking, accessible line height (1.5).

## 3. Color Palette — Pan-West-African
Inspiration: the three flags share a green field (Pan-African colour) and each contributes a complementary warm tone (Ghana gold, Côte d'Ivoire orange, Guinea yellow). Red is the Pan-African red of Ghana and Guinea, reserved for danger.

- **Authority / Sidebar (Forest — Deep Sahel Green)**
  - `forest-950`: `#021c12`
  - `forest-900`: `#062b1d` (sidebar, brand-dark surfaces)
  - `forest-800`: `#0a3d2a`
  - `forest-700`: `#0e5036`
  - `forest-600`: `#136442`

- **Primary Action (Brand — Ghana Flag Green `#006B3F`)**
  - `brand-600`: `#006b3f` (primary buttons, strong links — 5.6:1 contrast with white)
  - `brand-700`: `#005230` (hover state)
  - `brand-100`: `#cfe8d8` (selected row backgrounds)
  - `brand-50`:  `#e8f5ee` (subtle hover surfaces)

- **Secondary Action / Info (Premium Emerald)**
  A deeper, slightly cooler jade-emerald — premium boardroom feel — used for
  *on-track* states, info accents, and secondary actions. Distinct enough
  from the brand green to maintain visual hierarchy.

  This scale **overrides Tailwind's default `blue` palette**, so every
  `bg-blue-*` / `text-blue-*` / `accent-blue-*` / `focus:ring-blue-*` class
  in the codebase resolves to Premium Emerald. There is no real blue in the
  product.

  - `blue-50`:  `#e7f4ef` (selected row, info chip background)
  - `blue-100`: `#c6e5d4`
  - `blue-200`: `#94cdb0` (info chip border)
  - `blue-500`: `#0e774e` (focus rings)
  - `blue-600`: `#066040` (primary — secondary-action buttons, on-track dot, info metric bar)
  - `blue-700`: `#044b32` (hover, info text on light backgrounds)
  - `blue-800`: `#033925`

- **Accent (Gold — Saharan Saffron)**
  Bridges Ghana gold (`#FCD116`), Côte d'Ivoire orange (`#F77F00`), and Guinea yellow.
  - `gold-400`: `#fbcb74` (light accent / focus rings on dark)
  - `gold-500`: `#f5a623` (accent — rules, badges, logo chip)
  - `gold-600`: `#d68a18` (hover, strong accent text)

- **Neutral / Surface (Grays — institutional clarity)**
  - `canvas`:  `#f0f0f0` (app background)
  - `surface`: `#ffffff` (cards, panels)
  - `line`:    `#dfe1e2` (crisp 1px card borders)

- **Ink (Text)**
  - `ink-900`: `#1b1b1b` (primary text)
  - `ink-600`: `#565c65` (secondary text / labels)

- **Status (Semantic)**
  - `success`: `#006b3f` (Ghana flag green — also brand)
  - `info`:    `#066040` (Premium Emerald — replaces former institutional blue)
  - `warning`: `#f5a623` (saffron)
  - `danger`:  `#ce1126` (Pan-African red — Ghana & Guinea flags)

### Per-country chart palette
When charts must distinguish countries, each line/bar uses its own flag colour:
- **Guinea (GIN)** → `#006b3f` (Pan-African green)
- **Ghana (GHA)** → `#d68a18` (flag gold / saffron)
- **Côte d'Ivoire (CIV)** → `#f77f00` (flag orange)

## 4. Layout & Spacing
- **Borders**: All cards, inputs, and distinct layout areas must have a solid 1px border (`#dfe1e2`).
- **Radiuses**: Keep corner rounding small and institutional (`0.25rem` or `0.375rem`). Do not use large pill-shaped or heavy rounded corners.
- **Shadows**: Use very subtle, sharp drop shadows only when absolutely necessary (e.g., modals). Flat design is preferred for standard cards.

## 5. Interaction
- **Focus States**: A thick, highly visible outline must appear on all interactive elements when keyboard focused (`3px solid #006b3f`, with `2px` offset).
- **Hover States**: Simple background color shifts or border color darkening. No floating or lifting animations (`transform: translateY`).

## Implementation Constraints
- AI code generation tools must respect these tokens and avoid introducing unauthorized utility classes (like `backdrop-blur`, `bg-opacity`, or non-standard colors).
- New colours must come from this palette only. Country charts may use the per-country flag palette above; nothing else.
