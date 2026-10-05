# 数组与 vector 基础

[返回学习目录](../README.md) · [浏览器阅读](index.html) · [可运行 C++ 示例](arrays.cpp) · [接着学习链表](../linked-list/README.md)

数组按照位置访问元素；链表沿着指针访问节点。先理解两者怎样保存数据，再学习增删操作。

## 1. 数组如何保存数据

数组是相同类型元素的集合，元素位于连续的内存空间中。这里的连续指程序可见的地址连续。

```cpp
int a[4] = {10, 20, 30, 40};
a[0];      // 10：读取第一个元素
a[2] = 99; // 修改第三个元素
```

下标从 0 开始。长度为 4，合法下标为 0、1、2、3，访问 `a[4]` 就越界了。

程序根据起始地址、下标和每个元素的大小计算位置，所以访问 `a[i]` 不需要先走过前面的元素，时间为 O(1)。

假设这个环境中 `sizeof(int) == 4`，地址可以示意为：

| 下标 | 值 | 示意地址 |
| --- | --- | --- |
| 0 | 10 | 0x1000 |
| 1 | 20 | 0x1004 |
| 2 | 30 | 0x1008 |
| 3 | 40 | 0x100C |

实际大小用 `sizeof(int)` 获取，不能把 4 字节当成所有环境都必须满足的规定。`0x` 表示十六进制，`C` 表示十进制的 12。

## 2. 原生数组、array、vector

| 类型 | 例子 | 元素数量是否能改变 | 所需头文件 |
| --- | --- | --- | --- |
| 原生数组 | `int a[3] = {1, 2, 3};` | 这个数组对象的长度固定 | 无 |
| `std::array` | `std::array<int, 3> a{1, 2, 3};` | 固定，有标准库接口 | `<array>` |
| `std::vector` | `std::vector<int> v{1, 2, 3};` | 可以动态增删 | `<vector>` |

可以把 `vector<int>` 理解为标准库管理的动态数组。它保存的 int 元素连续，扩容时可能分配更大的存储区并移动元素。它不是以 `std::array` 作为底层容器。

不要把这里对 `vector<int>` 的描述直接套到特殊化的 `vector<bool>`。

## 3. 原生数组怎样“删除”元素

原生数组本身没有删除成员函数。常用做法是把后面的内容向前覆盖，并减少自己记录的有效长度。

```cpp
int a[4] = {10, 20, 30, 40};
int len = 4;

// 删除下标 1 的元素 20
for (int i = 1; i < len - 1; ++i) {
    a[i] = a[i + 1];
}
--len;

// 只把前 len 个元素视为有效：10、30、40
// 原数组仍然有 4 个存储位置
```

移动的是元素的内容，原数组的存储位置没有因此改变。删除中间元素时，要保持原有顺序，通常需要移动后续元素，时间为 O(n)。

## 4. vector 常用接口

```cpp
#include <vector>
#include <algorithm>

std::vector<int> v{10, 20, 30};
v.push_back(40);        // 10、20、30、40
v.pop_back();           // 10、20、30
v.insert(v.begin(), 5); // 5、10、20、30
v.erase(v.begin() + 1); // 5、20、30
std::sort(v.begin(), v.end());
```

| 接口 | 含义 | 注意 |
| --- | --- | --- |
| `v[i]` | 访问下标 i | 要自己保证下标合法 |
| `v.at(i)` | 访问下标 i | 越界会抛出异常 |
| `v.front()` | 访问第一个元素 | 要非空，不删除 |
| `v.back()` | 访问最后一个元素 | 要非空，不删除 |
| `v.push_back(x)` | 尾部添加 x | 均摊 O(1)，扩容的一次可能是 O(n) |
| `v.pop_back()` | 删除最后一个元素 | 要非空，不返回被删的值 |
| `v.insert(it, x)` | 在 it 之前插入 x | 中间插入通常 O(n) |
| `v.erase(it)` | 删除 it 指向的元素 | 中间删除通常 O(n) |
| `v.size()` | 元素数量 | 不是内存字节数 |
| `v.empty()` | 判断是否为空 | 不会清空容器 |
| `v.clear()` | 删除全部元素 | size 变为 0，不保证释放容量 |
| `v.resize(n)` | 将元素数量改成 n | 改变 size |
| `v.reserve(n)` | 预留至少 n 个元素的容量 | 不增加元素，不改变 size |
| `v.capacity()` | 当前容量 | 可能大于 size |
| `v.begin()` | 第一个元素的迭代器 | 空容器中等于 end |
| `v.end()` | 最后一个元素之后的位置 | 不能解引用 |
| `v.data()` | 指向元素存储区的指针 | 仍要保证访问范围合法 |

```cpp
std::vector<int> v;
v.reserve(100); // size 仍为 0，不能因为预留了容量就访问 v[0]
v.resize(3);    // 现在有 3 个 int，初始值为 0
```

扩容可能使原有指针、引用和迭代器失效。初学时，增删后需要重新定位元素，避免继续使用已经失效的迭代器。

## 5. 迭代器与遍历

迭代器是用于定位、访问、遍历容器元素的工具。可以先把它理解为“记录当前访问位置”。

```cpp
for (int x : v) {
    std::cout << x << ' ';
}

for (auto it = v.begin(); it != v.end(); ++it) {
    std::cout << *it << ' ';
}
```

`*it` 读取当前位置的元素。`++it` 前进到下一个位置。使用 `std::cout` 需要 `<iostream>`。

## 6. algorithm 头文件里的常用函数

这些函数不是 vector 的成员函数，要写 `std::sort(...)`，不能写 `v.sort()`。

| 写法 | 用途 |
| --- | --- |
| `std::sort(v.begin(), v.end())` | 升序排序 |
| `std::reverse(v.begin(), v.end())` | 反转顺序 |
| `std::find(v.begin(), v.end(), x)` | 找 x，没找到返回 v.end() |
| `std::max_element(v.begin(), v.end())` | 返回最大元素的迭代器 |
| `std::min_element(v.begin(), v.end())` | 返回最小元素的迭代器 |
| `std::fill(v.begin(), v.end(), x)` | 将范围内所有元素改为 x |

空容器的 `max_element`、`min_element` 会返回 end，不能直接对其结果解引用。

## 7. 二维数组是不是连续的

```cpp
int a[2][3] = {{0, 1, 2}, {3, 4, 5}};
```

这种原生二维数组按行连续存放：先是第一行的三个元素，然后是第二行的三个元素。`a[1][0]` 表示第二行、第一个元素。

```cpp
std::vector<std::vector<int>> rows(2, std::vector<int>(3));
```

这个写法中，每一行分别是一个 vector，每一行的 int 连续；不同的行不保证共用一整块连续的元素存储区。

## 8. 常见代码符号

| 写法 | 意思 |
| --- | --- |
| `#include <vector>` | 引入 vector 的声明 |
| `std::` | 访问标准库命名空间中的名字 |
| `<int>` | 容器中保存 int 类型 |
| `v[i]` | 按下标访问 |
| `&a[i]` | 获取这个元素的地址 |
| `sizeof(int)` | int 类型占多少字节 |
| `auto` | 由编译器推导变量类型 |
| `++i` | 将 i 增加 1 |

在原生数组定义所在的作用域，可以用 `sizeof(a) / sizeof(a[0])` 算元素数量；数组作为普通数组形参传入函数时通常退化为指针，不能再照搬这个公式。

## 9. 数组和链表的性能区别

| 操作 | 数组／vector | 单链表 |
| --- | --- | --- |
| 访问第 i 个元素 | O(1) | 通常 O(n) |
| 无序数据中找某个值 | 通常 O(n) | 通常 O(n) |
| 保持顺序的中间插入或删除 | 通常 O(n) | 已知前驱节点时修改连接 O(1) |
| 存储特点 | 元素连续 | 每个节点还保存连接信息 |

链表增删的 O(1) 不包含寻找位置的时间。连续存储通常也有较好的缓存局部性，不能只根据“增删频繁”就认定链表一定更快。

## 10. 运行示例

在仓库根目录执行：

```bash
g++ -std=c++17 -Wall -Wextra -pedantic arrays/arrays.cpp -o arrays-demo
./arrays-demo
```

示例实际打印数组地址、删除后的有效内容、vector 的增删，以及 reserve 和 resize 的区别。

## 参考资料

- [C++ 标准草案：array](https://eel.is/c++draft/array.overview)
- [C++ 标准草案：vector](https://eel.is/c++draft/vector.overview)
- [C++ 标准草案：vector 容量](https://eel.is/c++draft/vector.capacity)
- [Microsoft Learn：vector 类](https://learn.microsoft.com/en-us/cpp/standard-library/vector-class?view=msvc-170)

内容为本项目整理的学习笔记，接口行为可对照上述资料核查。
