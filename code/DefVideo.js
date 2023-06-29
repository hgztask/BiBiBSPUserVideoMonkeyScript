const DefVideo = {
    isCreativeTeam: function () {//判断是否是创作团队
        return document.querySelector(".header") !== null;
    },
    getCreativeTeam: function () {//获取创作团队
        const userList = [];
        if (this.isCreativeTeam()) {
            const list = document.querySelectorAll(".container .membersinfo-upcard-wrap .staff-name.is-vip");
            list.forEach(value => {
                const data = {};
                data["name"] = value.textContent.trim();
                const userAddress = value.getAttribute("href");
                data ["uid"] = parseInt(Util.getSubWebUrlUid(userAddress));
                data["e"] = value;
                userList.push(data);
            })
            return userList;
        }
        const userInfo = document.querySelector(".up-name");
        if (userInfo === null) {
            return userList;
        }
        const data = {};
        data["name"] = userInfo.textContent.trim();
        const userAddress = userInfo.getAttribute("href");
        data["uid"] = Util.getSubWebUrlUid(userAddress);
        data["e"] = userInfo;
        userList.push(data);
        return userList;
    }
}
