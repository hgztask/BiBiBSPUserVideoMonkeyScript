const HttpUtil = {
    httpRequest(method, url, headers, resolve, reject) {
        let tempHraders = {
            "User-Agent": navigator.userAgent
        };
        if (headers !== null || headers !== undefined) {
            tempHraders = Object.assign({}, tempHraders, headers)
        }
        Util.httpRequest({
            method: method,
            url: url,
            headers: tempHraders,
            onload: resolve,
            onerror: reject
        });
    },
    /**
     *封装好的底层post请求，一般情况下不要直接调用，请使用对应的封装好的函数
     */
    _post(url, data, headers, resolve, reject) {
        let temp = {
            "Content-Type": "application/json"
        };
        if (headers !== null || headers !== undefined) {
            temp = headers;
        }
        Util.httpRequest({
            method: "POST",
            url: url,
            headers: temp,
            data: JSON.stringify(data),
            onload: resolve,
            onerror: reject
        });
    },
    post(url, data, headers) {
        return new Promise((resolve, reject) => {
            this._post(url, data, headers, (res) => {
                resolve(this._toData(res));
            }, (error) => {
                reject(error);
            });
        });
    },
    /**
     * 封装好的底层get请求
     */
    get(url) {
        return new Promise((resolve, reject) => {
            this.httpRequest("get", url, {
                "User-Agent": navigator.userAgent,
            }, (res) => {
                resolve(this._toData(res))
            }, (error) => {
                reject(reject(error))
            });
        });
    },
    //私有的，不应该外部访问到，调整相应结果中的res数据
    _toData(res) {
        const data = {
            body: res.responseText,
            res: res,
            status: res.status,
            responseType: res["RESPONSE_TYPE_JSON"],
            bodyJson: null,
            message: ""
        };
        try {
            if (data.responseType === "json") {
                data.bodyJson = JSON.parse(res.responseText);
            }
        } catch (e) {
            data.error = e;
            data.bodyJson = null;
            data.message = "检测到responseType是json,但转换json失败了";
            console.error(data);
        }
        return data;
    },
    /**
     *携带cookioie发起get请求
     * @param url
     * @param {string}cookie
     */
    getCookie(url, cookie) {
        return new Promise((resolve, reject) => {
            this.httpRequest("get", url, {
                "User-Agent": navigator.userAgent,
                "cookie": cookie
            }, (res => {
                resolve(this._toData(res));
            }), (error) => {
                reject(error);
            });
        });
    },
    /**
     * 发送请求获取视频的基本信息
     * @param {string|number}bvOrAv
     */
    getVideoInfo(bvOrAv) {
        let url = "https://api.bilibili.com/x/player/pagelist?";
        if (bvOrAv + "".startsWith("BV")) {
            url = url + "bvid=" + bvOrAv;//需要带上BV号
        } else {
            url = url + "aid=" + bvOrAv;//不需要带上AV号
        }
        return this.get(url);
    },
    /**
     * 发送请求获取直播间基本信息
     * @param id 直播间房间号
     */
    getLiveInfo(id) {
        return this.get("https://api.live.bilibili.com/room/v1/Room/get_info?room_id=" + id);
    },
    /**
     * 获取用户关注的用户直播列表
     * @param cookie
     * @param page 页数，每页最多29个
     */
    getUsersFollowTheLiveList(cookie, page) {
        return this.getCookie(`https://api.live.bilibili.com/xlive/web-ucenter/user/following?page=${page}&page_size=29`, cookie);
    },
    /**
     * 获取指定分区下的用户直播列表
     * @param parent_id 父级分区
     * @param id 子级分区
     * @param page 页数
     * @param sort 排序-如综合或者最新，最新live_time 为空着综合
     */
    getLiveList(parent_id, id, page, sort) {
        //https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=3&area_id=0&sort_type=sort_type_121&page=3
        return this.get(`https://api.live.bilibili.com/xlive/web-interface/v1/second/getList?platform=web&parent_area_id=${parent_id}&area_id=${id}&sort_type=${sort}&page=${page}`);
    },
    //获取指定用户创建的所有收藏夹信息
    //使用教程<a href="https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/fav/info.md">地址</a>
    getUSerAllFavInfo(uid) {
        return this.get(`https://api.bilibili.com/x/v3/fav/folder/created/list-all?up_mid=${uid}`);
    },
    /**
     * 获取我的所有表情包
     * api:<a href="https://github.com/SocialSisterYi/bilibili-API-collect/blob/master/docs/emoji/list.md">地址</a>
     * @param {string}business 场景 reply：评论区 dynamic：动态
     */
    getEmoJiList(business) {
        return this.get(`https://api.bilibili.com/x/emote/setting/panel?business=${business}`);
    },
    /**
     * 获取稍后再看列表
     * @param {string}SESSDATA
     */
    getLookAtItLater(SESSDATA) {
        return this.getCookie("https://api.bilibili.com/x/v2/history/toview", SESSDATA);
    }
};
