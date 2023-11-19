package build;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.util.StrUtil;

import java.io.File;
import java.util.ArrayList;
import java.util.List;

/**
 * 一键整合指定js内容并覆盖至指定文件
 *
 * @author Admin
 */
public class build {

    /**
     * 项目绝对路径
     */
    private static final String PROJECT_ABSOLUTE_PATH = System.getProperty("user.dir");


    public static void main(String[] args) {

        List<File> jsOrder = getJsOrder(new File(PROJECT_ABSOLUTE_PATH + "/src/other/油猴本地开发元规则.js"));
        StringBuilder stringBuilder = new StringBuilder();
        for (File v : jsOrder) {
            String content = FileUtil.readUtf8String(v).trim().replace("  ", "");
            stringBuilder.append(content).append("\n");
        }
        String content = String.valueOf(stringBuilder);
        content = content.trim();
        File file = FileUtil.writeUtf8String(content, System.getProperty("user.dir") + "\\BIBIShield.js");
        System.out.println("已整合js代码保存在" + file);

    }


    /**
     * 获取js的执行顺序
     *
     * @param file
     * @return
     */
    private static List<File> getJsOrder(File file) {
        List<String> list = FileUtil.readUtf8Lines(file);
        ArrayList<File> tempList = new ArrayList<>(list.size());
        for (String fileName : list) {
            if (excludeFIleName(fileName)) {
                continue;
            }
            tempList.add(new File(StrUtil.subAfter(fileName, "file:///", true)));
        }
        return tempList;
    }


    /**
     * 排除文件
     *
     * @param name
     * @return
     */
    @SuppressWarnings("all")
    private static boolean excludeFIleName(String name) {
        return "油猴本地开发元规则.js".equals(name);
    }
}
