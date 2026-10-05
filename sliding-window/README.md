# 滑动窗口最大值与单调队列

[返回学习目录](../README.md) · [打开动画](index.html) · [C++ 示例](sliding_window.cpp) · [JavaScript 实现](algorithm.js)

先观察窗口里有哪些元素，再观察候选队列为什么只保留其中一部分。点击播放，也可以用上一步、下一步逐个查看。

## 1. 题目和窗口

[LeetCode 239：滑动窗口最大值](https://leetcode.cn/problems/sliding-window-maximum/)

给定数组 nums 和窗口大小 k，窗口每次向右移动一格，记录每个完整窗口中的最大值。题目约束为 `1 <= k <= nums.length`。

```text
nums = [1, 3, -1, -3, 5, 3, 6, 7]
k = 3
最大值答案 = [3, 3, 5, 5, 6, 7]
```

动画还提供求最小值的模式，用来比较递减和递增的维护规则。最大值和最小值是两种分别运行的演示。

## 2. 单调是什么意思

| 队列方向 | 从队头到队尾的数值 | 队头是什么 |
| --- | --- | --- |
| 单调递减，允许相等 | 8、5、5、2 | 最大值 |
| 单调递增，允许相等 | 2、5、5、8 | 最小值 |

严格说，允许相等时分别是单调不增和单调不减。题解里经常简称递减、递增。

单调队列保存的是可能成为窗口极值的候选，而不是窗口中的全部数。候选仍按原数组的出现顺序排列，没有任意交换位置。

## 3. 为什么可以删除较小的旧数

若新来的数比一个旧数更大，并且位置更靠后，那么：

1. 新数比旧数更适合充当最大值。
2. 新数会更晚离开固定大小、逐步向右移动的窗口。
3. 以后只要窗口还包含旧数，就一定还包含这个新数。

所以旧数以后也不可能成为最大值，可以永久从候选中移除。这里删除的是候选记录，不会修改 nums 数组。

例如以下五个数仍在窗口中，按顺序进入候选队列：

| 新值 | 加入后的队列 | 原因 |
| --- | --- | --- |
| 2 | [2] | 当前只有它 |
| 3 | [3] | 3 更大且更晚离开，淘汰 2 |
| 5 | [5] | 同理淘汰 3 |
| 1 | [5, 1] | 5 离开后，1 可能有用 |
| 4 | [5, 4] | 淘汰 1，保留更大的 5 |

把窗口内所有数排序，不会得到这个维护过程；排序也无法直接利用原出现顺序判断谁已经过期。

## 4. 为什么用 deque

`std::queue` 提供先进先出的受限接口。此处需要从队头移除过期候选、从队尾淘汰较差候选，所以直接使用双端队列 deque。

```cpp
#include <deque>
std::deque<int> que;
```

| 接口 | 含义 |
| --- | --- |
| `push_back(x)` | 尾部添加 x |
| `pop_back()` | 删除尾部元素 |
| `push_front(x)` | 头部添加 x |
| `pop_front()` | 删除头部元素 |
| `front()` | 访问头部，不删除 |
| `back()` | 访问尾部，不删除 |
| `empty()` / `size()` | 判空／元素数量 |

访问 front、back 或删除元素前要保证非空。两端增删是常数时间。deque 支持下标访问，但不保证所有元素像 vector<int> 那样连续存放。

## 5. push(value)：新数加入时淘汰队尾

```cpp
while (!que.empty() && value > que.back()) {
    que.pop_back();
}
que.push_back(value);
```

队列为 [8, 5, 2]，新值为 6：先删除 2，再删除 5；6 不大于 8，停止删除；加入 6，得到 [8, 6]。

这里用 while，因为一个新值可能连续淘汰多个候选。`&&` 是逻辑与：左边 empty 检查未通过时，不会访问右边的 back，避免对空队列读取。

## 6. pop(value)：旧数离开窗口

```cpp
if (!que.empty() && value == que.front()) {
    que.pop_front();
}
```

这里的 pop(value) 是自己定义的成员函数。标准库的 deque::pop_front() 不接收这个 value 参数。

正在离开窗口的是原数组里最早的那个数。如果它还在候选队列里，就只能位于队头；如果已经被更大的新数淘汰，就无需再次删除。所以不必到队列中间遍历查找。

## 7. 为什么按数值出队时要保留重复值

假设窗口中先后出现两个 5。前一个 5 离开时，后一个 5 可能还在窗口中。

按数值维护的这个版本使用严格的 `value > que.back()`，保留两个 5，然后每次只删除过期的那一个。

不能随意改成 >=。如果入队时合并相等的数，出队时仍只根据数值判断，就可能误删尚未过期的那个 5。

保存下标的另一种实现可以用下标准确判定过期，因此其重复值处理有更多选择；不能把不同版本的规则混用。

## 8. front() 为什么直接是答案

候选始终从大到小排列，且已经移除了离开窗口的候选。队头既在当前窗口中，又不小于其他候选，因此它就是当前最大值。

队头可能暂时来自已经离开的旧窗口，动画会把“检查过期”和“移除过期”拆成两个步骤展示；只有处理完过期、入队并到达记录步骤，才写入答案。

## 9. 与题解一致的 C++ 写法

```cpp
#include <deque>
#include <vector>

class MyQueue {
private:
    std::deque<int> que;

public:
    void pop(int value) {
        if (!que.empty() && value == que.front()) {
            que.pop_front();
        }
    }

    void push(int value) {
        while (!que.empty() && value > que.back()) {
            que.pop_back();
        }
        que.push_back(value);
    }

    int front() {
        return que.front();
    }
};

class Solution {
public:
    std::vector<int> maxSlidingWindow(std::vector<int>& nums, int k) {
        MyQueue que;
        std::vector<int> result;

        for (int i = 0; i < k; ++i) {
            que.push(nums[i]);
        }
        result.push_back(que.front());

        int n = static_cast<int>(nums.size());
        for (int i = k; i < n; ++i) {
            que.pop(nums[i - k]);
            que.push(nums[i]);
            result.push_back(que.front());
        }
        return result;
    }
};
```

第一段 for 建立第一个完整窗口。后面的循环每次移出 nums[i-k]，再加入 nums[i]。例如 k=3、i=3 时，nums[0] 离开，nums[3] 加入。

`class` 定义类；`private` 后的成员不能由外部直接访问；`public` 后的成员可以调用；`std::vector<int>` 是保存 int 的动态数组；返回 result 就得到各个窗口的答案。

上面的刷题函数按题目合法输入约束使用。可运行的 [sliding_window.cpp](sliding_window.cpp) 还提供边界检查、存下标的版本以及大顶堆版本。

## 10. 为什么嵌套 while 仍然是 O(n)

每个数组元素最多入队一次，最多从队头或队尾移除一次。即使一次 push 删除多个元素，所有删除次数相加也不会超过 n。

- 总时间：O(n)。
- 候选队列：最多保存 k 个元素，额外空间 O(k)。
- 返回数组：保存 n-k+1 个答案，单独占 O(n-k+1)。

动画为了回看每一步会保存状态快照，这些教学快照不是算法本身的空间开销；不能用动画快照的总占用代表单调队列的 O(k)。

## 11. 求最小值：维护单调递增

```cpp
while (!que.empty() && value < que.back()) {
    que.pop_back();
}
que.push_back(value);
```

新来的小数淘汰队尾的大数。留下的候选从小到大，队头就是最小值。按数值移出时仍要保留相等的候选。

## 12. 单调队列与优先级队列

| 对比 | 本题单调队列 | 默认 priority_queue<int> |
| --- | --- | --- |
| 底层 | deque，按规则淘汰候选 | 堆，默认底层容器 vector |
| 顺序 | 候选数值单调，位置按原出现顺序 | 只保证堆结构和堆顶最大，整体不一定排好序 |
| 删除 | 可以删除队头和队尾 | 公共接口只能删除堆顶 |
| 读取最大值 | front() | top() |
| 一次加入 | 本题中均摊 O(1) | O(log m)，m 为堆中元素数量 |

priority_queue 的常用接口是 push、pop、top、empty、size；pop 不返回被删除的值，top 不删除元素。

大顶堆可以解这道题。保存“数值＋下标”，取答案前不断弹出已经过期的堆顶，直到堆顶仍处于当前窗口。这是延迟删除。

简单的延迟删除堆可能保留许多已经过期、还未到堆顶的小数，最坏时间 O(n log n)，额外空间 O(n)。支持按下标主动删除的其他堆实现可以限制窗口大小，但普通 priority_queue 没有提供这样的删除接口。

单调队列根据支配关系提前放弃无用候选，因此能用 O(n) 时间完成。

## 13. 动画与文件约定

- 蓝色高亮表示当前窗口，新值另有向下标记。
- 候选队头在左侧；小字 i 是原数组下标，用来观察候选来自哪里。
- 比较、淘汰、加入、记录分别成一步。
- 播放可暂停；上一步、下一步可逐格查看；到结尾再点播放会从头重播。
- 切换递增／递减模式会暂停播放并回到第一项入队后的状态。
- 动画解释采用按数值移出的题解规则；状态中额外记录下标作为教学标签。
- algorithm.js 的实际计算函数用下标和固定容量队列保证 O(n) 时间、O(k) 候选空间；buildSteps 专门生成教学过程。

所有资源保存在仓库内，浏览器直接打开 index.html 即可离线运行，不依赖聊天页面的运行环境。

## 14. 运行检查

在仓库根目录执行：

```bash
node --test sliding-window/algorithm.test.js sliding-window/app.test.js
g++ -std=c++17 -Wall -Wextra -pedantic sliding-window/sliding_window.cpp -o sliding-window-demo
./sliding-window-demo
./sliding-window-demo --check
```

JavaScript 将实际结果和教学步骤与独立的暴力窗口结果比较，并检查重复值、k=1、k=n、递增／递减输入，以及播放和模式切换。C++ 的 --check 比较单调队列两种写法、大顶堆和暴力结果。

## 参考资料

- [C++ 标准草案：deque](https://eel.is/c++draft/deque.overview)
- [C++ 标准草案：priority_queue](https://eel.is/c++draft/priority.queue)
- [题目：LeetCode 239](https://leetcode.cn/problems/sliding-window-maximum/)
- [学习来源：代码随想录](https://programmercarl.com/)

讲解和动画为本项目整理实现，未包含外部文章的整篇复制或外部图片资源。
