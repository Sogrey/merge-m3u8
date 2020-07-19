# merge-m3u8
m3u8缓存合并，基于node.js

基于一个小需求：我在观看网上一些教程视频，想下载后离线观看发现下载后是m3u8的缓存文件，一堆的`.ts`文件，就想着怎么能合并这些零散的文件为一个完整可观看的视频，网上查到以下命令：

``` cmd
copy/b 0.ts+1.ts+2.ts+3.ts+4.ts+5.ts+6.ts+7.ts+...ts new.ts
```

本应用就是基于这个命令完成的。

## Usage
安装三方依赖：
``` cmd
npm i
```
运行：
``` cmd
npm start
```

举例输出如下：
```
E:\workspace\node.js\merge-m3u8>npm start

> m3u8-merge@1.0.0 start E:\workspace\node.js\merge-m3u8
> node merge-m3u8.js

请输入m3u8缓存目录或其父目录完整路径：E:\workspace\node.js\merge-m3u8\sampleData
开始扫描：E:\workspace\node.js\merge-m3u8\sampleData
1 E:\workspace\node.js\merge-m3u8\sampleData\49c2c0ea273\index.m3u8
一共找到1个符合的目标文件。
请输入需要合并的文件序号1或直接回车即可：
已选择全部合并。
正在合并： E:\workspace\node.js\merge-m3u8\sampleData\49c2c0ea273\index.m3u8
合并完成 E:\workspace\node.js\merge-m3u8\sampleData\49c2c0ea273/index.ts

```

## 三方依赖

- [line-reader](https://github.com/nickewing/line-reader)

## TODO

- [ ] `.m3u8`文件中所列的`.ts`文件可能不存在
- [ ] 加密视频的解密
