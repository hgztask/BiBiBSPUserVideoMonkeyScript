/**
 * 检查 .vue 文件中的 TypeScript 类型错误
 * 原理：用 vue-template-compiler 解析 .vue 文件，提取 <script lang="ts"> 块，
 * 写入临时 .vue.ts 文件，再用 tsc --noEmit 检查，过滤掉 TS2307（模块解析）错误
 */
import {execSync} from 'child_process';
import {readdirSync, readFileSync, statSync, unlinkSync, writeFileSync} from 'fs';
import {extname, join, resolve} from 'path';
import {createRequire} from 'module';

const require = createRequire(import.meta.url);
const {parseComponent} = require('vue-template-compiler');

const SRC_DIR = resolve('src/web');
const TSCONFIG = resolve('tsconfig.json');
const TEMP_CONFIG = resolve('tsconfig.vue-check.json');

const tempFiles = [];

function cleanUp() {
    for (const f of tempFiles) {
        try {
            unlinkSync(f);
        } catch {
        }
    }
    try {
        unlinkSync(TEMP_CONFIG);
    } catch {
    }
}

function walkDir(dir) {
    const results = [];
    for (const entry of readdirSync(dir)) {
        const fullPath = join(dir, entry);
        if (statSync(fullPath).isDirectory()) {
            results.push(...walkDir(fullPath));
        } else if (extname(entry) === '.vue') {
            results.push(fullPath);
        }
    }
    return results;
}

function checkVueTypes() {
    const vueFiles = walkDir(SRC_DIR);
    let hasScript = false;

    for (const vueFile of vueFiles) {
        const content = readFileSync(vueFile, 'utf-8');
        const parsed = parseComponent(content);

        if (parsed.script && parsed.script.lang === 'ts') {
            hasScript = true;
            const tempFile = vueFile.replace(/\.vue$/, '.vue.ts');
            writeFileSync(tempFile, parsed.script.content, 'utf-8');
            tempFiles.push(tempFile);
        }
    }

    if (!hasScript) {
        console.log('No .vue files with <script lang="ts"> found.');
        return 0;
    }

    const mainConfig = JSON.parse(readFileSync(TSCONFIG, 'utf-8'));
    mainConfig.include = mainConfig.include || [];
    mainConfig.include.push('src/web/**/*.vue.ts');
    writeFileSync(TEMP_CONFIG, JSON.stringify(mainConfig, null, 2), 'utf-8');

    let output = '';
    let exitCode = 0;

    try {
        output = execSync('pnpm exec tsc --noEmit -p tsconfig.vue-check.json', {
            encoding: 'utf-8',
            cwd: process.cwd(),
            stdio: ['pipe', 'pipe', 'pipe']
        });
    } catch (e) {
        output = e.stdout || '';
        const stderr = e.stderr || '';
        if (stderr) output += stderr;
        exitCode = 1;
    }

    // 过滤输出：只保留 .vue.ts 文件的非忽略错误
    // TS2307: .vue 模块无法被 tsc 解析（产生 .vue.ts 临时文件 import 原始 .vue 时会报）
    const IGNORED_ERRORS = ['TS2307'];
    const lines = output.split('\n');
    const vueErrors = [];
    const otherErrors = [];

    for (const line of lines) {
        if (line.includes('.vue.ts')) {
            const isIgnored = IGNORED_ERRORS.some(code => line.includes(code));
            if (!isIgnored) {
                vueErrors.push(line);
            }
        } else if (line.includes('error TS')) {
            otherErrors.push(line);
        }
    }

    if (vueErrors.length > 0) {
        console.log('\n=== Vue SFC 类型错误 ===');
        for (const err of vueErrors) {
            // 显示时还原为原始 .vue 文件名
            console.log(err.replace(/\.vue\.ts/g, '.vue'));
        }
    }

    if (otherErrors.length > 0) {
        console.log('\n=== 其他类型错误 ===');
        for (const err of otherErrors) {
            console.log(err);
        }
    }

    if (vueErrors.length > 0) {
        console.log(`\n共 ${vueErrors.length} 个 Vue SFC 类型错误。`);
    }

    cleanUp();

    return vueErrors.length > 0 ? 1 : 0;
}

const result = checkVueTypes();
process.exit(result);