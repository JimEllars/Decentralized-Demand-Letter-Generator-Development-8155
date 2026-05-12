import re

with open('src/components/DemandLanding.jsx', 'r') as f:
    content = f.read()

# The helmet title is overriding the dynamic document.title
content = content.replace('<title>AXiM Demand Letter Generator | AI-Powered Legal Drafting</title>', '{/* <title>AXiM Demand Letter Generator | AI-Powered Legal Drafting</title> */}')

with open('src/components/DemandLanding.jsx', 'w') as f:
    f.write(content)

print("Patched Helmet title successfully")
