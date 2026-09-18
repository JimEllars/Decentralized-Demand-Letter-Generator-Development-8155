import re

with open("src/components/Header.jsx", "r") as f:
    content = f.read()

# Add import
if "import { useAximAuth }" not in content:
    content = content.replace("import React, { useState } from 'react';", "import React, { useState } from 'react';\nimport { useAximAuth } from '../hooks/useAximAuth';")

# Replace useState with useAximAuth
content = re.sub(
    r"  const \[isAuthenticated, setIsAuthenticated\] = useState\(false\);",
    "  const { isAuthenticated, user, login, logout } = useAximAuth();",
    content
)

# Update the button
new_button = """      {isAuthenticated ? (
        <div className="flex items-center gap-4">
          <span className="text-zinc-400 text-xs font-inter">{user?.email}</span>
          <button
            onClick={logout}
            className="px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-zinc-400 hover:text-white bg-transparent hover:bg-zinc-800 rounded border border-transparent hover:border-zinc-700 transition-colors"
          >
            Log Out
          </button>
        </div>
      ) : (
        <button
          onClick={login}
          className="px-4 py-1.5 text-xs font-semibold tracking-wider uppercase text-white bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 transition-colors"
        >
          Login
        </button>
      )}"""

content = re.sub(
    r"      <button\n        onClick=\{\(\) => setIsAuthenticated\(!isAuthenticated\)\}\n        className=\"px-4 py-1\.5 text-xs font-semibold tracking-wider uppercase text-white bg-zinc-800 hover:bg-zinc-700 rounded border border-zinc-700 transition-colors\"\n      >\n        \{isAuthenticated \? 'Hi AXiM User' : 'Login'\}\n      </button>",
    new_button,
    content,
    flags=re.DOTALL
)

with open("src/components/Header.jsx", "w") as f:
    f.write(content)
