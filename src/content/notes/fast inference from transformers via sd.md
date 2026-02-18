---
title: "Fast Inference from Transformers via Speculative Decoding"
pubDate: 2026-02-14
description: "This paper introduces speculative decoding, a distribution-preserving algorithm that accelerates autoregressive language model inference by using a smaller approximation model to propose tokens and verifying them in parallel with the target model via rejection sampling.."
tags: ["LLM inference acceleration", "Speculative Decoding"]
---

# Fast Inference from Transformers via Speculative Decoding

### Algorithm SD

![image-20260218204024020](C:\Users\czw67\AppData\Roaming\Typora\typora-user-images\image-20260218204024020.png)

- acceptance rule

p>q accept, otherwise accept with probability of p/q

- rejection sampling

p′(x)=normalize(max(0,p(x)−q(x)))  

Sampling continues only from the remaining probability mass.

- distribution preserving

SD preserves distribution no matter what kind of Mq such as Transformer, n-gram, random model, heuristic etc.

### proof understanding 

- DLK divergence : $DLK_{(p, q)} = 1 − \sum_x \min(p(x), q(x))$

- $\alpha = 1- E(D_{LK}(p,q)) =  overlap(p, q)$ not accuracy or draft quality, but token-level probability overlap.  
- α < 1 ⇒ stopping time bounded
- expectation of acceptance length: $E[m^*]\simeq \frac{1}{1-\alpha}$, explains why accepted token length doesn't increase with M.
- $E(\textbf{generated tokens}) = \frac{1 − α^{γ+1}}{1 − α}$ per step forward.
- walltime: improvement $\frac{1-\alpha^{\gamma+1}}{(1-\alpha)(c\gamma + 1)}$ 
  - c = Mq runtime per step / Mp runtime per step; 
  - cost: $T(c\gamma + 1)$ 

#### approximation model

speedup: $\alpha$ increases as Mq gets bigger; c increases as well. so there is a tradeoff.

they find: 

1. choosing Mq to be around two orders of magnitude smaller than Mp usually performed best

2. c=0 model unigram, bigram almost free models(c=0) still get speedup; $\alpha$ still not zero (bigram in translation task gets $\alpha \approx 0.2$)

### Experiment

- $\alpha$ is different with different tasks
- sampling strategy has an impact on $\alpha$ -- entropy :
  - argmax higher a; sampling lower a
  - temperature 1 lower a; 0 higher a

### Related work & discussion

 SD is not simply another efficiency trick.

It introduces: A stochastic generalization of speculative execution with exact distribution preservation.

Its novelty lies in combining:

- Rejection sampling
- Parallel execution
- Autoregressive decoding

However, it does not deeply analyze structural limitations of its own acceptance mechanism: a gap that later work (e.g., Judge Decoding) begins to explore.

The paper proposes several extensions:

(a) Beam Search Extension

Applying speculative decoding to beam search is possible but more complex.

(b) Custom Approximation Models

Training Mq specifically to maximize acceptance rate α could yield further gains.

(c) Hierarchical Speculation

Using multiple levels of approximation models.

(d) Adaptive γ

Dynamically adjusting the draft length γ based on predicted acceptance rates.

(e) Broader Applications

Speculative execution in other stochastic pipelines (e.g., reinforcement learning, simulation).

