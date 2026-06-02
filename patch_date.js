const fs = require('fs');

let content = fs.readFileSync('worker.js', 'utf8');

const search = `const formattedDeadline = deadlineDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric', timeZone: 'UTC' });`;
const replace = `const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
        const formattedDeadline = \`\${months[deadlineDate.getMonth()]} \${deadlineDate.getDate()}, \${deadlineDate.getFullYear()}\`;`;

if (content.includes(search)) {
    content = content.replace(search, replace);
    fs.writeFileSync('worker.js', content, 'utf8');
    console.log("Date format successfully patched!");
} else {
    console.log("Search string not found!");
}
