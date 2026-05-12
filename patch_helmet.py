import re

with open('src/components/DemandLanding.jsx', 'r') as f:
    content = f.read()

# Try again with a more robust regex
content = re.sub(r'<Helmet>\s*\{\/\* <title>.*?<\/title> \*\/\}', '<Helmet>\n        <title>{stateId ? `${stateId.toUpperCase()} Demand Letter Generator | Quick Demand Letter` : "Quick Demand Letter | Create a Legal PDF Instantly"}</title>', content)

with open('src/components/DemandLanding.jsx', 'w') as f:
    f.write(content)

print("Patched Helmet")
