# Image Architecture Guide for Pebbo Main Website

This document explains the image architecture implemented in the audit portal and how the main website should consume and render question images.

## 1. Overview

The `primary_questions` table (and its corresponding view `questions_with_effective_status`) is the single source of truth for questions.

We have introduced a rigorous "Image Audit" workflow to ensuring that AI-generated images match the question requirements.

- **Storage**: Question content is stored in TipTap JSON format in `question_object_en` / `question_object_zh`.
- **Image Context**: A new column `image_description` contains the AI prompt/context for the image.
- **Approval Logic**: A new column `image_approved` (boolean) flags whether the image in the content is valid.

## 2. Data Model

When fetching questions for the main website, query the **`questions_with_effective_status`** view. This view automatically merges the latest approved changes.

### Key Columns

- `question_object_en` / `question_object_zh` (JSON): The rich text content.
- `image_description` (Text): Description of the image (used for generation/regeneration).
- `image_approved` (Boolean):
  - `TRUE`: The image inside the `question_object` is verified and safe to display.
  - `FALSE` or `NULL`: The image is pending review or rejected.

## 3. Rendering Logic

The main website does **not** need to implement auditing or drafting logic. It simply needs to render the content based on the data.

### Step 1: Fetch the Data

Query the database view:

```sql
SELECT * FROM questions_with_effective_status WHERE id = ?
```

### Step 2: Render Content (TipTap JSON)

Iterate through the `content` array of the JSON object (`question_object_en` or `zh`).

#### Handling Visuals (`SvgReactComponent`)

Visual elements (diagrams, shapes, etc.) are stored using the **`SvgReactComponent`** node type. These nodes can contain either raw SVG data or a URL to a rendered PNG image.

**Logic for Rendering:**

1.  **Prioritize PNG**: Check for `attrs.imageUrl`.
    - If `attrs.imageUrl` exists and is not empty, render it as a **PNG image**.
    - The admin portal ensures this URL is only present if the image is verified (or stripped if rejected).
2.  **Fallback to SVG**: If `attrs.imageUrl` is missing or empty, render the raw SVG instead.
    - The raw SVG XML is stored in the `attrs.data` attribute.
    - Use a library like `dangerouslySetInnerHTML` or a safe SVG parser to render this.

**Example Implementation:**

```jsx
const SvgReactComponent = ({ node, imageDescription }) => {
  const { imageUrl, data: svgData } = node.attrs;

  // 1. Render PNG if available
  if (imageUrl) {
    return (
      <img
        src={imageUrl}
        alt={imageDescription || "Question visual reference"}
        className="question-image"
      />
    );
  }

  // 2. Fallback to raw SVG data
  if (svgData) {
    return (
      <div
        dangerouslySetInnerHTML={{ __html: svgData }}
        className="question-svg-container"
      />
    );
  }

  return null;
};
```

## 4. Architecture Summary for AI Assistants

If you are an AI (Claude/Cursor) working on the main website repo:

1.  **Read-Only**: The main website is a consumer. Do not write to `primary_questions`.
2.  **Trust the View**: Always query `questions_with_effective_status` to get the final merged state of a question.
3.  **Visuals**: Use the **`SvgReactComponent`** node type. It prioritizes `attrs.imageUrl` (PNG) and falls back to `attrs.data` (SVG XML).
4.  **Context**: The `image_description` field is metadata describing _what_ the image should be. Use it for accessibility (alt text) on the image tag.

---

_Created by the Audit Portal Team_
