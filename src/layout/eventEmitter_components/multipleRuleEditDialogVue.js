import {eventEmitter} from "../../model/EventEmitter.js";
import ruleKeyListData from "../../data/ruleKeyListData.js";
import arrUtil from "../../utils/arrUtil.js";

/**
 * 多重规则编辑对话框
 *
 *
 *
 * todo 待对接视频屏蔽，并且需要优化所有的验证函数，目前发现采用异步函数方式，根据返回的promise进行判断好点
 * @type {{}}
 */
export const multiple_rule_edit_dialog_vue = {
    template: `
      <div>
        <el-dialog :visible.sync="dialogVisible" title="多重规则"
                   :modal="false"
                   :close-on-click-modal="false" :close-on-press-escape="false">
          <el-tag>{{ typeMap.name }}</el-tag>
          <el-card>
            <template #header>说明</template>
            <div>1.组合类型每条项至少大于1</div>
            <div>2.不能添加空项</div>
            <div>3.每组中的项不能超过15个字符</div>
            <div>4.不能重复添加已有的组合</div>
            <div>5.每组不能添加过包括已有的组合</div>
            <div>6.不能添加视频tag(精确匹配)已有的项，如需要，请先移除对应的项！包括视频tag(模糊匹配)</div>
          </el-card>
          <el-card>
            <el-input
                class="input-new-tag"
                v-if="inputVisible"
                v-model="inputValue"
                ref="saveTagInput"
                size="small"
                placeholder="多个项时请用英文符号分割"
                @keyup.enter.native="handleInputConfirm"
                @blur="handleInputConfirm"
            >
            </el-input>
            <el-button v-else class="button-new-tag" size="small" @click="showInput">+ New Tag</el-button>
            <el-tag closable v-for="(item,index) in showTags" @close="handleTagClose(item,index)">{{ item|filterTag }}
            </el-tag>
          </el-card>
        </el-dialog>
      </div>`,
    data() {
        return {
            dialogVisible: false,
            inputVisible: false,
            inputValue: '',
            //最小项
            min: 2,
            typeMap: {},
            showTags: [],
        }
    },
    methods: {
        updateShowTags() {
            this.showTags = ruleKeyListData.getVideoTagPreciseCombination();
        },
        handleTagClose(tag, index) {
            if (tag === '') return;
            this.$confirm(`确定要删除 ${tag} 吗？`, '提示', {
                confirmButtonText: '确定',
                cancelButtonText: '取消',
                type: 'warning'
            }).then(() => {
                this.showTags.splice(index, 1)
                ruleKeyListData.setVideoTagPreciseCombination(this.showTags)
                this.$message.success(`已移除 ${tag}`)
                eventEmitter.send('刷新规则信息', false)
            })
        },
        showInput() {
            this.inputVisible = true;
            this.$nextTick(_ => {
                this.$refs.saveTagInput.$refs.input.focus();
            });
        },
        handleInputConfirm() {
            let inputValue = this.inputValue;
            this.inputVisible = false;
            if (inputValue === '') return;
            this.submitBut(inputValue);
            this.inputValue = '';
        },
        submitBut(inputValue) {
            const split = inputValue.split(',');
            if (split.length < this.min) {
                this.$message.error('最少添加' + this.min + '项')
                return;
            }
            const preciseVideoTagArr = ruleKeyListData.getPreciseVideoTagArr();
            const videoTagArr = ruleKeyListData.getVideoTagArr();
            for (let showTag of split) {
                showTag = showTag.trim()
                if (showTag === "") {
                    this.$message.error('不能添加空项')
                    return;
                }
                if (preciseVideoTagArr.includes(showTag)) {
                    this.$message.error('不能添加视频tag(精确匹配)已有的项，请先移除对应的项！')
                    return;
                }
                if (videoTagArr.includes(showTag)) {
                    this.$message.error('不能添加视频tag(模糊匹配)已有的项，请先移除对应的项！')
                    return;
                }
                if (showTag.length > 15) {
                    this.$message.error('项不能超过15个字符')
                    return;
                }
            }
            const arr = ruleKeyListData.getVideoTagPreciseCombination();
            for (let mk_arr of arr) {
                if (arrUtil.arraysLooseEqual(mk_arr, split)) {
                    this.$message.error('不能重复添加已有的组合！')
                    return
                }
                if (arrUtil.arrayContains(mk_arr, split)) {
                    this.$message.error('该组合已添加过或包括该组合')
                    return
                }
            }
            arr.push(split)
            ruleKeyListData.setVideoTagPreciseCombination(arr)
            console.log(this.typeMap, split, arr)
            this.$message.success(`${this.typeMap.name}添加成功`)
            this.updateShowTags();
            eventEmitter.send('刷新规则信息', false)
        }
    },
    created() {
        eventEmitter.on('打开多重规则编辑对话框', (typeMap) => {
            this.typeMap = typeMap;
            this.dialogVisible = true;
            this.updateShowTags()
        })
    },
    filters: {
        /**
         *将数组转换成字符串并用,连接
         * @param tag {Array}
         * @returns {string}
         */
        filterTag(tag) {
            return tag.join('||')
        }
    }
}
