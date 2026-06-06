import os
import re

TEST_DIR = "app/tests/test_users.py"

with open(TEST_DIR, "r") as f:
    content = f.read()

content = content.replace('assert "accessToken" in token_data', 'assert "access_token" in token_data')

with open(TEST_DIR, "w") as f:
    f.write(content)
