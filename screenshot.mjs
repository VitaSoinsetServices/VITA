import { createRequire } from 'module';
import { existsSync, mkdirSync, readdirSync } from 'fs';
import { join } from 'path';
import { fileURLToPath } from 'url';

const require = createRequire(import.meta.url);
const puppeteer = require('C:\\Users\\Niko\\puppeteer-test\\node_modules\\puppeteer\\lib\\cjs\\puppeteer\\puppeteer.js');

const __dirname = fileURLToPath(new URL('.', import.meta.url));

const url = process.argv[2] || 'http://localhost:3000';
const label = process.argv[3] || '';

const outDir = join(__dirname, 'temporary screenshots');
if (!existsSync(outDir)) mkdirSync(outDir, { recursive: true });

const existing = readdirSync(outDir).filter(f => f.endsWith('.png'));
const nums = existing.map(f => parseInt(f.match(/^screenshot-(\d+)/)?.[1] || '0')).filter(n => !isNaN(n));
const next = nums.length ? Math.max(...nums) + 1 : 1;

const filename = label ? `screenshot-${next}-${label}.png` : `screenshot-${next}.png`;
const outPath = join(outDir, filename);

const browser = await puppeteer.launch({
  executablePath: 'C:\\Users\\Niko\\.cache\\puppeteer\\chrome\\win64-146.0.7680.153\\chrome-win64\\chrome.exe',
  args: ['--no-sandbox', '--disable-setuid-sandbox'],
});

const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 900 });
await page.goto(url, { waitUntil: 'networkidle0', timeout: 30000 });
await new Promise(r => setTimeout(r, 800));

// Scroll through page to trigger IntersectionObserver animations
await page.evaluate(async () => {
    await new Promise(resolve => {
        const total = document.body.scrollHeight;
        let pos = 0;
        const step = () => {
            pos += 400;
            window.scrollTo(0, pos);
            if (pos < total) requestAnimationFrame(step);
            else { window.scrollTo(0, 0); setTimeout(resolve, 400); }
        };
        requestAnimationFrame(step);
    });
});
await new Promise(r => setTimeout(r, 800));
const fullPage = process.argv[4] !== 'viewport';
await page.screenshot({ path: outPath, fullPage });
await browser.close();

console.log(`Screenshot saved: ${outPath}`);
