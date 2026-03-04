import glob
import os

replacements = {
    'ظٹ': 'ي', 'ظپ': 'ف', 'ظƒ': 'ك', 'طھ': 'ت', 'ظˆ': 'و', 'ظ…': 'م', 'ظ†': 'ن', 'ط§': 'ا', 'ظ„': 'ل', 'ط±': 'ر',
    'ط¨': 'ب', 'ط¯': 'د', 'ط³': 'س', 'ط´': 'ش', 'ظ‡': 'ه', 'ظ‘': 'ّ', 'ط،': 'ء', 'ط·': 'ط', 'ط¹': 'ع', 'طµ': 'ص',
    'ظ‚': 'ق', 'ط«': 'ث', 'ظ': 'ظ', 'ط®': 'خ', 'ط¬': 'ج', 'ظ€': 'ـ', 'ط': 'ح', 'ط²': 'ز', 'ط°': 'ذ', 'ط¶': 'ض',
    'ط؛': 'غ', 'ط£': 'أ', 'ط¥': 'إ', 'ط¢': 'آ', 'ط¤': 'ؤ', 'ط¦': 'ئ', 'ط©': 'ة', 'ط،ً': 'ءً', 'ط¸': 'ظ', 'ط،ٍ': 'ءٍ',
    'طŒ': '،', 'طں': '؟', 'ط،ٌ': 'ءٌ', 'مظڈ': 'مُ', 'قظگ': 'قِ', 'بظژ': 'بَ', 'لظژ': 'لَ'
}

count = 0
files_checked = 0
target_dir = r"c:\Users\TOSHIBA\Desktop\hakeem-jo\src"

# Find all tsx, ts, and css files
for ext in ('*.tsx', '*.ts', '*.css'):
    for f in glob.glob(os.path.join(target_dir, '**', ext), recursive=True):
        files_checked += 1
        try:
            with open(f, 'r', encoding='utf-8') as fp:
                text = fp.read()
                
            original_text = text
            for k, v in replacements.items():
                text = text.replace(k, v)
                
            if text != original_text:
                with open(f, 'w', encoding='utf-8') as fw:
                    fw.write(text)
                count += 1
                print(f"Fixed: {f}")
        except Exception as e:
            print(f"Error processing {f}: {e}")

print(f"Checked {files_checked} files. Fixed {count} files.")
