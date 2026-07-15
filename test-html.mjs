import { readFileSync } from 'fs';
const html = readFileSync('.next/server/app/en.html', 'utf8');
const links = html.match(/<link[^>]*>/g);
console.log(links.filter(l => l.includes('font')));
