# Data Model: Polished Chat UI/UX

This feature is purely presentational. No new data entities, database tables, or API changes are introduced.

## Entities

None — all improvements are client-side rendering and interaction enhancements using existing data structures.

## Notes

- The existing `conversations` and `messages` data structures remain unchanged
- Date grouping in the conversation list is computed client-side from existing `createdAt` timestamps
- Suggestion chips use hardcoded content (no new data source)
