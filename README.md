# blunt

Claude Code plugins for blunt, low-noise agent behavior.

## Plugins

### blunt

Injects communication guidelines into every session via a `SessionStart` hook
(fires on startup, resume, `/clear`, and compact, so the guidelines survive
context resets). The guidelines live in
[`plugins/blunt/context/communication.md`](plugins/blunt/context/communication.md).

## Install

```
/plugin marketplace add raineorshine/blunt
/plugin install blunt@blunt
```

Or for a one-off session:

```
claude --plugin-dir path/to/blunt/plugins/blunt
```
