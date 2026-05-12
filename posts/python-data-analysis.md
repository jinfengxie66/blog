---
title: "Python 数据分析工作流最佳实践"
date: "2026-04-15"
tag: "数据分析"
tagClass: "tag-da"
summary: "Pandas、Polars 与 SQL 的协同使用技巧，让数据处理更高效优雅。"
---

Pandas、Polars 与 SQL 的协同使用技巧，让数据处理更高效优雅。

## Pandas 还是 Polars？

| 场景 | 推荐 |
|------|------|
| 探索性数据分析 | Pandas |
| 大规模数据处理 | Polars |
| 与数据库交互 | SQL 优先 |

## 高效 Pandas 技巧

```python
# 避免循环，用向量化操作
df['new_col'] = df['a'] + df['b']  # 快
# 而非 for idx, row in df.iterrows()  # 慢

# 链式调用
result = (df
    .query('age > 18')
    .groupby('city')
    .agg({'salary': 'mean'})
    .sort_values('salary', ascending=False)
)
```

## SQL 与 DataFrame 协作

用 `duckdb` 在 DataFrame 上直接写 SQL：

```python
import duckdb
duckdb.query("""
    SELECT city, AVG(salary)
    FROM df
    WHERE age > 18
    GROUP BY city
""")
```

## 可视化原则

- 分布：直方图、箱线图
- 关系：散点图、相关性热力图
- 趋势：折线图

选择正确的图表类型，比花哨的样式更重要。

## 总结

数据分析的核心不是工具本身，而是理解数据、提出正确的问题、并用清晰的方式呈现结论。
