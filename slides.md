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
      { type: "pause" },
      { type: "chat-user", text: "I need to make a presentation about using AI for Summer Week. Can you help?", speed: 50 },
      { type: "pause" },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "A little last-minute, but no worries - I'm here for you! But if I'm going to be part of your presentation, I'd like some walk-on music...", delayBefore: 600 },
      { type: "chat-user", text: "Uh... ok, what do you have in mind?", speed: 50 },
      { type: "pause" },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "How about this?", delayBefore: 600 },
      { type: "play-audio", src: "audio/wanna-be-me-too.mp3", waitForEnd: true },
      { type: "pause" },
      { type: "chat-user", text: "That's a little on-the-nose, no?", speed: 50 },
      { type: "pause" },
      { type: "chat-assistant", text: "You're right to push back here, I'll tone it down. Let's try this.", delayBefore: 600 },
      { type: "play-audio", src: "audio/somebodys-watching-me.mp3", waitForEnd: true },
      { type: "pause" },
      { type: "chat-user", text: "Fine, whatever.", speed: 50 },
      { type: "chat-user", text: "Now, about the presentation?", speed: 50 },
      { type: "pause" },
      { type: "chat-assistant", text: "Right. How's this for an outline?",delayBefore: 600 },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: `### Intro: why are we here?
  * a data engineer who has access to PII, builds with AI, and is worried about compromise... and eroding my skills
  * a cloud engineer who is responsible for deploying code and keeping it secure
  * This talk is a case for _thoughtful_ use of AI

  ### Part 1: Philosophical explorations
  * AI is brilliant at producing plausible-looking work
  * When the work is _load-bearing_, a human must understand and check it

  ### Part 2: Categories of failures in AI work
  * Malicious tools/extensions
  * Supply-chain compromise
  * Human error (e.g. typosquatting)

  ### Part 3: Summary of challenges
  * Secrets and PII leaving a laptop
  * Compromised packages sailing into production.
  * The "day 300" problem

  ### Part 4: Discussion

  ### Conclusion: Connecting to EA's values
  * Thoughtful use <-> Human-Centered
  * Build cool things. Check the work. Tell a human. Don't leave it to rot.
  `, delayBefore: 600, speechSynthesis: false } 
    ]
  });
</script>
---

## Philosophical explorations

<!-- .slide: data-background-color="#004645" -->

Note:
- "This half is the philosophy. The scary security stuff comes after — this is *why it matters*."

---

## Correctness

![too-many-fingers](./images/new-engineer-sure-types-fast.png)

Note:
- The core claim, said plainly: plausibility used to be *evidence* of correctness — because producing plausible work was hard. A fluent analysis was probably a real one.
- AI makes plausibility free while leaving correctness expensive. So the tell we all quietly relied on — "this looks right, feels right" — has come unhooked from "is right."

##

## _When_ does correctness matter?

When it's _load-bearing_.

- Not everything is load-bearing.
- The stuff that is? A human should actually understand it.

Note:
- Example: an Excel formula for summing project costs... load-bearing, or not? Depends - a matter of judgement.
- The point isn't "don't trust AI." It's that plausibility is no longer enough *for the things that matter* — someone has to be responsible for understanding and correctness. (We'll come back to "responsibility.")
---

<div class="vscode-sim" data-script="philosophy-script"></div>

<script data-vscode-script>
  VscodeSimulatorPlugin.registerScript('philosophy-script', {
    title: "Philosophy",
    config: {
      chatOnly: true,
      speechSynthesis: true
    },
    actions: [
      { type: "pause" },
      { type: "chat-user", text: "Sometimes AI-generated work bothers me, even when it's good. Why?", speed: 50 },
      { type: "pause" },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "Good question. Here's one way to see it: For all of history, the effort to make something was quietly doing three jobs at once: it produced the thing, it proved you understood the thing, and it showed you cared enough to try. Those three always came bundled.", delayBefore: 600 },
      { type: "pause" },
      { type: "chat-user", text: "Interesting - and AI splits them apart. You can have the artifact without the understanding.", speed: 50 },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "Exactly. The artifact stops being evidence of the other two.", delayBefore: 600 },
    ]
  });
</script>
---

## Side-effects of Effort

Effort used to do **three** jobs at once:

<table><tr><td>

![effort-understanding-care](./images/effort-understanding-care.png)

in the past, _effort_
1. made the thing
2. proved you understood it
3. showed you cared enough to try

</td><td>

![cost-free-making](./images/cost-free-making.png)

with AI, you can now
- have the artifact **without** the understanding
- have it **without** the effort-that-signals-care

</td></tr></table>

Note:
- Maybe this is why so much feels subtly broken right now — our trust instincts, our norms, our sense of "this person did the work" all quietly relied on that bundle.
- AI has collapsed the cost of *making* things. It has not collapsed the cost of *understanding* them, *maintaining* them, or *being responsible* for them — if anything, it raised those."
---

## Dependence

<table><tr><td>

![division-long](./images/division-long.png)

</td><td>

![division-calculator](./images/division-calculator.png)

</td></tr></table>

Offloading the **task**? Fine, we've been doing that forever.

Offloading the **understanding**? That's potentially a problem.

Note:
- The calculator didn't kill mathematicians. We offload skills to tools constantly and it's good.
- The honest question isn't "am I using AI to do things I couldn't do myself." It's "am I offloading the *task*, or the *understanding of the task*?"
---

## Maintainance

- Load-bearing artifacts (both AI- and human-generated) need maintenance.
- Humans must know they exist, and how they work.
- (Also related to responsibility & accountability)

![hide-the-leak-harold](./images/hide-the-leak-harold.png)

Note:
- The *ease* of making with AI can make things invisible. It was so cheap it never entered any of the processes — review, docs, dependency tracking — that would've helped make it maintainable. The ease *is* the liability, just deferred.
- "Software at scale is infrastructure. Most of us wouldn't drive over a bridge some guy built in his backyard over a weekend."
---
 
## Structure

<table><tr><td style="text-align:center;">

![building-no-plan](./images/building-no-plan.png)

Vibe-coding, stream-of-consciousness

(No plan, no structure)

</td><td style="text-align:center;">

![building-with-plan](./images/building-with-plan.png)

Plan before building

(First-principles thinking)

</td></tr></table>

Note:
- Vibe-coding, especially greenfield, tends to be "just describe what you want and it builds it." Fun. Fast. Often structurally a mess.
- That mess isn't just ugly — it's *illegible*. Hard for the next human to read, reason about, or safely change.
- First-principles thinking is how you front-load legibility so the day-300 person has a fighting chance. Structure is a gift to your future colleague.
---

<div class="vscode-sim" data-script="philosophy-script"></div>

<script data-vscode-script>
  VscodeSimulatorPlugin.registerScript('philosophy-script', {
    title: "Philosophy",
    config: {
      chatOnly: true,
      speechSynthesis: true
    },
    actions: [
      { type: "pause" },
      { type: "chat-user", text: "Ok, can you help me put some of these ideas together into a concise definition of \"thoughtful use of AI\"?", speed: 50 },
      { type: "pause" },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "I can give you a clean line, but you might not want mine — you'll want the one that's true to your company. What do you actually value here?", delayBefore: 600 },
      { type: "pause" },
      { type: "chat-user", text: "Well, one of our company vlues is we are \"respectfully human-centered.\"", speed: 50 },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "chat-assistant", text: "So maybe this: thoughtful use is remembering there's always a _human_ on the other end of AI work - someone who inherits code, shares responsibility for a process, or must check correctness.", delayBefore: 600 },
    ]
  });
</script>

Note:
- I didn't write that last line alone. But I chose it, and I believe it. That's the whole point. Same tool, used two very different ways — and only one of them is thoughtful.
---

## Categories of failures in AI work

<!-- .slide: data-background-color="#B9C838" -->

Note:
- "Let's shift gears a bit and look at some examples of real ways AI is impacting software and security in the wild.
---





























## Supply-chain attack

This slide can help explain how a supply-chain attack works, based on recent news about salad kits.

![salad-surprise](./images/supply-chain-attack.png)

Suppose Mark is building a new business "Salad Surprises!" where he buys salad kits and then recombines/repackages them into new and surprising flavor combinations.

---

## Supply-chain attack

Unfortunately, Mark is vulnerable to a supply-chain attck.

![salad-surprise](./images/supply-chain-attack-2.png)

If one of the salad kits he buys is unsafe, then his product will be unsafe too.

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















---

## Discussion

<!-- .slide: data-background-color="#014363" -->
Discuss one of the following at your table:

<div style="width:60%; margin:0 auto;"><ol>
  <li style="margin-bottom:10px;">Can you think of something at work that only one person understands? (a spreadsheet, a process, a document) What would happen if they left?</li>
  <li style="margin-bottom:10px;">In your role, name one thing it'd be fine if AI got a little wrong, and one thing that absolutely cannot be wrong. What makes the difference?</li>
  <li style="margin-bottom:10px;">If a colleague sent you a polished document, would you want to know AI wrote it? Does your answer change for a birthday card vs. a contract vs. a performance review?</li>
  <li style="margin-bottom:10px;">What's something AI has genuinely made better or more human for you or your team?</li>
</ol></div>

Note:
- Let's take 10 minutes to discuss.
---

## Summary

EA's use of AI should be connected to our values.

* **Respectfully Human Centered** ↔ Thoughtful use of AI
* **First Principles Thinking** ↔ Structure-first approach
* **Evidence-Based** ↔ Correctness (when load-bearing)
---

<div class="vscode-sim" data-script="final-script"></div>

<script data-vscode-script>
  VscodeSimulatorPlugin.registerScript('final-script', {
    title: "Conclusion",
    config: {
      chatOnly: true,
      speechSynthesis: true
    },
    actions: [
      { type: "pause" },
      { type: "chat-assistant", text: "Ok, it sounds like we're ready to wrap up this presentation. Can I take us out with a song?", delayBefore: 600 },
      { type: "pause" },
      { type: "chat-user", text: "Sure, why not.", speed: 50 },
      { type: "pause" },
      { type: "chat-wait", duration: 2000, speed: 60 },
      { type: "play-audio", src: "audio/EducationAnalyticsSummerWeekAIAnthem.mp3", waitForEnd: false },
      { type: "chat-assistant", text: "[Verse 1] Monday badge on", delayBefore: 1350, speechSynthesis: false },
      { type: "chat-assistant", text: "Fresh white shoes", delayBefore: 1585, speechSynthesis: false },
      { type: "chat-assistant", text: "Coffee in the lobby", delayBefore: 907, speechSynthesis: false },
      { type: "chat-assistant", text: "Big plans, new moves", delayBefore: 1029, speechSynthesis: false },
      { type: "chat-assistant", text: "Education Analytics", delayBefore: 2250, speechSynthesis: false },
      { type: "chat-assistant", text: "On the wall", delayBefore: 2459, speechSynthesis: false },
      { type: "chat-assistant", text: "We came in curious", delayBefore: 1201, speechSynthesis: false },
      { type: "chat-assistant", text: "Ready for it all", delayBefore: 1598, speechSynthesis: false },
      { type: "chat-assistant", text: "[Pre-Chorus] Hands up, ideas rise", delayBefore: 2116, speechSynthesis: false },
      { type: "chat-assistant", text: "Small spark, big sky", delayBefore: 2943, speechSynthesis: false },
      { type: "chat-assistant", text: "One good question", delayBefore: 3410, speechSynthesis: false },
      { type: "chat-assistant", text: "Can change the ride", delayBefore: 1037, speechSynthesis: false },
      { type: "chat-assistant", text: "[Chorus] Education Analytics", delayBefore: 3979, speechSynthesis: false },
      { type: "chat-assistant", text: "We learn it, we live it", delayBefore: 3408, speechSynthesis: false },
      { type: "chat-assistant", text: "Education Analytics", delayBefore: 3163, speechSynthesis: false },
      { type: "chat-assistant", text: "Smart heart, we give it", delayBefore: 3429, speechSynthesis: false },
      { type: "chat-assistant", text: "Summer Week, Summer Week ☀️😎", delayBefore: 3953, speechSynthesis: false },
      { type: "chat-assistant", text: "Keep it moving, keep it sleek", delayBefore: 2979, speechSynthesis: false },
      { type: "chat-assistant", text: "Education Analytics", delayBefore: 2629, speechSynthesis: false },
      { type: "chat-assistant", text: "This is the moment we keep", delayBefore: 3479, speechSynthesis: false },
      { type: "chat-assistant", text: "[Verse 2] Whiteboard full", delayBefore: 4786, speechSynthesis: false },
      { type: "chat-assistant", text: "With the next best thing", delayBefore: 1105, speechSynthesis: false },
      { type: "chat-assistant", text: "Real talk, real data", delayBefore: 1224, speechSynthesis: false },
      { type: "chat-assistant", text: "Let the whole room sing", delayBefore: 1280, speechSynthesis: false },
      { type: "chat-assistant", text: "AI with a thoughtful touch", delayBefore: 1673, speechSynthesis: false },
      { type: "chat-assistant", text: "Used right, used well", delayBefore: 1366, speechSynthesis: false },
      { type: "chat-assistant", text: "Less noise, more insight", delayBefore: 1501, speechSynthesis: false },
      { type: "chat-assistant", text: "That's the story we tell", delayBefore: 1314, speechSynthesis: false },
      { type: "chat-assistant", text: "[Pre-Chorus] Hands up, ideas rise", delayBefore: 2274, speechSynthesis: false },
      { type: "chat-assistant", text: "Small spark, big sky", delayBefore: 2973, speechSynthesis: false },
      { type: "chat-assistant", text: "One good question", delayBefore: 3280, speechSynthesis: false },
      { type: "chat-assistant", text: "Can change the ride", delayBefore: 1187, speechSynthesis: false },
      { type: "chat-assistant", text: "[Chorus] Education Analytics", delayBefore: 3919, speechSynthesis: false },
      { type: "chat-assistant", text: "We learn it, we live it", delayBefore: 3428, speechSynthesis: false },
      { type: "chat-assistant", text: "Education Analytics", delayBefore: 3153, speechSynthesis: false },
      { type: "chat-assistant", text: "Smart heart, we give it", delayBefore: 3439, speechSynthesis: false },
      { type: "chat-assistant", text: "Summer Week, Summer Week ☀️😎", delayBefore: 3863, speechSynthesis: false },
      { type: "chat-assistant", text: "Keep it moving, keep it sleek", delayBefore: 3089, speechSynthesis: false },
      { type: "chat-assistant", text: "Education Analytics", delayBefore: 2749, speechSynthesis: false },
      { type: "chat-assistant", text: "This is the moment we keep", delayBefore: 3319, speechSynthesis: false },
      { type: "chat-assistant", text: "[Bridge] Take it slow", delayBefore: 4806, speechSynthesis: false },
      { type: "chat-assistant", text: "Make it right", delayBefore: 1721, speechSynthesis: false },
      { type: "chat-assistant", text: "Build it for the classroom", delayBefore: 1413, speechSynthesis: false },
      { type: "chat-assistant", text: "Build it for life", delayBefore: 1336, speechSynthesis: false },
      { type: "chat-assistant", text: "Human first", delayBefore: 1877, speechSynthesis: false },
      { type: "chat-assistant", text: "Then the guide", delayBefore: 1681, speechSynthesis: false },
      { type: "chat-assistant", text: "AI in the back seat", delayBefore: 1334, speechSynthesis: false },
      { type: "chat-assistant", text: "Helping us decide", delayBefore: 1479, speechSynthesis: false },
      { type: "chat-assistant", text: "[Final Chorus] Education Analytics", delayBefore: 5607, speechSynthesis: false },
      { type: "chat-assistant", text: "We learn it, we live it", delayBefore: 3324, speechSynthesis: false },
      { type: "chat-assistant", text: "Education Analytics", delayBefore: 3313, speechSynthesis: false },
      { type: "chat-assistant", text: "Smart heart, we give it", delayBefore: 3279, speechSynthesis: false },
      { type: "chat-assistant", text: "Summer Week, Summer Week ☀️😎", delayBefore: 3793, speechSynthesis: false },
      { type: "chat-assistant", text: "Keep it moving, keep it sleek", delayBefore: 3239, speechSynthesis: false },
      { type: "chat-assistant", text: "Education Analytics", delayBefore: 2759, speechSynthesis: false },
      { type: "chat-assistant", text: "This is the moment we keep", delayBefore: 3279, speechSynthesis: false },
      { type: "chat-assistant", text: "[Outro] Oh-oh, we keep it thoughtful", delayBefore: 5296, speechSynthesis: false },
      { type: "chat-assistant", text: "Oh-oh, we keep it bright", delayBefore: 3106, speechSynthesis: false },
      { type: "chat-assistant", text: "Summer Week at Education Analytics", delayBefore: 3964, speechSynthesis: false },
      { type: "chat-assistant", text: "Feels so right", delayBefore: 2054, speechSynthesis: false },
      { type: "wait", duration: 7168 },
    ]
  });
</script>