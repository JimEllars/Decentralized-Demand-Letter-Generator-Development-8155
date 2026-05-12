import re

with open('src/components/DemandLanding.jsx', 'r') as f:
    content = f.read()

# Insert the useEffect after parsing stateId
target_string = "const displayState = stateId ? stateId.toUpperCase() : '';\n"
new_effect = """
  useEffect(() => {
    const baseTitle = "Quick Demand Letter | Create a Legal PDF Instantly";
    if (stateId) {
      document.title = `${stateId.toUpperCase()} Demand Letter Generator | Quick Demand Letter`;
    } else {
      document.title = baseTitle;
    }
  }, [stateId]);
"""

# replace the target with the target + the new effect
if target_string in content:
    content = content.replace(target_string, target_string + new_effect)
    with open('src/components/DemandLanding.jsx', 'w') as f:
        f.write(content)
    print("Patched successfully")
else:
    print("Target string not found")
