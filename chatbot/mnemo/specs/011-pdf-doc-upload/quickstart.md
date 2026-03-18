# Quickstart: PDF & DOC/DOCX Upload Support

## Install New Dependencies

```bash
pnpm add unpdf mammoth word-extractor
```

## Files to Modify

1. **`lib/utils/text-extractor.ts`** (NEW) — Text extraction dispatcher
2. **`app/api/documents/route.ts`** — Accept new file types, use extractor in `after()` block
3. **`app/documents/page.tsx`** — Update `accept` attribute on file input

## Verification

1. Start dev server: `pnpm dev`
2. Navigate to `/documents`
3. Upload a `.pdf` file → should show "处理中" then "就绪"
4. Upload a `.docx` file → same behavior
5. Upload a `.doc` file → same behavior
6. Upload a corrupt/password-protected PDF → should show "错误"
7. Existing `.txt`/`.md` uploads should still work
