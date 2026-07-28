const VscodeSimulatorPlugin = {
  id: 'vscode-simulator',
  registeredScripts: {},

  // Called from an executable <script data-vscode-script> block to register a simulator
  // script as a real JS object literal (supports template-literal strings, comments, etc.)
  // instead of a <script type="application/json"> block, which only allows strict JSON.
  registerScript(key, script) {
    this.registeredScripts[key] = script;
  },

  init(deck) {
    this.deck = deck;
    window.vscodeSimulatorControllers = {};
    window.activeVscodeSimulator = null;

    deck.on('ready', () => {
      this.mountSimulators();
      this.mountVerbingAnims();
      this.updateActiveSimulator();
    });

    deck.on('slidechanged', () => {
      this.updateActiveSimulator();
    });

    document.addEventListener('keydown', event => {
      const sim = window.activeVscodeSimulator;
      if (!sim) {
        return;
      }

      if (event.key === 'ArrowDown') {
        if (sim.hasMoreSteps()) {
          event.preventDefault();
          event.stopImmediatePropagation();
          sim.nextStep();
        }
      } else if (event.key === 'ArrowUp') {
        event.preventDefault();
        event.stopImmediatePropagation();
        sim.prevStep();
      } else if (event.key === 'm' || event.key === 'M') {
        let handled = false;
        if (typeof speechSynthesis !== 'undefined' && speechSynthesis.speaking) {
          speechSynthesis.cancel();
          handled = true;
        }
        if (activeAudioStop) {
          activeAudioStop();
          activeAudioStop = null;
          handled = true;
        }
        if (handled) {
          event.preventDefault();
          event.stopImmediatePropagation();
        }
      }
    }, true);
  },

  mountSimulators() {
    const sections = Array.from(document.querySelectorAll('.slides section'));
    sections.forEach(section => this.mountSimulatorsInSection(section));
  },

  mountVerbingAnims() {
    document.querySelectorAll('.verbing-anim').forEach(el => {
      if (el.dataset.verbMounted === 'true') return;
      el.dataset.verbMounted = 'true';
      const speed = el.dataset.speed != null ? parseInt(el.dataset.speed) : undefined;
      const hold = el.dataset.hold != null ? parseInt(el.dataset.hold) : undefined;
      const className = el.dataset.class || undefined;
      ReactDOM.render(React.createElement(VerbingText, { speed, hold, className }), el);
    });
  },

  // RevealMarkdown injects each slide's HTML via innerHTML, and scripts inserted that way
  // never auto-execute (a standard HTML behavior, not a bug). So <script data-vscode-script>
  // blocks are re-created as fresh <script> elements here, which forces the browser to run them.
  activateInlineScripts(section) {
    const scripts = section.querySelectorAll('script[data-vscode-script]');
    scripts.forEach(oldScript => {
      if (oldScript.dataset.vscodeScriptRun === 'true') {
        return;
      }
      oldScript.dataset.vscodeScriptRun = 'true';
      const newScript = document.createElement('script');
      newScript.textContent = oldScript.textContent;
      document.body.appendChild(newScript);
    });
  },

  mountSimulatorsInSection(section) {
    this.activateInlineScripts(section);
    const placeholders = section.querySelectorAll('.vscode-sim');
    placeholders.forEach(placeholder => {
      if (placeholder.dataset.simMounted === 'true') {
        return;
      }

      const scriptKey = placeholder.dataset.script;
      const script = this.loadScript(scriptKey);
      if (!script) {
        console.warn('No script found for', scriptKey);
        return;
      }

      const containerId = placeholder.dataset.simId || `vscode-sim-${Math.random().toString(36).slice(2, 10)}`;
      placeholder.dataset.simId = containerId;
      placeholder.dataset.simMounted = 'true';

      ReactDOM.render(
        React.createElement(VscodeSimulator, {
          script,
          onReady: controller => {
            window.vscodeSimulatorControllers[containerId] = controller;
            if (placeholder.closest('.present')) {
              window.activeVscodeSimulator = controller;
              controller.activate();
            }
          }
        }),
        placeholder
      );
    });
  },

  loadScript(scriptKey) {
    if (!scriptKey) {
      return null;
    }

    if (Object.prototype.hasOwnProperty.call(this.registeredScripts, scriptKey)) {
      return this.registeredScripts[scriptKey];
    }

    const candidates = [
      `script[type="application/json"]#${CSS.escape(scriptKey)}`,
      `script[type="application/json"]#${CSS.escape(`${scriptKey}-script`)}`
    ];

    let node = null;
    for (const selector of candidates) {
      node = document.querySelector(selector);
      if (node) {
        break;
      }
    }

    if (!node) {
      node = document.getElementById(scriptKey);
    }

    if (!node) {
      return null;
    }

    try {
      return JSON.parse(node.textContent);
    } catch (error) {
      console.error(`Invalid JSON in demo script ${scriptKey}`, error);
      return null;
    }
  },

  updateActiveSimulator() {
    const current = this.deck.getCurrentSlide();
    const activeSim = current ? current.querySelector('.vscode-sim') : null;
    const previousSim = window.activeVscodeSimulator;

    if (previousSim && previousSim.deactivate) {
      previousSim.deactivate();
    }

    if (activeSim && activeSim.dataset.simId) {
      const controller = window.vscodeSimulatorControllers[activeSim.dataset.simId];
      if (controller) {
        window.activeVscodeSimulator = controller;
        if (controller.activate) {
          controller.activate();
        }
        return;
      }
    }

    window.activeVscodeSimulator = null;
  }
};

// Set while a `play-audio` action's clip is playing, so the 'm' key can stop it early.
let activeAudioStop = null;

// Global default for whether `chat-assistant` actions are read aloud via the Web Speech API.
// Override per-action with `"speechSynthesis": false`, or flip this to change the default for the whole deck.
VscodeSimulatorPlugin.defaultSpeechSynthesis = true;

function sleep(duration) {
  return new Promise(resolve => setTimeout(resolve, duration));
}

// Returns a promise that resolves once the utterance finishes (or errors out),
// so callers can await it to pause playback until the line is done being spoken.
function speakText(text) {
  if (typeof speechSynthesis === 'undefined') {
    return Promise.resolve();
  }
  const utterance = new SpeechSynthesisUtterance(text);
  const voices = speechSynthesis.getVoices();
  if (voices.length > 0) {
    utterance.voice = voices[0];
    utterance.rate = 2;    // 0.1–10, 1 = normal
    utterance.pitch = 1;   // 0–2, 1 = normal
    utterance.volume = 1;  // 0–1
  }
  return new Promise(resolve => {
    utterance.addEventListener('end', resolve, { once: true });
    utterance.addEventListener('error', resolve, { once: true });
    speechSynthesis.speak(utterance);
  });
}

// Resolution order: per-action flag > per-simulator config > global default.
function resolveSpeechSynthesis(action, config) {
  if (action.speechSynthesis != null) {
    return action.speechSynthesis;
  }
  if (config && config.speechSynthesis != null) {
    return config.speechSynthesis;
  }
  return VscodeSimulatorPlugin.defaultSpeechSynthesis;
}

const CHAT_WAIT_VERBS = [
  'Flibbertigibbeting','Discombobulating','Wibbling','Snorfling','Bamboozling',
  'Whirligiggling','Kerfuffling','Lollygagging','Noodling','Doohickeying',
  'Thingamajigging','Skedaddling','Wobblefritzing','Bloopfangling','Snickersnacking',
  'Quibbleflopping','Flummoxing','Retroblasting','Cyberlasering','Turboencabulating',
  'Quantumfanagling','Hypercomputing','Megabooping','Photonjuggling','Nanoschmoozing',
  'Warpfolding','Flux-capacitating','Datacrunchifying','Vectorvibing','Synapsezapping',
  'Holopondering','Cryocogitating','Teleportulating','Bitwrangling','Plasmafiddling',
  'Subroutinizing','Galaxy-braining','Pondering','Hyperpostulating','Cogitating',
  'Ruminating','Percolating','Marinating','Mulling','Conjuring','Extrapolating',
  'Theorizing','Deliberating','Synthesizing','Contemplating','Postulating','Effervescing'
];

async function runVerbAnimation(speed, hold, onUpdate, shouldStop) {
  const verbs = [...CHAT_WAIT_VERBS];
  for (let i = verbs.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [verbs[i], verbs[j]] = [verbs[j], verbs[i]];
  }
  const charDelay = Math.max(5, speed != null ? speed : 30);
  const holdDelay = hold != null ? hold : 600;
  let verbIndex = 0;
  outer: while (!shouldStop()) {
    const verb = verbs[verbIndex % verbs.length];
    verbIndex++;
    for (let i = 1; i <= verb.length; i++) {
      if (shouldStop()) break outer;
      onUpdate(verb.slice(0, i));
      await sleep(charDelay);
    }
    await sleep(holdDelay);
    if (shouldStop()) break;
    for (let i = verb.length - 1; i >= 0; i--) {
      if (shouldStop()) break outer;
      onUpdate(verb.slice(0, i));
      await sleep(charDelay);
    }
    await sleep(180);
  }
  onUpdate('');
}

function VerbingText({ speed, hold, className }) {
  const [text, setText] = React.useState('');
  const cancelledRef = React.useRef(false);

  React.useEffect(() => {
    cancelledRef.current = false;
    runVerbAnimation(speed, hold, setText, () => cancelledRef.current);
    return () => { cancelledRef.current = true; };
  }, [speed, hold]);

  return React.createElement('span', { className: className || 'verbing-text' },
    text ? text + '...' : ''
  );
}

const ACTIVITY_ICON_PATHS = {
  Explorer: 'M20 6h-8l-2-2H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V8c0-1.1-.9-2-2-2z',
  Search: 'M15.5 14h-.79l-.28-.27C15.41 12.59 16 11.11 16 9.5 16 5.91 13.09 3 9.5 3S3 5.91 3 9.5 5.91 16 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z',
  Git: 'M22 11V3h-7v3H9V3H2v8h7V8h2v10h4v3h7v-8h-7v3h-2V8h2v3z',
  Run: 'M8 5v14l11-7z',
  Extensions: 'M20.5 11H19V7c0-1.1-.9-2-2-2h-4V3.5C13 2.12 11.88 1 10.5 1S8 2.12 8 3.5V5H4c-1.1 0-1.99.9-1.99 2v3.8H3.5c1.49 0 2.7 1.21 2.7 2.7s-1.21 2.7-2.7 2.7H2V20c0 1.1.9 2 2 2h3.8v-1.5c0-1.49 1.21-2.7 2.7-2.7 1.49 0 2.7 1.21 2.7 2.7V22H17c1.1 0 2-.9 2-2v-4h1.5c1.38 0 2.5-1.12 2.5-2.5S21.88 11 20.5 11z',
  Settings: 'M19.14 12.94c.04-.3.06-.61.06-.94 0-.32-.02-.64-.07-.94l2.03-1.58c.18-.14.23-.41.12-.61l-1.92-3.32c-.12-.22-.37-.29-.59-.22l-2.39.96c-.5-.38-1.03-.7-1.62-.94l-.36-2.54c-.04-.24-.24-.41-.48-.41h-3.84c-.24 0-.43.17-.47.41l-.36 2.54c-.59.24-1.13.57-1.62.94l-2.39-.96c-.22-.08-.47 0-.59.22L2.74 8.87c-.12.21-.08.47.12.61l2.03 1.58c-.05.3-.09.63-.09.94s.02.64.07.94l-2.03 1.58c-.18.14-.23.41-.12.61l1.92 3.32c.12.22.37.29.59.22l2.39-.96c.5.38 1.03.7 1.62.94l.36 2.54c.05.24.24.41.48.41h3.84c.24 0 .44-.17.47-.41l.36-2.54c.59-.24 1.13-.57 1.62-.94l2.39.96c.22.08.47 0 .59-.22l1.92-3.32c.12-.22.07-.47-.12-.61l-2.01-1.58zM12 15.6c-1.98 0-3.6-1.62-3.6-3.6s1.62-3.6 3.6-3.6 3.6 1.62 3.6 3.6-1.62 3.6-3.6 3.6z'
};

function flattenFiles(items, prefix) {
  const results = [];
  (items || []).forEach(item => {
    if (item.files) {
      const fullPath = (prefix || '') + item.path;
      const childPrefix = fullPath.endsWith('/') ? fullPath : fullPath + '/';
      results.push(...flattenFiles(item.files, childPrefix));
    } else {
      results.push({ path: (prefix || '') + item.path, content: item.content || '' });
    }
  });
  return results;
}

// Insert or replace a file in a nested file-tree. Returns a new tree (immutable update).
function upsertFile(items, filePath, content) {
  const parts = filePath.split('/').filter(Boolean);
  if (parts.length === 0) {
    return items || [];
  }

  const upsertAt = (nodes, index) => {
    const list = [...(nodes || [])];
    const name = parts[index];
    const isLast = index === parts.length - 1;

    if (isLast) {
      const existing = list.findIndex(item => !item.files && item.path === name);
      if (existing >= 0) {
        list[existing] = { path: name, content };
      } else {
        list.push({ path: name, content });
      }
      return list;
    }

    const folderKey = name + '/';
    const folderIndex = list.findIndex(item => item.files && (item.path === name || item.path === folderKey));
    if (folderIndex >= 0) {
      const folder = list[folderIndex];
      list[folderIndex] = {
        path: folder.path.endsWith('/') ? folder.path : folder.path + '/',
        files: upsertAt(folder.files, index + 1)
      };
    } else {
      list.push({
        path: folderKey,
        files: upsertAt([], index + 1)
      });
    }
    return list;
  };

  return upsertAt(items, 0);
}

function renderFileTree(items, prefix, depth, activePath, onSelect, openFolders, onToggleFolder) {
  const results = [];
  const basePad = 12 + depth * 14;
  const sorted = [...(items || [])].sort((a, b) => {
    if (a.files && !b.files) return -1;
    if (!a.files && b.files) return 1;
    return 0;
  });
  sorted.forEach(item => {
    if (item.files) {
      const folderName = item.path.replace(/\/$/, '');
      const fullPrefix = (prefix || '') + (item.path.endsWith('/') ? item.path : item.path + '/');
      const isOpen = openFolders.has(fullPrefix);
      results.push(React.createElement('li', {
        key: fullPrefix,
        className: 'file-folder',
        style: { paddingLeft: basePad + 'px' },
        onClick: () => onToggleFolder(fullPrefix)
      },
        React.createElement('span', { className: 'folder-icon' }, isOpen ? '▾ ' : '▸ '),
        folderName
      ));
      if (isOpen) {
        results.push(...renderFileTree(item.files, fullPrefix, depth + 1, activePath, onSelect, openFolders, onToggleFolder));
      }
    } else {
      const fullPath = (prefix || '') + item.path;
      results.push(React.createElement('li', {
        key: fullPath,
        className: fullPath === activePath ? 'active' : '',
        style: { paddingLeft: (basePad + 4) + 'px' },
        onClick: () => onSelect(fullPath)
      }, item.path));
    }
  });
  return results;
}

// Reuse the marked parser already bundled with the RevealMarkdown plugin — no extra dependency needed.
// Reveal.getPlugin('*') is safe to call here because simulators are only mounted after the 'ready' event.
function parseMarkdown(text) {
  return Reveal.getPlugin('markdown').marked.parse(text);
}

// Renders markdown to HTML then reads back the plain text, so headings/lists/code fences
// don't get spoken aloud as literal characters (e.g. "##", "*", backticks).
function markdownToPlainText(markdown) {
  const container = document.createElement('div');
  container.innerHTML = parseMarkdown(markdown);
  container.querySelectorAll('p, div, li, h1, h2, h3, h4, h5, h6, br, blockquote, pre, tr')
    .forEach(el => el.insertAdjacentText('afterend', ' '));
  return (container.textContent || '').replace(/\s+/g, ' ').trim();
}

const EXTENSION_TO_LANGUAGE = {
  js: 'javascript', jsx: 'javascript',
  ts: 'typescript', tsx: 'typescript',
  py: 'python',
  css: 'css', scss: 'scss',
  html: 'html',
  json: 'json',
  md: 'markdown',
  sh: 'bash', bash: 'bash',
  yml: 'yaml', yaml: 'yaml',
  sql: 'sql',
};

function getLanguage(filePath) {
  const ext = (filePath.split('.').pop() || '').toLowerCase();
  return EXTENSION_TO_LANGUAGE[ext] || 'plaintext';
}

// Reuse the hljs instance already bundled with the RevealHighlight plugin.
function highlightCode(content, language) {
  const hljs = Reveal.getPlugin('highlight').hljs;
  try {
    return hljs.highlight(content, { language }).value;
  } catch (_) {
    // Unknown language — return safely escaped plain text
    return content.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }
}

function defaultProjectName(script) {
  return (script.config && script.config.projectName) || 'talk-staying-safe-sane-with-ai [WSL: Ubuntu]';
}

function VscodeSimulator({ script, onReady }) {
  const [fileTree, setFileTree] = React.useState(() => script.files || []);
  const [projectName, setProjectName] = React.useState(() => defaultProjectName(script));
  const [activePath, setActivePath] = React.useState(() => {
    const files = flattenFiles(script.files || []);
    return (files[0] && files[0].path) || '';
  });
  const [terminalOutput, setTerminalOutput] = React.useState([{ type: 'separator' }]);
  const [terminalDraft, setTerminalDraft] = React.useState('');
  const [chatMessages, setChatMessages] = React.useState([]);
  const [chatDraft, setChatDraft] = React.useState('');
  const [chatDraftRole, setChatDraftRole] = React.useState('');
  const [openFolders, setOpenFolders] = React.useState(new Set());
  const [chatWaiting, setChatWaiting] = React.useState('');
  const [chatPrompt, setChatPrompt] = React.useState(null);
  const [stepCount, setStepCount] = React.useState(0);
  const actionIndexRef = React.useRef(0);
  const isActiveRef = React.useRef(false);
  const isRunningRef = React.useRef(false);
  const latestScriptRef = React.useRef(script);
  const chatPanelBodyRef = React.useRef(null);
  const terminalPanelBodyRef = React.useRef(null);

  latestScriptRef.current = script;

  const allFiles = React.useMemo(() => flattenFiles(fileTree), [fileTree]);

  const activeFile = React.useMemo(() => {
    return allFiles.find(file => file.path === activePath) || allFiles[0] || { path: '', content: '' };
  }, [allFiles, activePath]);

  const openAncestorFolders = React.useCallback(filePath => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      const parts = filePath.split('/');
      for (let i = 1; i < parts.length; i++) {
        next.add(parts.slice(0, i).join('/') + '/');
      }
      return next;
    });
  }, []);

  const toggleFolder = React.useCallback(folderPath => {
    setOpenFolders(prev => {
      const next = new Set(prev);
      if (next.has(folderPath)) {
        next.delete(folderPath);
      } else {
        next.add(folderPath);
      }
      return next;
    });
  }, []);

  const appendTerminalLine = React.useCallback(line => {
    setTerminalOutput(prev => [...prev, line]);
  }, []);

  const appendChatMessage = React.useCallback(message => {
    setChatMessages(prev => [...prev, message]);
  }, []);

  const typeText = React.useCallback(async (text, speed, onFrame) => {
    const delay = Math.max(10, Math.floor(1000 / (speed || 80)));
    let result = '';
    for (let i = 0; i < text.length; i += 1) {
      result += text[i];
      onFrame(result);
      await sleep(delay);
    }
    return result;
  }, []);

  const executeAction = React.useCallback(async (action, options = {}) => {
    if (!action || !latestScriptRef.current) {
      return;
    }

    const skipDelay = options.skipDelay === true;
    const skipTyping = options.skipTyping === true;

    if (action.delayBefore && !skipDelay) {
      await sleep(action.delayBefore);
    }

    switch (action.type) {
      case 'wait':
        if (!skipDelay) {
          await sleep(action.duration || 500);
        }
        break;

      case 'open-file':
        setActivePath(action.path);
        openAncestorFolders(action.path);
        break;

      case 'write-file': {
        const path = action.path;
        const content = action.content == null ? '' : action.content;
        setFileTree(prev => upsertFile(prev, path, content));
        if (action.open !== false) {
          setActivePath(path);
          openAncestorFolders(path);
        }
        break;
      }

      case 'set-files': {
        const nextFiles = action.files || [];
        setFileTree(nextFiles);
        setOpenFolders(new Set());
        if (action.projectName) {
          setProjectName(action.projectName);
        }
        const first = flattenFiles(nextFiles)[0];
        const nextPath = action.open || (first && first.path) || '';
        setActivePath(nextPath);
        if (nextPath) {
          openAncestorFolders(nextPath);
        }
        break;
      }

      case 'type-terminal': {
        const commitCommand = text => {
          setTerminalOutput(prev => {
            const last = prev[prev.length - 1];
            if (last && last.type === 'separator') {
              return [...prev.slice(0, -1), { type: 'command', text }];
            }
            return [...prev, { type: 'command', text }];
          });
        };
        setTerminalDraft('');
        if (skipTyping) {
          commitCommand(action.text);
        } else {
          await typeText(action.text, action.speed || 80, value => setTerminalDraft(value));
          commitCommand(action.text);
          setTerminalDraft('');
        }
        break;
      }

      case 'terminal-output': {
        const buildOutputLines = (lines) => {
          return (prev) => {
            const last = prev[prev.length - 1];
            const hasSeparator = last && last.type === 'separator';
            const base = hasSeparator ? prev.slice(0, -1) : prev;
            const [first, ...rest] = lines;
            return [
              ...base,
              hasSeparator
                ? { type: 'command', text: first }
                : { type: 'output', text: first },
              ...rest.map(text => ({ type: 'output', text })),
              { type: 'separator' }
            ];
          };
        };
        if (action.lines) {
          setTerminalOutput(buildOutputLines(action.lines));
        } else if (action.text) {
          setTerminalOutput(buildOutputLines([action.text]));
        }
        break;
      }

      case 'chat-user':
      case 'chat-assistant': {
        const role = action.type === 'chat-user' ? 'user' : 'assistant';
        setChatDraftRole(role);
        setChatDraft('');
        let speechPromise = null;
        if (role === 'assistant' && !skipTyping) {
          const scriptConfig = latestScriptRef.current.config || {};
          if (resolveSpeechSynthesis(action, scriptConfig)) {
            speechPromise = speakText(markdownToPlainText(action.text));
          }
        }
        if (skipTyping) {
          appendChatMessage({ role, text: action.text });
        } else {
          await typeText(action.text, action.speed || 60, value => setChatDraft(value));
          appendChatMessage({ role, text: action.text });
          setChatDraft('');
        }
        if (speechPromise) {
          await speechPromise;
        }
        setChatDraftRole('');
        break;
      }

      case 'show-image':
        appendChatMessage({ role: 'assistant', image: action.src, alt: action.alt || '' });
        break;

      case 'chat-wait':
        if (!skipDelay) {
          const endTime = Date.now() + (action.duration || 5000);
          await runVerbAnimation(action.speed, action.hold, setChatWaiting, () => Date.now() >= endTime);
        }
        break;

      case 'play-audio': {
        if (skipTyping) {
          break;
        }
        const audio = new Audio(action.src);
        if (action.volume != null) {
          audio.volume = action.volume;
        }
        const playback = audio.play();
        if (playback && playback.catch) {
          playback.catch(error => console.warn('Audio playback failed:', error));
        }
        if (action.waitForEnd) {
          await new Promise(resolve => {
            const finish = () => {
              activeAudioStop = null;
              resolve();
            };
            audio.addEventListener('ended', finish, { once: true });
            audio.addEventListener('error', finish, { once: true });
            activeAudioStop = () => {
              audio.pause();
              finish();
            };
          });
        } else {
          activeAudioStop = () => audio.pause();
          audio.addEventListener('ended', () => { activeAudioStop = null; }, { once: true });
        }
        break;
      }

      case 'chat-prompt':
        setChatPrompt({ title: action.title, command: action.command, description: action.description });
        return 'pause';

      case 'pause':
        return 'pause';

      default:
        console.warn('Unknown action type:', action.type);
    }

    if (action.pauseAfter && !skipDelay) {
      await sleep(action.pauseAfter);
    }

    return 'done';
  }, [appendChatMessage, appendTerminalLine, openAncestorFolders, typeText]);

  const hasMoreSteps = React.useCallback(() => {
    return actionIndexRef.current < (latestScriptRef.current.actions || []).length;
  }, []);

  const playNext = React.useCallback(async () => {
    if (!isActiveRef.current || isRunningRef.current) {
      return;
    }

    isRunningRef.current = true;
    const actions = latestScriptRef.current.actions || [];

    while (actionIndexRef.current < actions.length && isActiveRef.current) {
      const action = actions[actionIndexRef.current];
      const result = await executeAction(action);
      actionIndexRef.current += 1;
      setStepCount(actionIndexRef.current);

      if (result === 'pause') {
        break;
      }
    }

    isRunningRef.current = false;
  }, [executeAction]);

  const replayTo = React.useCallback(async targetIndex => {
    const actions = latestScriptRef.current.actions || [];
    const initialFiles = latestScriptRef.current.files || [];
    const firstFile = flattenFiles(initialFiles)[0];
    setFileTree(initialFiles);
    setProjectName(defaultProjectName(latestScriptRef.current));
    setActivePath((firstFile && firstFile.path) || '');
    setTerminalOutput([{ type: 'separator' }]);
    setTerminalDraft('');
    setChatMessages([]);
    setChatDraft('');
    setChatDraftRole('');
    setOpenFolders(new Set());
    setChatWaiting('');
    setChatPrompt(null);
    actionIndexRef.current = 0;
    setStepCount(0);

    for (let index = 0; index < targetIndex; index += 1) {
      const action = actions[index];
      await executeAction(action, { skipDelay: true, skipTyping: true });
      actionIndexRef.current += 1;
      setStepCount(actionIndexRef.current);
    }
  }, [executeAction]);

  const nextStep = React.useCallback(() => {
    if (!hasMoreSteps()) {
      return;
    }
    setChatPrompt(null);
    playNext();
  }, [hasMoreSteps, playNext]);

  const prevStep = React.useCallback(async () => {
    const actions = latestScriptRef.current.actions || [];
    const currentIndex = actionIndexRef.current;
    if (currentIndex <= 0) {
      return;
    }

    // Rewind to the action right after the most recent pause, or to 0
    let targetIndex = 0;
    for (let i = currentIndex - 2; i >= 0; i--) {
      if (actions[i].type === 'pause') {
        targetIndex = i + 1;
        break;
      }
    }
    await replayTo(targetIndex);
  }, [replayTo]);

  const activate = React.useCallback(() => {
    isActiveRef.current = true;
    playNext();
  }, [playNext]);

  const deactivate = React.useCallback(() => {
    isActiveRef.current = false;
    if (typeof speechSynthesis !== 'undefined') {
      speechSynthesis.cancel();
    }
  }, []);

  React.useEffect(() => {
    if (onReady) {
      onReady({ nextStep, prevStep, hasMoreSteps, activate, deactivate });
    }
  }, [hasMoreSteps, nextStep, onReady, prevStep, activate, deactivate]);

  // Auto-scroll: watch panel bodies for any DOM change and immediately scroll to the bottom.
  // MutationObserver fires as a browser microtask — outside React's rendering cycle — so it
  // avoids all timing issues with useEffect/useLayoutEffect. It also only touches these
  // elements, unlike scrollIntoView() which walks up to every scrollable ancestor.
  React.useEffect(() => {
    const panels = [chatPanelBodyRef.current, terminalPanelBodyRef.current].filter(Boolean);
    const observers = panels.map((el) => {
      const observer = new MutationObserver(() => {
        el.scrollTop = el.scrollHeight;
      });
      observer.observe(el, { childList: true, subtree: true, characterData: true });
      return observer;
    });
    return () => observers.forEach((observer) => observer.disconnect());
  }, []);

  const activeIndex = actionIndexRef.current;
  const totalSteps = script.actions.length;
  const config = script.config || {};
  const chatOnly = config.chatOnly === true;
  const agentName = config.agentName || 'Claude Code';

  return React.createElement('div', { className: 'vscode-shell' },
    React.createElement('div', { className: 'vscode-toolbar' },
      React.createElement('div', { className: 'toolbar-left' },
        ['File', 'Edit', 'Selection', 'View', 'Go', 'Run', 'Terminal', 'Help'].map(menu =>
          React.createElement('span', { key: menu, className: 'toolbar-item' }, menu)
        )
      ),
      React.createElement('div', { className: 'toolbar-right' },
        React.createElement('span', { className: 'toolbar-project' }, projectName)
      )
    ),
    React.createElement('div', { className: 'vscode-main' },
      React.createElement('div', { className: 'vscode-activity' },
        ['Explorer', 'Search', 'Git', 'Run', 'Extensions', 'Settings'].map(label =>
          React.createElement('div', { key: label, className: 'activity-icon', title: label },
            React.createElement('svg', {
              width: 22, height: 22,
              viewBox: '0 0 24 24',
              fill: 'currentColor',
              style: { display: 'block' }
            },
              React.createElement('path', { d: ACTIVITY_ICON_PATHS[label] || '' })
            )
          )
        )
      ),
      chatOnly ? null : React.createElement('div', { className: 'vscode-sidebar' },
        React.createElement('div', { className: 'sidebar-header' }, 'EXPLORER'),
        React.createElement('div', { className: 'sidebar-subtitle' }, 'WORKSPACE'),
        React.createElement('ul', { className: 'file-list' },
          renderFileTree(fileTree, '', 0, activePath, setActivePath, openFolders, toggleFolder)
        )
      ),
      React.createElement('div', { className: 'vscode-content' },
        chatOnly ? null : React.createElement('div', { className: 'editor-terminal-col' },
          React.createElement('div', { className: 'editor-region' },
            React.createElement('div', { className: 'editor-tabs' },
              React.createElement('div', { className: 'editor-tab active' }, activeFile.path)
            ),
            React.createElement('div', { className: 'vscode-editor' },
              React.createElement('div', { className: 'editor-body' },
                React.createElement('pre', { className: 'line-gutter' },
                  activeFile.content.split('\n').map((_, i) => i + 1).join('\n')
                ),
                React.createElement('pre', {
                  className: 'code-content hljs',
                  dangerouslySetInnerHTML: {
                    __html: highlightCode(activeFile.content, getLanguage(activeFile.path))
                  }
                })
              )
            )
          ),
          React.createElement('div', { className: 'panel terminal-panel' },
            React.createElement('div', { className: 'panel-header' }, 'Terminal'),
            React.createElement('div', { className: 'panel-body terminal-body', ref: terminalPanelBodyRef },
              terminalOutput.map((line, index) => {
                if (line.type === 'command') {
                  return React.createElement('div', { key: `command-${index}`, className: 'terminal-line command' },
                    React.createElement('span', { className: 'terminal-prompt' }, 'user@localhost:~$ '),
                    line.text
                  );
                }
                if (line.type === 'separator') {
                  const isLast = index === terminalOutput.length - 1;
                  return React.createElement('div', { key: `sep-${index}`, className: 'terminal-line command' },
                    React.createElement('span', { className: 'terminal-prompt' }, 'user@localhost:~$ '),
                    isLast ? terminalDraft : null
                  );
                }
                return React.createElement('div', { key: `output-${index}`, className: 'terminal-line output' }, line.text);
              }),
            )
          )
        ),
        React.createElement('div', { className: chatOnly ? 'panel chat-panel chat-panel-full' : 'panel chat-panel' },
            React.createElement('div', { className: 'panel-header' }, agentName),
            React.createElement('div', { className: 'panel-body', ref: chatPanelBodyRef },
              chatMessages.map((message, index) => {
                if (message.image) {
                  return React.createElement('div', {
                    key: `assistant-${index}`,
                    className: 'chat-bubble assistant chat-image-bubble'
                  }, React.createElement('img', {
                    className: 'chat-image',
                    src: message.image,
                    alt: message.alt || ''
                  }));
                }
                if (message.role === 'assistant') {
                  // Render assistant messages as Markdown HTML
                  return React.createElement('div', {
                    key: `assistant-${index}`,
                    className: 'chat-bubble assistant',
                    dangerouslySetInnerHTML: { __html: parseMarkdown(message.text) }
                  });
                }
                // User messages are plain text (typed input)
                return React.createElement('div', {
                  key: `user-${index}`,
                  className: 'chat-bubble user'
                }, message.text);
              }),
              chatDraft && chatDraftRole === 'assistant'
                ? React.createElement('div', {
                    className: 'chat-bubble assistant',
                    dangerouslySetInnerHTML: { __html: parseMarkdown(chatDraft) }
                  })
                : null,
              chatWaiting
                ? React.createElement('div', { className: 'chat-waiting' }, chatWaiting, '...')
                : null,
              chatPrompt
                ? React.createElement('div', { className: 'chat-prompt-card' },
                    React.createElement('div', { className: 'chat-prompt-title' }, chatPrompt.title),
                    chatPrompt.command
                      ? React.createElement('div', { className: 'chat-prompt-command' }, chatPrompt.command)
                      : null,
                    chatPrompt.description
                      ? React.createElement('div', {
                          className: 'chat-prompt-description',
                          dangerouslySetInnerHTML: { __html: parseMarkdown(chatPrompt.description) }
                        })
                      : null,
                    React.createElement('div', { className: 'chat-prompt-buttons' },
                      React.createElement('button', { className: 'chat-prompt-yes', onClick: nextStep }, 'Yes'),
                      React.createElement('button', { className: 'chat-prompt-no' }, 'No')
                    )
                  )
                : null
            ),
            React.createElement('div', { className: 'chat-input-area' },
              React.createElement('input', {
                type: 'text',
                className: 'chat-input',
                value: chatDraftRole === 'user' ? chatDraft : '',
                placeholder: 'Ask ' + agentName + '...',
                readOnly: true,
                onChange: function() {}
              }),
              React.createElement('button', { className: 'chat-send-btn' }, '↑')
            )
        )
      )
    ),
    React.createElement('div', { className: 'status-bar' },
      React.createElement('div', { className: 'status-left' },
        React.createElement('span', null, 'WSL: Ubuntu'),
        React.createElement('span', null, 'JavaScript'),
        React.createElement('span', null, `Step ${activeIndex} / ${totalSteps}`)
      ),
      React.createElement('div', { className: 'status-right' })
    )
  );
}
