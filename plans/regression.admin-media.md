# Regression Testing Strategy: Module 36 — Admin Media Library

## 1. Regression Scope & Risk Assessment
**Module Name**: Module 36 — Admin Media Library  
**Impact Radius**:
- Product Catalog & Image Galleries (`products`, `product_images`)
- Category Icons & Banners (`categories`)
- Brand Logos (`brands`)
- Storefront Banners & CMS Page Assets (`banners`, `cms_pages`)
- Storage Disk Storage Files & Disk Paths (`storage/app/public`)

---

## 2. Regression Protection Checklist

- [ ] **Zero Product Breakage**: Deleting unattached media must never break existing attached product main images or product gallery sliders.
- [ ] **Category & Brand Assets**: Updating alt text or asset types in Media Library must preserve category icon and brand logo bindings.
- [ ] **Storage Disk Safety**: Physical file deletion must only remove targeted files and avoid deleting parent directory structures or unlinked storage files.
- [ ] **Zero Overwrite Policy**: Ensure core `MediaService` methods maintain 100% backward compatibility for storefront API consumers.
- [ ] **Existing Feature Suite Test Run**:
  - `docker exec ecom-panel-app php artisan test`
  - `npx playwright test`
