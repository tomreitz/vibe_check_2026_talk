[comment]: # (controls: true)
[comment]: # (keyboard: true)
[comment]: # (markdown: { smartypants: true })
[comment]: # (hash: false)
[comment]: # (respondToHashChanges: false)


# Vibe check: a vibe-coded talk about<br />staying safe and sane with AI

<div class="verbing-anim" data-class="intro-verb-animation"></div>

<div style="display:inline-block; width:48%; margin-top:40px; text-align:right;">
  <b>Mark TenHoor</b> (Principal Cloud Engineer)
  <br /><span style="line-height:200%"> </span>
  <b>Tom Reitz</b> (Staff Data Engineer)
</div>
<div style="display:inline-block; width:48%; position:relative; top:-12px; text-align:left;">
&nbsp; @ <img src="ea_logo.png" style="height:48px; width:auto; margin:0; padding:0 10px; vertical-align:middle;" />

---

## Normal slide

This slide is regular Markdown content.

![too-many-fingers](./images/new-engineer-sure-types-fast.png)

The new engineer sure types fast!

---

## Intro demo

<div class="vscode-sim" data-script="intro-demo-script"></div>

<script type="application/json" id="intro-demo-script">
{
  "title": "Intro demo",
  "files": [
    {
      "path": "README.md",
      "content": "# Demo Project\n\nThis file is part of the simulated file tree."
    },
    {
      "path": "src/",
      "files": [
        {
          "path": "index.js",
          "content": "console.log('Hello from the simulator!');\n"
        }
      ]
    }
  ],
  "actions": [
    { "type": "open-file", "path": "README.md", "delayBefore": 200 },
    { "type": "wait", "duration": 2800 },
    { "type": "type-terminal", "text": "npm start", "speed": 70, "pauseAfter": 400 },
    { "type": "terminal-output", "lines": ["Starting development server...", "Compiled successfully!"], "delayBefore": 2800 },
    { "type": "wait", "duration": 1200 },
    { "type": "chat-user", "text": "Show me the next step.", "speed": 50 },
    { "type": "chat-wait", "duration": 4000, "speed": 60 },
    { "type": "chat-assistant", "text": "### Summary\nHere the plan:\n1. Determine file and directory structure.\n1. Read `*.js` files.\n1. Add new feature:\n```javascript\nloop.run();\n```", "delayBefore": 600 },
    { "type": "chat-prompt", "title": "Allow: run a command", "command": "ls -al ./", "description": "Check what files exist in the current directory" },
    { "type": "type-terminal", "text": "ls -al ./", "speed": 70, "pauseAfter": 400 },
    { "type": "terminal-output", "lines": ["README.md   src/"], "delayBefore": 800 },
    { "type": "chat-assistant", "text": "Great, I see the `index.js`, now let me look at its contents.", "delayBefore": 600 },
    { "type": "open-file", "path": "src/index.js", "delayBefore": 500 },
    { "type": "chat-wait", "duration": 4000, "speed": 60 },
    { "type": "chat-assistant", "text": "Ok, I'm going to add the following code to `index.js`:\n```javascript\nconsole.log('hi from Claude Code!');\n```\n(Asking the user to confirm this edit.)", "delayBefore": 600 },
    { "type": "chat-prompt", "title": "Allow: edit file", "description": "`src/index.js`" }
  ]
}
</script>

---

## Manual step demo

Use the down-arrow while this slide is active to advance the simulator steps, and the up-arrow to rewind one step.

<div class="vscode-sim" data-script="manual-demo-script"></div>

<script type="application/json" id="manual-demo-script">
{
  "title": "Manual step demo",
  "files": [
    {
      "path": "app.js",
      "content": "function greet() {\n  return 'Hello world';\n}\n\nconsole.log(greet());\n"
    }
  ],
  "actions": [
    { "type": "open-file", "path": "app.js" },
    { "type": "pause" },
    { "type": "type-terminal", "text": "node app.js", "speed": 60 },
    { "type": "pause" },
    { "type": "terminal-output", "lines": ["Hello world"] }
  ]
}
</script>

---

## Notes

- Scripts live directly in Markdown using `<script type="application/json">` blocks.
- The page mounts a reusable simulator component for each placeholder.
- Arrow keys are hijacked while a simulator is active, so the demo steps advance before Reveal moves to the next slide.
