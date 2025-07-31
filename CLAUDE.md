# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based marble racing betting game built with vanilla HTML5, CSS3, and JavaScript. Players bet gems on marble races, watch random race simulations, and collect winnings based on finishing positions. The game is fully implemented and functional.

## Architecture

The codebase follows a simple, single-page application structure:

- **index.html**: Main game interface with marble selection, betting controls, race track, and results
- **script.js**: Contains the `MarbleRaceGame` class that manages all game logic and state
- **styles.css**: Complete responsive styling with mobile optimizations and race animations
- **prd.md**: Original product requirements document

## Key Code Structure

### MarbleRaceGame Class (script.js)
The main game controller handles:
- **State Management**: gems balance, selected marbles, bets, racing status
- **Event Handling**: marble selection, bet input validation, race controls
- **Race Simulation**: randomized marble movement with smooth animations
- **Payout Calculation**: position-based multipliers (3x/2x/1x/0x)
- **Persistence**: localStorage for gem balance between sessions

### UI Components
- **Marble Grid**: 10 selectable marbles with unique gradient styles
- **Betting Interface**: Dynamic input generation for selected marbles
- **Race Track**: Animated marble movement with finish line
- **Results Display**: Position rankings with visual highlighting for top 3

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

### Race Animation
- Uses `setInterval` with 50ms updates for smooth 20 FPS animation
- Random speed multipliers (0.5-1.0) create realistic race dynamics
- Track width calculation ensures proper finish line detection

### Game Balance
- 40% house edge with 0.6x expected return
- All 10 marbles race but only selected ones can win payouts
- Position-based payouts: 1st (3x), 2nd (2x), 3rd (1x), 4th+ (0x)

### State Validation
- Total bet validation against available gems
- Marble selection limits (1-9 maximum)
- Input sanitization for bet amounts

## Mobile Responsiveness

Comprehensive responsive design with breakpoints at 768px:
- Stacked header layout on mobile
- Smaller marble sizes and adjusted grid
- Single-column betting inputs
- Reduced race track height