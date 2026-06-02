import os
import re

# Fix server.py
with open("server.py", "r", encoding="utf-8") as f:
    server_code = f.read()

replacement = """            parsed_data = extract_json(raw_response)

            if endpoint in ['assumptions', 'uncertainty', 'context', 'prompts']:
                if isinstance(parsed_data, dict):
                    for val in parsed_data.values():
                        if isinstance(val, list):
                            parsed_data = val
                            break
                    else:
                        parsed_data = [parsed_data]

            self.send_response(200)"""

server_code = server_code.replace("            parsed_data = extract_json(raw_response)\n\n            self.send_response(200)", replacement)
server_code = server_code.replace("            parsed_data = extract_json(raw_response)\r\n\r\n            self.send_response(200)", replacement)

with open("server.py", "w", encoding="utf-8") as f:
    f.write(server_code)

# Fix style.css
with open("public/style.css", "r", encoding="utf-8") as f:
    css = f.read()

css = re.sub(r'\.home-container \{[\s\S]*?margin: 4rem auto;', r'.home-container {\n  max-width: 720px;\n  margin: 2rem auto;', css)
css = re.sub(r'\.hero-section h1 \{[\s\S]*?font-size: [^\n]+;\n[\s\S]*?margin-bottom: [^\n]+;', r'.hero-section h1 {\n  font-family: var(--font-title);\n  font-size: 2rem;\n  font-weight: 800;\n  letter-spacing: -1px;\n  line-height: 1.15;\n  color: var(--slate-900);\n  margin-bottom: 0.5rem;', css)
css = re.sub(r'\.hero-section \.subtitle \{[\s\S]*?font-size: [^\n]+;', r'.hero-section .subtitle {\n  font-size: 1rem;', css)
css = re.sub(r'\.evaluation-form \{[\s\S]*?padding: [^\n]+;', r'.evaluation-form {\n  background-color: #ffffff;\n  border-radius: var(--radius-lg);\n  padding: 1.5rem;', css)
css = re.sub(r'\.form-group \{[\s\S]*?margin-bottom: [^\n]+;', r'.form-group {\n  display: flex;\n  flex-direction: column;\n  gap: 0.5rem;\n  margin-bottom: 1.25rem;', css)
css = re.sub(r'\.form-group textarea \{[\s\S]*?padding: [^\n]+;([\s\S]*?)min-height: [^\n]+;', r'.form-group textarea {\n  font-family: var(--font-body);\n  font-size: 1rem;\n  padding: 0.75rem 1rem;\1min-height: 120px;', css)
css = re.sub(r'\.form-row \{[\s\S]*?margin-bottom: [^\n]+;', r'.form-row {\n  margin-bottom: 1.25rem;', css)

css = re.sub(r'(\.btn-primary, \.btn-submit \{[\s\S]*?padding: )[^\n]+;([\s\S]*?font-size: )[^\n]+;', r'\g<1>0.6rem 1.2rem;\g<2>0.95rem;', css)
css = re.sub(r'(\.btn-secondary \{[\s\S]*?font-size: )[^\n]+;\n  padding: [^\n]+;', r'\g<1>0.95rem;\n  padding: 0.6rem 1.2rem;', css)

css = re.sub(r'\.page-view \{[\s\S]*?padding: [^\n]+;', r'.page-view {\n  display: none;\n  width: 100%;\n  max-width: 1200px;\n  margin: 0 auto;\n  padding: 1.5rem 1rem;', css)
css = re.sub(r'\.results-header \{[\s\S]*?gap: [^\n]+;\n  margin-bottom: [^\n]+;', r'.results-header {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  margin-bottom: 1.5rem;', css)
css = re.sub(r'\.analysis-status h2 \{[\s\S]*?font-size: [^\n]+;', r'.analysis-status h2 {\n  font-family: var(--font-title);\n  font-size: 1.75rem;', css)
css = re.sub(r'\.grid-panels \{[\s\S]*?gap: [^\n]+;\n  margin-bottom: [^\n]+;', r'.grid-panels {\n  display: grid;\n  grid-template-columns: 1fr 1fr;\n  gap: 1rem;\n  margin-bottom: 1.5rem;', css)
css = re.sub(r'\.panel-header \{[\s\S]*?padding: [^\n]+;([\s\S]*?)gap: [^\n]+;', r'.panel-header {\n  padding: 0.75rem 1rem;\1gap: 0.5rem;', css)
css = re.sub(r'\.panel-icon \{[\s\S]*?width: [^\n]+;\n  height: [^\n]+;([\s\S]*?)font-size: [^\n]+;', r'.panel-icon {\n  width: 1.75rem;\n  height: 1.75rem;\1font-size: 1rem;', css)
css = re.sub(r'\.panel-header h3 \{[\s\S]*?font-size: [^\n]+;', r'.panel-header h3 {\n  font-family: var(--font-title);\n  font-size: 1rem;', css)
css = re.sub(r'\.panel-body \{[\s\S]*?padding: [^\n]+;', r'.panel-body {\n  padding: 1rem;', css)

css = re.sub(r'\.score-section \{[\s\S]*?padding: [^\n]+;([\s\S]*?)margin-top: [^\n]+;', r'.score-section {\n  background-color: #ffffff;\n  border-radius: var(--radius-lg);\n  padding: 1.5rem;\1margin-top: 1.5rem;', css)
css = re.sub(r'\.score-header h3 \{[\s\S]*?font-size: [^\n]+;', r'.score-header h3 {\n  font-family: var(--font-title);\n  font-size: 1.25rem;', css)
css = re.sub(r'\.score-grid \{[\s\S]*?gap: [^\n]+;\n  margin-bottom: [^\n]+;', r'.score-grid {\n  display: flex;\n  flex-direction: column;\n  gap: 0.75rem;\n  margin-bottom: 1.5rem;', css)
css = re.sub(r'\.score-bar-card \{[\s\S]*?padding: [^\n]+;', r'.score-bar-card {\n  border: 1px solid var(--slate-100);\n  border-radius: var(--radius-md);\n  padding: 0.75rem 1rem;', css)
css = re.sub(r'\.score-bar-header \{[\s\S]*?margin-bottom: [^\n]+;', r'.score-bar-header {\n  display: flex;\n  justify-content: space-between;\n  align-items: center;\n  margin-bottom: 0.4rem;', css)

if "@media (max-width: 768px)" not in css:
    css += "\n\n@media (max-width: 768px) {\n  .grid-panels {\n    grid-template-columns: 1fr;\n  }\n}\n"

with open("public/style.css", "w", encoding="utf-8") as f:
    f.write(css)

print("Fix applied successfully")
