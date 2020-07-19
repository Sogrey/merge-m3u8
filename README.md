# merge-m3u8
m3u8缓存合并，基于node.js

基于一个小需求：我在观看网上一些教程视频，想下载后离线观看发现下载后是m3u8的缓存文件，一堆的`.ts`文件，就想着怎么能合并这些零散的文件为一个完整可观看的视频，网上查到以下命令：

``` cmd
copy/b 0.ts+1.ts+2.ts+3.ts+4.ts+5.ts+6.ts+7.ts+...ts new.ts
```

本应用就是基于这个命令完成的。

不足：加密视频还未研究解密方案。

## 三方依赖

- [line-reader](https://github.com/nickewing/line-reader)

## TODO

- [] 加密视频的解密
