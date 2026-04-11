import sys
from playwright.sync_api import sync_playwright

def run_cuj(page):
    page.goto("http://localhost:8787/app/demand-generator")
    page.wait_for_timeout(5000)

    # Check if loaded properly, or if there's an error on the page. We will take a screenshot early.
    page.screenshot(path="verification_early.png")

    # Wait for the form to appear
    page.wait_for_selector("input#creditorName", timeout=10000)

    # Fill out the form
    page.locator("input#creditorName").fill("Test Creditor")
    page.locator("textarea#creditorAddress").fill("Test Creditor Address")
    page.locator("input#debtorName").fill("Test Debtor")
    page.locator("textarea#debtorAddress").fill("Test Debtor Address")
    page.locator("input#dueDate").fill("2025-12-31")

    # Target the amount input inside the items map
    page.locator("input[placeholder='0.00']").fill("1000")

    # Wait for calculations to update
    page.wait_for_timeout(500)

    # Click proceed to checkout
    page.get_by_role("button", name="PROCEED TO CHECKOUT ($4.00)").click()
    page.wait_for_timeout(3000)
    page.screenshot(path="verification_modal.png")

    # Check the email box in modal - use a broader locator in case it's missed
    page.locator("input[type='checkbox']").click()
    page.wait_for_timeout(500)

    # Fill email
    page.get_by_placeholder("Enter email address").fill("test@example.com")
    page.wait_for_timeout(500)

    # Click pay
    page.get_by_role("button", name="Pay $4.00 Now").click()

    # Wait for the simulated redirect and page load
    page.wait_for_timeout(5000)

    # Try navigating explicitly if not redirected automatically in sandbox
    if "success" not in page.url:
        print("Redirect seems to have failed or navigated to an external domain. Forcing local fallback to check routing...")
        page.goto("http://localhost:8787/success?session_id=AXM-12345")
        page.wait_for_timeout(3000)

    # Take a screenshot of the success page
    page.screenshot(path="verification.png")
    page.wait_for_timeout(2000)

if __name__ == "__main__":
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="videos")
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
