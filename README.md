# Laymon Games — Portfolio Website

A modern, professional portfolio website for an independent creative developer specializing in 2D game development, pixel art, music production, and video editing.

## 📁 File Structure

```
MYSITE/
├── index.html          # Main HTML file (complete website)
├── style.css           # All styles (dark theme with lemon accents)
├── script.js           # Interactive features & animations
└── assets/             # Placeholder images and graphics
    ├── lemon-avatar.svg      # Pixelated Lemon brand avatar
    ├── project-alpha.svg     # Game Project Alpha thumbnail
    ├── project-beta.svg      # Game Project Beta thumbnail
    ├── project-pixel-art.svg # Pixel Art Collection thumbnail
    ├── project-music.svg     # Music Project thumbnail
    ├── project-video-reel.svg# Video Editing Reel thumbnail
    └── project-experimental.svg # Experimental Project thumbnail
```

## 🚀 How to Use

1. **Open `index.html`** in any modern web browser — no server required!
2. The website is fully functional as-is with placeholder content.
3. Replace all placeholders with your actual information (see customization guide below).

## ✏️ Customization Guide

### Quick Start — Essential Replacements

Search for these markers in `index.html` and replace them:

| Placeholder | Location | What to Replace With |
|---|---|---|
| `[Your Real Name]` | Hero, About, Footer | Your actual name |
| `[Professional Title]` | Hero section | e.g., "2D Game Developer & Pixel Artist" |
| `assets/lemon-avatar.svg` | Multiple sections | Replace with your pixelated lemon image (PNG/SVG) |
| `assets/project-*.svg` | Projects section | Replace with actual project screenshots |

### Personal Identity — Replace These Sections

**Hero Section:**
```html
<!-- Find this in index.html -->
<h1 class="hero-name">[Your Real Name]</h1>
<p class="hero-title">[Professional Title]</p>
```

**About → Personal Subsection:**
```html
<!-- Replace the photo placeholder with your actual image -->
<img src="assets/your-photo.jpg" alt="Your name" class="about-photo">
<h3 class="about-card-name">[Your Real Name]</h3>
<p class="about-bio">Write your professional biography here...</p>
```

### Laymon Games Identity — Replace These Sections

**About → Brand Subsection:**
```html
<!-- The lemon avatar is already in place -->
<h3 class="about-card-name">Laymon Games</h3>
<p class="about-bio">Write your brand story here...</p>
```

### Contact Section — Update All Links

Search for `href="#"` or `[your-...]` patterns and replace:

| Placeholder | Replace With Example |
|---|---|
| `mailto:[your-email@example.com]` | `mailto:laymon@email.com` |
| `[Your Discord Username]` | Your actual Discord handle |
| `[your-github-username]` | Full GitHub URL or username |
| `[your-youtube-channel]` | Full YouTube channel URL |
| `[your-twitter-handle]` | Full X/Twitter profile URL |
| `[your-linkedin-profile]` | Full LinkedIn profile URL |

### Projects — Update Content & Images

For each project card, replace:
- **Thumbnail:** Change `src="assets/project-alpha.svg"` to your actual image path
- **Title:** Replace placeholder names with real project titles
- **Description:** Write actual descriptions for each project
- **Technologies:** Update the `<li>` tags with real tech used
- **Links:** Add real URLs to `href` attributes

### Skills — Customize Categories & Items

The skills section is organized into 4 categories. Edit the skill names and levels:
```html
<div class="skill-item">
  <span class="skill-name">Godot</span>
  <span class="skill-level">Advanced</span>
</div>
```

### Experience Timeline — Add Your Journey

Edit each timeline item with your actual milestones:
```html
<div class="timeline-item">
  <span class="timeline-year">2024</span>
  <h3 class="timeline-title">Your Achievement</h3>
  <p class="timeline-desc">Description of what you accomplished...</p>
</div>
```

## 🎨 Branding & Colors

The website uses a dark theme with lemon/yellow accents. To customize colors, edit the CSS custom properties in `style.css`:

```css
:root {
  --color-accent-primary: #F5D442;   /* Main lemon yellow */
  --color-accent-light: #FFE680;     /* Lighter highlight */
  --color-accent-dark: #C9A800;      /* Darker shade */
}
```

## 📱 Responsive Breakpoints

- **Desktop:** Full layout (1280px+)
- **Tablet:** Adjusted grid (768px–1024px)
- **Mobile:** Stacked layout (< 768px)
- **Small Mobile:** Extra compact (< 480px)

## ♿ Accessibility Features

- Semantic HTML5 structure
- ARIA labels on interactive elements
- Keyboard navigation support (Tab, Escape keys)
- Focus indicators on all interactive elements
- `prefers-reduced-motion` media query respected
- High contrast mode support
- Screen reader friendly content hierarchy

## ⚡ Performance Optimizations

- No external dependencies or frameworks
- Minimal CSS (~15KB gzipped)
- Vanilla JavaScript (no library overhead)
- SVG graphics instead of raster images for icons
- Throttled scroll event handlers
- Intersection Observer for lazy animations
- Passive event listeners where appropriate

## 🔧 Technical Details

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Features Implemented
| Feature | Status |
|---|---|
| Smooth scrolling | ✅ |
| Section reveal animations | ✅ |
| Active navigation highlighting | ✅ |
| Mobile hamburger menu | ✅ |
| Project filtering system | ✅ |
| Back-to-top button | ✅ |
| Hero particles animation | ✅ |
| Navbar scroll effect | ✅ |
| Keyboard accessibility | ✅ |
| Responsive design | ✅ |

## 📄 License

This is a personal portfolio website. All content, branding, and custom assets are the property of Laymon Games / [Your Name].

---

**Built with passion & precision.** 🍋
