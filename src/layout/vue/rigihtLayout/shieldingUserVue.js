import elUtil from "../../../utils/elUtil.js";
import space from "../../../pagesModel/space/space.js";
import ruleKeyListData from "../../../data/ruleKeyListData.js";
import ruleUtil from "../../../utils/ruleUtil.js";
import videoPlayModel from "../../../pagesModel/videoPlay/videoPlayModel.js";

//个人空间页面右侧屏蔽按钮组件
export const shielding_user_vue = {
    template: `
      <div>
      <el-dropdown v-if="shieldingModelShow"
                   @command="dropdownEvent">
        <el-button round>
          屏蔽操作<i class="el-icon-arrow-down el-icon--right"></i>
        </el-button>
        <el-dropdown-menu v-slot="dropdown">
          <el-dropdown-item command="屏蔽uid"
                            v-if="shieldingUseUIDrButShow">屏蔽(uid)
          </el-dropdown-item>
          <el-dropdown-item command="移除屏蔽uid"
                            v-if="removedShieldingUIDrButShow">移除屏蔽(uid)
          </el-dropdown-item>
          <el-dropdown-item command="选择用户屏蔽" v-if="selectUserBlockingButShow">选择用户屏蔽</el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      </div>`,
    data() {
        return {
            shieldingModelShow: true,
            shieldingUseUIDrButShow: false,
            removedShieldingUIDrButShow: false,
            selectUserBlockingButShow: false,
            uid: -1
        }
    },
    methods: {
        async dropdownEvent(item) {
            if (item === '屏蔽uid') {
                const {name, uid} = await space.getUserInfo()
                this.$confirm(`是否屏蔽当前用户【${name}】uid=【${uid}】`, '提示', {
                    confirmButtonText: '确定',
                    cancelButtonText: '取消',
                    type: 'warning'
                }).then(() => {
                    const {status, res} = ruleUtil.addRulePreciseUid(uid, false);
                    this.$alert(res)
                    if (status) {
                        // 屏蔽成功后隐藏屏蔽按钮并显示取消屏蔽按钮
                        this.shieldingUseUIDrButShow = false
                        this.removedShieldingUIDrButShow = true
                    }
                })
                return
            }
            if (item === '移除屏蔽uid') {
                const {uid} = await space.getUserInfo()
                ruleUtil.delRUlePreciseUid(uid)
                return
            }
            if (item === '选择用户屏蔽') {
                await videoPlayModel.selectUserBlocking()
                return
            }
            this.$message('未知选项')
        }
    },
    async created() {
        if (videoPlayModel.isVideoPlayPage()) {
            this.selectUserBlockingButShow = true
        }
        if (space.isSpacePage()) {
            this.urlUID = elUtil.getUrlUID(window.location.href);
            if (ruleKeyListData.getPreciseUidArr().includes(this.urlUID)) {
                this.shieldingModelShow = true
                this.removedShieldingUIDrButShow = true
                await this.$alert('当前用户为已标记uid黑名单', '提示');
                return;
            }
            if (await space.isPersonalHomepage()) {
                this.shieldingModelShow = false
                return;
            }
            this.shieldingModelShow = true
            this.shieldingUseUIDrButShow = true
        }
    }
}
