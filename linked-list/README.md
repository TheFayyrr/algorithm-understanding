# 链表、节点与指针基础

[返回学习目录](../README.md) · [浏览器阅读](index.html) · [可运行 C++ 示例](linked_list.cpp) · [回顾数组](../arrays/README.md)

链表的每个节点保存数据和连接信息。链表顺序由连接决定，不要求节点在内存中连续存放。

## 1. 数据域与指针域

```cpp
struct ListNode {
    int val;
    ListNode* next;

    ListNode(int x) : val(x), next(nullptr) {}
};
```

| 写法 | 含义 |
| --- | --- |
| `struct ListNode` | 定义一种节点类型 |
| `int val` | 当前节点保存的整数 |
| `ListNode* next` | 下一个节点的地址 |
| `ListNode(int x)` | 创建节点时调用的构造函数 |
| `: val(x), next(nullptr)` | 成员初始化列表：数据设为 x，连接设为空 |
| `nullptr` | C++ 空指针，表示没有指向节点 |

`next` 保存地址，不保存下一个节点的完整副本，也不是下一个节点的整数值。

## 2. 节点的逻辑顺序和内存地址

假设有以下三个节点，地址仅为示意：

| 节点地址 | val | next 保存的地址 |
| --- | --- | --- |
| 0x1000 | 10 | 0x3000 |
| 0x3000 | 20 | 0x2000 |
| 0x2000 | 30 | nullptr |

从 0x1000 开始沿着 next 访问，读出的顺序是 10、20、30。节点地址的大小顺序不决定链表顺序。

链表节点可能恰好挨着，也可能分散在不同位置；链表不要求连续存储。

## 3. 单链表、双链表、循环链表

| 类型 | 节点连接 | 特点 |
| --- | --- | --- |
| 单链表 | 一个 next | 可以沿连接走向后继 |
| 双链表 | prev 和 next | 可以访问前驱和后继 |
| 循环单链表 | 尾节点 next 指向首节点 | 遍历不能以遇到 nullptr 为唯一停止条件 |

循环链表可以用于循环轮转、约瑟夫环等问题。双链表也可以组织成循环结构。

## 4. head 是什么

```cpp
ListNode* head = new ListNode(10);
```

`head` 是一个指针变量，保存首节点的地址。空链表一般用 `head == nullptr` 表示。

一些实现还设置一个不保存有效数据的哨兵节点或虚拟头结点。要区分“保存首节点地址的 head 指针”和“额外的头结点”。

## 5. new、箭头、解引用

```cpp
ListNode* head = new ListNode(10);
head->next = new ListNode(20);
head->next->next = new ListNode(30);
```

| 写法 | 意思 |
| --- | --- |
| `new ListNode(10)` | 动态创建节点，调用构造函数，返回地址 |
| `ListNode* head` | 定义指向 ListNode 的指针 |
| `head->val` | 访问 head 指向的节点的数据 |
| `(*head).val` | 与 head->val 等价 |
| `head->next` | 访问首节点中保存的后继地址 |
| `delete p` | 释放 p 指向的、由匹配 new 创建的节点 |

访问 `p->val`、`p->next` 前，p 必须指向有效节点。delete 后，不可再访问该节点。

## 6. 怎样遍历

```cpp
ListNode* cur = head;

while (cur != nullptr) {
    std::cout << cur->val << ' ';
    cur = cur->next;
}
```

`cur` 用来访问节点。`cur = cur->next` 表示前进到后继节点。这个操作只改变 cur，不会改变 head。输出需要 `<iostream>`。

## 7. 删除节点：先接好，再释放

已知链表内容为 10、20、30，并且 head 和 head->next 有效，要删除 20：

```cpp
ListNode* removed = head->next;
head->next = removed->next;
delete removed;
```

先记住 20 节点的地址，让 10 的 next 改为指向 30，再释放 20。其他节点的数据没有搬动。

不能先 delete 再读取 `removed->next`，那是在访问已经释放的内存。

删除首节点时，要更新 head：

```cpp
if (head != nullptr) {
    ListNode* removed = head;
    head = head->next;
    delete removed;
}
```

## 8. 插入节点：先连接后继

已知当前内容为 10、30，在 10 后面插入 15：

```cpp
ListNode* node = new ListNode(15);
node->next = head->next;
head->next = node;
```

先让 15 指向原来的后继 30，再让 10 指向 15。若先覆盖 head->next，又没有保存原来的后继，就可能丢失后面的链。

## 9. 释放完整链表

```cpp
while (head != nullptr) {
    ListNode* next = head->next;
    delete head;
    head = next;
}
```

这些操作适用于以 nullptr 结束的非循环链表。循环链表需要不同的结束条件。

使用 `std::list` 和 `std::forward_list` 时，容器负责其节点的释放，不需要自己对容器元素调用 delete。

## 10. 构造函数与 C 定义的易错点

上面的 C++ 结构自定义了有参构造函数，所以可以写 `new ListNode(5)`。它没有无参构造函数，不能直接使用 `new ListNode()`。

如果改成没有自定义构造函数的结构：

```cpp
struct PlainNode {
    int val;
    PlainNode* next;
};

PlainNode* a = new PlainNode{5, nullptr}; // 直接初始化两个成员
PlainNode* b = new PlainNode();          // val 为 0，next 为空
PlainNode* c = new PlainNode;            // 不保证成员有这些初值

delete a;
delete b;
delete c;
```

上述 new PlainNode() 的结论针对这里没有自定义构造函数、没有成员初始化器的结构。不能把所有自定义构造函数的行为都概括成这一种情况。

C 语言的节点定义应写成：

```c
typedef struct ListNodeT {
    int val;
    struct ListNodeT* next;
} ListNode;
```

`struct ListNodeT next;` 少了星号，会要求在节点内部放一个完整的同类节点，结构无法形成有限大小。C 没有 C++ 构造函数，使用 malloc 后要自行初始化，并用 free 释放；new/delete 和 malloc/free 不可随意混配。

## 11. 增删到底是不是 O(1)

| 操作 | 单链表时间 |
| --- | --- |
| 已知前驱节点，在它后面插入一个节点 | 修改连接 O(1) |
| 已知前驱节点，删除它的后继 | 修改连接 O(1) |
| 从 head 查找第 i 个节点 | O(n) |
| 从 head 查找一个值 | O(n) |
| 先找到第五个节点再删除 | 整体通常 O(n) |

O(1) 不包含寻找位置的时间。节点分配和释放也有实际开销，不能只看指针赋值次数就断定链表一定比数组快。

## 12. 标准库链表常用接口

```cpp
#include <list>
#include <forward_list>

std::list<int> a{10, 20, 30};
std::forward_list<int> b{10, 20, 30};
```

| std::list 接口 | 含义 |
| --- | --- |
| `push_front(x)` / `push_back(x)` | 头部／尾部添加 |
| `pop_front()` / `pop_back()` | 删除头部／尾部，要求非空 |
| `front()` / `back()` | 访问头部／尾部，要求非空 |
| `insert(it, x)` | 在 it 指向的位置之前插入 |
| `erase(it)` | 删除 it 指向的一个元素 |
| `remove(x)` | 删除所有值等于 x 的元素 |
| `size()` / `empty()` / `clear()` | 数量／判空／清空 |
| `begin()` / `end()` | 遍历所需的起点与终点 |
| `sort()` / `reverse()` | 排序／反转 |

它们没有 `a[i]` 或 at() 这样的随机访问接口。`std::sort` 要求随机访问迭代器，不能直接用来排序 list；使用 `a.sort()`。

forward_list 用 `insert_after()`、`erase_after()` 操作指定位置后面的节点；`before_begin()` 表示首元素之前的位置。它没有 size()、back()、push_back()、pop_back()。

## 13. 运行示例

```bash
g++ -std=c++17 -Wall -Wextra -pedantic linked-list/linked_list.cpp -o linked-list-demo
./linked-list-demo
```

示例包含创建、遍历、删除中间节点、插入节点、更新首节点、释放链表，以及 list/forward_list 的操作。

## 参考资料

- [C++ 标准草案：list](https://eel.is/c++draft/list.overview)
- [C++ 标准草案：forward_list](https://eel.is/c++draft/forward.list.overview)
- [C++ 标准草案：初始化规则](https://eel.is/c++draft/dcl.init)

内容为本项目整理的学习笔记。
