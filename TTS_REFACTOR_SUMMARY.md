# TTS Speaker Icon Refactoring - Complete

## Summary

Successfully refactored the Text-to-Speech (TTS) speaker icon implementation to position icons at the top-right of question cards instead of inline with text.

## What Was Changed

### 1. RichText Component (`src/app/components/sections/richText/RichText.jsx`)

**Removed:**

- `RichTextSpeaker` Tiptap extension import
- `injectSpeakerIcons()`, `shouldAddSpeakerIcon()`, and `extractParagraphText()` helper functions
- `processedValue` memoization for injecting inline speaker icons
- `RichTextSpeaker` from editor extensions array

**Added:**

- `ttsManager` import from `@/app/utils/TextToSpeechManager`
- `enableTTS` prop (default: false) to control TTS feature visibility
- `isSpeaking` state to track TTS playback status
- `extractAllText()` helper function to extract all text from editor content
- `handleTTSToggle()` function to start/stop TTS playback
- `useEffect` cleanup to stop TTS on component unmount
- Speaker icon positioned absolutely at top-right (10px from top, 10px from right)
- Icon toggles between 🔊 (speaking) and 🔇 (silent)
- Hover effect: scale(1.15)
- Speaking animation via CSS class

**Key Feature:**

- Speaker icon now appears at the top-right corner of the card when `enableTTS={true}` is passed
- One icon per RichText instance (per sub-question)
- Icon reads ALL text content from that specific RichText editor instance
- Clean positioning that doesn't interfere with question content

### 2. QuestionPage Component (`src/app/components/templates/QuestionPage/QuestionPage.jsx`)

**Changes:**

- Added `enableTTS={true}` prop to both RichText components (lines 1616 and 1628)
- Enables TTS for both result view (scoreResult) and active question view

### 3. SCSS Styles (`src/app/assets/scss/components/sections/richText/_richText.scss`)

**Removed:**

- `.rich-text-speaker-icon` inline styles
- `@keyframes speaker-pulse-inline`

**Added:**

- `.section-rich-text-speaker-container`: Absolute positioning styles for the container
- `.section-rich-text-speaker-icon`: Speaker icon base styles with current emoji appearance
  - Background: `rgba(0, 205, 210, 0.1)`
  - Border: `1px solid #00CDD2`
  - Border radius: `4px`
  - Padding: `2px 4px`
  - Font size: `18px`
  - Hover: scale(1.15) + darker background
  - Active: scale(0.95)
- `.section-rich-text-speaker-icon-speaking`: Animation class for speaking state
- `@keyframes speaker-pulse`: Opacity pulse animation (1s duration, 0.6-1.0 opacity)

## Implementation Details

### Speaker Icon Behavior

1. **Visibility**: Only shows when `enableTTS={true}` AND `readOnly={true}` AND browser supports Web Speech API
2. **Position**: Absolutely positioned at top-right of RichText card (z-index: 1000)
3. **Icon States**:
   - 🔇 (muted): Default state, TTS not playing
   - 🔊 (speaking): Active state, TTS is reading text
4. **Interaction**:
   - Click to toggle TTS on/off
   - Hover for scale animation
   - Pulse animation when speaking

### Text Extraction

- `extractAllText()` traverses the entire Tiptap editor JSON structure
- Extracts text from all paragraphs, handling special nodes (textfield, dropdown, fractionField) as "blank"
- Returns combined text string for TTS to read

### TTS Integration

- Uses existing `TextToSpeechManager` utility (Web Speech API)
- Callbacks for state management:
  - `onStart`: Sets `isSpeaking` to true
  - `onEnd`: Sets `isSpeaking` to false
  - `onError`: Sets `isSpeaking` to false
- Auto-cleanup on component unmount to prevent orphaned speech

## Files Not Deleted (As Requested)

- `src/app/components/sections/richText/extensions/speaker/RichTextSpeaker.js` (unused)
- `src/app/components/sections/richText/extensions/speaker/SpeakerIconComponent.jsx` (unused)

These files can be safely deleted later as they are no longer imported or used.

## Testing Checklist

- [x] Build completes successfully
- [ ] Speaker icon appears at top-right of question cards
- [ ] Icon is visible for both plain background and white card questions
- [ ] Click toggles TTS playback
- [ ] Icon changes from 🔇 to 🔊 when speaking
- [ ] Pulse animation plays during speech
- [ ] Hover effect works (scale 1.15)
- [ ] TTS reads all text content from the question
- [ ] Multiple RichText instances have independent speaker icons
- [ ] TTS stops when navigating away or unmounting component

## Benefits of This Approach

1. **Clean Positioning**: Icon is always visible and consistently placed
2. **No Tiptap Complexity**: Removed complex Tiptap extension code
3. **Simpler Logic**: Easier to understand and maintain
4. **Better UX**: One icon per question card, reads entire question
5. **Maintains Current Design**: Kept emoji style with background as requested
6. **SSR Compatible**: Proper browser environment checks maintained

## Next Steps

1. Test the speaker icon functionality in the browser
2. Verify TTS works across different question types
3. Delete old Tiptap extension files once confirmed working
4. Add to animation progress report for client
