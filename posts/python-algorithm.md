---
title: "Python 高效算法设计与性能优化技巧"
date: "2026-05-12"
tag: "Python 算法"
tagClass: "tag-algo"
summary: "从时间复杂度分析到实际工程中的缓存、并行与数据结构选型，写出真正高性能的 Python。"
---

从时间复杂度分析到实际工程中的缓存、并行与数据结构选型，写出真正高性能的 Python。

## 时间复杂度不是唯一

很多开发者过度关注理论上的大 O 复杂度，却忽略了 Python 的**常数因子**往往才是瓶颈。

```python
# O(n) 但是常数巨大
result = [expensive_op(x) for x in data]

# O(n) 但是常数很小
result = list(map(cheap_op, data))
```

## 缓存——最简单的优化

Python 内置的 `functools.lru_cache` 是免费午餐：

```python
from functools import lru_cache

@lru_cache(maxsize=128)
def fibonacci(n):
    if n < 2:
        return n
    return fibonacci(n-1) + fibonacci(n-2)
```

## 数据结构选型指南

- **列表 vs 元组**：固定集合用元组，内存更小
- **集合 vs 列表**：成员检测用集合，O(1) vs O(n)
- **deque vs list**：频繁头操作用 deque

## 并行策略

对于 CPU 密集型任务，考虑 `concurrent.futures.ProcessPoolExecutor`；对于 IO 密集型，`ThreadPoolExecutor` 或 asyncio 更合适。

## 写在最后

算法优化是一个需要持续投入的领域。在交付压力面前，先保证正确性，再用 profiler 找到真正的瓶颈点，精准优化。
