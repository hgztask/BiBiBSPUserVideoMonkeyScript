/**
 * bv号与av号互转
 * 参考：https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/misc/bvid_desc.md#javascripttypescript
 */
class BilibiliEncoder {
     #XOR_CODE = 23442827791579n;
     #MASK_CODE = 2251799813685247n;
     #MAX_AID = 1n << 51n;
     #BASE = 58n;
     #data = 'FcwAPNKTMug3GV5Lj7EJnHpWsx4tb8haYeviqBz6rkCy12mUSDQX9RdoZf';

     av2bv(aid) {
        const bytes = ['B', 'V', '1', '0', '0', '0', '0', '0', '0', '0', '0', '0'];
        let bvIndex = bytes.length - 1;
        let tmp = (this.#MAX_AID | BigInt(aid)) ^ this.#XOR_CODE;
        while (tmp > 0) {
            bytes[bvIndex] = this.#data[Number(tmp % BigInt(this.#BASE))];
            tmp = tmp / this.#BASE;
            bvIndex -= 1;
        }
        [bytes[3], bytes[9]] = [bytes[9], bytes[3]];
        [bytes[4], bytes[7]] = [bytes[7], bytes[4]];
        return bytes.join('');
    }

    bv2av(bvid) {
        const bvidArr = Array.from(bvid);
        [bvidArr[3], bvidArr[9]] = [bvidArr[9], bvidArr[3]];
        [bvidArr[4], bvidArr[7]] = [bvidArr[7], bvidArr[4]];
        bvidArr.splice(0, 3);
        const tmp = bvidArr.reduce((pre, bvidChar) => pre * this.#BASE + BigInt(this.#data.indexOf(bvidChar)), 0n);
        return Number((tmp & this.#MASK_CODE) ^ this.#XOR_CODE);
    }
}

export const bilibiliEncoder = new BilibiliEncoder();
