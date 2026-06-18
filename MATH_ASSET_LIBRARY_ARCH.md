# Math Asset Library - Architecture Integration Guide

This document provides the technical specifications for integrating the **Math Asset Library** into the main application. It covers the database schema, storage configuration, and the dynamic category resolution logic.

---

## 1. Database Schema (Supabase)

The library uses a dedicated table `math_assets` within the `public` schema.

### Table: `public.math_assets`

| Column          | Type          | Description                                      |
| :-------------- | :------------ | :----------------------------------------------- |
| `id`            | `uuid`        | Primary Key (Default: `gen_random_uuid()`)       |
| `name`          | `text`        | Display name of the asset (e.g., "3D Cube")      |
| `description`   | `text`        | Multi-line context for usage in lessons          |
| `year`          | `integer`     | School year (1 - 6)                              |
| `category_id`   | `integer`     | ID of the **outermost** category                 |
| `category_name` | `text`        | Resolved display name of the category            |
| `asset_url`     | `text`        | Public URL to the graphic file                   |
| `asset_type`    | `text`        | One of: `2D Illustration`, `3D Shape`, `Diagram` |
| `status`        | `text`        | One of: `Active`, `Archived` (Default: `Active`) |
| `created_at`    | `timestamptz` | Creation timestamp                               |
| `updated_at`    | `timestamptz` | Last modification timestamp                      |

### Row Level Security (RLS)

- **Select**: Public Read Access enabled.
- **Insert/Update/Delete**: Currently set to Public (Anon) for development, but mapped to Authenticated users in production.

---

## 2. Storage Configuration

Assets are stored in a dedicated Supabase Storage bucket.

- **Bucket Name**: `math-assets`
- **Access Level**: Public
- **Path Structure**: `assets/{random_id}.{ext}`
- **Security**: Public read access via policy `Public Read Access for math-assets`.

---

## 3. Implementation Logic

### Dynamic Category Resolution

The library does not store the full category tree. Instead, it dynamically resolves the **outermost labels** based on the `year` selection using your existing `src/utils/categories.js` logic.

**Logic Flow:**

1. User selects `year` (1-6).
2. The UI looks up `categories[year]`.
3. It iterates through the keys (Outer IDs) and resolves the label from `outerData[`${year}.${outerId}`]`.
4. It supports both string labels and localized objects `{en, zh}`.

### Integration Points for Main App

To display these assets in the question editor or lesson builder:

- Query `math_assets` filtered by `status = 'Active'`.
- Filter by `year` or `category_id` to show relevant assets for the current context.
- Use `asset_url` directly in standard `<img>` or `next/image` tags.

---

## 4. Frontend Routes (Admin)

- `/mathlib`: Asset Dashboard (Filtering, Search, List View).
- `/mathlib/new`: Upload form with drag-and-drop.
- `/mathlib/[id]`: Asset editing.

---
