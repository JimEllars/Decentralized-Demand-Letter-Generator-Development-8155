from playwright.sync_api import Page, expect, sync_playwright

def verify_document_preview(page: Page):
    # 1. Arrange: Go to the app
    page.goto("http://localhost:5173")

    # Wait for the preview to be visible
    expect(page.get_by_text("PREVIEW ONLY")).to_be_visible()

    # 2. Act: Add an item to the form
    page.get_by_role("button", name="ADD LINE ITEM").click()

    inputs = page.get_by_placeholder("Description (e.g. Invoice #101)")
    inputs.nth(1).fill("New Test Item")

    amount_inputs = page.get_by_placeholder("0.00")
    amount_inputs.nth(1).fill("500.00")

    # 3. Assert: Check if the preview updated
    expect(page.get_by_text("New Test Item")).to_be_visible()

    # 4. Screenshot: Capture the preview area
    page.screenshot(path="verification/preview_verification.png")

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            verify_document_preview(page)
        finally:
            browser.close()
