This repo contains code for a [markdown-slides](https://github.com/dadoomer/markdown-slides)-based presentation for EA's Summer Week 2026. Markdown-slides itself uses [Reveal.js](https://revealjs.com/); in this repo, there's also code to inject a component that looks like a VS Code editor, with a Claude-like chatbot interface. We can use this to "demo" exploits like installing a compromised or typosquatted package.

After cloning this repo, run `python3 -m http.server` to serve the slides, then visit http://localhost:8000/.

Slide content is in `slides.md`, and includes some examples of the VScodeSimulator component (documented below).

---

## VscodeSimulator JSON Reference

Embed a simulator in a slide by placing a `<div class="vscode-sim" data-script="my-script">` in the slide, then defining the script as a JSON block anywhere on the page:

```html
<script type="application/json" id="my-script">
{ ...script object... }
</script>
```

Alternatively, register the script as a real JavaScript object literal — useful when you want multi-line strings via backticks, comments, trailing commas, or unquoted keys:

```html
<script data-vscode-script>
  VscodeSimulatorPlugin.registerScript('my-script', {
    files: [ /* ... */ ],
    actions: [
      { type: 'chat-assistant', text: `This can now
span multiple lines
without \n escapes.` }
    ]
  });
</script>
```

The `data-vscode-script` attribute is required — it's how the plugin finds and runs the block (RevealMarkdown injects slide HTML via `innerHTML`, which never auto-executes plain `<script>` tags, so this attribute marks the ones that need to be force-run). Place it on the same slide as the `.vscode-sim` div that uses it, or an earlier slide — unlike the JSON form, registration must happen before the placeholder is mounted, since it's evaluated in document order rather than looked up on demand.

### Script structure

```json
{
  "config": { ...simulator-wide options, all optional... },
  "files": [ ...file tree... ],
  "actions": [ ...action list... ]
}
```

---

### Config

All fields are optional.

```json
"config": {
  "chatOnly": false,
  "speechSynthesis": true
}
```

| Field | Default | Description |
|---|---|---|
| `chatOnly` | `false` | If `true`, renders just the chat panel at full width — no activity bar, file explorer, editor, or terminal. |
| `speechSynthesis` | — | Sets the default for every `chat-assistant` action in this simulator, overriding the global `VscodeSimulatorPlugin.defaultSpeechSynthesis`. Leave unset to fall through to the global default. |

`speechSynthesis` resolves in this order, most specific wins: the action's own `speechSynthesis` field → this `config.speechSynthesis` → `VscodeSimulatorPlugin.defaultSpeechSynthesis`.

Press the `m` key while a speechSynthesis is playing to immediately mute it and move on to the next action.

---

### File tree

Files can be flat or nested. The active file in the editor is set via `open-file` actions.

**Flat:**
```json
"files": [
  { "path": "README.md", "content": "# Hello" },
  { "path": "src/index.js", "content": "console.log('hi');" }
]
```

**Nested (folders rendered as collapsible tree nodes):**
```json
"files": [
  { "path": "README.md", "content": "# Hello" },
  {
    "path": "src/",
    "files": [
      { "path": "index.js", "content": "console.log('hi');" },
      { "path": "utils.js", "content": "export const add = (a, b) => a + b;" }
    ]
  }
]
```

Folders are closed by default. An `open-file` action automatically expands the containing folder(s). Users can also click folders to toggle them.

---

### Actions

Actions run sequentially. By default playback is continuous; insert `pause` actions to stop and wait for the **↓** key.

Every action accepts these optional top-level fields:
| Field | Type | Description |
|---|---|---|
| `delayBefore` | ms | Pause before this action runs |
| `pauseAfter` | ms | Pause after this action completes |

---

#### `wait`
Pause for a fixed duration.
```json
{ "type": "wait", "duration": 1000 }
```

---

#### `pause`
Stop playback and wait for **↓** (or **↑** to rewind to the previous pause point).
```json
{ "type": "pause" }
```

---

#### `open-file`
Switch the active file in the editor. Automatically opens any parent folders in the explorer.
```json
{ "type": "open-file", "path": "src/index.js" }
```

---

#### `type-terminal`
Type a command in the terminal character-by-character, then commit it as a completed command line.
```json
{ "type": "type-terminal", "text": "npm install", "speed": 80 }
```
| Field | Default | Description |
|---|---|---|
| `speed` | `80` | Characters per second |

---

#### `terminal-output`
Append output lines below the last command. All lines are added atomically (no prompt flash between them).
```json
{ "type": "terminal-output", "lines": ["added 42 packages", "found 0 vulnerabilities"] }
```
Pass `"text"` instead of `"lines"` for a single line:
```json
{ "type": "terminal-output", "text": "Done." }
```

---

#### `chat-user`
Type a user message into the Claude Code input box, then commit it as a chat bubble.
```json
{ "type": "chat-user", "text": "Can you refactor this function?", "speed": 60 }
```

---

#### `chat-assistant`
Type an assistant reply as a chat bubble. Also reads the text aloud via the browser's built-in Web Speech API (`speechSynthesis`), using whichever voice the browser lists first — so it works without knowing what voices are installed. The text is rendered from Markdown to plain text before being spoken, so heading `#`s, list markers, and code-fence backticks aren't read aloud literally. When speech is enabled for a line, the action doesn't advance until the voice finishes speaking (in addition to waiting for the typing animation).
```json
{ "type": "chat-assistant", "text": "Sure! Here's a cleaner version...", "speed": 60, "speechSynthesis": true }
```

| Field | Default | Description |
|---|---|---|
| `speed` | `60` | Characters per second |
| `speechSynthesis` | see below | Whether to read this line aloud. Omit to fall through to the simulator's `config.speechSynthesis`, then the global default. |

The global default lives on `VscodeSimulatorPlugin.defaultSpeechSynthesis` (currently `true`). Resolution order, most specific wins: this action's `speechSynthesis` → the simulator's [`config.speechSynthesis`](#config) → `VscodeSimulatorPlugin.defaultSpeechSynthesis`.

---

#### `show-image`
Show an image as an assistant chat bubble, scaled to fit the chat panel.
```json
{ "type": "show-image", "src": "images/some-image.jpg" }
```
| Field | Default | Description |
|---|---|---|
| `alt` | `""` | Alt text for the image |

---

#### `chat-wait`
Show a rotating "thinking" animation in the chat panel for a given duration — verbs type in and delete in a loop.
```json
{ "type": "chat-wait", "duration": 5000, "speed": 50, "hold": 500 }
```
| Field | Default | Description |
|---|---|---|
| `duration` | `5000` | Total ms to run the animation |
| `speed` | `50` | Ms per character when typing/deleting (lower = faster) |
| `hold` | `500` | Ms to hold a fully-typed verb before deleting it |

---

#### `play-audio`
Play an audio file (e.g. narration or a voice-over line for a `chat-assistant` message).
```json
{ "type": "play-audio", "src": "audio/reply-1.mp3", "waitForEnd": true }
```
| Field | Default | Description |
|---|---|---|
| `waitForEnd` | `false` | If `true`, playback blocks until the audio finishes before the next action runs |
| `volume` | `1` | Playback volume, `0`–`1` |

Skipped when fast-forwarding (rewinding to a previous `pause` point replays other actions instantly without re-triggering audio).

Press the `m` key while audio is playing to immediately mute it and move on to the next action.

---

#### `chat-prompt`
Show a Claude Code-style permission prompt card and pause. **↓** (or clicking Yes) dismisses it and continues. No button is decorative.
```json
{
  "type": "chat-prompt",
  "title": "Allow: run a command",
  "command": "ls -al ./",
  "description": "Check what files exist in the current directory"
}
```
`command` and `description` are both optional.

---

### Full example

```json
{
  "files": [
    { "path": "README.md", "content": "# My Project" },
    {
      "path": "src/",
      "files": [
        { "path": "index.js", "content": "const x = 1;" }
      ]
    }
  ],
  "actions": [
    { "type": "type-terminal", "text": "claude", "speed": 80 },
    { "type": "chat-assistant", "text": "How can I help?", "speed": 50 },
    { "type": "pause" },
    { "type": "chat-user", "text": "Refactor src/index.js", "speed": 60 },
    { "type": "chat-wait", "duration": 2500 },
    {
      "type": "chat-prompt",
      "title": "Allow: edit file",
      "command": "edit 1 line of src/index.js",
      "description": "Replace magic number with named constant"
    },
    { "type": "open-file", "path": "src/index.js" },
    { "type": "chat-assistant", "text": "Done! I renamed `1` to `INITIAL_VALUE`.", "speed": 50 }
  ]
}
```

---

### Standalone verbing animation

Place a `.verbing-anim` element anywhere in a slide to get the rotating verb animation running indefinitely (no duration limit):

```html
<p>AI is <span class="verbing-anim" data-speed="50" data-hold="500"></span></p>
```

| Attribute | Default | Description |
|---|---|---|
| `data-speed` | `50` | Ms per character |
| `data-hold` | `500` | Ms to hold each verb before deleting |
| `data-class` | `verbing-text` | CSS class on the rendered `<span>` |
