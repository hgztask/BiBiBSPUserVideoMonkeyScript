import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {shallowMount, type VueWrapper} from "@vue/test-utils";
import {defineComponent} from "vue";
import RemoteBackupView from "../src/web/ui/views/rule/remoteBackupView.vue";
import BackupPreviewDialog from "../src/web/ui/dialogs/backupPreviewDialog.vue";
import {eventEmitter} from "../src/web/core/EventEmitter.ts";

vi.mock("element-plus", () => ({
    ElMessage: {success: vi.fn(), error: vi.fn(), warning: vi.fn(), info: vi.fn()},
    ElMessageBox: {confirm: vi.fn(() => Promise.resolve()), alert: vi.fn(() => Promise.resolve())}
}));

const gmStore = new Map<string, unknown>();

const stubGmGlobals = (): void => {
    vi.stubGlobal("GM_getValue", (key: string, def: unknown) =>
        gmStore.has(key) ? gmStore.get(key) : def
    );
    vi.stubGlobal("GM_setValue", (key: string, value: unknown): void => {
        gmStore.set(key, value);
    });
    vi.stubGlobal("GM_deleteValue", (key: string): void => {
        gmStore.delete(key);
    });
    vi.stubGlobal("GM_info", {script: {version: "test-version"}});
};

beforeEach(() => {
    gmStore.clear();
    stubGmGlobals();
});

afterEach(() => {
    vi.unstubAllGlobals();
});

const slotStub = (tag: string) => defineComponent({
    template: `<${tag}><slot/><slot name="header"/><slot name="footer"/><slot name="title"/></${tag}>`
});

describe("远程备份UI", () => {
    let wrapper: VueWrapper;

    afterEach(() => {
        wrapper?.unmount();
    });

    it("渲染远程备份表单与同步状态", () => {
        wrapper = shallowMount(RemoteBackupView, {
            global: {
                stubs: {
                    "el-card": slotStub("div"),
                    "el-divider": true,
                    "el-select": true,
                    "el-option": true,
                    "el-input": true,
                    "el-button": true
                }
            }
        });
        expect(wrapper.text()).toContain("远程备份");
        expect(wrapper.text()).toContain("暂无同步记录");
        expect(wrapper.text()).toContain("WebDAV");
    });

    it("预览对话框展示导入差异统计", async () => {
        gmStore.set("name", ["本地规则"]);
        wrapper = shallowMount(BackupPreviewDialog, {
            global: {
                stubs: {
                    "el-dialog": slotStub("div"),
                    "el-table": true,
                    "el-table-column": true,
                    "el-tag": slotStub("span"),
                    "el-alert": slotStub("div"),
                    "el-button": slotStub("button")
                }
            }
        });
        eventEmitter.send("备份导入预览对话框", {
            rules: {name: ["本地规则", "远端规则"]},
            source: "备份格式 v1",
            unknownKeys: [{key: "isWsService", count: 1}]
        });
        await wrapper.vm.$nextTick();
        expect(wrapper.text()).toContain("合并新增 1 条");
        expect(wrapper.text()).toContain("isWsService");
        expect(wrapper.text()).toContain("覆盖导入");
        expect(wrapper.text()).toContain("合并导入");
    });
});
