//TODO 直播列表待开发
const LiveLayoutVue = {
    listOfFollowers: [],
    otherLiveRoomList: [],
    returnVue() {
        const vue = new Vue({
            el: "#liveLayout",
            data: {
                //关注列表
                listOfFollowers: [],
                loadFollowButText: "加载列表",
                isLoadFollowLstDisabled: false,
                findFollowListRoomKey: "",
                hRecoveryListOfFollowersIf: false,
                siftTypeSelect: "upName",
                siftTypeList: ["upName", "uid", "title", "roomId"],
                //其他分区直播列表
                otherLiveRoomList: [],
                mainPartitionSelect: "手游",
                partitionObjList: JSON.parse(`{"手游":[{"parent_name":"手游","parent_id":3,"name":"全部","id":0},{"parent_name":"手游","parent_id":3,"name":"原神","id":321},{"parent_name":"手游","parent_id":3,"name":"欢乐斗地主","id":719},{"parent_name":"手游","parent_id":3,"name":"DNF手游","id":343},{"parent_name":"手游","parent_id":3,"name":"新游评测","id":274},{"parent_name":"手游","parent_id":3,"name":"黎明觉醒：生机","id":479},{"parent_name":"手游","parent_id":3,"name":"宝可梦大集结","id":493},{"parent_name":"手游","parent_id":3,"name":"幻塔","id":550},{"parent_name":"手游","parent_id":3,"name":"三国志战棋版","id":756},{"parent_name":"手游","parent_id":3,"name":"明日之后","id":189},{"parent_name":"手游","parent_id":3,"name":"百闻牌","id":286},{"parent_name":"手游","parent_id":3,"name":"阴阳师","id":36},{"parent_name":"手游","parent_id":3,"name":"第五人格","id":163},{"parent_name":"手游","parent_id":3,"name":"战双帕弥什","id":293},{"parent_name":"手游","parent_id":3,"name":"FIFA足球世界","id":641},{"parent_name":"手游","parent_id":3,"name":"跃迁旅人","id":717},{"parent_name":"手游","parent_id":3,"name":"空之要塞：启航","id":718},{"parent_name":"手游","parent_id":3,"name":"火影忍者手游","id":292},{"parent_name":"手游","parent_id":3,"name":"Fate/GO","id":37},{"parent_name":"手游","parent_id":3,"name":"CF手游","id":333},{"parent_name":"手游","parent_id":3,"name":"游戏王","id":303},{"parent_name":"手游","parent_id":3,"name":"重返未来：1999 ","id":761},{"parent_name":"手游","parent_id":3,"name":"哈利波特：魔法觉醒 ","id":474},{"parent_name":"手游","parent_id":3,"name":"玛娜希斯回响","id":644},{"parent_name":"手游","parent_id":3,"name":" 东方归言录","id":538},{"parent_name":"手游","parent_id":3,"name":"无期迷途","id":675},{"parent_name":"手游","parent_id":3,"name":"光遇","id":687},{"parent_name":"手游","parent_id":3,"name":"少女前线：云图计划","id":525},{"parent_name":"手游","parent_id":3,"name":"黑色沙漠手游","id":615},{"parent_name":"手游","parent_id":3,"name":"雀姬","id":214},{"parent_name":"手游","parent_id":3,"name":"时空猎人3","id":643},{"parent_name":"手游","parent_id":3,"name":"明日方舟","id":255},{"parent_name":"手游","parent_id":3,"name":"猫咪公寓2","id":736},{"parent_name":"手游","parent_id":3,"name":"QQ飞车手游","id":154},{"parent_name":"手游","parent_id":3,"name":"古魂","id":759},{"parent_name":"手游","parent_id":3,"name":"航海王热血航线","id":504},{"parent_name":"手游","parent_id":3,"name":"和平精英","id":256},{"parent_name":"手游","parent_id":3,"name":"暗黑破坏神：不朽","id":492},{"parent_name":"手游","parent_id":3,"name":"蛋仔派对","id":571},{"parent_name":"手游","parent_id":3,"name":"JJ斗地主","id":724},{"parent_name":"手游","parent_id":3,"name":"香肠派对","id":689},{"parent_name":"手游","parent_id":3,"name":"跑跑卡丁车手游","id":265},{"parent_name":"手游","parent_id":3,"name":"梦幻模拟战","id":178},{"parent_name":"手游","parent_id":3,"name":"APEX手游","id":506},{"parent_name":"手游","parent_id":3,"name":"综合棋牌","id":354},{"parent_name":"手游","parent_id":3,"name":"以闪亮之名","id":755},{"parent_name":"手游","parent_id":3,"name":"恋爱养成游戏","id":576},{"parent_name":"手游","parent_id":3,"name":"漫威超级战争","id":478},{"parent_name":"手游","parent_id":3,"name":"暗区突围","id":502},{"parent_name":"手游","parent_id":3,"name":"狼人杀","id":41},{"parent_name":"手游","parent_id":3,"name":"盾之勇者成名录：浪潮","id":704},{"parent_name":"手游","parent_id":3,"name":"荒野乱斗","id":469},{"parent_name":"手游","parent_id":3,"name":"猫和老鼠手游","id":269},{"parent_name":"手游","parent_id":3,"name":"LOL手游","id":395},{"parent_name":"手游","parent_id":3,"name":"战火勋章","id":765},{"parent_name":"手游","parent_id":3,"name":"深空之眼","id":598},{"parent_name":"手游","parent_id":3,"name":"碧蓝航线","id":113},{"parent_name":"手游","parent_id":3,"name":"坎公骑冠剑","id":442},{"parent_name":"手游","parent_id":3,"name":"摩尔庄园手游","id":464},{"parent_name":"手游","parent_id":3,"name":"非人学园","id":212},{"parent_name":"手游","parent_id":3,"name":"崩坏3","id":40},{"parent_name":"手游","parent_id":3,"name":"天地劫：幽城再临","id":448},{"parent_name":"手游","parent_id":3,"name":"弹弹堂","id":734},{"parent_name":"手游","parent_id":3,"name":"300大作战","id":688},{"parent_name":"手游","parent_id":3,"name":"解密游戏","id":42},{"parent_name":"手游","parent_id":3,"name":"使命召唤手游","id":386},{"parent_name":"手游","parent_id":3,"name":"猫之城","id":645},{"parent_name":"手游","parent_id":3,"name":"长安幻想","id":738},{"parent_name":"手游","parent_id":3,"name":"少女前线","id":39},{"parent_name":"手游","parent_id":3,"name":"游戏王：决斗链接","id":407},{"parent_name":"手游","parent_id":3,"name":"梦幻西游手游","id":342},{"parent_name":"手游","parent_id":3,"name":"其他手游","id":98},{"parent_name":"手游","parent_id":3,"name":"决战！平安京","id":140},{"parent_name":"手游","parent_id":3,"name":"三国杀移动版","id":352},{"parent_name":"手游","parent_id":3,"name":"影之诗","id":156},{"parent_name":"手游","parent_id":3,"name":"公主连结Re:Dive","id":330},{"parent_name":"手游","parent_id":3,"name":"王者荣耀","id":35},{"parent_name":"手游","parent_id":3,"name":"忍者必须死3","id":203},{"parent_name":"手游","parent_id":3,"name":"BanG Dream","id":258},{"parent_name":"手游","parent_id":3,"name":"休闲小游戏","id":679},{"parent_name":"手游","parent_id":3,"name":"金铲铲之战","id":514},{"parent_name":"手游","parent_id":3,"name":"环形战争","id":725},{"parent_name":"手游","parent_id":3,"name":"天涯明月刀手游","id":389},{"parent_name":"手游","parent_id":3,"name":"漫威对决","id":511},{"parent_name":"手游","parent_id":3,"name":"奥比岛手游","id":661},{"parent_name":"手游","parent_id":3,"name":"奇点时代","id":762},{"parent_name":"手游","parent_id":3,"name":"部落冲突:皇室战争","id":50},{"parent_name":"手游","parent_id":3,"name":"重返帝国","id":613},{"parent_name":"手游","parent_id":3,"name":"小动物之星","id":473}],"赛事":[{"parent_name":"赛事","parent_id":13,"name":"全部","id":0},{"parent_name":"赛事","parent_id":13,"name":"体育赛事","id":562},{"parent_name":"赛事","parent_id":13,"name":"游戏赛事","id":561},{"parent_name":"赛事","parent_id":13,"name":"赛事综合","id":563}],"生活":[{"parent_name":"生活","parent_id":10,"name":"全部","id":0},{"parent_name":"生活","parent_id":10,"name":"手工绘画","id":627},{"parent_name":"生活","parent_id":10,"name":"时尚","id":378},{"parent_name":"生活","parent_id":10,"name":"影音馆","id":33},{"parent_name":"生活","parent_id":10,"name":"生活分享","id":646},{"parent_name":"生活","parent_id":10,"name":"萌宠","id":369},{"parent_name":"生活","parent_id":10,"name":"美食","id":367},{"parent_name":"生活","parent_id":10,"name":"搞笑","id":624},{"parent_name":"生活","parent_id":10,"name":"运动","id":628}],"娱乐":[{"parent_name":"娱乐","parent_id":1,"name":"全部","id":0},{"parent_name":"娱乐","parent_id":1,"name":"视频唱见","id":21},{"parent_name":"娱乐","parent_id":1,"name":"户外","id":123},{"parent_name":"娱乐","parent_id":1,"name":"萌宅领域","id":530},{"parent_name":"娱乐","parent_id":1,"name":"情感","id":706},{"parent_name":"娱乐","parent_id":1,"name":"视频聊天","id":145},{"parent_name":"娱乐","parent_id":1,"name":"日常","id":399},{"parent_name":"娱乐","parent_id":1,"name":"聊天室","id":740},{"parent_name":"娱乐","parent_id":1,"name":"舞见","id":207}],"电台":[{"parent_name":"电台","parent_id":5,"name":"全部","id":0},{"parent_name":"电台","parent_id":5,"name":"配音","id":193},{"parent_name":"电台","parent_id":5,"name":"唱见电台","id":190},{"parent_name":"电台","parent_id":5,"name":"聊天电台","id":192}],"网游":[{"parent_name":"网游","parent_id":2,"name":"全部","id":0},{"parent_name":"网游","parent_id":2,"name":"诛仙世界","id":654},{"parent_name":"网游","parent_id":2,"name":"街头篮球","id":649},{"parent_name":"网游","parent_id":2,"name":"洛克王国","id":669},{"parent_name":"网游","parent_id":2,"name":"剑灵","id":505},{"parent_name":"网游","parent_id":2,"name":"堡垒之夜","id":164},{"parent_name":"网游","parent_id":2,"name":"枪神纪","id":251},{"parent_name":"网游","parent_id":2,"name":"逃离塔科夫","id":252},{"parent_name":"网游","parent_id":2,"name":"吃鸡行动","id":80},{"parent_name":"网游","parent_id":2,"name":"坦克世界","id":115},{"parent_name":"网游","parent_id":2,"name":"VRChat","id":656},{"parent_name":"网游","parent_id":2,"name":"新游前瞻","id":298},{"parent_name":"网游","parent_id":2,"name":"星际战甲","id":249},{"parent_name":"网游","parent_id":2,"name":"战争雷霆","id":316},{"parent_name":"网游","parent_id":2,"name":"英雄联盟","id":86},{"parent_name":"网游","parent_id":2,"name":"超击突破","id":680},{"parent_name":"网游","parent_id":2,"name":"其他网游","id":107},{"parent_name":"网游","parent_id":2,"name":"创世战车","id":705},{"parent_name":"网游","parent_id":2,"name":"最终幻想14","id":102},{"parent_name":"网游","parent_id":2,"name":"跑跑卡丁车","id":664},{"parent_name":"网游","parent_id":2,"name":"梦三国","id":710},{"parent_name":"网游","parent_id":2,"name":"古剑奇谭OL","id":173},{"parent_name":"网游","parent_id":2,"name":"永恒轮回","id":459},{"parent_name":"网游","parent_id":2,"name":"激战2","id":607},{"parent_name":"网游","parent_id":2,"name":"奇迹MU","id":683},{"parent_name":"网游","parent_id":2,"name":"怀旧网游","id":288},{"parent_name":"网游","parent_id":2,"name":"APEX英雄","id":240},{"parent_name":"网游","parent_id":2,"name":"FIFA ONLINE 4","id":388},{"parent_name":"网游","parent_id":2,"name":"使命召唤:战区","id":318},{"parent_name":"网游","parent_id":2,"name":"反恐精英Online","id":629},{"parent_name":"网游","parent_id":2,"name":"阿尔比恩","id":639},{"parent_name":"网游","parent_id":2,"name":"星际争霸2","id":93},{"parent_name":"网游","parent_id":2,"name":"星际公民","id":658},{"parent_name":"网游","parent_id":2,"name":"CS:GO","id":89},{"parent_name":"网游","parent_id":2,"name":"天涯明月刀","id":596},{"parent_name":"网游","parent_id":2,"name":"炉石传说","id":91},{"parent_name":"网游","parent_id":2,"name":"生死狙击2","id":575},{"parent_name":"网游","parent_id":2,"name":"彩虹岛","id":686},{"parent_name":"网游","parent_id":2,"name":"武装突袭","id":634},{"parent_name":"网游","parent_id":2,"name":"魔兽争霸3","id":181},{"parent_name":"网游","parent_id":2,"name":"问道","id":670},{"parent_name":"网游","parent_id":2,"name":"剑网3","id":82},{"parent_name":"网游","parent_id":2,"name":"造梦西游","id":668},{"parent_name":"网游","parent_id":2,"name":"NBA2KOL2","id":581},{"parent_name":"网游","parent_id":2,"name":"星战前夜：晨曦","id":331},{"parent_name":"网游","parent_id":2,"name":"英魂之刃","id":690},{"parent_name":"网游","parent_id":2,"name":"永恒之塔","id":684},{"parent_name":"网游","parent_id":2,"name":"艾尔之光","id":651},{"parent_name":"网游","parent_id":2,"name":"大话西游","id":652},{"parent_name":"网游","parent_id":2,"name":"洛奇","id":663},{"parent_name":"网游","parent_id":2,"name":"风暴英雄","id":114},{"parent_name":"网游","parent_id":2,"name":"新天龙八部","id":653},{"parent_name":"网游","parent_id":2,"name":"骑士精神2","id":650},{"parent_name":"网游","parent_id":2,"name":"赛尔号","id":667},{"parent_name":"网游","parent_id":2,"name":"300英雄","id":84},{"parent_name":"网游","parent_id":2,"name":"封印者","id":300},{"parent_name":"网游","parent_id":2,"name":"新世界","id":544},{"parent_name":"网游","parent_id":2,"name":"战争与抉择","id":729},{"parent_name":"网游","parent_id":2,"name":"人间地狱","id":677},{"parent_name":"网游","parent_id":2,"name":"剑网3缘起","id":499},{"parent_name":"网游","parent_id":2,"name":"魔兽世界","id":83},{"parent_name":"网游","parent_id":2,"name":"泡泡堂","id":737},{"parent_name":"网游","parent_id":2,"name":"战舰世界","id":248},{"parent_name":"网游","parent_id":2,"name":"Squad战术小队","id":659},{"parent_name":"网游","parent_id":2,"name":"逆战","id":487},{"parent_name":"网游","parent_id":2,"name":"QQ飞车","id":610},{"parent_name":"网游","parent_id":2,"name":"穿越火线","id":88},{"parent_name":"网游","parent_id":2,"name":"洛奇英雄传","id":599},{"parent_name":"网游","parent_id":2,"name":"超激斗梦境","id":519},{"parent_name":"网游","parent_id":2,"name":"龙之谷","id":112},{"parent_name":"网游","parent_id":2,"name":"无畏契约","id":329},{"parent_name":"网游","parent_id":2,"name":"传奇","id":695},{"parent_name":"网游","parent_id":2,"name":"冒险岛","id":574},{"parent_name":"网游","parent_id":2,"name":"猎杀对决","id":600},{"parent_name":"网游","parent_id":2,"name":"流放之路","id":551},{"parent_name":"网游","parent_id":2,"name":"命运方舟","id":590},{"parent_name":"网游","parent_id":2,"name":"综合射击","id":601},{"parent_name":"网游","parent_id":2,"name":"黑色沙漠","id":632},{"parent_name":"网游","parent_id":2,"name":"刀塔自走棋","id":239},{"parent_name":"网游","parent_id":2,"name":"DNF","id":78},{"parent_name":"网游","parent_id":2,"name":"战意","id":383},{"parent_name":"网游","parent_id":2,"name":"守望先锋","id":87},{"parent_name":"网游","parent_id":2,"name":"DOTA2","id":92},{"parent_name":"网游","parent_id":2,"name":"FPS沙盒","id":633},{"parent_name":"网游","parent_id":2,"name":"风暴奇侠","id":648},{"parent_name":"网游","parent_id":2,"name":"幻想全明星","id":176},{"parent_name":"网游","parent_id":2,"name":"铁甲雄兵","id":691},{"parent_name":"网游","parent_id":2,"name":"三国杀","id":81},{"parent_name":"网游","parent_id":2,"name":"永劫无间","id":666},{"parent_name":"网游","parent_id":2,"name":"CFHD ","id":472},{"parent_name":"网游","parent_id":2,"name":"QQ三国","id":685},{"parent_name":"网游","parent_id":2,"name":"装甲战争","id":642}],"虚拟主播":[{"parent_name":"虚拟主播","parent_id":9,"name":"全部","id":0},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Singer","id":744},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟Gamer","id":745},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟声优","id":746},{"parent_name":"虚拟主播","parent_id":9,"name":"TopStar","id":743},{"parent_name":"虚拟主播","parent_id":9,"name":"虚拟日常","id":371}],"单机游戏":[{"parent_name":"单机游戏","parent_id":6,"name":"全部","id":0},{"parent_name":"单机游戏","parent_id":6,"name":"原子之心","id":750},{"parent_name":"单机游戏","parent_id":6,"name":"以撒","id":219},{"parent_name":"单机游戏","parent_id":6,"name":"荒野大镖客2","id":226},{"parent_name":"单机游戏","parent_id":6,"name":"双人成行","id":446},{"parent_name":"单机游戏","parent_id":6,"name":"刺客信条","id":227},{"parent_name":"单机游戏","parent_id":6,"name":"霍格沃茨之遗","id":747},{"parent_name":"单机游戏","parent_id":6,"name":"狂野之心","id":748},{"parent_name":"单机游戏","parent_id":6,"name":"独立游戏","id":283},{"parent_name":"单机游戏","parent_id":6,"name":"怀旧游戏","id":237},{"parent_name":"单机游戏","parent_id":6,"name":"格斗游戏","id":433},{"parent_name":"单机游戏","parent_id":6,"name":"胡闹厨房","id":507},{"parent_name":"单机游戏","parent_id":6,"name":"怪物猎人","id":578},{"parent_name":"单机游戏","parent_id":6,"name":"重生细胞","id":426},{"parent_name":"单机游戏","parent_id":6,"name":"盗贼之海","id":341},{"parent_name":"单机游戏","parent_id":6,"name":"暖雪","id":582},{"parent_name":"单机游戏","parent_id":6,"name":"NBA2K","id":362},{"parent_name":"单机游戏","parent_id":6,"name":"消逝的光芒2","id":586},{"parent_name":"单机游戏","parent_id":6,"name":"恋爱模拟游戏","id":592},{"parent_name":"单机游戏","parent_id":6,"name":"饥荒","id":218},{"parent_name":"单机游戏","parent_id":6,"name":"策略游戏","id":570},{"parent_name":"单机游戏","parent_id":6,"name":"卧龙：苍天陨落","id":700},{"parent_name":"单机游戏","parent_id":6,"name":"全面坦克战略官","id":758},{"parent_name":"单机游戏","parent_id":6,"name":"弹幕互动玩法","id":460},{"parent_name":"单机游戏","parent_id":6,"name":"暗黑破坏神","id":535},{"parent_name":"单机游戏","parent_id":6,"name":"全境封锁2","id":243},{"parent_name":"单机游戏","parent_id":6,"name":"禁闭求生","id":707},{"parent_name":"单机游戏","parent_id":6,"name":"帝国时代4","id":548},{"parent_name":"单机游戏","parent_id":6,"name":"边境","id":763},{"parent_name":"单机游戏","parent_id":6,"name":"战神","id":579},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争：战锤3","id":594},{"parent_name":"单机游戏","parent_id":6,"name":"无主之地3","id":273},{"parent_name":"单机游戏","parent_id":6,"name":"辐射76","id":220},{"parent_name":"单机游戏","parent_id":6,"name":"红色警戒2","id":693},{"parent_name":"单机游戏","parent_id":6,"name":"不羁联盟","id":764},{"parent_name":"单机游戏","parent_id":6,"name":"糖豆人","id":357},{"parent_name":"单机游戏","parent_id":6,"name":"霓虹序列","id":766},{"parent_name":"单机游戏","parent_id":6,"name":"战锤40K:暗潮","id":723},{"parent_name":"单机游戏","parent_id":6,"name":"Dread Hunger","id":591},{"parent_name":"单机游戏","parent_id":6,"name":"森林之子","id":751},{"parent_name":"单机游戏","parent_id":6,"name":"聚会游戏","id":636},{"parent_name":"单机游戏","parent_id":6,"name":"生化危机","id":721},{"parent_name":"单机游戏","parent_id":6,"name":"方舟","id":295},{"parent_name":"单机游戏","parent_id":6,"name":"艾尔登法环","id":555},{"parent_name":"单机游戏","parent_id":6,"name":"歧路旅人2","id":752},{"parent_name":"单机游戏","parent_id":6,"name":"Roblox","id":753},{"parent_name":"单机游戏","parent_id":6,"name":"只狼","id":245},{"parent_name":"单机游戏","parent_id":6,"name":"风帆纪元","id":739},{"parent_name":"单机游戏","parent_id":6,"name":"其他单机","id":235},{"parent_name":"单机游戏","parent_id":6,"name":"游戏速通","id":678},{"parent_name":"单机游戏","parent_id":6,"name":"恐怖游戏","id":276},{"parent_name":"单机游戏","parent_id":6,"name":"恐鬼症","id":387},{"parent_name":"单机游戏","parent_id":6,"name":"使命召唤19","id":282},{"parent_name":"单机游戏","parent_id":6,"name":"我的世界","id":216},{"parent_name":"单机游戏","parent_id":6,"name":"仁王2","id":313},{"parent_name":"单机游戏","parent_id":6,"name":"THE FINALS","id":754},{"parent_name":"单机游戏","parent_id":6,"name":"FORZA 极限竞速","id":302},{"parent_name":"单机游戏","parent_id":6,"name":"全面战争","id":257},{"parent_name":"单机游戏","parent_id":6,"name":"塞尔达传说","id":308},{"parent_name":"单机游戏","parent_id":6,"name":"鬼泣5","id":244},{"parent_name":"单机游戏","parent_id":6,"name":"法外枭雄:滚石城","id":757},{"parent_name":"单机游戏","parent_id":6,"name":"SIFU","id":587},{"parent_name":"单机游戏","parent_id":6,"name":"FIFA23","id":708},{"parent_name":"单机游戏","parent_id":6,"name":"命运2","id":277},{"parent_name":"单机游戏","parent_id":6,"name":"精灵宝可梦","id":228},{"parent_name":"单机游戏","parent_id":6,"name":"文字游戏","id":583},{"parent_name":"单机游戏","parent_id":6,"name":"主机游戏","id":236},{"parent_name":"单机游戏","parent_id":6,"name":"植物大战僵尸","id":309},{"parent_name":"单机游戏","parent_id":6,"name":"人类一败涂地","id":270},{"parent_name":"单机游戏","parent_id":6,"name":"战地风云","id":597},{"parent_name":"单机游戏","parent_id":6,"name":"骑马与砍杀","id":326},{"parent_name":"单机游戏","parent_id":6,"name":"泰拉瑞亚","id":593},{"parent_name":"单机游戏","parent_id":6,"name":"体育游戏","id":500},{"parent_name":"单机游戏","parent_id":6,"name":"宝可梦集换式卡牌游戏","id":720},{"parent_name":"单机游戏","parent_id":6,"name":"斯普拉遁3","id":694},{"parent_name":"单机游戏","parent_id":6,"name":"枪火重生","id":364}],"知识":[{"parent_name":"知识","parent_id":11,"name":"全部","id":0},{"parent_name":"知识","parent_id":11,"name":"科学科普","id":701},{"parent_name":"知识","parent_id":11,"name":"社科法律心理","id":376},{"parent_name":"知识","parent_id":11,"name":"职场·技能","id":377},{"parent_name":"知识","parent_id":11,"name":"科技","id":375},{"parent_name":"知识","parent_id":11,"name":"人文历史","id":702},{"parent_name":"知识","parent_id":11,"name":"校园学习","id":372}]}`),
                sPartitionSelectID: 0,
                sPartitionSelect: {},
                sPartitionObjList: [],//子分区
                partitionPage: 1,
                otherLoadMoreIf: false,//加载更多按钮销毁或显示
                loadedPartition: {},//用于记录上一次加载的直播列表数据
                findOtherListRoomKey: "",
                siftOtherLiveTypeSelect: "upName",
                siftOtherLiveTypeList: ["upName", "uid", "title", "roomId"],
                hRecoveryOtherLiveListIf: false,//恢复列表
            },
            methods: {
                getSPartitionSelect(id) {//通过id查找对应子分区列表中符合条件的项目
                    return this.sPartitionObjList.find(value => value.id === id);
                },
                loadFollowLst() {//加载关注列表中正在直播的用户列表api数据
                    const sessdata = LocalData.getSESSDATA();
                    if (sessdata === null) {
                        Qmsg.error("用户未配置sessdata！");
                        return;
                    }
                    Qmsg.success("用户配置了sessdata");
                    this.isLoadFollowLstDisabled = true;
                    const promise = Live.loadAddAllFollowDataList(this.listOfFollowers, sessdata);
                    promise.then(() => {
                        LiveLayoutVue.listOfFollowers = this.listOfFollowers;
                        Qmsg.success(`已临时保存关注列表中正在直播的用户列表，可使用搜索对其进行筛选`);
                    }).finally(() => {
                        this.loadFollowButText = "重新加载";
                        this.isLoadFollowLstDisabled = false;
                    });
                },
                hRecoveryListOfFollowersBut() {
                    this.listOfFollowers = LiveLayoutVue.listOfFollowers;
                    Qmsg.success(`已恢复关注中正在直播的用户列表`);
                },
                //其他分区直播列表
                loadOtherPartitionLiveListBut() {//加载其他分区直播列表
                    const id = this.sPartitionSelectID;
                    const sPartition = this.getSPartitionSelect(id);
                    const parentId = sPartition["parent_id"];
                    if (!confirm(`是要加载${sPartition["parent_name"]} 的子分区 ${sPartition.name} 吗？`)) return;
                    const loading = Qmsg.loading(`正在获取中！`);
                    const promise = Live.getOthersAreWorkingLiveDataList(parentId, id);
                    promise.then(value => {
                        if (!value.partitionBool) {
                            this.otherLoadMoreIf = true;
                        }
                        this.partitionPage++;//默认第一次加载成功加1，为2
                        this.loadedPartition = sPartition;
                        const info = value["info"];
                        if (info) {
                            Qmsg.error(`info:${info}`);
                        }
                        const tempList = value.dataList;
                        this.otherLiveRoomList = tempList;//清空列表并赋予新表
                        LiveLayoutVue.otherLiveRoomList = tempList;
                        Qmsg.success(`获取成功！已获取到${tempList.length}个直播间`);
                    }).catch(reason => {
                        Qmsg.error(reason.errorText);
                        console.log(reason.err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                otherLoadMoreBut() {
                    const id = this.sPartitionSelectID;
                    const sPartition = this.getSPartitionSelect(id);
                    const parentId = sPartition["parent_id"];
                    const loading = Qmsg.loading(`正在获取更多！`);
                    const promise = Live.getOthersAreWorkingLiveDataList(parentId, id, this.partitionPage);
                    promise.then(value => {
                        if (value.partitionBool) {
                            this.otherLoadMoreIf = false;
                        }
                        this.partitionPage++;//下一轮之后的则是新的一页
                        const loadedPartition = this.loadedPartition;
                        if (!Util.objEquals(loadedPartition, sPartition, ["parent_name", "parent_id", "name", "id"])) {
                            this.otherLiveRoomList = [];//不相同时清空列表
                            LiveLayoutVue.otherLiveRoomList = [];
                        }
                        const info = value["info"];
                        if (info) {
                            Qmsg.error(`info:${info}`);
                        }
                        /**
                         * 当两者数组长度不相同说明otherLiveRoomList应该是用户搜索过后过滤显示的内容
                         * 此时加载更多需要将原先的数组内容补上并在后面合并
                         */
                        if (this.otherLiveRoomList.length !== LiveLayoutVue.otherLiveRoomList.length) {
                            this.otherLiveRoomList = LiveLayoutVue.otherLiveRoomList;
                        }
                        const dataList = value.dataList;
                        //这里合并新数组的内容
                        Util.mergeArrays(this.otherLiveRoomList, dataList);
                        LiveLayoutVue.otherLiveRoomList = this.otherLiveRoomList;
                        Qmsg.success(`获取成功！已获取到${dataList.length}个直播间，累计${this.otherLiveRoomList.length}个直播间`);
                    }).catch(reason => {
                        Qmsg.error(reason.errorText);
                        console.log(reason.err);
                    }).finally(() => {
                        loading.close();
                    });
                },
                hRecoveryOtherLiveRoomListBut() {
                    this.otherLiveRoomList = LiveLayoutVue.otherLiveRoomList;
                    Qmsg.success(`已恢复其他分区正在直播的列表`);
                },
                godchildPartitionsSpecifiedParentPartition(parentPartitionName, title) {//查找指定父分区的子分区
                    const list = this.partitionObjList[parentPartitionName];
                    for (let value of list) {
                        if (!value.name.includes(title)) {
                            continue;
                        }
                        return value;
                    }
                    return null;
                },
                findThisSubPartitionBut() {//查询当前父分区中指定的子分区
                    const parentName = this.mainPartitionSelect;
                    let input = prompt(`请输入您要查询父分区${parentName}的子分区名是什么(可模糊匹配，仅匹配第一个)`);
                    if (input === null) return;
                    input = input.trim();
                    if (input === "") {
                        Qmsg.error("请正确书写！");
                        return;
                    }
                    const subPartition = this.godchildPartitionsSpecifiedParentPartition(parentName, input);
                    if (subPartition === null) {
                        alert(`未在父分区${parentName}查询到子分区 ${input} ！`);
                        return;
                    }
                    this.sPartitionSelect = subPartition;
                    this.sPartitionSelectID = subPartition.id;
                    Qmsg.success(`已在父分区${parentName}查询到子分区${subPartition.name} ！`);
                },
                findSubPartitionBut() {
                    let input = prompt(`请输入您要查询的子分区名是什么(可模糊匹配，仅匹配第一个)`);
                    if (input === null) return;
                    input = input.trim();
                    if (input === "") {
                        Qmsg.error("请正确书写！");
                        return;
                    }
                    const objList = this.partitionObjList;
                    let obj = null;
                    for (const key in objList) {
                        const tempObj = this.godchildPartitionsSpecifiedParentPartition(key, input);
                        if (tempObj === null) continue;
                        obj = tempObj;
                        break;
                    }
                    if (obj === null) {
                        alert(`未查询到子分区 ${input} ！`);
                        return;
                    }
                    Qmsg.success(`已在父分区${obj["parent_name"]}查询到子分区${obj.name} ！`);
                    this.mainPartitionSelect = obj["parent_name"];
                    this.sPartitionSelect = obj;
                    //代码在延迟 50 毫秒后执行，为了确保在 Vue.js 的下一个渲染周期中更新这个数据属性的值。这样做是为了避免在同一个渲染周期中进行数据修改，以确保 Vue.js 的响应式系统能够正确地追踪数据的变化并更新视图。
                    setTimeout(() => this.sPartitionSelectID = obj.id, 50);
                },
                openPartitionWebAddressBut() {
                    const partition = this.sPartitionSelect;
                    if (!confirm(`是要打开${partition["parent_name"]} 的子分区 ${partition.name} 吗？`)) return;
                    Util.openWindow(`https://live.bilibili.com/p/eden/area-tags?areaId=${partition.id}&parentAreaId=${partition["parent_id"]}`);
                },
            },
            watch: {
                findFollowListRoomKey(newVal) {
                    if (newVal === "") return;
                    const tempList = [];
                    for (const v of LiveLayoutVue.listOfFollowers) {
                        if (!v[this.siftTypeSelect].toString().includes(newVal)) {
                            continue;
                        }
                        tempList.push(v);
                    }
                    const tempSize = tempList.length;
                    if (tempSize === 0) {
                        Qmsg.error(`未搜索到正在直播中用户名包含关键词 ${newVal} 的用户！`);
                        return;
                    }
                    this.listOfFollowers = tempList;
                    this.hRecoveryListOfFollowersIf = true;
                    Qmsg.success(`已搜索到${tempSize}个符合搜索关键词的项目！`);
                },
                mainPartitionSelect(newVal) {
                    this.sPartitionObjList = this.partitionObjList[newVal];
                    this.sPartitionSelect = this.sPartitionObjList[0];
                },
                sPartitionSelectID(newVal) {
                    this.sPartitionSelect = this.getSPartitionSelect(newVal);
                },
                findOtherListRoomKey(newVal) {
                    if (newVal === "") return;
                    const tempList = [];
                    for (const v of LiveLayoutVue.otherLiveRoomList) {
                        if (!v[this.siftOtherLiveTypeSelect].toString().includes(newVal)) {
                            continue;
                        }
                        tempList.push(v);
                    }
                    const tempSize = tempList.length;
                    if (tempSize === 0) {
                        Qmsg.error(`未搜索到正在直播中用户名包含关键词 ${newVal} 的用户！`);
                        return;
                    }
                    this.hRecoveryOtherLiveListIf = true;
                    this.otherLiveRoomList = tempList;
                    Qmsg.success(`已搜索到${tempSize}个符合搜索关键词的项目！`);
                }
            }
        });
        return function () {
            return vue;
        }
    }
}