# NP-I18N-002 — Localization architecture

**Status:** Implemented on feature PR; merge/QA tracked in the Google Sheet.  
**Dependency:** [NP-I18N-001 terminology standard](./NP-I18N-001-terminology.md) (version 1.0.0).

## Design

- `src/i18n/messages.ts` holds paired, typed English and German **UI copy**, separated from payroll logic. Each migrated English key must have a corresponding German value, checked at compile time.
- `src/i18n/catalog.ts` is the pure lookup layer. `getMessage(locale, key)` requires a registered UI key. `getTerm(locale, id)` uses the canonical versioned terminology JSON without duplicating the glossary into a second translation table. Missing glossary keys throw during development rather than silently inserting incorrect financial wording.
- `src/i18n/LanguageProvider.tsx` provides `useLanguage()`: `locale`, `setLocale`, `t`, and `term`. The provider is at app-shell level, not imported into business calculations. A change of language **does not remount the salary or offer input components**, and does not recalculate or alter canonical numeric inputs.
- Language selector in the site header uses an explicitly labelled `select` with accessible keyboard navigation. `document.documentElement.lang` tracks the selected locale for assistive technology.
- Default language is English (`en`). German (`de`) is a supported message catalog and user-selectable setting.
- Browser storage key `nettopilot:locale` contains **only** `en` or `de`. Unsupported/corrupt values fall back to English. Storage errors are non-blocking. No salary, birthday, tax class, insurance data or offers are stored or placed in a URL.
- Numeric formatting and calculation engines are **unchanged** in this PR; NP-I18N-005 will switch output formatters to locale-aware presentation rules while preserving exact money and calculation semantics.

## Rollout boundary

The architecture supports both languages with full key parity **for every migrated shell string**. NP-I18N-003 and NP-I18N-004 must migrate the remaining calculator, comparison, warnings, error messages, methodology, helper text, report and print labels. Until then, German selection clearly displays an in-product note that calculator and comparison sections still use English. This PR must **not** be described as a completed German translation.

## Verification

- Unit contract tests enforce key parity, allowed locales, valid fallback, terminology linkage, and safe preference storage.
- React integration tests verify switching English ↔ German, `html lang`, persistent selection, and preservation of a partially entered gross salary without component remount.
- Chromium browser test covers keyboard-accessible selector, mobile width, refresh preference, sensitive values absent from the URL and storage, and no persistence of salary inputs.
- No new dependency, rate, payroll formula, external service, or server persistence.

## Next tasks

1. **NP-I18N-003:** extract/review every English UI message, errors, documentation/help references and print labels.
2. **NP-I18N-004:** complete and linguistically review the matching German UI messages.
3. **NP-I18N-005:** integrate `Intl` display formatting for money, percentages and locale-aware dates across supported visualizations; validate exact-decimal boundaries and rendered DE/EN results.
