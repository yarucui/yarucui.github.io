---
title: "Watermarking of language model output"
pubDate: 2026-02-01
description: "Exploring a watermark method for Language model output."
tags: ["AI safety"]
---

# Watermarking of language model output

这篇 paper 在 **AI Safety 圈子** 影响力很大

提出了一套在生成阶段嵌入 watermark 的方法，
用统计假设检验检测模型输出来源，
并系统分析了质量、长度、对抗攻击下的有效性。

vocab size $|V|$

作者想要seek a watermark with the following properties:

- The watermark can be algorithmically detected without any knowledge of the model parameters or access to the language model API. so that it allows the detection algorithm to be open sourced, cheap and fast.
- watermark text can be generated using a standard LM without re-training
- 即使只有一部分连续的text, watermark也能被detect到
- watermark不可能被移走除非改动相当大一部分生成的tokens
- 能够严格计算出watermark被detect的置信度

### Algorithm 1 — hard blacklist watermark

对于一个prompt序列 $s^{(-N_p)} ... s^{(-1)}$ 

for $t=0,1,...$  do

1. 使用LM得到t时间在vocab上的prob分布 $p^{(t)}$.
2. 计算token s^(t-1)的hash, 然后用它去seed一个随机数生成器.
3. 用这个seed, 随机切分这个vocab到一样大小的whitelist W 和blacklist B.
4. 只从白名单W里抽样 $s^{(t)}$, 不能用黑名单生成任何token.

end

### Algorithm 2 — soft blacklist

对于一个prompt序列 $s^{(-N_p)} ... s^{(-1)}$  

白名单比例 $\gamma \in (0,1)$, 

偏置强度, $\delta > 0$

for $t=0,1,...$  do

1. 使用LM得到t时间的logit vector $l^{(t)}$
2. 同algorithm 1，计算token s^(t-1)的hash, 然后用它去seed一个随机数生成器.
3. 同algorithm 1，随机切分这个vocab到一个size $\gamma |V|$白名单W, size $(1-\gamma)|V|$的黑名单.
4. 在��个白名单里的logit加上$\delta$，在黑名单里的logit保持不变. 在这些logits使用softmax 得到在vocab上的概率分布.

![image.png](attachment:19cf1b42-9f10-4529-b692-f358b3c57f6d:image.png)

1. 用watermarked distribution $\hat{p}^{(t)}$, 抽样下一个token, $s^{(t)}$

关键：

- **低 entropy**（只有一个合理 token）
    
    → 加 δ 也改变不了排序
    
    → 几乎不影响输出
    
- **高 entropy**（多个合理候选）
    
    → δ 会显著提高 whitelist 命中率
    
    → watermark 自动“变强”
    

### Algorithm 3 —  robust private watermarking

解决问题：如果攻击者知道wtm规则，会不会针对性清洗. 具体来说，前两个算法中 黑名单只依赖于s_{t-1} 如果攻击者改了一个token 就会影响后面很多步.

核心： 算法3 让wtm依赖”secret key + 多token context” 

对于一个prompt序列 $s^{(-N_p)} ... s^{(-1)}$  

PRF $F$ with key $K$ 

hardness parameter $\delta > 0$

window width $h > 0$

for $t=0,1,...$  do

1. 正常使用LM得到t时间的logit vector $l^{(t)}$
2. vocab按照 $l^{(t)}$从大到小排列. k=0, 也就是本来应该被选中的token的index（最有可能的）
3. 暂时让$s^{(t)}$设为第k个token, 计算 $H_i= F_k(s^{(t)}, s^{(t-i)})$ for $1\leq i \leq h$.  — 一系列伪随机数
4. $i^*= \argmin_{i>0} H_i$. 
5. seed $H_i$ 生成一个随机bit来决定token k是在白名单还是黑名单 — 黑白名单生成方式变成了PRFₖ(当前候选 token, 若干历史 token)

也就是说按logits从大到小排列，依次尝试：

- 如果我选中这个token，在白名单吗
- 如果在，直接选
- 如果在黑名单， 那只要下一个损失不超过/delta 继续尝试下一个（k=k+1)  $l_{k+1}^{(t)} < l_0^{(t)} - \delta$
- 如果损失太大，就选最优token 放弃wtm

# Experiment

实验**只回答 4 个问题**：

1. **能不能被检测出来？**（sensitivity / TPR）
2. **会不会误伤人类文本？**（false positive）
3. **会不会明显降低文本质量？**（perplexity）
4. **在对抗攻击下会发生什么？**

### 一、实验整体设置

- **模型**
    - 生成模型：OPT-1.3B / OPT-6.7B
    - 质量评估模型（oracle）：更大的 OPT（避免自评偏差）
- **数据 / prompt**
    - 来自真实新闻数据（C4 / RealNewsLike）
    - 人类文本作为 prompt，模型生成 continuation
    - 模拟真实 API 输出场景
- **解码方式**
    - multinomial sampling
    - greedy decoding
    - beam search（4 / 8 beams）
    - 因为 watermark 强度强烈依赖解码策略

### 二、核心实验

1. Watermark 是否可被检测？
- 方法（本论文最大的范式贡献之一 — watermark detection = 统计假设检验）：
    - 统计白名单 token 比例
    - 用 z-score 做假设检验 TPR FPR ROC AUC
    - 固定极低 false positive（≈10⁻⁵）
- 结果：
    - watermark 文本：TPR ≈ 98–99%
    - 人类文本：几乎不被误判
- 目的：
    - 证明 watermark 是**统计上可靠的**

---

1. 需要多少 token 才能检测？ — 文本长度实验
- 设计：
    - 生成长度从几十到 200 tokens
    - 观察 z-score 随长度变化
- 结论：
    - sampling：~50–100 tokens 稳定检测
    - beam search：~25–40 tokens 即可
- 意义：
    - 支持“短文本可检测”（推文、评论）

---

1. 对文本质量的影响有多大？
- 指标：
    - Perplexity（PPL）
    - 由更大的 oracle LM 计算
- 发现：
    - watermark 会略微提高 PPL
    - 提升是有上界的、可控的
    - 高熵 / 低熵位置几乎不受影响
- 含义：
    - watermark 不会明显破坏语言流畅性

---

1. 失败案例长什么样？
- 系统展示检测失败样例
- 共同特征：
    - 低 entropy
    - 模板化文本
    - 数据记忆（如时间表、体育数据、代码）
- 后来论文**几乎都会**：
    - 明确承认这是**理论极限, 是watermark的盲区**

---

1. 对抗攻击下是否仍然有效？
- 攻击方式：
    - 用 T5-Large 自动改写文本（span replacement）
- 攻击预算：
    - ε = 改写 token 的比例（0.1 / 0.3 / 0.5 / 0.7）
- 结果：
    - ε ≤ 0.1：watermark 基本不受影响
    - ε ≈ 0.3：watermark 明显削弱
    - 但此时文本质量（PPL）严重下降
- 核心结论：
    - watermark 可被移除
    - **但高质量移除代价很高**
