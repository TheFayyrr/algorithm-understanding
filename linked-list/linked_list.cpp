#include <cassert>
#include <forward_list>
#include <iostream>
#include <list>
#include <vector>

struct ListNode {
    int val;
    ListNode* next;
    explicit ListNode(int value) : val(value), next(nullptr) {}
};

// 已知前驱 prev，在它后面插入一个节点。
void insertAfter(ListNode* prev, int value) {
    if (prev == nullptr) return;
    ListNode* node = new ListNode(value);
    node->next = prev->next;
    prev->next = node;
}

// 已知前驱 prev，删除它的后继；没有后继时返回 false。
bool removeAfter(ListNode* prev) {
    if (prev == nullptr || prev->next == nullptr) return false;
    ListNode* removed = prev->next;
    prev->next = removed->next;
    delete removed;
    return true;
}

std::vector<int> collect(const ListNode* head) {
    std::vector<int> values;
    for (const ListNode* cur = head; cur != nullptr; cur = cur->next) {
        values.push_back(cur->val);
    }
    return values;
}

void print(const char* label, const ListNode* head) {
    std::cout << label << ':';
    for (const ListNode* cur = head; cur != nullptr; cur = cur->next) {
        std::cout << ' ' << cur->val;
    }
    std::cout << '\n';
}

void destroy(ListNode*& head) {
    while (head != nullptr) {
        ListNode* next = head->next;
        delete head;
        head = next;
    }
}

int main() {
    ListNode* head = new ListNode(10);
    insertAfter(head, 30);
    insertAfter(head, 20);
    assert((collect(head) == std::vector<int>{10, 20, 30}));
    print("原链表", head);

    bool removed = removeAfter(head);
    assert(removed && (collect(head) == std::vector<int>{10, 30}));
    print("删除 20", head);

    insertAfter(head, 15);
    assert((collect(head) == std::vector<int>{10, 15, 30}));
    print("插入 15", head);

    ListNode* oldHead = head;
    head = head->next;
    delete oldHead;
    assert((collect(head) == std::vector<int>{15, 30}));
    print("删除首节点", head);
    destroy(head);
    assert(head == nullptr);
    assert(!removeAfter(head));
    std::cout << "释放后 head == nullptr\n";

    std::list<int> values{10, 20, 30};
    values.push_front(5);
    values.push_back(40);
    auto it = values.begin();
    ++it; // 定位 10：list 通过迭代器逐步前进
    values.erase(it);
    values.remove(20);
    values.reverse();
    values.sort();
    assert((std::vector<int>(values.begin(), values.end()) == std::vector<int>{5, 30, 40}));
    std::cout << "std::list:";
    for (int value : values) std::cout << ' ' << value;
    std::cout << '\n';

    std::forward_list<int> forward{10, 30};
    auto first = forward.begin();
    forward.insert_after(first, 20);
    assert((std::vector<int>(forward.begin(), forward.end()) == std::vector<int>{10, 20, 30}));
    forward.erase_after(first);
    std::cout << "std::forward_list:";
    for (int value : forward) std::cout << ' ' << value;
    std::cout << '\n';
}
