class AIService {
  /**
   * Analyzes text for spam and toxicity.
   * Fake AI Implementation - rule based logic.
   * Can be replaced with real API call later.
   *
   * @param {string} text
   * @returns {Object} { spam_score, toxicity_score, label }
   */
  async analyze(text) {
    let spam_score = 0.1;
    let toxicity_score = 0.1;
    let label = 'NORMAL';

    const lowerText = text.toLowerCase();

    // Check for Spam
    if (lowerText.includes('buy now') || lowerText.includes('free money')) {
      spam_score = 0.9;
      label = 'SPAM';
    }

    // Check for Toxicity (Overrides spam if both, but we can keep toxicity priority)
    if (lowerText.includes('idiot') || lowerText.includes('stupid')) {
      toxicity_score = 0.85;
      label = 'TOXIC';
    }

    return {
      spam_score,
      toxicity_score,
      label
    };
  }
}

module.exports = new AIService();
