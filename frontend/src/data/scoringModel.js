/**
 * AccessCheck AI Transparent Scoring Model
 * 
 * SCORING METHODOLOGY:
 * Starting Baseline: 100 Points.
 * Deductions are weighted proportionally by severity impact:
 * - Critical Impact: 15 points per unique failing rule
 * - Serious Impact:   8 points per unique failing rule
 * - Moderate Impact:  4 points per unique failing rule
 * - Minor Impact:     1 point per unique failing rule
 * 
 * Score Formula:
 * max(0, 100 - (critical * 15 + serious * 8 + moderate * 4 + minor * 1))
 * 
 * DISCLAIMER:
 * Automated testing via axe-core evaluates roughly 30% - 50% of WCAG criteria.
 * The score provided is an ESTIMATE and does NOT constitute official legal or
 * certified WCAG compliance. Manual auditing, assistive technology testing
 * (screen readers), and human evaluation are required for complete conformance.
 */

export const SCORING_MODEL = {
  baseline: 100,
  weights: {
    critical: 15,
    serious: 8,
    moderate: 4,
    minor: 1,
  },
  disclaimer: "Estimated accessibility score based on automated axe-core DOM inspection. Passing automated checks does NOT guarantee complete accessibility or legal compliance. Manual auditing is essential."
};

