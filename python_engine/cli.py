#!/usr/bin/env python3
"""
Textra Python NLP Engine CLI
Run Stanford NLP pipeline directly from command line or piping input.

Usage:
  python -m python_engine.cli "Stanford University was founded in California."
  echo "Chris Manning is an NLP pioneer." | python -m python_engine.cli
"""

import sys
import os
import json

ENGINE_DIR = os.path.dirname(os.path.abspath(__file__))
PROJECT_DIR = os.path.dirname(ENGINE_DIR)
if PROJECT_DIR not in sys.path:
    sys.path.insert(0, PROJECT_DIR)

from python_engine.model import analyze_text

def main():
    if len(sys.argv) > 1:
        input_text = " ".join(sys.argv[1:])
    else:
        if not sys.stdin.isatty():
            input_text = sys.stdin.read()
        else:
            print("Usage: python -m python_engine.cli \"<text>\" or pipe text to stdin", file=sys.stderr)
            sys.exit(1)

    if not input_text.strip():
        print("Error: Input text is empty.", file=sys.stderr)
        sys.exit(1)

    result = analyze_text(input_text.strip())
    print(json.dumps(result, indent=2))

if __name__ == "__main__":
    main()
