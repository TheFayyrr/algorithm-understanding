#include <algorithm>
#include <array>
#include <cassert>
#include <iostream>
#include <vector>

template <class Range>
void print(const char* label, const Range& values) {
    std::cout << label << ':';
    for (int value : values) std::cout << ' ' << value;
    std::cout << '\n';
}

int main() {
    int a[4] = {10, 20, 30, 40};
    std::cout << "sizeof(int) = " << sizeof(int) << '\n';
    for (int i = 0; i < 4; ++i) {
        std::cout << "a[" << i << "] = " << a[i]
                  << ", address = " << &a[i] << '\n';
    }

    int len = 4;
    for (int i = 1; i < len - 1; ++i) a[i] = a[i + 1];
    --len;
    std::cout << "删除 20 后的有效内容:";
    for (int i = 0; i < len; ++i) std::cout << ' ' << a[i];
    std::cout << "; 原数组仍有 " << sizeof(a) / sizeof(a[0]) << " 个位置\n";
    assert(len == 3 && a[0] == 10 && a[1] == 30 && a[2] == 40);

    std::array<int, 3> fixed{1, 2, 3};
    fixed.fill(7);
    print("array.fill(7)", fixed);

    std::vector<int> v{10, 20, 30};
    v.push_back(40);
    v.pop_back();
    v.insert(v.begin(), 5);
    v.erase(v.begin() + 1);
    assert((v == std::vector<int>{5, 20, 30}));
    print("vector 增删后", v);
    std::reverse(v.begin(), v.end());
    print("reverse 后", v);
    std::sort(v.begin(), v.end());
    print("sort 后", v);
    auto found = std::find(v.begin(), v.end(), 20);
    if (found != v.end()) std::cout << "find(20) = " << *found << '\n';
    if (!v.empty()) std::cout << "最大值 = " << *std::max_element(v.begin(), v.end()) << '\n';

    std::vector<int> buffer;
    buffer.reserve(100);
    assert(buffer.empty() && buffer.capacity() >= 100);
    std::cout << "reserve(100): size=" << buffer.size()
              << ", capacity=" << buffer.capacity() << '\n';
    buffer.resize(3);
    assert((buffer == std::vector<int>{0, 0, 0}));
    print("resize(3) 后", buffer);

    int matrix[2][3] = {{0, 1, 2}, {3, 4, 5}};
    for (int row = 0; row < 2; ++row) {
        for (int col = 0; col < 3; ++col) {
            std::cout << "matrix[" << row << "][" << col << "] = "
                      << matrix[row][col] << ", address = " << &matrix[row][col] << '\n';
        }
    }
}
