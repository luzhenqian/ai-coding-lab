# Tasks: Blog UI Polish

**Input**: Design documents from `/specs/002-blog-ui-polish/`
**Prerequisites**: plan.md (required), spec.md (required)

**Tests**: Not requested. Visual verification only.

## Phase 1: Setup

- [x] T001 Install `@tailwindcss/typography` plugin and configure in `app/globals.css`
- [x] T002 Add highlight.js CSS theme (dark + light) for code syntax highlighting in `app/globals.css`

---

## Phase 2: User Story 1 - Markdown Rendering (Priority: P1)

**Goal**: All Markdown elements render with rich, distinct visual styling

- [x] T003 [US1] Update `components/blog/MarkdownRenderer.tsx` to apply Tailwind `prose` classes with dark mode variant, configure max-width, and ensure all Markdown elements are styled
- [x] T004 [US1] Add custom prose overrides in `app/globals.css` for tables (borders, alternating rows, horizontal scroll), code blocks (background, padding, rounded corners, horizontal scroll), blockquotes (left border accent, background), and inline code (background, padding, border-radius)
- [x] T005 [US1] Update article detail page `app/(public)/posts/[slug]/page.tsx` to use refined layout: comfortable reading width, generous spacing between metadata/content/tags/comments

**Checkpoint**: Article content renders beautifully with all Markdown elements styled

---

## Phase 3: User Story 2 - Homepage Cards (Priority: P1)

- [x] T006 [US2] Redesign `components/blog/ArticleCard.tsx` with refined visual hierarchy: larger title font, muted metadata, subtle category badge, clean tag pills, balanced whitespace, polished hover effect (shadow + slight translate)
- [x] T007 [US2] Polish homepage layout in `app/(public)/page.tsx`: refine page header with title and search bar spacing, improve grid gap, add subtle section separators
- [x] T008 [P] [US2] Polish `components/ui/Pagination.tsx` with refined button styles, proper spacing, and active state design
- [x] T009 [P] [US2] Polish tag/category/search pages (`app/(public)/tags/[slug]/page.tsx`, `app/(public)/categories/[slug]/page.tsx`, `app/(public)/search/page.tsx`) with consistent page header and layout matching homepage

**Checkpoint**: Homepage and listing pages look polished and professional

---

## Phase 4: User Story 3 - Dark Mode (Priority: P2)

- [x] T010 [US3] Audit and fix dark mode across all components: ensure every background, border, text color, badge, and card has proper `dark:` variants in globals and components
- [x] T011 [US3] Add dark-optimized code block theme — ensure syntax highlighting colors work on dark backgrounds with sufficient contrast
- [x] T012 [US3] Verify dark mode for tables (dark borders, dark alternating rows), blockquotes (dark accent border, dark background), and all prose elements

**Checkpoint**: Full dark mode coverage with no bright flashes or unreadable text

---

## Phase 5: User Story 4 - Navigation Chrome (Priority: P2)

- [x] T013 [US4] Refine `components/ui/Header.tsx` styling: clean typography, balanced spacing, subtle bottom border, polished mobile menu with smooth transitions
- [x] T014 [US4] Refine `components/ui/Footer.tsx` styling: centered layout, muted text, proper spacing from content, subtle top border

**Checkpoint**: Header and footer frame pages with professional polish

---

## Phase 6: Final Validation

- [x] T015 Run `npm run build` to verify no build errors after style changes
- [x] T016 Visual check: verify all Markdown elements, cards, dark mode, and navigation on both mobile (375px) and desktop (1920px) viewports

---

## Dependencies

- Phase 1 (Setup) → blocks all other phases
- Phase 2 (US1) and Phase 3 (US2) can run in parallel after setup
- Phase 4 (US3) should run after US1 + US2 to audit final dark mode state
- Phase 5 (US4) can run in parallel with Phase 4
- Phase 6 runs last
