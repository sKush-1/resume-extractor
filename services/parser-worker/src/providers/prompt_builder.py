import json

DEFAULT_METRICS = [
    {"name": "name", "description": "full name"},
    {"name": "email", "description": "email address or empty string"},
    {"name": "phone", "description": "phone number or empty string"},
    {"name": "skills", "description": "array of skill strings"},
    {"name": "experience_years", "description": "total years of experience, e.g. '5' or '3-5'"},
    {"name": "education", "description": "array of education entries, e.g. 'B.Tech in Computer Science, XYZ University, 2020'"},
    {"name": "companies", "description": "array of company names the candidate has worked at"},
    {"name": "location", "description": "city/state/country or empty string"},
]

def build_extraction_prompt(metrics: list = None) -> str:
    """Build a dynamic prompt based on provided metrics list."""
    if not metrics:
        metrics = DEFAULT_METRICS
    
    schema_dict = {}
    for m in metrics:
        # Trim and normalize name for key consistency
        key = m["name"].strip()
        schema_dict[key] = f"string ({m['description']})"

    schema_json = json.dumps(schema_dict, indent=2)

    return f"""You are a resume data extraction assistant.
Extract structured information from the given resume text.
You MUST respond with ONLY valid JSON matching this exact schema:

{schema_json}

Rules:
- Return ONLY the JSON object, no markdown, no explanation.
- If a field cannot be determined, use empty string or empty array.
- Extract exactly the fields defined in the schema above.
"""
