---
title: "Judge Decoding: Faster Speculative Sampling Requires Going Beyond Model Alignment"
pubDate: 2026-02-11
description: "This paper investigates the verification mechanism in Speculative Decoding and identifies alignment-based verification scheme as the primary bottleneck to speedup, and introduces correctness-aware verification scheme to overcome this limitation"
tags: ["Speculative Decoding", "LLM inference acceleration"]
---

#### Motivation in this paper:

Verification in standard SD is alignment-based, not correctness-based. Many high-quality draft tokens are rejected. Acceptance length quickly saturates. Speedup is fundamentally limited.

#### Key Question:
Can we adapt verification to assess token correctness rather than strict alignment?

The authors introduce Judge Decoding

#### Judge Decoding:

- Use target model embeddings to detect whether a token is contextually correct.
- Train a small linear classifier ("judge head") on top of target embeddings.
- Accept tokens if either:
  - Standard SD accepts them (alignment-based), or
  - The judge head predicts correctness.

Formally:

$z_{\text{standard}} \lor z_{\text{judge}}$



#### Experimental Findings

- Acceptance Length: JD increases average accepted tokens from ~6 to ~19–20 in large-model settings. This directly increases speedup.

- Accuracy Preservation: Across benchmarks 

  - Judge Decoding maintains nearly identical accuracy to the target model.

  - Simple relaxed baselines (e.g., top-K verification) significantly degrade performance.

​	This demonstrates that correctness-based verification is more selective than naive relaxation.

- Speed Improvements: With Llama-8B drafting for Llama-405B: Up to **9× speedup**; ~129 tokens/s in optimized inference frameworks. JD benefits especially when:

  - The target model is very large

  - The draft model is strong

  - Many tokens can be accepted per step

#### Key insights:

Embeddings Contain Error Signals

Trade-off Loss of Theoretical Guarantee



#### Limitations:

No strict mathematical guarantee of distribution preservation.

Requires a reasonably strong draft model.

Requires small supervised dataset to train the judge.

May not generalize perfectly to unseen task domains.

