#!/bin/sh
# Odtwarza wszystkie pliki src/data/*.json z PDF-ów w materialy/. Wymaga: pip install pdfplumber
set -e
cd "$(dirname "$0")/../.."
python3 scripts/extract/analysis.py        # musi być przed compendium_data.py (examRules)
python3 scripts/extract/artworks.py
python3 scripts/extract/questions.py
python3 scripts/extract/compendium_data.py
python3 scripts/extract/tags.py
