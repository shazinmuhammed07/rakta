const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
    fs.readdirSync(dir).forEach(f => {
        let dirPath = path.join(dir, f);
        let isDirectory = fs.statSync(dirPath).isDirectory();
        isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
    });
}

let count = 0;
walkDir('c:/Users/SHAZI/rakta/app', function(filePath) {
    if (filePath.endsWith('.js') || filePath.endsWith('.jsx')) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (content.includes('createClient()') && !content.includes('await createClient()') && !filePath.includes('server.js') && !filePath.includes('client.js')) {
            content = content.replace(/const supabase = createClient\(\);/g, 'const supabase = await createClient();');
            content = content.replace(/let supabase = createClient\(\);/g, 'let supabase = await createClient();');
            if (content.includes('const supabase = await createClient();')) {
                fs.writeFileSync(filePath, content, 'utf8');
                count++;
                console.log('Fixed', filePath);
            }
        }
    }
});
console.log(`Replaced in ${count} files.`);
