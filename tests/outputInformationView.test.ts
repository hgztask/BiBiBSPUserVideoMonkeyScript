import {afterEach, describe, expect, it, vi} from "vitest";
import {shallowMount, type VueWrapper} from "@vue/test-utils";
import {defineComponent} from "vue";
import OutputInformationView from "../src/web/ui/views/debug/outputInformationView.vue";
import {eventEmitter} from "../src/web/core/EventEmitter.ts";

vi.mock("element-plus", () => ({
  ElMessage: {success: vi.fn(), error: vi.fn()},
  ElMessageBox: {confirm: vi.fn(() => Promise.resolve())},
  ElNotification: vi.fn()
}));

describe("输出信息屏蔽记录", () => {
  let wrapper: VueWrapper;

  afterEach(() => {
    wrapper?.unmount();
  });

  it("展示响应层分类、原文菜单并合并重复记录", async () => {
    wrapper = shallowMount(OutputInformationView, {
      global: {
        stubs: {
          "el-select": true,
          "el-option": true,
          "el-input": true,
          "el-button": true,
          "el-tag": defineComponent({template: "<span><slot/></span>"}),
          "el-dropdown": defineComponent({template: "<div><slot/><slot name=\"dropdown\"/></div>"}),
          "el-dropdown-menu": defineComponent({template: "<div><slot/></div>"}),
          "el-dropdown-item": defineComponent({template: "<button><slot/></button>"}),
          "el-dialog": true
        }
      }
    });
    const event = {
      source: "响应层过滤" as const,
      sourceLabel: "评论响应",
      ruleType: "正则评论",
      matching: "玩.*的",
      objectType: "评论" as const,
      data: {name: "用户", uid: 2447278, content: "完整评论"},
      original: {rpid: 1, content: {message: "完整评论"}}
    };
    eventEmitter.send("屏蔽日志", event);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("响应层过滤");
    expect(wrapper.text()).toContain("查看原文");
    expect(wrapper.text()).toContain("首次：");

    eventEmitter.send("屏蔽日志", event);
    await wrapper.vm.$nextTick();
    expect(wrapper.text()).toContain("×2");
    expect(wrapper.text()).toContain("更新：");
  });
});
