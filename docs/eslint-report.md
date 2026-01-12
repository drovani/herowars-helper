# ESLint Report

**Generated:** 2026-01-12

## Summary

| Metric | Count |
|--------|-------|
| Total Errors | 220 |
| Total Warnings | 94 |
| Files with Issues | 71 |
| Total Problems | 314 |

## Issues by Rule

### Errors (220 total)

| Rule | Count | Description |
|------|-------|-------------|
| `@typescript-eslint/no-explicit-any` | 168 | Disallows the `any` type |
| `@typescript-eslint/no-unused-vars` | 42 | Disallows unused variables |
| `react/jsx-no-useless-fragment` | 4 | Disallows unnecessary fragments |
| `@typescript-eslint/no-empty-object-type` | 3 | Disallows empty interfaces |
| `no-constant-binary-expression` | 2 | Disallows constant expressions in conditions |
| `@typescript-eslint/no-require-imports` | 1 | Disallows `require()` imports |

### Warnings (94 total)

| Rule | Count | Description |
|------|-------|-------------|
| `@typescript-eslint/no-non-null-assertion` | 57 | Disallows non-null assertions (`!`) |
| `react/no-unescaped-entities` | 30 | Requires escaping quotes in JSX |
| `react-hooks/exhaustive-deps` | 4 | Enforces rules of Hooks dependencies |
| `no-console` | 2 | Disallows `console` statements |
| `import/order` | 1 | Enforces import order conventions |

---

## Detailed Issues by File

### app/__tests__/mocks/msw/utils.ts

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 62:43 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/components/auth/AuthenticationErrorBoundary.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 122:26 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/components/auth/RequireRole.tsx

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 22:12 | error | `react/jsx-no-useless-fragment` | Fragments should contain more than one child |
| 25:10 | error | `react/jsx-no-useless-fragment` | Fragments should contain more than one child |

---

### app/components/auth/__tests__/AuthenticationErrorBoundary.test.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 4:18 | error | `@typescript-eslint/no-unused-vars` | 'fireEvent' is defined but never used |

---

### app/components/auth/__tests__/LoginForm.test.tsx

**Errors:** 5 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 51:13 | error | `@typescript-eslint/no-unused-vars` | 'result' is assigned a value but never used |
| 58:13 | error | `@typescript-eslint/no-unused-vars` | 'result' is assigned a value but never used |
| 66:13 | error | `@typescript-eslint/no-unused-vars` | 'result' is assigned a value but never used |
| 204:13 | error | `@typescript-eslint/no-unused-vars` | 'result' is assigned a value but never used |
| 217:13 | error | `@typescript-eslint/no-unused-vars` | 'result' is assigned a value but never used |

---

### app/components/auth/__tests__/LoginModal.test.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 396:15 | error | `@typescript-eslint/no-unused-vars` | 'result' is assigned a value but never used |

---

### app/components/forms/FormErrorBoundary.tsx

**Errors:** 0 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 98:88 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 99:24 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |

---

### app/components/forms/__tests__/FormErrorBoundary.test.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 4:18 | error | `@typescript-eslint/no-unused-vars` | 'fireEvent' is defined but never used |

---

### app/components/hero-form/ItemSelectionDialog.tsx

**Errors:** 0 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 91:43 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 91:57 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |

---

### app/components/hero/HeroFilters.tsx

**Errors:** 4 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 135:24 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 137:31 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 142:24 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 144:24 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/components/player/AddAllHeroesButton.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 116:81 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/components/player/__tests__/HeroCollectionCard.test.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 202:23 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/components/player/details/ArtifactsView.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 32:56 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/components/skeletons/AdminSetupSkeleton.tsx

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 7:3 | error | `@typescript-eslint/no-unused-vars` | 'CardDescription' is defined but never used |
| 9:3 | error | `@typescript-eslint/no-unused-vars` | 'CardTitle' is defined but never used |

---

### app/components/ui/command.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 29:11 | error | `@typescript-eslint/no-empty-object-type` | An interface declaring no members is equivalent to its supertype |

---

### app/components/ui/input.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 5:18 | error | `@typescript-eslint/no-empty-object-type` | An interface declaring no members is equivalent to its supertype |

---

### app/config/site.test.ts

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 128:13 | error | `@typescript-eslint/no-unused-vars` | 'originalTemplate' is assigned a value but never used |

---

### app/data/navigation.ts

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 18:30 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 25:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/hooks/__tests__/useErrorBoundary.test.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 63:22 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/hooks/useErrorBoundary.tsx

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 65:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 65:77 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/hooks/useQueryState.test.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 3:32 | error | `@typescript-eslint/no-unused-vars` | 'vi' is defined but never used |

---

### app/hooks/useQueryState.ts

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 26:5 | warning | `react-hooks/exhaustive-deps` | React Hook useCallback has a missing dependency: 'replaceState' |

---

### app/hooks/useRoles.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 52:6 | warning | `react-hooks/exhaustive-deps` | React Hook useMemo has a missing dependency: 'user' |

---

### app/lib/__tests__/artifact-calculations.test.ts

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 8:8 | error | `@typescript-eslint/no-unused-vars` | 'ArtifactUpgradeResult' is defined but never used |

---

### app/lib/auth/utils.ts

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 98:23 | error | `@typescript-eslint/no-require-imports` | A `require()` style import is forbidden |

---

### app/lib/hero-data-migration.ts

**Errors:** 0 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 42:9 | warning | `no-console` | Unexpected console statement |
| 284:7 | warning | `no-console` | Unexpected console statement |

---

### app/lib/hero-transformations.ts

**Errors:** 16 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 21:49 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 55:50 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 167:18 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 189:24 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 189:30 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 212:45 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 226:44 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 233:46 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 243:39 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 263:42 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 263:62 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 277:42 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 278:20 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 302:42 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 302:62 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 323:42 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/lib/supabase/admin-client.ts

**Errors:** 0 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 23:7 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 24:7 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/lib/supabase/admin.ts

**Errors:** 3 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 132:5 | error | `@typescript-eslint/no-unused-vars` | 'userData' is defined but never used |
| 201:16 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 202:25 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/lib/supabase/client.ts

**Errors:** 0 | **Warnings:** 4

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 15:7 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 16:7 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 40:7 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 41:7 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/lib/utils.test.ts

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 166:25 | error | `no-constant-binary-expression` | Unexpected constant truthiness on the left-hand side of a `&&` expression |
| 167:25 | error | `no-constant-binary-expression` | Unexpected constant truthiness on the left-hand side of a `&&` expression |

---

### app/repositories/BaseRepository.ts

**Errors:** 21 | **Warnings:** 4

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 22:38 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 24:31 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 28:45 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 29:23 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 31:51 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 38:61 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 44:72 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 46:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 61:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 128:55 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 131:38 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 185:43 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 202:26 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 237:42 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 249:55 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 251:26 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 252:38 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 286:49 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 289:38 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 350:28 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 352:28 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 453:26 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 502:20 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 574:20 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 672:32 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/repositories/EquipmentRepository.ts

**Errors:** 10 | **Warnings:** 12

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 55:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 288:26 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 364:24 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 515:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 516:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 536:23 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 537:23 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 572:27 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 573:30 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 624:28 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 645:31 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 653:27 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 749:22 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 750:18 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 795:22 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 796:27 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 850:22 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 851:18 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 852:27 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 1051:22 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 1052:18 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 1053:27 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/repositories/HeroRepository.ts

**Errors:** 27 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 41:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 399:62 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 410:37 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 481:31 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 482:31 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 483:31 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 484:31 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 534:36 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 582:32 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 631:33 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 681:36 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 730:63 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 732:19 | error | `@typescript-eslint/no-unused-vars` | 'hero_equipment_slot' is assigned a value but never used |
| 841:20 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 947:19 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1006:19 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1062:19 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1118:19 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1267:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1275:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1276:22 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1378:16 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1427:12 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1433:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1451:13 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1481:12 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 1528:49 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/repositories/MissionRepository.ts

**Errors:** 3 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 44:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 285:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 382:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/repositories/PlayerEventRepository.ts

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 13:15 | error | `@typescript-eslint/no-unused-vars` | 'Json' is defined but never used |
| 52:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/repositories/PlayerHeroRepository.ts

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 44:55 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 46:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/repositories/PlayerTeamRepository.ts

**Errors:** 11 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 43:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 101:27 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 105:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 105:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 392:42 | error | `@typescript-eslint/no-unused-vars` | 'checkError' is assigned a value but never used |
| 565:27 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 569:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 569:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 627:27 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 631:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 631:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/repositories/__tests__/EquipmentRepository.test.ts

**Errors:** 3 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 862:11 | error | `@typescript-eslint/no-unused-vars` | 'mockEnchantedLuteFragment' is assigned a value but never used |
| 1004:13 | error | `@typescript-eslint/no-unused-vars` | 'mockComponent' is assigned a value but never used |
| 1250:13 | error | `@typescript-eslint/no-unused-vars` | 'mockFragment' is assigned a value but never used |

---

### app/repositories/__tests__/HeroRepository.test.ts

**Errors:** 3 | **Warnings:** 4

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 11:3 | error | `@typescript-eslint/no-unused-vars` | 'HeroArtifact' is defined but never used |
| 12:3 | error | `@typescript-eslint/no-unused-vars` | 'HeroSkin' is defined but never used |
| 13:3 | error | `@typescript-eslint/no-unused-vars` | 'HeroGlyph' is defined but never used |
| 733:16 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 743:16 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 753:16 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 763:16 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/repositories/__tests__/PlayerHeroRepository.test.ts

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 407:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/repositories/__tests__/PlayerTeamRepository.test.ts

**Errors:** 0 | **Warnings:** 18

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 118:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 119:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 121:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 122:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 140:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 189:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 190:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 249:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 250:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 308:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 340:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 383:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 474:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 475:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 476:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 585:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 732:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 810:14 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/repositories/types.ts

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 17:42 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 27:87 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/resources/api/admin/users.test.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 26:1 | warning | `import/order` | `./users` import should occur before import of `~/__tests__/mocks/admin` |

---

### app/routes/resources/api/admin/users.tsx

**Errors:** 3 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 48:34 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 215:45 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 234:45 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/account/profile.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 52:14 | error | `@typescript-eslint/no-unused-vars` | 'error' is defined but never used |

---

### app/routes/views/admin/index.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 8:10 | error | `react/jsx-no-useless-fragment` | Fragments should contain more than one child |

---

### app/routes/views/admin/setup.tsx

**Errors:** 24 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 77:10 | error | `@typescript-eslint/no-unused-vars` | 'getEquipmentSubset' is defined but never used |
| 101:20 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 153:72 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 158:74 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 163:69 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 252:53 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 260:55 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 271:58 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 284:55 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 295:58 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 304:46 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 329:49 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 379:64 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 382:48 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 398:51 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 414:46 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 441:59 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 444:48 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 460:51 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 512:20 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 513:18 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 743:38 | error | `@typescript-eslint/no-unused-vars` | 'actionData' is defined but never used |
| 1278:51 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |
| 1279:56 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/routes/views/admin/test-coverage.tsx

**Errors:** 4 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 40:32 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 41:25 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 42:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 462:32 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/admin/users.tsx

**Errors:** 3 | **Warnings:** 6

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 106:12 | error | `@typescript-eslint/no-unused-vars` | 'error' is defined but never used |
| 144:14 | error | `@typescript-eslint/no-unused-vars` | 'error' is defined but never used |
| 207:39 | error | `@typescript-eslint/no-unused-vars` | 'removed' is assigned a value but never used |
| 224:6 | warning | `react-hooks/exhaustive-deps` | React Hook useEffect has a missing dependency: 'isRevalidating' |
| 253:6 | warning | `react-hooks/exhaustive-deps` | React Hook useEffect has a missing dependency: 'revalidator' |
| 673:57 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 673:70 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 882:37 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 882:50 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |

---

### app/routes/views/auth/sign-up.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 80:22 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/routes/views/equipment/index.tsx

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 49:57 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 103:31 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/equipment/new.tsx

**Errors:** 1 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 3:34 | error | `@typescript-eslint/no-unused-vars` | 'data' is defined but never used |
| 79:35 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/routes/views/equipment/slug.edit.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 118:35 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/routes/views/equipment/slug.tsx

**Errors:** 18 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 257:14 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 258:22 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 259:25 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 260:16 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 261:19 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 262:19 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 263:18 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 264:18 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 265:20 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 453:69 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 628:22 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 629:30 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 630:33 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 631:24 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 632:27 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 633:27 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 634:26 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 635:26 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 636:28 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/heroes/__tests__/slug.edit.integration.test.ts

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 94:15 | error | `@typescript-eslint/no-unused-vars` | 'result' is assigned a value but never used |
| 105:16 | error | `@typescript-eslint/no-unused-vars` | 'e' is defined but never used |

---

### app/routes/views/heroes/index.tsx

**Errors:** 12 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 5:3 | error | `@typescript-eslint/no-unused-vars` | 'ChevronLeftIcon' is defined but never used |
| 6:3 | error | `@typescript-eslint/no-unused-vars` | 'ChevronRightIcon' is defined but never used |
| 24:10 | error | `@typescript-eslint/no-unused-vars` | 'Button' is defined but never used |
| 48:3 | error | `@typescript-eslint/no-unused-vars` | 'sortHeroRecords' is defined but never used |
| 62:15 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 91:18 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 165:11 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 166:14 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 315:11 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 316:16 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 481:19 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 482:22 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/heroes/slug.edit.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 218:3 | error | `@typescript-eslint/no-unused-vars` | 'actionData' is defined but never used |

---

### app/routes/views/heroes/slug.tsx

**Errors:** 10 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 232:9 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 233:13 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 234:13 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 235:20 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 236:18 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 428:17 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 429:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 430:21 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 431:28 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 432:26 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/missions/index.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 58:21 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |

---

### app/routes/views/missions/slug.edit.tsx

**Errors:** 3 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 7:10 | error | `@typescript-eslint/no-unused-vars` | 'ZodError' is defined but never used |
| 19:8 | error | `@typescript-eslint/no-unused-vars` | 'Mission' is defined but never used |
| 111:3 | error | `@typescript-eslint/no-unused-vars` | 'actionData' is defined but never used |

---

### app/routes/views/player/index.tsx

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 8:10 | error | `react/jsx-no-useless-fragment` | Fragments should contain more than one child |

---

### app/routes/views/player/roster/$heroSlug.$view.tsx

**Errors:** 0 | **Warnings:** 4

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 43:24 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 43:31 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 68:24 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 68:42 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |

---

### app/routes/views/player/roster/$heroSlug.tsx

**Errors:** 0 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 39:24 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 39:42 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |

---

### app/routes/views/player/roster/layout.tsx

**Errors:** 2 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 93:22 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |
| 142:11 | error | `@typescript-eslint/no-unused-vars` | 'heroes' is assigned a value but never used |

---

### app/routes/views/player/teams/index.tsx

**Errors:** 2 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 7:22 | error | `@typescript-eslint/no-unused-vars` | 'useLoaderData' is defined but never used |
| 79:27 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 80:19 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 216:29 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/player/teams/new.tsx

**Errors:** 1 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 72:22 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 93:27 | warning | `@typescript-eslint/no-non-null-assertion` | Forbidden non-null assertion |
| 189:25 | error | `@typescript-eslint/no-explicit-any` | Unexpected any. Specify a different type |

---

### app/routes/views/public/index.tsx

**Errors:** 0 | **Warnings:** 2

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 88:71 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |
| 97:74 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/routes/views/tools/artifact-calculator.tsx

**Errors:** 0 | **Warnings:** 1

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 181:17 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/routes/views/tools/skin-calculator.tsx

**Errors:** 0 | **Warnings:** 7

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 112:29 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |
| 127:53 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 127:59 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rsquo;` |
| 224:77 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |
| 245:51 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 245:57 | warning | `react/no-unescaped-entities` | `"` can be escaped with `&quot;`, `&ldquo;`, `&#34;`, `&rdquo;` |
| 245:82 | warning | `react/no-unescaped-entities` | `'` can be escaped with `&apos;`, `&lsquo;`, `&#39;`, `&rsquo;` |

---

### app/services/types.ts

**Errors:** 1 | **Warnings:** 0

| Line | Severity | Rule | Message |
|------|----------|------|---------|
| 19:18 | error | `@typescript-eslint/no-empty-object-type` | An interface declaring no members is equivalent to its supertype |

---

## Recommended Fix Priority

### High Priority (Errors)

1. **`@typescript-eslint/no-explicit-any` (168 occurrences)**
   - Replace `any` types with proper TypeScript types
   - Focus on repositories and route files first
   - Consider using `unknown` when type is truly unknown

2. **`@typescript-eslint/no-unused-vars` (42 occurrences)**
   - Remove unused imports and variables
   - Prefix with underscore (`_`) if intentionally unused
   - Quick fix: Most IDEs can auto-remove unused imports

3. **`react/jsx-no-useless-fragment` (4 occurrences)**
   - Remove unnecessary `<>...</>` wrappers
   - Return child element directly

4. **`@typescript-eslint/no-empty-object-type` (3 occurrences)**
   - Use `Record<string, never>` or remove empty interfaces
   - Consider if the interface is actually needed

5. **`no-constant-binary-expression` (2 occurrences)**
   - Fix constant expressions in conditions
   - Check for logic errors

6. **`@typescript-eslint/no-require-imports` (1 occurrence)**
   - Convert `require()` to ES module `import`

### Medium Priority (Warnings)

1. **`@typescript-eslint/no-non-null-assertion` (57 occurrences)**
   - Add proper null checks or use optional chaining
   - Consider if data is guaranteed to exist

2. **`react/no-unescaped-entities` (30 occurrences)**
   - Escape quotes in JSX: `'` → `&apos;`, `"` → `&quot;`

3. **`react-hooks/exhaustive-deps` (4 occurrences)**
   - Add missing dependencies to hooks
   - Or add disable comment with justification

4. **`no-console` (2 occurrences)**
   - Replace with proper logging (loglevel)

5. **`import/order` (1 occurrence)**
   - Fix import ordering

---

## Files with Most Issues

| File | Errors | Warnings | Total |
|------|--------|----------|-------|
| [app/repositories/HeroRepository.ts](app/repositories/HeroRepository.ts) | 27 | 1 | 28 |
| [app/routes/views/admin/setup.tsx](app/routes/views/admin/setup.tsx) | 24 | 2 | 26 |
| [app/repositories/BaseRepository.ts](app/repositories/BaseRepository.ts) | 21 | 4 | 25 |
| [app/repositories/EquipmentRepository.ts](app/repositories/EquipmentRepository.ts) | 10 | 12 | 22 |
| [app/routes/views/equipment/slug.tsx](app/routes/views/equipment/slug.tsx) | 18 | 0 | 18 |
| [app/repositories/__tests__/PlayerTeamRepository.test.ts](app/repositories/__tests__/PlayerTeamRepository.test.ts) | 0 | 18 | 18 |
| [app/lib/hero-transformations.ts](app/lib/hero-transformations.ts) | 16 | 0 | 16 |
| [app/routes/views/heroes/index.tsx](app/routes/views/heroes/index.tsx) | 12 | 0 | 12 |
| [app/repositories/PlayerTeamRepository.ts](app/repositories/PlayerTeamRepository.ts) | 11 | 0 | 11 |
| [app/routes/views/heroes/slug.tsx](app/routes/views/heroes/slug.tsx) | 10 | 0 | 10 |
