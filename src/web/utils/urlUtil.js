export default {
    getUrlRoomId(url) {
        const match = url.match(/live\.bilibili\.com\/(\d+)/);
        if (match === null) {
            return -1
        }
        return parseInt(match[1])
    }
}