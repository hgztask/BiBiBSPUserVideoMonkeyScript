import cn.hutool.core.io.FileUtil;

import java.io.File;
import java.util.LinkedList;
import java.util.List;
import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

/**
 * 获取一个目录下的所有空目录并将其删除
 * @author byhgz
 * @version 1.0
 * @date 2023/4/3 19:03
 */
public class FileDemo {

    private static void getNullFiles(List<File>list,File path) {
        for (File v : FileUtil.ls(path.toString())) {
            if (!v.isDirectory()) {
                continue;
            }
            if (FileUtil.ls(v.toString()).length == 0) {
                synchronized (FileDemo.class){
                    list.add(v);
                    //该目录是空目录
                    System.out.printf("该目录是空目录%s 空列表个数：%s%n", v,list.size());
                    //boolean delete = FileUtil.del(v);
                    //System.out.println(delete?"删除成功！"+v:"删除失败"+v);
                }
            }
            @SuppressWarnings("all")
            ExecutorService executor = Executors.newSingleThreadExecutor();
            try {
                executor.execute(() -> getNullFiles(list,v));
            } finally {
                executor.shutdown();
            }
        }
    }
    /**
     * 获取一个文件夹下的空目录，排除文件
     * 先判断传入来的路径是否是文件夹，不是则结束
     * 反之继续获取该路径下的所有文件夹和目录，排除该目录下的文件，只获取该目录下的文件夹
     * 重复上一步步骤
     */
    public static void main(String[] args) {
        File file = new File("C:\\");
        if (!file.isDirectory()) {
            System.out.println("该路径非目录");
            return;
        }
        @SuppressWarnings("all")
          final List<File> list = new LinkedList<>();
        getNullFiles(list,file);
        try {
            Thread.currentThread().wait();
        } catch (InterruptedException e) {
            throw new RuntimeException(e);
        }
    }
}
