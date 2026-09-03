// ==================== CRC32 表 ====================
const CRC_TABLE: Uint32Array = (() => {
    const table = new Uint32Array(256);
    for (let i = 0; i < 256; i++) {
        let crc = i;
        for (let j = 0; j < 8; j++) {
            crc = (crc & 1) ? ((crc >>> 1) ^ 0xEDB88320) >>> 0 : crc >>> 1;
        }
        table[i] = crc >>> 0;
    }
    return table;
})();

/** 更新 CRC32 内部状态 */
const updateCrc = (byte: number, crc: number): number =>
    ((crc >>> 8) ^ CRC_TABLE[(crc & 0xFF) ^ byte]) >>> 0;

/**
 * 计算字符串的 CRC32 值
 * B站弹幕数据的 uhash/midHash 即发送者uid字符串的 CRC32 十六进制表示
 * @param str {string}
 * @returns {number} 无符号 32 位 CRC32
 */
const crc32 = (str: string): number => {
    let crc = 0xFFFFFFFF;
    for (let i = 0; i < str.length; i++) {
        crc = updateCrc(str.charCodeAt(i), crc);
    }
    return (crc ^ 0xFFFFFFFF) >>> 0;
}

// ==================== pakku 风格 rainbow 破解表 ====================
// 支持 5~11 位 uid：11 位 uid 需要枚举 6 位前缀，因此表容量为 10^6。
const DIGIT_RAINBOW_SIZE = 1_000_000;
const SUFFIX_RAINBOW_SIZE = 100_000;

interface CrackTables {
    digitRainbow: Uint32Array;
    prefixRainbow: Uint32Array;
    hashPosition: Uint32Array;
    hashValues: Uint32Array;
}

let crackTables: CrackTables | null = null;

/** 计算数字字节数组的 CRC 内部状态，初始值与 pakku 保持一致 */
const computeDigitState = (digits: number[], init = 0): number => {
    let crc = init;
    for (const digit of digits) {
        crc = updateCrc(digit, crc);
    }
    return crc;
}

const buildCrackTables = (): CrackTables => {
    const digitRainbow = new Uint32Array(DIGIT_RAINBOW_SIZE);
    for (let i = 0; i < DIGIT_RAINBOW_SIZE; i++) {
        const digits = String(i).split('').map(Number);
        digitRainbow[i] = computeDigitState(digits);
    }

    // 对每个最多六位的前缀，预计算追加五个0字节后的状态。
    const prefixRainbow = new Uint32Array(DIGIT_RAINBOW_SIZE);
    const zeroSuffix = [0, 0, 0, 0, 0];
    for (let i = 0; i < DIGIT_RAINBOW_SIZE; i++) {
        prefixRainbow[i] = computeDigitState(zeroSuffix, digitRainbow[i]);
    }

    // 只把五位后缀（0~99999）按高16位建立索引。
    const hashPosition = new Uint32Array(65537);
    for (let i = 0; i < SUFFIX_RAINBOW_SIZE; i++) {
        hashPosition[digitRainbow[i] >>> 16]++;
    }
    for (let i = 1; i <= 65536; i++) {
        hashPosition[i] += hashPosition[i - 1];
    }

    const hashValues = new Uint32Array(SUFFIX_RAINBOW_SIZE * 2);
    for (let i = 0; i < SUFFIX_RAINBOW_SIZE; i++) {
        const position = --hashPosition[digitRainbow[i] >>> 16];
        hashValues[position * 2] = digitRainbow[i];
        hashValues[position * 2 + 1] = i;
    }
    return {digitRainbow, prefixRainbow, hashPosition, hashValues};
}

const getCrackTables = (): CrackTables => {
    if (crackTables === null) crackTables = buildCrackTables();
    return crackTables;
}

const lookupSuffix = (tables: CrackTables, crc: number): number[] => {
    const first = tables.hashPosition[crc >>> 16];
    const last = tables.hashPosition[(crc >>> 16) + 1];
    const result: number[] = [];
    for (let i = first; i < last; i++) {
        if (tables.hashValues[i * 2] === crc) {
            result.push(tables.hashValues[i * 2 + 1]);
        }
    }
    return result;
}

/**
 * 破解 uhash：采用 pakku 的 rainbow table 算法，
 * 枚举数字 uid 的前缀，利用 CRC32 状态分解直接求出五位后缀。
 * 返回结果包含数学上的碰撞候选，调用方必须用用户接口做二次校验。
 * @param uhash {string} 弹幕发送者 uid 的 CRC32 十六进制哈希
 * @param maxLen {number} 最大尝试位数，默认 11（超过 11 位开销不可接受）
 * @returns {string[]} 按 uid 位数升序排列的候选 uid
 */
const crackUhashCandidates = (uhash: string, maxLen: number = 11): string[] => {
    const mainCrc = parseInt(uhash, 16);
    if (isNaN(mainCrc)) return [];
    const maxDigit = Math.min(Math.max(Math.floor(maxLen), 1), 11);
    const tables = getCrackTables();
    const results: string[] = [];
    // 发布的 CRC 值需要还原成内部状态，和 pakku 的 maincrc = ~maincrc 一致。
    const targetState = (~mainCrc) >>> 0;
    let baseState = 0xFFFFFFFF;

    for (let digitCount = 1; digitCount <= maxDigit; digitCount++) {
        baseState = updateCrc(0x30, baseState);
        if (digitCount < 6) {
            const firstUid = Math.pow(10, digitCount - 1);
            const lastUid = Math.pow(10, digitCount);
            for (let uid = firstUid; uid < lastUid; uid++) {
                if (targetState === ((baseState ^ tables.digitRainbow[uid]) >>> 0)) {
                    results.push(String(uid));
                }
            }
            continue;
        }

        const firstPrefix = Math.pow(10, digitCount - 6);
        const lastPrefix = Math.pow(10, digitCount - 5);
        for (let prefix = firstPrefix; prefix < lastPrefix; prefix++) {
            const remaining = (targetState ^ baseState ^ tables.prefixRainbow[prefix]) >>> 0;
            for (const suffix of lookupSuffix(tables, remaining)) {
                results.push(String(prefix * 100000 + suffix));
            }
        }
    }
    return results;
}

export default {crc32, crackUhashCandidates}
