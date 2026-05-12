import re

with open('src/components/LetterForm.jsx', 'r') as f:
    content = f.read()

# Replace dueDate input
old_due_date = """<input maxLength="2000"
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        value={formData.dueDate}"""
new_due_date = """<input maxLength="2000"
                        id="dueDate"
                        name="dueDate"
                        type="date"
                        min={new Date().toISOString().split('T')[0]}
                        value={formData.dueDate}"""

# Replace letterDate input
old_letter_date = """<input maxLength="2000"
                            id="letterDate"
                            type="date"
                            name="letterDate"
                            value={formData.letterDate || ''}"""
new_letter_date = """<input maxLength="2000"
                            id="letterDate"
                            type="date"
                            min={new Date().toISOString().split('T')[0]}
                            name="letterDate"
                            value={formData.letterDate || ''}"""

content = content.replace(old_due_date, new_due_date)
content = content.replace(old_letter_date, new_letter_date)

with open('src/components/LetterForm.jsx', 'w') as f:
    f.write(content)

print("Patched successfully")
