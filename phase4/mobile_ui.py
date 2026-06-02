import os

css_append = """
/* --- Mobile App / No-Scroll Root Layout --- */
html, body {
  height: 100dvh;
  overflow: hidden;
  margin: 0;
  padding: 0;
}

.app-main {
  flex: 1;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

/* Home Page Specific Layout */
#page-home.active {
  display: flex;
  flex-direction: column;
  height: 100%;
  padding: 1rem;
}

#page-home .home-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  margin: 0 auto;
  width: 100%;
  max-width: 720px;
}

#page-home .evaluation-form {
  flex: 1;
  display: flex;
  flex-direction: column;
  padding: 1rem;
  margin-bottom: 0;
}

/* Make the first textarea (AI Output) take up remaining vertical space */
#page-home .evaluation-form .form-group:nth-child(1) {
  flex: 1;
  display: flex;
  flex-direction: column;
}

#page-home .evaluation-form .form-group:nth-child(1) textarea {
  flex: 1;
  resize: none;
  min-height: 80px;
}

/* Keep the other inputs compact */
#page-home .evaluation-form .form-group:nth-child(2) textarea {
  min-height: 60px;
}

/* Shrink hero margins to save space on mobile */
.hero-section {
  margin-bottom: 0.75rem;
}

@media (max-width: 600px) {
  .hero-section h1 {
    font-size: 1.5rem;
  }
  .hero-section .subtitle {
    font-size: 0.85rem;
  }
  .app-header .header-container {
    padding: 0.75rem 1rem;
  }
}
"""

with open("public/style.css", "a", encoding="utf-8") as f:
    f.write(css_append)

print("Appended mobile UI CSS to style.css")
