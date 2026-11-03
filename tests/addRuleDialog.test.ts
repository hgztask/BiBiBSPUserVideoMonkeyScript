import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {defineComponent} from "vue";
import {flushPromises, mount, type VueWrapper} from "@vue/test-utils";
import AddRuleDialog from "../src/web/ui/components/addRuleDialog.vue";
import {rememberTypes} from "../src/web/core/util/multiTypeRuleMemory.ts";

vi.mock("element-plus", () => ({
    ElMessage: {
        success: vi.fn(),
        error: vi.fn(),
        warning: vi.fn(),
        info: vi.fn()
    },
    ElMessageBox: {
        alert: vi.fn(() => Promise.resolve()),
        confirm: vi.fn(() => Promise.resolve())
    }
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
};

const ElDialogStub = defineComponent({
    props: ["modelValue", "width"],
    emits: ["update:modelValue", "close"],
    template: "<div v-if=\"modelValue\"><slot name=\"header\"/><slot/><slot name=\"footer\"/></div>"
});

const ElCardStub = defineComponent({
    template: "<div><slot name=\"header\"/><slot/></div>"
});

const ElFormStub = defineComponent({
    template: "<form><slot/></form>"
});

const ElFormItemStub = defineComponent({
    props: ["label"],
    template: "<div><span v-if=\"label\">{{ label }}</span><slot/></div>"
});

const ElInputStub = defineComponent({
    props: {modelValue: {type: [String, Number], default: ""}, type: {type: String, default: "text"}},
    emits: ["update:modelValue"],
    template: `
        <textarea v-if="type === 'textarea'" :value="modelValue"
                  @input="$emit('update:modelValue', $event.target.value)"></textarea>
        <input v-else :value="modelValue"
               @input="$emit('update:modelValue', $event.target.value)">
    `
});

const ElButtonStub = defineComponent({
    props: {disabled: Boolean, loading: Boolean, link: Boolean, type: String, size: String},
    emits: ["click"],
    template: "<button :disabled=\"disabled\" @click=\"$emit('click')\"><slot/></button>"
});

const ElSwitchStub = defineComponent({
    props: ["modelValue", "activeText"],
    template: "<span>{{ activeText }}</span>"
});

const ElTagStub = defineComponent({
    props: ["type", "size", "effect"],
    template: "<span><slot/></span>"
});

const ElScrollbarStub = defineComponent({
    props: ["maxHeight"],
    template: "<div><slot/></div>"
});

const ElCheckboxGroupStub = defineComponent({
    props: ["modelValue"],
    template: "<div><slot/></div>"
});

const ElCheckboxStub = defineComponent({
    props: ["value"],
    template: "<label><slot/></label>"
});

const stubs = {
    "el-dialog": ElDialogStub,
    "el-card": ElCardStub,
    "el-form": ElFormStub,
    "el-form-item": ElFormItemStub,
    "el-input": ElInputStub,
    "el-button": ElButtonStub,
    "el-switch": ElSwitchStub,
    "el-tag": ElTagStub,
    "el-scrollbar": ElScrollbarStub,
    "el-checkbox-group": ElCheckboxGroupStub,
    "el-checkbox": ElCheckboxStub
};

describe("批量规则对话框", () => {
    let wrapper: VueWrapper;

    beforeEach(() => {
        gmStore.clear();
        stubGmGlobals();
    });

    afterEach(() => {
        wrapper?.unmount();
        vi.unstubAllGlobals();
        vi.clearAllMocks();
    });

    it("带出上次选择的多个类型，并按数字/文本分别写入", async () => {
        rememberTypes("精确匹配", ["precise_uid", "precise_name"]);

        wrapper = mount(AddRuleDialog, {
            props: {
                modelValue: true,
                ruleInfo: {type: "precise_uid", name: "用户uid(精确匹配)", mode: "精确匹配"},
                operation: "add"
            },
            global: {stubs}
        });
        await flushPromises();

        expect(wrapper.text()).toContain("已选 2 / 14");
        expect(wrapper.text()).toContain("用户uid");
        expect(wrapper.text()).toContain("用户名");

        await wrapper.find("textarea").setValue("12345");
        expect(wrapper.text()).toContain("将向 2 个类型各添加 1 个值");

        const addButton = wrapper.findAll("button").find(button => button.text().includes("添加 2 项"));
        expect(addButton).toBeTruthy();
        await addButton!.trigger("click");
        await flushPromises();

        expect(gmStore.get("precise_uid")).toEqual([12345]);
        expect(gmStore.get("precise_name")).toEqual(["12345"]);
    });

    it("精确模式选中数字类型时，非整数整组禁用添加", async () => {
        rememberTypes("精确匹配", ["precise_uid", "precise_name"]);

        wrapper = mount(AddRuleDialog, {
            props: {
                modelValue: true,
                ruleInfo: {type: "precise_uid", name: "用户uid(精确匹配)", mode: "精确匹配"},
                operation: "add"
            },
            global: {stubs}
        });
        await flushPromises();

        await wrapper.find("textarea").setValue("原神");
        expect(wrapper.text()).toContain("整组必须是非负整数");
        const addButton = wrapper.findAll("button").find(button => button.text().includes("添加 2 项"));
        expect(addButton?.attributes("disabled")).toBeDefined();
    });
});
