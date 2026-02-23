
import asyncio
from playwright.async_api import async_playwright

async def run():
    async with async_playwright() as p:
        # Launch browser
        browser = await p.chromium.launch(headless=True)
        # Grant clipboard permissions
        context = await browser.new_context(permissions=["clipboard-write", "clipboard-read"])
        page = await context.new_page()

        try:
            # 1. Navigate to the app
            print("Navigating to http://localhost:5173...")
            await page.goto("http://localhost:5173")

            # 2. Wait for content to load
            await page.wait_for_selector("h1", timeout=10000)
            print("Page loaded.")

            # 3. Check Instructions
            print("Checking Instructions...")
            await page.locator("text=How It Works").wait_for(state="visible")

            # 4. Fill in some data
            print("Filling form...")
            # Interest Rate
            await page.fill('input[name="statutoryInterest"]', '0')

            # Creditor Name
            await page.fill('input[name="creditorName"]', 'Test Creditor')

            # Amount
            await page.fill('input[aria-label="Amount for item 1"]', '1000')

            # 5. Check Summary
            print("Checking Summary...")
            await page.wait_for_timeout(1000) # Wait for react render

            interest_loc = page.locator("p.text-xl.font-bold.text-emerald-600")
            await interest_loc.wait_for(state="visible")
            interest_text = await interest_loc.inner_text()
            print(f"Interest Text: {interest_text}")

            if interest_text != "$0.00":
                print(f"WARNING: Interest text is {interest_text}, expected $0.00")

            # 6. Test Copy Button
            print("Testing Copy Button...")
            # Use a more robust selector if needed, but title attribute is good
            copy_btn = page.locator("button[title='Copy Summary to Clipboard']")
            await copy_btn.click()

            # Check if icon changed to checkmark
            # The icon is an SVG inside the button
            # We look for the class applied to the check icon
            await page.locator("svg.text-emerald-500").wait_for(state="visible", timeout=5000)
            print("Copy button clicked and feedback shown.")

            # 7. Take Screenshot
            print("Taking screenshot...")
            await page.screenshot(path="verification/verification.png", full_page=True)
            print("Screenshot saved to verification/verification.png")

        except Exception as e:
            print(f"Error: {e}")
            await page.screenshot(path="verification/error.png")
            raise e
        finally:
            await browser.close()

if __name__ == "__main__":
    asyncio.run(run())
