# Personal Assistant UI Design System

## 🎨 Design Philosophy

The VS Code Personal Assistant interface is designed to feel like conversing with an intelligent, approachable companion. The design balances modern AI interface aesthetics with VS Code's familiar patterns, creating a seamless transition between coding and personal assistance modes.

### Design Principles
- **Conversational**: Natural, human-like interaction patterns
- **Intelligent**: Visual cues that convey AI understanding and processing
- **Adaptive**: Responsive to user context and preferences
- **Elegant**: Clean, minimalist aesthetic that doesn't distract
- **Accessible**: High contrast, clear typography, screen reader friendly

## 🌈 Color Palette

### Primary Colors
```css
/* Light Theme */
--assistant-primary: #0066CC;           /* VS Code Blue */
--assistant-primary-hover: #005A9E;     /* Darker blue for hover states */
--assistant-primary-light: #E6F2FF;     /* Light blue backgrounds */

/* Dark Theme */
--assistant-primary-dark: #007ACC;      /* Brighter blue for dark mode */
--assistant-primary-dark-hover: #0099FF; /* Hover state for dark mode */
--assistant-primary-dark-light: #1A2332; /* Dark blue backgrounds */
```

### Semantic Colors
```css
/* Success States */
--success-primary: #10B981;             /* Emerald green */
--success-light: #D1FAE5;               /* Light green background */
--success-dark: #065F46;                /* Dark green text */

/* Warning States */
--warning-primary: #F59E0B;             /* Amber */
--warning-light: #FEF3C7;               /* Light amber background */
--warning-dark: #92400E;                /* Dark amber text */

/* Error States */
--error-primary: #EF4444;               /* Red */
--error-light: #FEE2E2;                 /* Light red background */
--error-dark: #991B1B;                  /* Dark red text */

/* AI Provider Colors */
--copilot-primary: #24292F;             /* GitHub black */
--claude-primary: #FF6B35;              /* Anthropic orange */
--chatgpt-primary: #10A37F;             /* OpenAI green */
```

### Neutral Colors (Light Theme)
```css
--neutral-50: #F9FAFB;                  /* Lightest backgrounds */
--neutral-100: #F3F4F6;                 /* Card backgrounds */
--neutral-200: #E5E7EB;                 /* Borders, dividers */
--neutral-300: #D1D5DB;                 /* Disabled elements */
--neutral-400: #9CA3AF;                 /* Placeholder text */
--neutral-500: #6B7280;                 /* Secondary text */
--neutral-600: #4B5563;                 /* Primary text */
--neutral-700: #374151;                 /* Headings */
--neutral-800: #1F2937;                 /* High contrast text */
--neutral-900: #111827;                 /* Highest contrast */
```

### Neutral Colors (Dark Theme)
```css
--neutral-50-dark: #18181B;             /* Lightest backgrounds */
--neutral-100-dark: #27272A;            /* Card backgrounds */
--neutral-200-dark: #3F3F46;            /* Borders, dividers */
--neutral-300-dark: #52525B;            /* Disabled elements */
--neutral-400-dark: #71717A;            /* Placeholder text */
--neutral-500-dark: #A1A1AA;            /* Secondary text */
--neutral-600-dark: #D4D4D8;            /* Primary text */
--neutral-700-dark: #E4E4E7;            /* Headings */
--neutral-800-dark: #F4F4F5;            /* High contrast text */
--neutral-900-dark: #FAFAFA;            /* Highest contrast */
```

### Gradient Colors
```css
/* Beautiful gradient backgrounds */
--gradient-primary: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
--gradient-secondary: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
--gradient-success: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
--gradient-warm: linear-gradient(135deg, #fa709a 0%, #fee140 100%);
--gradient-cool: linear-gradient(135deg, #a8edea 0%, #fed6e3 100%);
--gradient-midnight: linear-gradient(135deg, #2c3e50 0%, #3498db 100%);
```

## 🔤 Typography System

### Font Families
```css
/* Primary font stack */
--font-primary: 'Segoe UI', 'Helvetica Neue', Helvetica, Arial, sans-serif;

/* Monospace for code */
--font-mono: 'SF Mono', Monaco, 'Cascadia Code', 'Roboto Mono', 'Courier New', monospace;

/* Display font for headings */
--font-display: 'Inter', 'Segoe UI', system-ui, sans-serif;
```

### Font Scales
```css
/* Font sizes following a harmonious scale */
--text-xs: 0.75rem;      /* 12px - captions, timestamps */
--text-sm: 0.875rem;     /* 14px - body text, labels */
--text-base: 1rem;       /* 16px - default body text */
--text-lg: 1.125rem;     /* 18px - large body text */
--text-xl: 1.25rem;      /* 20px - small headings */
--text-2xl: 1.5rem;      /* 24px - section headings */
--text-3xl: 1.875rem;    /* 30px - page headings */
--text-4xl: 2.25rem;     /* 36px - display headings */
--text-5xl: 3rem;        /* 48px - hero headings */
```

### Font Weights
```css
--font-light: 300;       /* Light text */
--font-regular: 400;     /* Regular text */
--font-medium: 500;      /* Medium emphasis */
--font-semibold: 600;    /* Strong emphasis */
--font-bold: 700;        /* Headings */
--font-extrabold: 800;   /* Display text */
```

### Line Heights
```css
--leading-tight: 1.25;   /* Headings */
--leading-snug: 1.375;   /* Large text */
--leading-normal: 1.5;   /* Body text */
--leading-relaxed: 1.625; /* Large body text */
--leading-loose: 2;      /* Spaced text */
```

## 📐 Spacing System

### Base Spacing Unit
```css
--space-unit: 0.25rem;   /* 4px base unit */

/* Spacing scale */
--space-1: 0.25rem;      /* 4px */
--space-2: 0.5rem;       /* 8px */
--space-3: 0.75rem;      /* 12px */
--space-4: 1rem;         /* 16px */
--space-5: 1.25rem;      /* 20px */
--space-6: 1.5rem;       /* 24px */
--space-8: 2rem;         /* 32px */
--space-10: 2.5rem;      /* 40px */
--space-12: 3rem;        /* 48px */
--space-16: 4rem;        /* 64px */
--space-20: 5rem;        /* 80px */
--space-24: 6rem;        /* 96px */
```

## 🎯 Component Design Specifications

### Chat Bubbles

#### User Messages
```css
.chat-bubble-user {
    background: var(--assistant-primary);
    color: white;
    border-radius: 18px 18px 4px 18px;
    padding: 12px 16px;
    max-width: 70%;
    margin-left: auto;
    box-shadow: 0 2px 8px rgba(0, 102, 204, 0.15);
    animation: slideInRight 0.3s ease-out;
}
```

#### Assistant Messages
```css
.chat-bubble-assistant {
    background: var(--neutral-100);
    color: var(--neutral-700);
    border-radius: 18px 18px 18px 4px;
    padding: 12px 16px;
    max-width: 70%;
    margin-right: auto;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
    animation: slideInLeft 0.3s ease-out;
}

/* Dark theme variant */
.dark .chat-bubble-assistant {
    background: var(--neutral-100-dark);
    color: var(--neutral-700-dark);
}
```

#### Typing Indicator
```css
.typing-indicator {
    display: flex;
    gap: 4px;
    padding: 12px 16px;
    background: var(--neutral-100);
    border-radius: 18px;
    margin-right: auto;
    max-width: 60px;
}

.typing-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--neutral-400);
    animation: typingDots 1.5s infinite;
}

.typing-dot:nth-child(2) { animation-delay: 0.2s; }
.typing-dot:nth-child(3) { animation-delay: 0.4s; }
```

### Voice Visualizer

#### Audio Waveform
```css
.voice-visualizer {
    display: flex;
    align-items: center;
    justify-content: center;
    height: 80px;
    gap: 2px;
    padding: 20px;
}

.waveform-bar {
    width: 3px;
    background: var(--assistant-primary);
    border-radius: 2px;
    min-height: 4px;
    transition: height 0.1s ease-out;
    animation: waveform 2s ease-in-out infinite;
}

.waveform-bar:nth-child(odd) {
    animation-delay: 0.1s;
}
```

#### Voice Button
```css
.voice-button {
    width: 56px;
    height: 56px;
    border-radius: 50%;
    border: none;
    background: var(--gradient-primary);
    color: white;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s ease;
    box-shadow: 0 4px 16px rgba(0, 102, 204, 0.3);
}

.voice-button:hover {
    transform: scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 102, 204, 0.4);
}

.voice-button.recording {
    background: var(--error-primary);
    animation: pulse 2s infinite;
}
```

### AI Provider Selector

#### Provider Cards
```css
.provider-card {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 16px;
    border-radius: 12px;
    border: 2px solid var(--neutral-200);
    background: var(--neutral-50);
    cursor: pointer;
    transition: all 0.2s ease;
}

.provider-card:hover {
    border-color: var(--assistant-primary);
    transform: translateY(-2px);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
}

.provider-card.active {
    border-color: var(--assistant-primary);
    background: var(--assistant-primary-light);
}

.provider-icon {
    width: 32px;
    height: 32px;
    border-radius: 8px;
    display: flex;
    align-items: center;
    justify-content: center;
    font-weight: var(--font-bold);
    color: white;
}

.provider-icon.copilot { background: var(--copilot-primary); }
.provider-icon.claude { background: var(--claude-primary); }
.provider-icon.chatgpt { background: var(--chatgpt-primary); }
```

### Glass-morphism Effects

#### Glass Cards
```css
.glass-card {
    background: rgba(255, 255, 255, 0.1);
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 16px;
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}

.dark .glass-card {
    background: rgba(0, 0, 0, 0.2);
    border-color: rgba(255, 255, 255, 0.1);
}
```

#### Glass Navigation
```css
.glass-nav {
    position: fixed;
    top: 20px;
    left: 50%;
    transform: translateX(-50%);
    background: rgba(255, 255, 255, 0.8);
    backdrop-filter: blur(20px);
    border-radius: 24px;
    padding: 8px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
}
```

## 🎭 Animation Specifications

### Transition Timing
```css
/* Standard easing curves */
--ease-out-cubic: cubic-bezier(0.33, 1, 0.68, 1);
--ease-in-cubic: cubic-bezier(0.32, 0, 0.67, 0);
--ease-in-out-cubic: cubic-bezier(0.65, 0, 0.35, 1);

/* Duration tokens */
--duration-fast: 150ms;
--duration-normal: 300ms;
--duration-slow: 500ms;
```

### Keyframe Animations
```css
@keyframes slideInRight {
    from {
        opacity: 0;
        transform: translateX(20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes slideInLeft {
    from {
        opacity: 0;
        transform: translateX(-20px);
    }
    to {
        opacity: 1;
        transform: translateX(0);
    }
}

@keyframes typingDots {
    0%, 20% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.3); opacity: 0.7; }
    80%, 100% { transform: scale(1); opacity: 1; }
}

@keyframes waveform {
    0%, 100% { height: 4px; }
    50% { height: 32px; }
}

@keyframes pulse {
    0% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0.4); }
    70% { box-shadow: 0 0 0 10px rgba(239, 68, 68, 0); }
    100% { box-shadow: 0 0 0 0 rgba(239, 68, 68, 0); }
}

@keyframes fadeIn {
    from { opacity: 0; }
    to { opacity: 1; }
}

@keyframes scaleIn {
    from {
        opacity: 0;
        transform: scale(0.8);
    }
    to {
        opacity: 1;
        transform: scale(1);
    }
}
```

## 📱 Responsive Design Breakpoints

```css
/* Mobile first approach */
--bp-sm: 640px;    /* Small devices */
--bp-md: 768px;    /* Medium devices */
--bp-lg: 1024px;   /* Large devices */
--bp-xl: 1280px;   /* Extra large devices */
--bp-2xl: 1536px;  /* 2X large devices */
```

### Layout Adaptations
- **Mobile (< 640px)**: Single column, stacked layout, bottom navigation
- **Tablet (640px - 1024px)**: Two column layout, side navigation
- **Desktop (> 1024px)**: Multi-column layout, persistent sidebars

## 🎨 Theme Implementation

### CSS Custom Properties Setup
```css
:root {
    /* Light theme (default) */
    color-scheme: light;
}

:root.dark {
    /* Dark theme overrides */
    color-scheme: dark;
}

@media (prefers-color-scheme: dark) {
    :root {
        /* Automatic dark mode */
    }
}
```

### Theme Toggle Component
```css
.theme-toggle {
    width: 48px;
    height: 24px;
    border-radius: 12px;
    background: var(--neutral-300);
    position: relative;
    cursor: pointer;
    transition: background-color var(--duration-normal) ease;
}

.theme-toggle.dark {
    background: var(--assistant-primary);
}

.theme-toggle-handle {
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: white;
    position: absolute;
    top: 2px;
    left: 2px;
    transition: transform var(--duration-normal) ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
}

.theme-toggle.dark .theme-toggle-handle {
    transform: translateX(24px);
}
```

## 🛠️ Implementation Guidelines

### CSS Architecture
- Use CSS custom properties for theming
- Follow BEM naming convention for components
- Implement mobile-first responsive design
- Use CSS Grid and Flexbox for layouts
- Leverage CSS animations for micro-interactions

### Accessibility Requirements
- Maintain WCAG 2.1 AA contrast ratios
- Support keyboard navigation
- Provide focus indicators
- Include ARIA labels and roles
- Support screen readers
- Respect prefers-reduced-motion

### Performance Considerations
- Use CSS transforms for animations
- Implement will-change sparingly
- Optimize for 60fps animations
- Use CSS containment where appropriate
- Minimize repaints and reflows

## 🎯 Component States

### Interactive States
```css
/* Standard state progression */
.component {
    /* Default state */
}

.component:hover {
    /* Hover state */
}

.component:focus {
    /* Focus state */
    outline: 2px solid var(--assistant-primary);
    outline-offset: 2px;
}

.component:active {
    /* Active state */
}

.component:disabled {
    /* Disabled state */
    opacity: 0.5;
    cursor: not-allowed;
}
```

### Loading States
```css
.loading {
    position: relative;
    overflow: hidden;
}

.loading::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(
        90deg,
        transparent,
        rgba(255, 255, 255, 0.4),
        transparent
    );
    animation: shimmer 2s infinite;
}

@keyframes shimmer {
    0% { left: -100%; }
    100% { left: 100%; }
}
```

This design system provides a comprehensive foundation for building a beautiful, modern personal assistant interface that feels both familiar and innovative within the VS Code ecosystem.