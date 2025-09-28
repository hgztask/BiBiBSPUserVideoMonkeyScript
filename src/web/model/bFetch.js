import video_zoneData from "../data/video_zoneData.js";
import {eventEmitter} from "./EventEmitter.js";
import {bilibiliEncoder} from "./BilibiliEncoder.js";

/*const apiStyle = [
    {
        txt: '返回视频的所有标签及其基本属性，适合在需要显示标签列表的场景中使用',
        url: "https://api.bilibili.com/x/tag/archive/tags?bvid="
    },
    {
        txt: `参考脚本所使用的api获取视频tag
        返回视频的所有标签及其基本属性，还提供了标签的类型和跳转链接，适合在需要根据标签类型进行特殊处理或跳转的场景中使用`,
        url: 'https://api.bilibili.com/x/web-interface/view/detail/tag?bvid='
    },
]*/

// 请求获取弹幕屏蔽词
const fetchGetBarrageBlockingWords = () => {
    return new Promise((resolve, reject) => {
        fetch('https://api.bilibili.com/x/dm/filter/user', {
            credentials: 'include'
        })
            .then(response => response.json())
            .then(({code, data, message}) => {
                if (code !== 0) {
                    reject({state: false, msg: `请求相应内容失败：msg=${message} code=` + code})
                    return
                }
                /**
                 * type类型,0为文本，1为正则，2为屏蔽用户。
                 * 但是2的内容不是uid或者用户名，目前不清楚实际内容用途
                 */
                const {rule} = data
                const list = []
                for (let r of rule) {
                    const {type, filter, ctime} = r
                    if (type === 2) {
                        continue
                    }
                    list.push({type, filter, ctime})
                }
                resolve({state: true, data, list, msg: '获取成功'})
            })
    })
}

/**
 * 发起网络请求获取视频信息
 * 已测试data.View.is_view_self属性【是否为自己上传的视频】值对不上实际情况
 * @param bvId {string} bv号
 * @returns {Promise<{state: boolean,msg:string,data:{bv:string,name:string,title:string,tags:[string]}|any}>}
 */
const fetchGetVideoInfo = async (bvId) => {
    const response = await fetch(`https://api.bilibili.com/x/web-interface/view/detail?bvid=${bvId}`)
    if (response.status !== 200) {
        eventEmitter.send('请求获取视频信息失败', response, bvId)
        return {state: false, msg: '网络请求失败', data: response}
    }
    const {code, data, message} = await response.json();
    const defData = {state: false, msg: '默认失败信息'}
    if (code !== 0) {
        defData.msg = message
        return defData
    }
    defData.state = true
    defData.msg = '获取成功'
    const {
        View: {
            //合作成员列表，非合作视频没有此项
            staff,
            //子分区名称
            tname,
            //子分区名称-v2
            tname_v2,
            //视频简介
            desc,
            //发布时间
            pubdate,
            //用户投稿时间
            ctime,
            //版权类型转载还是原创
            copyright,
            //是否为充电专属
            is_upower_exclusive,
            //视频时长
            duration,
            //视频1P的分辨率
            dimension,
            //视频状态数
            stat: {
                //播放量
                view,
                //弹幕数
                danmaku,
                //评论数
                reply,
                // 收藏数
                favorite,
                // 投币数
                coin,
                //分享数
                share,
                //点赞数
                like
            },
        }, Card: {
            // 粉丝数
            follower,
            // 获赞数
            like_num,
            // 视频数量
            archive_count,
            //是否关注此用户
            following,
            // 专栏数量
            article_count, card: {
                //关注数
                friend,
                mid: uid,
                name,
                // 性别
                sex, level_info: {
                    //当前等级
                    current_level
                },
                //挂件信息对象
                pendant,
                //勋章信息对象
                nameplate,
                //认证信息对象
                Official,
                // 验证是否是有认证对象
                official_verify,
                //会员信息对象
                vip,
                // 用户签名
                sign,
                // 是否为硬核会员
                is_senior_member
            }
        }, Tags,
        //分词
        participle
    } = data

    //封装视频信息
    const videoInfo = {
        //合作成员列表，非合作视频没有此项
        staff,
        //子分区名称
        tname,
        //子分区名称-v2
        tname_v2,
        //视频简介
        desc,
        //发布时间
        pubdate,
        //用户投稿时间
        ctime,
        //版权类型转载还是原创
        copyright,
        //是否为充电专属
        is_upower_exclusive,
        //视频时长
        duration,
        //视频播放量
        view,
        //弹幕数
        danmaku,
        //评论数
        reply,
        //收藏数
        favorite,
        // 投币数
        coin,
        // 分享数
        share,
        //分词
        participle,
        dimension,
        like
    }

    //封装用户信息
    const userInfo = {
        // 粉丝数
        follower,
        // 关注数
        friend,
        // 获赞数
        like_num,
        // 视频数量
        archive_count,
        // 专栏数量
        article_count,
        // 认证信息对象
        Official,
        // 验证是否是有认证对象
        official_verify,
        //会员信息对象
        vip,
        // 获取用户信息
        uid: parseInt(uid),
        name,
        // 性别
        sex,
        // 当前用户b站等级
        current_level,
        //挂件信息对象
        pendant,
        nameplate,
        following,
        sign,
        is_senior_member
    }
    const tags = []
    for (let tag of Tags) {
        tags.push(tag['tag_name'])
    }
    //添加子分区名称，添加子分区名称-v2
    tags.unshift(tname, tname_v2)
    const findKey = video_zoneData.findKey(tname);
    if (findKey) {
        tags.unshift(findKey)
    }
    defData.data = {videoInfo, userInfo, tags}
    return defData
}

//获取视频评论框的配置数据
const fetchGetVideoReplyBoxDescription = async (bv) => {
    const avid = bilibiliEncoder.bv2av(bv);
    return new Promise((resolve, reject) => {
        fetch(`https://api.bilibili.com/x/v2/reply/subject/description?oid=${avid}&type=1`, {credentials: 'include'}
        ).then(response => response.json()).then(res => {
            try {
                const {data, code, message} = res;
                const {child_text, disabled = false} = data['base']['input'];
                if (code !== 0) {
                    reject({state: false, message})
                    return
                }
                resolve({state: true, message, childText: child_text, disabled})
            } catch (e) {
                reject({state: false, e})
            }
        }).catch(e => {
            reject({state: false, e})
        })
    })
}

export default {
    fetchGetVideoInfo,
    fetchGetBarrageBlockingWords
}
