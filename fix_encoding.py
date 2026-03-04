#!/usr/bin/env python3
"""
Fix Arabic Mojibake in TypeScript/TSX files.
The issue: Arabic UTF-8 bytes were read as CP1256 (Windows Arabic codepage),
creating garbled text. This script reverses the process.

Conversion: file_text.encode('cp1256') -> .decode('utf-8') = original Arabic
"""

import os
import re
import sys

# Characters that indicate mojibake (cp1256 chars that result from Arabic UTF-8 bytes)
MOJIBAKE_CHARS = set('طظءآأؤإئابةتثجحخدذرزسشصضطظعغفقكلمنهوىيًٌٍَُِّْ§„"‡ˆ‰Š‹ŒŽ''""•–—˜™šœžŸ¡¢£¤¥¦©ª«¬­®¯°±²³´µ¶·¸¹º»¼½¾¿ÀÁÂÃÄÅÆÇÈÉÊËÌÍÎÏÐÑÒÓÔÕÖØÙÚÛÜÝÞßàáâãäåæçèéêëìíîïðñòóôõöøùúûüýþÿ')

def fix_mojibake_segment(segment: str) -> str:
    """Try to fix a mojibake segment by encoding as cp1256 then decoding as utf-8."""
    try:
        fixed = segment.encode('cp1256').decode('utf-8')
        return fixed
    except (UnicodeEncodeError, UnicodeDecodeError):
        return segment

def fix_text(text: str) -> str:
    """
    Find and fix mojibake sequences in text.
    A mojibake sequence is a run of characters that:
    1. Contains Arabic-looking mojibake chars
    2. Is surrounded by normal ASCII/JSX code
    """
    result = []
    i = 0
    n = len(text)
    
    while i < n:
        char = text[i]
        
        # Check if this could be start of a mojibake sequence
        # Mojibake typically starts with ط or ظ or similar Arabic-in-CP1256 chars
        if ord(char) > 127 and char in 'طظءآأؤإئابةتثجحخدذرزسشصضعغفقكلمنهوىيًٌٍَُِّْ':
            # Collect the mojibake segment
            seg_start = i
            while i < n and (ord(text[i]) > 127 or text[i] in ' \t،,،؟!:.()[]{}'):
                i += 1
            segment = text[seg_start:i]
            
            # Strip trailing ASCII punctuation for safe conversion
            stripped = segment.rstrip(' \t')
            trailing = segment[len(stripped):]
            
            fixed = fix_mojibake_segment(stripped)
            result.append(fixed + trailing)
        else:
            result.append(char)
            i += 1
    
    return ''.join(result)

def process_file(filepath: str) -> bool:
    """Process a single file. Returns True if changes were made."""
    try:
        with open(filepath, 'r', encoding='utf-8', errors='replace') as f:
            original = f.read()
        
        # Check if file has mojibake (contains the characteristic pattern)
        if 'ط§' not in original and 'ظ„' not in original and 'ط©' not in original:
            return False
        
        fixed = fix_text(original)
        
        if fixed == original:
            return False
        
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(fixed)
        
        return True
    except Exception as e:
        print(f"  ERROR processing {filepath}: {e}")
        return False

def find_files(root_dir: str, extensions: tuple) -> list:
    """Find all files with given extensions, excluding node_modules and dist."""
    files = []
    skip_dirs = {'node_modules', 'dist', '.git', 'build', '__pycache__', '.next'}
    
    for dirpath, dirnames, filenames in os.walk(root_dir):
        # Skip unwanted directories
        dirnames[:] = [d for d in dirnames if d not in skip_dirs]
        
        for filename in filenames:
            if any(filename.endswith(ext) for ext in extensions):
                files.append(os.path.join(dirpath, filename))
    
    return files

def main():
    # Project root
    root = r'c:\Users\TOSHIBA\Desktop\hakeem-jo\src'
    
    print(f"🔍 Scanning for mojibake in: {root}")
    print("=" * 60)
    
    files = find_files(root, ('.tsx', '.ts'))
    print(f"Found {len(files)} TypeScript files to check\n")
    
    fixed_count = 0
    for filepath in sorted(files):
        rel = os.path.relpath(filepath, root)
        changed = process_file(filepath)
        if changed:
            print(f"  ✅ Fixed: {rel}")
            fixed_count += 1
        else:
            print(f"  ⏭️  Skip:  {rel}")
    
    print("\n" + "=" * 60)
    print(f"✅ Done! Fixed {fixed_count} out of {len(files)} files.")
    
    if fixed_count == 0:
        print("ℹ️  No mojibake found — files may already be correct.")

if __name__ == '__main__':
    main()
