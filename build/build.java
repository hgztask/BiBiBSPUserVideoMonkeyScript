package build;

import cn.hutool.core.io.FileUtil;
import cn.hutool.core.io.IORuntimeException;
import cn.hutool.json.JSONArray;
import cn.hutool.json.JSONUtil;

import java.io.File;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.List;

/**
 * 一键整合指定js内容并覆盖至指定文件
 *
 * @author byhgz
 */
public class build {
    /**
     * 项目绝对路径
     */
    private static final String PROJECT_ABSOLUTE_PATH = System.getProperty("user.dir");

    /**
     * 排除文件数组
     */
    private static final JSONArray GITIGNORE = new JSONArray();

    /**
     * 拼接顺序
     */
    private static final List<String> SPLICING_SEQUENCELIST = new ArrayList<>();

    static {
        try {
            GITIGNORE.addAll(JSONUtil.readJSONArray(new File(PROJECT_ABSOLUTE_PATH + "/build/gitignore.json"), StandardCharsets.UTF_8));
        } catch (IORuntimeException e) {
            System.out.println(e.getMessage());
        }
        String metaData = PROJECT_ABSOLUTE_PATH + "/build/metaData.js";
        if (!FileUtil.isFile(metaData)) {
            throw new RuntimeException(metaData + "油猴头部信息不存在！");
        }
        SPLICING_SEQUENCELIST.add(metaData);
        List<String> lines;
        try {
            lines = FileUtil.readUtf8Lines((PROJECT_ABSOLUTE_PATH + "/build/path.js"));
        } catch (IORuntimeException e) {
            System.out.println("未配置本地开发文件路径顺序！");
            throw new RuntimeException(e);
        }
        for (String linePath : lines) {
            String path = linePath.replace("// @require      file:///", "");
            if (excludeFileName(path)) {
                continue;
            }
            SPLICING_SEQUENCELIST.add(path);
        }
    }

    public static void main(String[] args) {
        StringBuilder stringBuilder = new StringBuilder();
        for (String v : SPLICING_SEQUENCELIST) {
            String read = FileUtil.readUtf8String(v);
            if (v.lastIndexOf("/build/metaData.js") != -1) {//排除针对于头部描述信息的格式化处理
                stringBuilder.append(read).append("\n");
                continue;
            }
            stringBuilder.append(read.trim().replace("  ", "")).append("\n");
        }
        String content = String.valueOf(stringBuilder).trim();
        File file = FileUtil.writeUtf8String(content, PROJECT_ABSOLUTE_PATH + "\\BIBIShield.js");
        System.out.println("已整合js代码保存在" + file);
    }

    /**
     * 排除的文件
     *
     * @param path 文件路径
     * @return 是否排除
     */
    private static boolean excludeFileName(String path) {
        boolean temp = false;
        if (GITIGNORE.size() == 0) {
            return false;
        }
        String fIleName = FileUtil.getName(path);
        for (Object o : GITIGNORE) {
            if (!fIleName.equals(o)) {
                continue;
            }
            temp = true;
            break;
        }
        return temp;
    }
}