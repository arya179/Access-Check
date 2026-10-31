export const WCAG_GUIDELINES = [
  {
    principle: "Perceivable",
    description: "Information and user interface components must be presentable to users in ways they can perceive.",
    color: "indigo",
    guidelines: [
      {
        id: "1.1",
        title: "Text Alternatives",
        level: "Level A",
        criterion: "1.1.1 Non-text Content",
        description: "Provide text alternatives for any non-text content so that it can be changed into other forms people need (large print, braille, speech, symbols).",
        rules: ["image-alt", "input-image-alt", "area-alt", "role-img-alt"],
        solution: "Add informative alt attributes to <img> elements or use aria-hidden='true' for purely decorative imagery."
      },
      {
        id: "1.2",
        title: "Time-based Media",
        level: "Level A / AA",
        criterion: "1.2.1 Audio-only / Video-only, 1.2.2 Captions",
        description: "Provide alternatives for time-based media such as captions, audio transcripts, and synchronized audio description.",
        rules: ["video-caption", "audio-caption"],
        solution: "Supply WebVTT caption tracks using <track kind='captions'> and provide written transcripts."
      },
      {
        id: "1.3",
        title: "Adaptable",
        level: "Level A",
        criterion: "1.3.1 Info and Relationships",
        description: "Information, structure, and relationships conveyed through presentation can be programmatically determined or are available in text.",
        rules: ["aria-roles", "heading-order", "label", "landmark-one-main"],
        solution: "Use native semantic HTML5 tags (<main>, <nav>, <header>, <h1>-<h6>) rather than generic styled <div> tags."
      },
      {
        id: "1.4",
        title: "Distinguishable",
        level: "Level AA",
        criterion: "1.4.3 Contrast (Minimum), 1.4.11 Non-text Contrast",
        description: "Make it easier for users to see and hear content including separating foreground from background.",
        rules: ["color-contrast", "color-contrast-enhanced", "link-in-text-block"],
        solution: "Ensure normal body text has at least 4.5:1 contrast ratio against the background (3:1 for large 18pt+ text)."
      }
    ]
  },
  {
    principle: "Operable",
    description: "User interface components and navigation must be operable.",
    color: "emerald",
    guidelines: [
      {
        id: "2.1",
        title: "Keyboard Accessible",
        level: "Level A",
        criterion: "2.1.1 Keyboard, 2.1.2 No Keyboard Trap",
        description: "Make all functionality available from a keyboard without getting trapped in modal popups or widgets.",
        rules: ["tabindex", "accesskeys", "focus-order-semantics"],
        solution: "Ensure interactive elements are focusable and never set positive tabindex values like tabindex='5'."
      },
      {
        id: "2.4",
        title: "Navigable",
        level: "Level AA",
        criterion: "2.4.1 Bypass Blocks, 2.4.4 Link Purpose, 2.4.7 Focus Visible",
        description: "Provide ways to help users navigate, find content, and determine where they are.",
        rules: ["bypass", "document-title", "link-name", "meta-viewport"],
        solution: "Provide a visible 'Skip to main content' link, assign distinct meaningful link text, and never disable pinch-zoom in viewport."
      }
    ]
  },
  {
    principle: "Understandable",
    description: "Information and the operation of user interface must be understandable.",
    color: "amber",
    guidelines: [
      {
        id: "3.1",
        title: "Readable",
        level: "Level A",
        criterion: "3.1.1 Language of Page",
        description: "Make text content readable and understandable by identifying the primary human language.",
        rules: ["html-has-lang", "html-lang-valid"],
        solution: "Set a valid IETF BCP 47 language code on the root HTML tag: <html lang='en'>."
      },
      {
        id: "3.3",
        title: "Input Assistance",
        level: "Level A / AA",
        criterion: "3.3.1 Error Identification, 3.3.2 Labels or Instructions",
        description: "Help users avoid and correct mistakes by providing descriptive validation messages and associated form labels.",
        rules: ["label", "aria-valid-attr-value", "aria-required-children"],
        solution: "Associate <label for='id'> with every input or use aria-labelledby / aria-describedby for error cues."
      }
    ]
  },
  {
    principle: "Robust",
    description: "Content must be robust enough that it can be interpreted reliably by a wide variety of user agents, including assistive technologies.",
    color: "purple",
    guidelines: [
      {
        id: "4.1",
        title: "Compatible",
        level: "Level A",
        criterion: "4.1.1 Parsing, 4.1.2 Name, Role, Value",
        description: "Maximize compatibility with current and future user agents, including assistive technologies.",
        rules: ["duplicate-id", "button-name", "aria-allowed-attr", "aria-hidden-focus"],
        solution: "Ensure HTML ID attributes are strictly unique within the DOM and every custom control has an accessible name."
      }
    ]
  }
];

