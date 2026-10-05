// KMP：前缀表不减一，与网页动画采用相同的 i/j 约定。
#include <cassert>
#include <iostream>
#include <string>
#include <vector>

std::vector<int> getNext(const std::string& pattern) {
    std::vector<int> next(pattern.size(), 0);
    int j = 0;
    for (int i = 1; i < static_cast<int>(pattern.size()); ++i) {
        while (j > 0 && pattern[i] != pattern[j]) {
            j = next[j - 1];
        }
        if (pattern[i] == pattern[j]) ++j;
        next[i] = j;
    }
    return next;
}

int kmpFind(const std::string& text, const std::string& pattern) {
    if (pattern.empty()) return 0;
    const std::vector<int> next = getNext(pattern);
    int i = 0;
    int j = 0;
    while (i < static_cast<int>(text.size())) {
        // 同一个 text[i] 可以在不同的模式位置重新比较。
        while (j > 0 && text[i] != pattern[j]) {
            j = next[j - 1];
        }
        if (text[i] == pattern[j]) ++j;
        ++i;
        // i 已前进到最后一个匹配字符的后一位。
        if (j == static_cast<int>(pattern.size())) return i - j;
    }
    return -1;
}

int main() {
    const std::string pattern = "aabaaf";
    const std::string text = "aabaabaaf";
    assert((getNext(pattern) == std::vector<int>{0, 1, 0, 1, 2, 0}));
    assert(kmpFind(text, pattern) == 3);
    for (const auto& source : {std::string(""), std::string("a"),
             std::string("aaaaa"), std::string("ababa"), text}) {
        for (const auto& target : {std::string(""), std::string("a"),
                 std::string("aa"), std::string("aba"), std::string("abc"), pattern}) {
            const auto position = source.find(target);
            const int expected = position == std::string::npos ? -1 : static_cast<int>(position);
            assert(kmpFind(source, target) == expected);
        }
    }
    std::cout << "next: ";
    for (const int length : getNext(pattern)) std::cout << length << ' ';
    std::cout << "\nfirst match: " << kmpFind(text, pattern) << '\n';
}
