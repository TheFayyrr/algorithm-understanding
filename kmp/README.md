# 算法理解

通过网页动画观察算法中的比较、指针移动和状态变化。每个算法独立一个文件夹，先理解过程，再阅读代码。

首版包含 **KMP 字符串匹配**，保留两段演示：生成 `next` 数组、利用 `next` 匹配文本。

## 开始使用

下载或克隆仓库后，直接用浏览器打开根目录的 `index.html`，再进入 KMP 动画。

也可以直接打开 `kmp/index.html`。页面使用 HTML、CSS 和原生 JavaScript，无需安装依赖、编译或启动后端；所有页面资源均保存在仓库内，可以离线使用。

```bash
git clone https://github.com/TheFayyrr/algorithm-understanding.git
cd algorithm-understanding
```

若希望通过本地网址访问，可运行：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。

## 当前算法

| 算法 | 网页入口 | 学习内容 | 示例代码 |
| --- | --- | --- | --- |
| KMP | [kmp/index.html](kmp/index.html) | 前后缀、next 数组、i/j、失配回退 | [C++](kmp/kmp.cpp) / [JavaScript](kmp/algorithm.js) |

KMP 默认例子：

- 模式串：`aabaaf`。
- 前缀表：`[0, 1, 0, 1, 2, 0]`。
- 文本串：`aabaabaaf`。
- 首次匹配位置：`3`，下标从 `0` 开始。

点击“播放”自动播放；点击“暂停”后，可用“上一步”和“下一步”逐步观察。播放结束后可以重播。切换演示阶段会暂停并回到该阶段开头。

## 文件组织

| 路径 | 用途 |
| --- | --- |
| `index.html` | 算法目录首页 |
| `assets/base.css` | 页面公共样式、浅色与深色主题 |
| `kmp/index.html` | KMP 网页入口 |
| `kmp/style.css` | KMP 动画布局与移动效果 |
| `kmp/algorithm.js` | 算法、前缀表与动画状态生成，独立于界面 |
| `kmp/app.js` | 播放、暂停、前后步与画面更新 |
| `kmp/algorithm.test.js` | 算法正确性与动画状态检查 |
| `kmp/app.test.js` | 动画控件和阶段切换检查 |
| `kmp/kmp.cpp` | 与动画约定一致的 C++ 实现 |
| `kmp/README.md` | KMP 的变量约定和阅读说明 |
| `CONTRIBUTING.md` | 新算法目录和贡献约定 |
| `LICENSE` | MIT 许可证 |

## 运行检查

使用 Node.js 18 或更高版本，无需 `npm install`：

```bash
node --test kmp/algorithm.test.js kmp/app.test.js
```

编译 C++ 示例：

```bash
g++ -std=c++17 -Wall -Wextra -pedantic kmp/kmp.cpp -o kmp-demo
./kmp-demo
```

## 发布为在线网页

仓库是可直接发布的静态网站。GitHub Pages 可使用 `main` 分支的根目录：

1. 打开仓库的 **Settings → Pages**。
2. 在 **Build and deployment** 中选择 **Deploy from a branch**。
3. 选择 **main** 和 **/ (root)**，然后保存。
4. 等待部署完成，从 Pages 页面打开实际生成的地址。

`.nojekyll` 用于按静态文件发布。部署说明参考 [GitHub 官方文档](https://docs.github.com/en/pages/getting-started-with-github-pages/configuring-a-publishing-source-for-your-github-pages-site)。

## 后续扩展规划

以下是后续方向，目前尚未实现：

1. 二分查找：观察左右边界和中点如何变化。
2. 双指针：观察左右指针和判断条件。
3. 滑动窗口：观察窗口扩张、收缩和当前统计值。
4. 排序：观察元素比较、交换与已完成区间。

每次新增算法都独立建立文件夹，提供网页动画、变量说明、代码示例和正确性检查，并在首页添加入口。

## 许可证

[MIT](LICENSE)。欢迎使用、修改和贡献。
