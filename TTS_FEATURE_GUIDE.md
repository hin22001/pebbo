# Text-to-Speech Feature Guide

## Quick Start

### For Users

1. Navigate to any exercise/question page
2. Look for the **speaker icon** 🔊 next to each question
3. Click the icon to hear the question read aloud
4. Click again to stop

### Visual Location

```
┌─────────────────────────────────────────────────────┐
│  Q1/5                                                │
│  Category: Addition  Difficulty: Easy  ID: 123      │
│                                                      │
│  ┌──┐  ┌──────────────────────────────────────┐   │
│  │🔊│  │ What is 5 + 3?                        │   │
│  └──┘  │                                        │   │
│        │ [Input Box]                            │   │
│        └──────────────────────────────────────┘   │
└─────────────────────────────────────────────────────┘
```

## Icon States

### 1. Idle State (Gray)

- Color: #8D8D8D
- Icon: VolumeOff (muted speaker)
- Meaning: Click to start reading

### 2. Speaking State (Blue + Pulsing)

- Color: #00CDD2 (cyan)
- Icon: VolumeUp (speaker with sound waves)
- Animation: Continuous pulse (1.2s cycle)
- Meaning: Currently reading, click to stop

### 3. Hover State

- Background: Light cyan circle appears
- Scale: Slightly larger (1.1x)
- Cursor: Pointer

## How It Works

### What Gets Read

✅ Question text
✅ All sub-question text
✅ "[blank]" for input fields
✅ Mathematical expressions (as text)

❌ Does NOT read:

- Input field values
- Dropdown options
- Answer explanations (until revealed)

### Example

**Question**: "What is [input] + [input] ?"

**Speech Output**: "What is [blank] plus [blank] ?"

## Browser Support

| Browser | Status | Notes          |
| ------- | ------ | -------------- |
| Chrome  | ✅     | Best quality   |
| Safari  | ✅     | iOS supported  |
| Firefox | ✅     | Good quality   |
| Edge    | ✅     | Windows voices |
| Opera   | ✅     | Chromium-based |

## Keyboard Shortcuts

Currently: None (manual click only)

Future: Could add Ctrl+Shift+S to toggle TTS

## Settings

Currently: Always enabled (if browser supports)

Future enhancements:

- Speed control (0.5x - 2x)
- Voice selection
- Auto-play option
- Global on/off toggle

## Testing the Feature

### Test Cases

1. **Basic Functionality**
   - [ ] Click speaker icon → question reads aloud
   - [ ] Click again → speech stops
   - [ ] Icon changes color during speech

2. **Multiple Questions**
   - [ ] Switch to next question → previous speech stops
   - [ ] Each question has its own speaker icon
   - [ ] State is maintained per question

3. **Edge Cases**
   - [ ] Questions with multiple input fields
   - [ ] Very long questions
   - [ ] Questions with special characters
   - [ ] Questions with mathematical notation

4. **Animations**
   - [ ] Hover effect works
   - [ ] Pulse animation during speech
   - [ ] Click feedback animation

5. **Browser Compatibility**
   - [ ] Works in Chrome
   - [ ] Works in Safari
   - [ ] Works in Firefox
   - [ ] Icon hidden in unsupported browsers

## Troubleshooting

### Speaker Icon Not Visible

**Cause**: Browser doesn't support Web Speech API
**Solution**: Use a modern browser (Chrome, Safari, Firefox, Edge)

### No Sound When Clicking

**Possible Causes**:

1. Device volume is muted
2. Browser requires user interaction first (try clicking elsewhere first)
3. Browser permissions blocked

**Solutions**:

1. Check device volume
2. Refresh page and try again
3. Check browser permissions

### Speech Cuts Off

**Cause**: Browser limitation on text length
**Solution**: This is rare, but if it happens, the question might be too long for TTS

### Wrong Language

**Cause**: Browser selected non-English voice
**Solution**: The code prefers en-US voices, but this depends on available system voices

## Developer Notes

### Code Location

- **Manager**: `src/app/utils/TextToSpeechManager.js`
- **UI**: `src/app/components/templates/QuestionPage/QuestionPage.jsx` (lines 1708-1785)
- **Animations**: `src/app/utils/ExerciseAnimationController.js` (lines 585-663)
- **Styles**: `src/app/assets/scss/components/templates/QuestionPage/_questionPage.scss` (lines 365-401)

### Key Functions

```javascript
// Toggle TTS for a question
handleTTSToggle(questionId, questionData);

// Extract text from Tiptap JSON
extractQuestionText(questionData);

// TTS Manager methods
ttsManager.speak(text, options);
ttsManager.stop();
ttsManager.isSupported();
```

### State Management

```javascript
this.state = {
  isSpeaking: false, // Is TTS currently active?
  speakingQuestionId: null, // Which question is being read?
};
```

## Customization

### Change Voice Speed

Edit `TextToSpeechManager.js`:

```javascript
utterance.rate = 1.5; // 1.5x speed (default is 1.0)
```

### Change Voice Pitch

```javascript
utterance.pitch = 1.2; // Higher pitch (default is 1.0)
```

### Change Icon Colors

Edit `QuestionPage.jsx`:

```javascript
// Idle color
color: "#8D8D8D"; // Change this

// Speaking color
color: "#00CDD2"; // Change this
```

### Change Animation Speed

Edit `_questionPage.scss`:

```scss
@keyframes speaker-pulse {
  // Change 1.2s to adjust speed
  animation: speaker-pulse 0.8s ease-in-out infinite;
}
```

## Accessibility Impact

### WCAG 2.1 Compliance

- ✅ **1.3.1 Info and Relationships**: Clear visual indicator
- ✅ **2.1.1 Keyboard**: Can be triggered via keyboard (focus + Enter)
- ✅ **2.4.7 Focus Visible**: Hover state provides feedback
- ✅ **3.2.4 Consistent Identification**: Same icon used throughout

### Benefits

1. **Auditory Learners**: Hear questions instead of just reading
2. **Reading Difficulties**: Dyslexia, visual impairments
3. **ESL Students**: Hear correct pronunciation
4. **Multitasking**: Listen while looking at reference materials
5. **Fatigue**: Reduce eye strain from reading

## Performance

### Bundle Size Impact

- TextToSpeechManager: ~2KB gzipped
- No external dependencies
- Native browser API (zero network calls)

### Runtime Performance

- Lazy initialization (only when needed)
- No impact on page load
- Minimal memory usage
- Works offline

## Future Roadmap

### Phase 2 Enhancements

1. **Speed Control Slider**
   - 0.5x (slow)
   - 1.0x (normal)
   - 1.5x (fast)
   - 2.0x (very fast)

2. **Voice Selection Dropdown**
   - Male/Female options
   - Different accents
   - Preview voices

3. **Auto-play Setting**
   - Toggle in user profile
   - Auto-read on question load
   - Delay before auto-play

4. **Highlight Sync**
   - Highlight words as spoken
   - Visual progress indicator

5. **Keyboard Shortcuts**
   - Ctrl+Shift+S: Toggle TTS
   - Ctrl+Shift+P: Pause/Resume
   - Ctrl+Shift+[: Slower
   - Ctrl+Shift+]: Faster

6. **Language Support**
   - Chinese (zh-HK) questions
   - Bilingual support
   - Language auto-detection

## Feedback Collection

### User Testing Questions

1. How often do you use the TTS feature?
2. Is the speaker icon easy to find?
3. Is the voice speed appropriate?
4. Does it help you understand questions better?
5. What improvements would you suggest?

### Analytics to Track

- TTS usage rate (% of questions)
- Average duration per session
- Browser distribution
- Error rate
- Completion rate (TTS users vs non-users)

---

**Last Updated**: October 24, 2025
**Version**: 1.0.0
**Status**: ✅ Production Ready
