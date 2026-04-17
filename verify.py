from playwright.sync_api import sync_playwright
import os

def run_cuj(page):
    page.goto("http://localhost:5173/")
    page.wait_for_timeout(4000)

    # Click the correct Get Started button
    page.locator("a[href='/app/demand-generator']").first.click()
    page.wait_for_timeout(2000)

    # Fill out the required form fields
    page.locator("#creditorName").fill("John Doe")
    page.wait_for_timeout(500)
    page.locator("#creditorAddress").fill("123 Main St, City, ST 12345")
    page.wait_for_timeout(500)
    page.locator("#debtorName").fill("Jane Smith")
    page.wait_for_timeout(500)
    page.locator("#debtorAddress").fill("456 Elm St, City, ST 12345")
    page.wait_for_timeout(500)
    page.locator("#dueDate").fill("2025-01-01")
    page.wait_for_timeout(500)

    # Locate the items section to fill amount
    page.locator("input[type='number']").nth(1).fill("1000") # the first input type=number is probably interest rate
    page.wait_for_timeout(500)

    # Click on Proceed to Checkout to trigger the modal
    page.locator("button:has-text('PROCEED TO CHECKOUT')").click()
    page.wait_for_timeout(2000)

    # Now let's try to simulate connecting the wallet to test the "Bypass Paywall" button rendering
    # Since we use useActiveAccount from thirdweb/react, we might not be able to easily mock it from playwright
    # Let's at least take the screenshot showing the modal with "Connect"
    page.screenshot(path="/home/jules/verification/screenshots/verification.png")
    page.wait_for_timeout(1000)

if __name__ == "__main__":
    os.makedirs("/home/jules/verification/screenshots", exist_ok=True)
    os.makedirs("/home/jules/verification/videos", exist_ok=True)
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        context = browser.new_context(record_video_dir="/home/jules/verification/videos")
        page = context.new_page()
        try:
            run_cuj(page)
        finally:
            context.close()
            browser.close()
