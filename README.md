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

### Script structure

```json
{
  "files": [ ...file tree... ],
  "actions": [ ...action list... ]
}
```

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
Type an assistant reply as a chat bubble.
```json
{ "type": "chat-assistant", "text": "Sure! Here's a cleaner version...", "speed": 60 }
```

| Field | Default | Description |
|---|---|---|
| `speed` | `60` | Characters per second |

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
