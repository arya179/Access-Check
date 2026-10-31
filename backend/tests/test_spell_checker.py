import pytest
from backend.services.spell_checker import ContentQualityScanner, COMMON_TECH_TERMS

@pytest.fixture
def scanner():
    return ContentQualityScanner(language="en")

def test_detects_misspelled_words(scanner):
    text = "The websyte contains clear instruktions for visitors."
    findings = scanner.scan_text_segment(text, "p", "https://example.com")
    misspellings = [f for f in findings if f["issue_type"] == "misspelling"]
    words_found = {f["incorrect_word"].lower() for f in misspellings}
    assert "websyte" in words_found
    assert "instruktions" in words_found

def test_detects_repeated_words(scanner):
    text = "This is the the primary button on our landing page."
    findings = scanner.scan_text_segment(text, "p", "https://example.com")
    repeated = [f for f in findings if f["issue_type"] == "repeated_word"]
    assert len(repeated) >= 1
    assert "the the" in repeated[0]["incorrect_word"].lower()
    assert repeated[0]["suggested_correction"] == "the"

def test_detects_missing_space_after_punctuation(scanner):
    text = "Important notice,please click here."
    findings = scanner.scan_text_segment(text, "p", "https://example.com")
    spacing = [f for f in findings if f["issue_type"] == "missing_space"]
    assert len(spacing) >= 1
    assert "notice,please" in spacing[0]["incorrect_word"] or ",p" in spacing[0]["incorrect_word"] or spacing[0]["suggested_correction"] == "notice, please"

def test_detects_placeholder_text(scanner):
    text = "Lorem ipsum dolor sit amet, consectetur adipiscing elit."
    findings = scanner.scan_text_segment(text, "p", "https://example.com")
    placeholders = [f for f in findings if f["issue_type"] == "placeholder_text"]
    assert len(placeholders) >= 1
    assert "lorem ipsum" in placeholders[0]["incorrect_word"].lower()

def test_detects_todo_placeholder(scanner):
    text = "TODO: Update this section before launch."
    findings = scanner.scan_text_segment(text, "h2", "https://example.com")
    placeholders = [f for f in findings if f["issue_type"] == "placeholder_text"]
    assert len(placeholders) >= 1
    assert "todo" in placeholders[0]["incorrect_word"].lower()

def test_whitelists_technical_terms_and_brands_to_prevent_false_positives(scanner):
    tech_sentence = "We deployed our FastAPI and React application using Playwright, SQLite, and Tailwind CSS."
    findings = scanner.scan_text_segment(tech_sentence, "p", "https://example.com")
    misspellings = [f for f in findings if f["issue_type"] == "misspelling"]
    incorrect_words = {f["incorrect_word"].lower() for f in misspellings}
    
    # None of these technical terms should be flagged as misspellings
    for term in ["fastapi", "react", "playwright", "sqlite", "tailwind", "css"]:
        assert term not in incorrect_words, f"False positive detected: {term}"

def test_handles_proper_nouns_and_acronyms(scanner):
    text = "Complies with WCAG 2.1 Level AA and Section 508 guidelines."
    findings = scanner.scan_text_segment(text, "p", "https://example.com")
    misspellings = [f for f in findings if f["issue_type"] == "misspelling"]
    assert len(misspellings) == 0

@pytest.mark.asyncio
async def test_full_page_content_quality_score_calculation(scanner):
    extracted_elements = [
        {"tag": "h1", "text": "AccessCheck AI Official Documentation"},
        {"tag": "p", "text": "This application audits websites for WCAG compliance."},
        {"tag": "button", "text": "Scan Website Now"}
    ]
    result = await scanner.scan_page_content(extracted_elements, "https://example.com", enable_ai_grammar=False)
    assert result["content_quality_score"] == 100
    assert result["total_content_issues"] == 0
    assert result["findings"] == []

