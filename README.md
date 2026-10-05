# 算法理解

通过网页动画观察算法中的比较、指针移动和状态变化。每个算法独立一个文件夹，先理解过程，再阅读代码。

目前包含 **数组与 vector 基础、链表与指针基础、KMP 字符串匹配、滑动窗口与单调队列**。KMP 有生成 `next` 和字符串匹配两段动画；单调队列可切换递减求最大值与递增求最小值。

## 开始使用

下载或克隆仓库后，直接用浏览器打开根目录的 `index.html`，选择要学习的章节。

也可以直接打开 `kmp/index.html` 或 `sliding-window/index.html`。页面使用 HTML、CSS 和原生 JavaScript，无需安装依赖、编译或启动后端；知识点、代码展示和动画资源均保存在仓库内，可以离线使用。

```bash
git clone https://github.com/TheFayyrr/algorithm-understanding.git
cd algorithm-understanding
```

若希望通过本地网址访问，可运行：

```bash
python3 -m http.server 8000
```

然后打开 `http://localhost:8000/`。

## 当前学习内容

| 算法 | 网页入口 | 学习内容 | 示例代码 |
| --- | --- | --- | --- |
| 数组与 vector | [arrays/index.html](arrays/index.html) | 连续内存、下标、增删、常用接口、二维数组 | [C++](arrays/arrays.cpp) / [学习笔记](arrays/README.md) |
| 链表与指针 | [linked-list/index.html](linked-list/index.html) | 节点、next/head、遍历、插入删除、内存释放、list/forward_list | [C++](linked-list/linked_list.cpp) / [学习笔记](linked-list/README.md) |
| KMP | [kmp/index.html](kmp/index.html) | 前后缀、next 数组、i/j、失配回退 | [C++](kmp/kmp.cpp) / [JavaScript](kmp/algorithm.js) |
| 滑动窗口与单调队列 | [sliding-window/index.html](sliding-window/index.html) | 递增／递减、候选淘汰、过期、重复值、deque 与堆的区别 | [C++](sliding-window/sliding_window.cpp) / [学习笔记](sliding-window/README.md) |

KMP 默认例子：

- 模式串：`aabaaf`。
- 前缀表：`[0, 1, 0, 1, 2, 0]`。
- 文本串：`aabaabaaf`。
- 首次匹配位置：`3`，下标从 `0` 开始。

点击“播放”自动播放；点击“暂停”后，可用“上一步”和“下一步”逐步观察。播放结束后可以重播。切换演示阶段会暂停并回到该阶段开头。

单调队列默认例子为 `nums = [1,3,-1,-3,5,3,6,7]`、`k = 3`。先播放“递减：求最大值”，再切换“递增：求最小值”。动画下方可展开完整讲解和 C++ 代码。

建议先阅读数组和链表，再学习两个动画。笔记特别说明了按数值出队时为何保留重复值、链表 O(1) 的前提，以及大顶堆通过延迟删除也能解决滑动窗口题。

## 文件组织

| 路径 | 用途 |
| --- | --- |
| `index.html` | 算法目录首页 |
| `assets/base.css` | 页面公共样式、浅色与深色主题 |
| `assets/learning.css` | 学习笔记、章节导航和模式按钮样式 |
| `arrays/` | 数组知识点、离线网页和可运行 C++ 示例 |
| `linked-list/` | 链表知识点、离线网页和可运行 C++ 示例 |
| `kmp/index.html` | KMP 网页入口 |
| `kmp/style.css` | KMP 动画布局与移动效果 |
| `kmp/algorithm.js` | 算法、前缀表与动画状态生成，独立于界面 |
| `kmp/app.js` | 播放、暂停、前后步与画面更新 |
| `kmp/algorithm.test.js` | 算法正确性与动画状态检查 |
| `kmp/app.test.js` | 动画控件和阶段切换检查 |
| `kmp/kmp.cpp` | 与动画约定一致的 C++ 实现 |
| `kmp/README.md` | KMP 的变量约定和阅读说明 |
| `sliding-window/index.html` | 单调队列动画与完整题解 |
| `sliding-window/algorithm.js` | 独立计算函数和教学状态生成 |
| `sliding-window/app.js` / `style.css` | 播放控件、模式切换和移动效果 |
| `sliding-window/sliding_window.cpp` | 按值、按下标和大顶堆的 C++ 实现 |
| `sliding-window/*.test.js` | 独立暴力对照和控件检查 |
| `CONTRIBUTING.md` | 新算法目录和贡献约定 |
| `LICENSE` | MIT 许可证 |

## 运行检查

使用 Node.js 18 或更高版本，无需 `npm install`：

```bash
node --test kmp/algorithm.test.js kmp/app.test.js sliding-window/algorithm.test.js sliding-window/app.test.js
```

编译 C++ 示例：

```bash
g++ -std=c++17 -Wall -Wextra -pedantic kmp/kmp.cpp -o kmp-demo
./kmp-demo
g++ -std=c++17 -Wall -Wextra -pedantic arrays/arrays.cpp -o arrays-demo
./arrays-demo
g++ -std=c++17 -Wall -Wextra -pedantic linked-list/linked_list.cpp -o linked-list-demo
./linked-list-demo
g++ -std=c++17 -Wall -Wextra -pedantic sliding-window/sliding_window.cpp -o sliding-window-demo
./sliding-window-demo --check
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
3. 可变长度滑动窗口：观察边界扩张、收缩和判断条件。
4. 排序：观察元素比较、交换与已完成区间。

每次新增算法都独立建立文件夹，提供网页动画、变量说明、代码示例和正确性检查，并在首页添加入口。

## 许可证

[MIT](LICENSE)。欢迎使用、修改和贡献。
