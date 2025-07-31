# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based marble racing betting game built with vanilla HTML5, CSS3, and JavaScript. Players bet gems on continuous marble races in alternating 15-second phases: betting phase for current race and racing phase with next-race betting. The game features automatic race cycling, position-based payouts, and persistent gem balance storage.

## Architecture

The codebase follows a simple, single-page application structure:

- **index.html**: Main game interface with marble selection, betting controls, race track, and results
- **script.js**: Contains the `MarbleRaceGame` class that manages all game logic and state
- **styles.css**: Complete responsive styling with mobile optimizations and race animations
- **prd.md**: Original product requirements document

## Key Code Structure

### MarbleRaceGame Class (script.js)
The main game controller handles:
- **Dual-Phase System**: alternating 15-second betting and racing phases
- **State Management**: gems balance, current/next race selections, automatic transitions
- **Event Handling**: marble selection for current or next race based on phase
- **Race Simulation**: 15-second races with randomized marble movement and smooth animations
- **Payout Calculation**: position-based multipliers (3x/2x/1x/0x) for selected marbles only
- **Persistence**: localStorage for gem balance between sessions

### UI Components
- **Marble Grid**: 10 selectable marbles with unique gradient styles and phase-specific selection indicators
- **Betting Interface**: Dynamic input generation with headers for current race vs next race betting
- **Race Track**: 15-second animated marble movement with finish line detection
- **Results Display**: Position rankings with visual highlighting for top 3 and detailed payout breakdown
- **Phase Indicator**: Real-time countdown showing betting phase vs racing phase status

## Development Commands

This is a client-side only project with no build system. To develop:

```bash
# Serve locally (any simple HTTP server)
python -m http.server 8000
# or
npx serve .
# or
open index.html directly in browser
```

## Key Implementation Details

### Dual-Phase Game Loop
- **Betting Phase**: 15-second countdown for current race marble selection and betting
- **Racing Phase**: 15-second race execution with simultaneous next-race betting capability
- Automatic phase transitions with visual and textual indicators
- Seamless state transfer from next-race bets to current-race bets

### Race Animation
- Uses `setInterval` with 50ms updates for smooth 20 FPS animation
- Exactly 15-second race duration with progress-based marble positioning
- Random speed multipliers (0.5-1.0) create realistic race dynamics
- Distance-based finish line detection with final position sorting

### Game Balance
- 40% house edge with 0.6x expected return
- All 10 marbles race but only selected ones can win payouts
- Position-based payouts: 1st (3x), 2nd (2x), 3rd (1x), 4th+ (0x)
- Bet processing occurs at race start, winnings awarded at race completion

### State Validation
- Phase-aware marble selection (gold border for current race, red border for next race)
- Total bet validation against available gems for each phase
- Marble selection limits (1-9 maximum per race)
- Input sanitization and clamping for bet amounts (1 to available gems)
- Automatic state transitions with persistent selection management

## Mobile Responsiveness

Comprehensive responsive design with breakpoints at 768px:
- Stacked header layout on mobile
- Smaller marble sizes and adjusted grid
- Single-column betting inputs
- Reduced race track height