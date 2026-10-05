#include <algorithm>
#include <cassert>
#include <deque>
#include <iostream>
#include <queue>
#include <random>
#include <stdexcept>
#include <string>
#include <utility>
#include <vector>

void validate(const std::vector<int>& nums, int k) {
    if (k < 1 || static_cast<std::size_t>(k) > nums.size()) {
        throw std::invalid_argument("要求 1 <= k <= nums.size()");
    }
}

// 与题解相同：保存数值，保留重复值。
class MyQueue {
private:
    std::deque<int> que;

public:
    void pop(int value) {
        if (!que.empty() && value == que.front()) que.pop_front();
    }
    void push(int value) {
        while (!que.empty() && value > que.back()) que.pop_back();
        que.push_back(value);
    }
    int front() const { return que.front(); }
};

std::vector<int> maxByValues(const std::vector<int>& nums, int k) {
    validate(nums, k);
    MyQueue que;
    std::vector<int> result;
    for (int i = 0; i < k; ++i) que.push(nums[i]);
    result.push_back(que.front());
    for (int i = k; i < static_cast<int>(nums.size()); ++i) {
        que.pop(nums[i - k]);
        que.push(nums[i]);
        result.push_back(que.front());
    }
    return result;
}

// 保存下标：过期判断直接使用位置；队列数值仍保持单调。
std::vector<int> extremaByIndices(const std::vector<int>& nums, int k, bool maximum) {
    validate(nums, k);
    std::deque<int> candidates;
    std::vector<int> result;
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        while (!candidates.empty() && candidates.front() <= i - k) {
            candidates.pop_front();
        }
        while (!candidates.empty() &&
               (maximum ? nums[i] > nums[candidates.back()] : nums[i] < nums[candidates.back()])) {
            candidates.pop_back();
        }
        candidates.push_back(i);
        if (i >= k - 1) result.push_back(nums[candidates.front()]);
    }
    return result;
}

// 大顶堆也可解题：用下标识别过期堆顶，进行延迟删除。
std::vector<int> maxByHeap(const std::vector<int>& nums, int k) {
    validate(nums, k);
    std::priority_queue<std::pair<int, int>> heap;
    std::vector<int> result;
    for (int i = 0; i < static_cast<int>(nums.size()); ++i) {
        heap.push({nums[i], i});
        while (heap.top().second <= i - k) heap.pop();
        if (i >= k - 1) result.push_back(heap.top().first);
    }
    return result;
}

// 独立的暴力基准：直接扫描每个完整窗口。
std::vector<int> brute(const std::vector<int>& nums, int k, bool maximum) {
    validate(nums, k);
    std::vector<int> result;
    for (int left = 0; left + k <= static_cast<int>(nums.size()); ++left) {
        int best = nums[left];
        for (int j = left + 1; j < left + k; ++j) {
            best = maximum ? std::max(best, nums[j]) : std::min(best, nums[j]);
        }
        result.push_back(best);
    }
    return result;
}

void print(const char* label, const std::vector<int>& values) {
    std::cout << label << ": [";
    for (std::size_t i = 0; i < values.size(); ++i) {
        if (i) std::cout << ", ";
        std::cout << values[i];
    }
    std::cout << "]\n";
}

int main(int argc, char** argv) {
    const std::vector<int> nums{1, 3, -1, -3, 5, 3, 6, 7};
    const int k = 3;
    auto maxima = maxByValues(nums, k);
    assert((maxima == std::vector<int>{3, 3, 5, 5, 6, 7}));
    assert(maxima == extremaByIndices(nums, k, true));
    assert(maxima == maxByHeap(nums, k));
    print("最大值", maxima);
    print("最小值", extremaByIndices(nums, k, false));

    if (argc > 1 && std::string(argv[1]) == "--check") {
        std::mt19937 generator(239);
        std::uniform_int_distribution<int> values(-5, 5);
        int cases = 0;
        for (int n = 1; n <= 30; ++n) {
            for (int window = 1; window <= n; ++window) {
                for (int repeat = 0; repeat < 5; ++repeat) {
                    std::vector<int> a(n);
                    for (int& value : a) value = values(generator);
                    auto expectedMax = brute(a, window, true);
                    assert(maxByValues(a, window) == expectedMax);
                    assert(extremaByIndices(a, window, true) == expectedMax);
                    assert(maxByHeap(a, window) == expectedMax);
                    assert(extremaByIndices(a, window, false) == brute(a, window, false));
                    ++cases;
                }
            }
        }
        std::cout << "独立暴力对照通过：" << cases << " 组输入\n";
    }
}
