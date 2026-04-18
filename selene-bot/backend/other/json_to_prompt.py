import json

def json_to_prompt(json_str: str) -> str:
    history = json.loads(json_str)
    lines = []
    for h in history:
        role = "User" if h["isUser"] else "Bot"
        if h["content"].strip():
            lines.append(f"{role}: {h['content']}")
    return "\n".join(lines) + "\nBot:"