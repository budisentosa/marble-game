# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a web-based marble racing betting game built with vanilla HTML5, CSS3, and JavaScript. Players bet gems on marble races, watch random race simulations, and collect winnings based on finishing positions.

## Key Game Mechanics

- **Initial Balance**: 1,000 gems
- **Marble Selection**: Choose 1-9 marbles from a pool of 10
- **Betting**: Default 10 gems per marble, customizable (min 1 gem, max available balance)
- **Race Duration**: 3-10 seconds with smooth animation
- **Payouts**: 1st place (3x), 2nd place (2x), 3rd place (1x), 4th+ (0x)
- **House Edge**: 40% (expected return 0.6x per bet)

## Development Environment

This is a client-side only project with no build system or dependencies. The codebase currently contains only a PRD document. When implementing:

- Use vanilla JavaScript (ES6+)
- Target modern browsers (Chrome, Firefox, Safari, Edge)
- Implement responsive design for desktop and mobile
- Use localStorage for gem balance persistence
- No server or API calls required

## Technical Requirements

- **Performance**: Maintain 30+ FPS for race animations
- **Load Time**: Under 3 seconds
- **Memory**: Mobile-friendly usage
- **Offline**: Fully functional without internet
- **Accessibility**: Keyboard navigation, screen reader support, clear visual contrast

## Game Balance

The random race simulation should ensure equal probability for all marbles. The 40% house edge is intentional for realistic gambling mechanics while providing reasonable play time with the 1,000 gem starting balance.