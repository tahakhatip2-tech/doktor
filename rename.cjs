const fs = require('fs');
const path = require('path');

const directories = ['src', '.', 'hakeem-native/src'];

function replaceInFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    // Replace English
    content = content.replace(/Hakeem Jordan/g, 'Doctor Jo');
    content = content.replace(/Hakeem/g, 'Doctor Jo');
    // Replace Arabic
    content = content.replace(/حكيم الأردن/g, 'دكتور جو');
    // For standalone حكيم
    content = content.replace(/حكيم/g, 'دكتور جو');

    if (content !== original) {
        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Updated: ${filePath}`);
    }
}

function walkSync(dir) {
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            if (file !== 'node_modules' && file !== '.git' && file !== 'dist' && file !== 'build') {
                walkSync(fullPath);
            }
        } else {
            if (['.tsx', '.ts', '.js', '.jsx', '.html', '.css'].includes(path.extname(fullPath))) {
                replaceInFile(fullPath);
            }
        }
    }
}

directories.forEach(dir => {
    if (fs.existsSync(dir)) {
        if (dir === '.') {
            replaceInFile('index.html');
        } else {
            walkSync(dir);
        }
    }
});
console.log('Done renaming.');
