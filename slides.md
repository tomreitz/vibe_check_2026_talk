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

<div class="vscode-sim" data-script="intro-script"></div>

<script data-vscode-script>
  VscodeSimulatorPlugin.registerScript('intro-script', {
    title: "Intro",
    config: {
      chatOnly: true,
      speechSynthesis: true
    },
    actions: [
      { type: "chat-user", text: "Hey there, I need to make a presentation about using AI for Summer Week. Can you help?", speed: 50 },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "Kinda last-minute, no? Well no worries, I'm here for you! But if I'm going to be part of your presentation, I'd like some walk-on music...", delayBefore: 600 },
      { type: "chat-user", text: "Uh... ok, what do you have in mind?", speed: 50 },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "How about this?", delayBefore: 600 },
      { type: "play-audio", src: "audio/wanna-be-me-too.mp3", waitForEnd: true },
      { type: "pause" },
      { type: "chat-user", text: "That's a little on-the-nose, no?", speed: 50 },
      { type: "chat-assistant", text: "You're right to push back here, I'll tone it down. Let's try this.", delayBefore: 600 },
      { type: "play-audio", src: "audio/somebodys-watching-me.mp3", waitForEnd: true },
      { type: "pause" },
      { type: "chat-user", text: "Fine, whatever.", speed: 50 },
      { type: "chat-user", text: "Now, about the presentation?", speed: 50 },
      { type: "chat-assistant", text: "Right. How's this for an outline?",delayBefore: 600 },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: `### Intro: why are we here?
  * a data engineer who has access to PII, builds with AI, and is worried about compromise... and eroding my skills
  * a cloud engineer who is responsible for deploying code and keeping it secure
  * This talk is a case for _thoughtful_ use of AI

  ### Part 1: Philosophy
  * AI is brilliant at producing plausible-looking work
  * When the work is _load-bearing_, a human must understand and check it

  ### Part 2: Categories of failures in AI work
  * Malicious tools/extensions
  * Supply-chain compromise
  * Human error (e.g. typosquatting)

  ### Part 3: Summary of dangers
  * Secrets and PII leaving a laptop
  * Compromised packages sailing into production.
  * The "day 300" problem

  ### Part 5: Discussion

  ### Conclusion: Connecting to EA's values
  * Thoughtful use <-> Human-Centered
  * Build cool things. Check the work. Tell a human. Don't leave it to rot.

  `, delayBefore: 600, speechSynthesis: false } 
    ]
  });
</script>

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
