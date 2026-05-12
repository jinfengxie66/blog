---
title: "特征工程的系统化方法与自动化工具"
date: "2026-04-28"
tag: "机器学习"
tagClass: "tag-ml"
summary: "从数据预处理、特征构造到特征选择，梳理一套可复用的特征工程体系。"
---

从数据预处理、特征构造到特征选择，梳理一套可复用的特征工程体系。

## 特征工程的三个阶段

### 1. 数据预处理

- 缺失值处理：均值/中位数填充、KNN 填充、删除
- 异常值检测：IQR 法、Z-score 法、孤立森林
- 编码：One-Hot、Label Encoding、Target Encoding

### 2. 特征构造

- 时间特征：提取年/月/日/星期/是否周末
- 文本特征：TF-IDF、词嵌入、主题模型
- 交互特征：相加、相乘、相除等组合

### 3. 特征选择

```python
from sklearn.feature_selection import SelectKBest, f_classif

selector = SelectKBest(score_func=f_classif, k=20)
X_selected = selector.fit_transform(X, y)
```

## 自动化工具

`featuretools` 可以实现深度特征合成（DFS），自动组合多表特征，大幅减少人工构造的时间。

## 总结

特征工程没有银弹。在理解业务的基础上，用自动化工具加速探索，用交叉验证去伪存真，才能构建出真正有用的特征体系。
