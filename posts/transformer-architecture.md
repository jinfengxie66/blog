---
title: "Transformer 架构逐层拆解与实现"
date: "2026-05-02"
tag: "深度学习"
tagClass: "tag-dl"
summary: "用 PyTorch 从零实现一个 Transformer，彻底理解自注意力与位置编码。"
---

用 PyTorch 从零实现一个 Transformer，彻底理解自注意力与位置编码。

## 自注意力机制

自注意力是 Transformer 的灵魂。核心公式：

```
Attention(Q, K, V) = softmax(QK^T / √d_k) V
```

每一层的计算步骤：

1. 线性映射生成 Q、K、V
2. 计算注意力分数并缩放
3. softmax 归一化
4. 加权求和

## 多头注意力

```python
class MultiHeadAttention(nn.Module):
    def __init__(self, d_model, n_heads):
        super().__init__()
        self.heads = nn.ModuleList([
            AttentionHead(d_model) for _ in range(n_heads)
        ])
        self.out_proj = nn.Linear(d_model, d_model)
```

## 位置编码

由于注意力机制本身不感知顺序，位置编码是必需的：

- **正弦位置编码**：固定的三角函数
- **可学习位置编码**：作为参数参与训练
- **RoPE**：旋转位置编码，当前主流

## 实战 Tips

- Pre-LN（层归一化在前）比 Post-LN 更稳定
- 使用 flash-attention 大幅降低显存占用
- 梯度累积突破小 batch 限制
