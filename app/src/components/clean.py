import codecs

with codecs.open('ModernLanding.tsx', 'r', 'utf-8') as f:
    content = f.read()

start_marker = "            {/* Contact Section */}"
end_marker = "            {/* Footer */}"

start_idx = content.find(start_marker)
end_idx = content.find(end_marker)

if start_idx != -1 and end_idx != -1:
    new_content = content[:start_idx] + content[end_idx:]
    with codecs.open('ModernLanding.tsx', 'w', 'utf-8') as f:
        f.write(new_content)
    print("Success")
else:
    print(f"Failed. Start: {start_idx}, End: {end_idx}")
