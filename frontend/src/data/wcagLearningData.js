export const WCAG_POUR_PRINCIPLES = [
  {
    id: "perceivable",
    title: "1. Perceivable",
    tagline: "Can users perceive the content with their senses?",
    summary: "Information and user interface components must be presentable to users in ways they can perceive. Content cannot be invisible to all of their senses. This requires text alternatives, captions, adaptable layouts, and distinguishable color contrast.",
    color: "#6366f1"
  },
  {
    id: "operable",
    title: "2. Operable",
    tagline: "Can users navigate and interact with the interface?",
    summary: "User interface components and navigation must be operable with a keyboard alone. Users must have enough time to read and interact with content, must not encounter seizure-inducing flashes, and should be helped to navigate and locate content easily.",
    color: "#10b981"
  },
  {
    id: "understandable",
    title: "3. Understandable",
    tagline: "Can users understand the information and operations?",
    summary: "Information and the operation of the user interface must be understandable. Text must be readable and predictable in behavior. Interfaces must help users avoid mistakes and correct input errors before permanent submission.",
    color: "#f59e0b"
  },
  {
    id: "robust",
    title: "4. Robust",
    tagline: "Can assistive technologies reliably interpret the code?",
    summary: "Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies like screen readers, voice dictation tools, and braille displays as technologies evolve.",
    color: "#8b5cf6"
  }
];

export const WCAG_LEARNING_TOPICS = [
  {
    id: "image-alt-text",
    title: "Image Alt Text",
    principle: "perceivable",
    wcag_reference: "WCAG 2.1 SC 1.1.1 Non-text Content (Level A)",
    explanation: "Alternative text ('alt text') is a written replacement for an image that conveys the same meaning, function, or context when the visual graphic cannot be seen.",
    why_it_matters: "Screen reader users rely on alt text to hear what an image depicts. Alt text also renders if the user has a poor internet connection or image loading disabled.",
    common_mistakes: [
      "Leaving the alt attribute completely missing (<img src='photo.jpg'>).",
      "Writing redundant filler like 'image of a...', 'photo of a...', or raw file names like 'DSC_0041.png'.",
      "Writing non-empty alt text for purely decorative graphics or background flourishes."
    ],
    incorrect_code: `<!-- Bad: Missing alt entirely or meaningless filler -->
<img src="checkout_btn.jpg">
<img src="chart.png" alt="chart">
<img src="decorative-blob.svg" alt="decorative blob">`,
    correct_code: `<!-- Good: Informative, concise, and intentional -->
<img src="checkout_btn.jpg" alt="Proceed to Secure Checkout">
<img src="revenue_q3.png" alt="Bar chart showing Q3 revenue increased by 24% to $1.2M">

<!-- Good: Purely decorative graphics should have empty alt="" -->
<img src="decorative-blob.svg" alt="" role="presentation">`,
    rule_id: "image-alt"
  },
  {
    id: "keyboard-navigation",
    title: "Keyboard Navigation",
    principle: "operable",
    wcag_reference: "WCAG 2.1 SC 2.1.1 Keyboard & 2.1.2 No Keyboard Trap (Level A)",
    explanation: "All interactive controls, links, forms, and dialogs must be fully navigable and actionable using only standard keyboard keys (Tab, Shift+Tab, Enter, Space, and Arrow keys).",
    why_it_matters: "Many users with motor disabilities, tremors, arthritis, or repetitive strain injuries cannot use a precision mouse. They navigate exclusively via keyboard or switch devices.",
    common_mistakes: [
      "Hiding focus outlines with CSS: outline: none or outline: 0 without providing an accessible replacement.",
      "Using custom div elements as click targets without handling keydown events (Enter/Space).",
      "Trapping keyboard focus inside modal popups without providing an Escape key exit."
    ],
    incorrect_code: `/* Bad: Destroys keyboard visibility */
:focus {
  outline: none;
}

<!-- Bad: Unfocusable and unusable via keyboard -->
<div class="custom-btn" onclick="openMenu()">
  Menu
</div>`,
    correct_code: `/* Good: High-contrast focus indicator for keyboard users */
:focus-visible {
  outline: 2px solid #4f46e5;
  outline-offset: 3px;
}

<!-- Good: Native button element handles Tab and Enter automatically -->
<button type="button" class="btn" onclick="openMenu()">
  Menu
</button>`,
    rule_id: "tabindex"
  },
  {
    id: "color-contrast",
    title: "Color Contrast",
    principle: "perceivable",
    wcag_reference: "WCAG 2.1 SC 1.4.3 Contrast (Minimum) (Level AA)",
    explanation: "There must be sufficient visual contrast between the foreground text color and its background container so that content is clearly distinguishable.",
    why_it_matters: "Users with low vision, color blindness, cataracts, or aging vision, as well as individuals viewing screens under bright outdoor sunlight, struggle to read washed-out text.",
    common_mistakes: [
      "Light grey text on white background (e.g., #94a3b8 on #ffffff).",
      "Using colored badges with low contrast (e.g., light yellow text on green).",
      "Placing text over complex background imagery without an overlay scrim."
    ],
    incorrect_code: `/* Bad: Contrast ratio is only 2.1:1 (Fails WCAG AA) */
.caption {
  color: #a0aec0;
  background-color: #ffffff;
  font-size: 14px;
}`,
    correct_code: `/* Good: Contrast ratio is 7.2:1 (Exceeds WCAG AA 4.5:1 requirement) */
.caption {
  color: #334155;
  background-color: #ffffff;
  font-size: 14px;
}`,
    rule_id: "color-contrast"
  },
  {
    id: "form-labels",
    title: "Form Labels",
    principle: "understandable",
    wcag_reference: "WCAG 2.1 SC 3.3.2 Labels or Instructions (Level A)",
    explanation: "Every form field (<input>, <select>, <textarea>) must have an associated programmatic label that explicitly defines its expected input.",
    why_it_matters: "Screen readers announce the label when a field receives focus. Visible labels also assist users with cognitive disabilities who may forget the field's purpose once typing begins.",
    common_mistakes: [
      "Relying solely on placeholder='Enter email' as the only label (placeholders disappear as soon as user types).",
      "Using floating styled div text that isn't connected via <label for='...'> or aria-labelledby.",
      "Generic inputs with missing name or label attributes."
    ],
    incorrect_code: `<!-- Bad: Placeholder is not an accessible label -->
<input type="email" placeholder="Enter your email address">`,
    correct_code: `<!-- Good: Explicitly associated label via matching 'for' and 'id' -->
<label for="user-email" class="form-label">
  Email Address <span aria-hidden="true">*</span>
</label>
<input 
  type="email" 
  id="user-email" 
  name="email" 
  required 
  aria-required="true"
  autocomplete="email"
>`,
    rule_id: "label"
  },
  {
    id: "semantic-html",
    title: "Semantic HTML",
    principle: "robust",
    wcag_reference: "WCAG 2.1 SC 1.3.1 Info and Relationships (Level A)",
    explanation: "Semantic HTML means using native elements (<header>, <nav>, <main>, <article>, <aside>, <footer>) according to their intended browser and accessibility roles.",
    why_it_matters: "Assistive technologies interpret landmark elements automatically, allowing screen reader users to jump directly to main content or navigation with a single keystroke.",
    common_mistakes: [
      "Overusing generic <div> and <span> tags for page layout ('div soup').",
      "Failing to provide a single top-level <main> landmark.",
      "Writing multiple competing <header> or <nav> landmarks without unique aria-label names."
    ],
    incorrect_code: `<!-- Bad: Screen readers see this as an undifferentiated box -->
<div class="site-header">
  <div class="site-nav">...</div>
</div>
<div class="site-content">
  <div class="article-body">...</div>
</div>`,
    correct_code: `<!-- Good: Native landmarks provide instantaneous screen reader shortcuts -->
<header role="banner">
  <nav aria-label="Primary Navigation">...</nav>
</header>
<main id="main-content">
  <article>...</article>
</main>
<footer role="contentinfo">...</footer>`,
    rule_id: "landmark-one-main"
  },
  {
    id: "screen-reader-support",
    title: "Screen Reader Support",
    principle: "perceivable",
    wcag_reference: "WCAG 2.1 SC 4.1.2 Name, Role, Value (Level A)",
    explanation: "Techniques for conveying hidden or visual status indicators (badges, counts, loading states) cleanly to speech synthesizers without cluttering the visual UI.",
    why_it_matters: "Blind users cannot see visual iconography like notification dots, red asterisks, or spinner graphics without descriptive text.",
    common_mistakes: [
      "Using display: none to hide text intended for screen readers (display: none removes content from accessibility trees too).",
      "Icon buttons with no text (e.g. <button><svg>...</svg></button>).",
      "Dynamic alerts that update silently without aria-live notifications."
    ],
    incorrect_code: `<!-- Bad: Screen reader announces 'button' with no name -->
<button class="icon-btn">
  <svg class="bell-icon"></svg>
</button>`,
    correct_code: `<!-- Good: Visually-hidden text accessible to screen readers -->
<button type="button" class="icon-btn" aria-label="Notifications (3 unread)">
  <svg class="bell-icon" aria-hidden="true"></svg>
  <span class="sr-only">Notifications (3 unread)</span>
</button>

<style>
/* Modern sr-only utility */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}
</style>`,
    rule_id: "button-name"
  },
  {
    id: "heading-hierarchy",
    title: "Heading Hierarchy",
    principle: "perceivable",
    wcag_reference: "WCAG 2.1 SC 1.3.1 Info and Relationships & 2.4.6 Headings (Level AA)",
    explanation: "Headings (<h1> through <h6>) must communicate an organized outline of the document hierarchy without skipping levels.",
    why_it_matters: "Screen reader users navigate web pages primarily by listing headings (e.g., pressing 'H' in NVDA/JAWS). Skipping levels causes disorientation.",
    common_mistakes: [
      "Choosing heading tags based on visual font size rather than outline hierarchy (e.g., jumping from <h1> directly to <h4>).",
      "Having multiple competing <h1> tags on a single page.",
      "Using bold styled <b> or <p class='title'> instead of native heading tags."
    ],
    incorrect_code: `<!-- Bad: Jumps from h1 to h4, skipping h2 and h3 -->
<h1>Product Features</h1>
<h4>Billing Options</h4> <!-- Skipped hierarchy! -->`,
    correct_code: `<!-- Good: Logical, nested heading outline -->
<h1>Product Documentation</h1>
  <h2>Getting Started</h2>
    <h3>Installation</h3>
    <h3>Configuration</h3>
  <h2>Billing & Plans</h2>
    <h3>Enterprise Tier</h3>`,
    rule_id: "heading-order"
  },
  {
    id: "accessible-buttons",
    title: "Accessible Buttons",
    principle: "operable",
    wcag_reference: "WCAG 2.1 SC 4.1.2 Name, Role, Value (Level A)",
    explanation: "Buttons are for triggering actions, submitting forms, or opening dialogs. They must use native <button> elements or explicit role='button' with key handling.",
    why_it_matters: "Native buttons have built-in accessibility: they are in the natural tab order and fire on both Enter and Space keys.",
    common_mistakes: [
      "Using <div> or <span> with an onclick handler instead of <button>.",
      "Using <a> links as buttons (href='#') to perform actions instead of navigating.",
      "Disabling buttons with disabled attribute without explaining why the form is incomplete."
    ],
    incorrect_code: `<!-- Bad: Unfocusable by default, ignored by screen readers -->
<a href="#" onclick="deleteAccount()">Delete Account</a>
<div class="submit-btn" onclick="submitForm()">Submit</div>`,
    correct_code: `<!-- Good: Native semantic HTML button -->
<button 
  type="button" 
  class="btn btn-danger" 
  onclick="deleteAccount()"
>
  Delete Account
</button>`,
    rule_id: "aria-roles"
  },
  {
    id: "accessible-links",
    title: "Accessible Links",
    principle: "understandable",
    wcag_reference: "WCAG 2.1 SC 2.4.4 Link Purpose (In Context) (Level A)",
    explanation: "Link text must clearly describe the destination or purpose of the link without requiring surrounding context.",
    why_it_matters: "Screen reader users frequently browse a standalone list of all links on a page. Repetitive links like 'click here' or 'read more' become impossible to distinguish.",
    common_mistakes: [
      "Using generic phrases like 'Click here', 'More', 'Read more', or 'Link'.",
      "Pasting bare naked URLs (e.g. https://example.com/item/382910?ref=xyz).",
      "Opening links in a new browser tab (target='_blank') without warning the user."
    ],
    incorrect_code: `<!-- Bad: Meaningless when spoken out of context -->
<p>To view our updated privacy policy, <a href="/privacy">click here</a>.</p>
<p>Our blog: <a href="/article-2">Read more</a>.</p>`,
    correct_code: `<!-- Good: Self-descriptive, distinct link copy -->
<p>Review our <a href="/privacy">updated 2026 privacy policy</a>.</p>
<p><a href="/article-2">Read our full guide on Accessible Color Contrast</a>.</p>

<!-- If opening in a new tab, warn the user -->
<a href="https://w3.org" target="_blank" rel="noopener noreferrer">
  W3C Web Standards <span class="sr-only">(opens in a new tab)</span>
</a>`,
    rule_id: "link-name"
  }
];

