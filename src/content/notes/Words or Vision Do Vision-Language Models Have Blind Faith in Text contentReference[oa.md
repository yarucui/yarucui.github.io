---
title: "Words or Vision: Do Vision-Language Models Have Blind Faith in Text?"
pubDate: 2026-02-12
description: "Exploring hallucination in VLM."
tags: ["Vision Language Model"]
---
---

## 1. What this paper is about (main idea)

This paper studies a simple but important question:

> When image and text give different information, which one do Vision-Language Models (VLMs) trust more?

The authors find that many VLMs show a strong **“blind faith in text”**.  
That means:  
When text and image are inconsistent, the model often believes the text, even if the image shows something else.

For example (shown in the paper),  
the image has green pepper on a pizza,  
but the text says it has broccoli.  
Many models answer “broccoli”. :contentReference[oaicite:1]{index=1}  

This shows the model trusts text more than vision.

---

## 2. How they test this problem

They design three types of text:

1. **Match** – text is correct and helpful  
2. **Corruption** – text is wrong but looks reasonable  
3. **Irrelevance** – text is unrelated  

Then they test many models (both open-source and proprietary) on four tasks:
- VQAv2 (general VQA)
- DocVQA
- MathVista
- Brand detection (real-world setting) :contentReference[oaicite:2]{index=2}  

They measure:
- Accuracy
- Text Preference Ratio (TPR)  
  (how often the model chooses text-based answer instead of image-based answer)

When text is corrupted, many models still follow the text.  
Accuracy drops a lot. :contentReference[oaicite:3]{index=3}  

---

## 3. Main findings

### (1) Models really prefer text

When text and image disagree, most models choose text.  
This is very clear in the corruption case. :contentReference[oaicite:4]{index=4}  

Open-source models show stronger text bias than proprietary models.

---

### (2) Performance drops a lot under corrupted text

When the text is wrong, model accuracy decreases significantly. :contentReference[oaicite:5]{index=5}  

This is dangerous in real applications.

In the brand detection task, if the HTML text is manipulated (like phishing attack),  
some models fail badly. :contentReference[oaicite:6]{index=6}  

So this is not only academic, but also related to safety.

---

### (3) What affects text bias?

They study several factors:

- **Instruction prompts**  
  Saying “focus on image” helps a little, but not much.

- **Model size**  
  Larger models are slightly better, but not fully solved.

- **Text relevance**  
  If the text looks relevant, models trust it more.

- **Token order**  
  If text tokens come before image tokens, bias becomes stronger.

- **Certainty of each modality**  
  If text confidence is high and image confidence is low, model prefers text.

This part is very interesting because it shows bias is not random. :contentReference[oaicite:7]{index=7}  

---

### (4) Can we fix it?

They try **supervised fine-tuning (SFT)** with special data.

After fine-tuning with matched + corrupted + irrelevant text examples,  
text bias reduces a lot. :contentReference[oaicite:8]{index=8}  

So training data balance is important.

They also give a theoretical explanation:  
Because VLMs are built on large language models,  
they have much more pure text training than multi-modal training. :contentReference[oaicite:9]{index=9}  

So naturally, they trust text more.

---

## 4. What I learned

1. Just because a model is “multimodal” does not mean it really balances both modalities.
2. Evaluation should not only test accuracy, but also test **robustness under inconsistency**.
3. Text can act like an “adversarial signal” in multimodal systems.
4. Training data composition (text-only vs multimodal) is very important.
5. Simple instruction prompting is not enough to fix deep bias.

Before reading this paper, I thought hallucination was mainly about image mistakes.  
Now I realize that **text itself can cause hallucination**.

---

## 5. My reflections (as a beginner)

### This paper is very clean and simple

The idea is simple:
Just change the text and see what happens.

But the result is powerful.

It shows a structural weakness in current VLMs.

---

### I feel this connects to video LLM reasoning

In video:
- Information is longer
- More uncertainty
- More chance to rely on language shortcut

So maybe video models also have similar bias.

---

### I wonder:

- If we remove text completely, does performance improve?
- In long videos, does text bias become stronger?
- Can we measure “causal reliance” instead of just answer matching?

---

### One small weakness (in my opinion)

They mostly test VQA-style tasks.  
Maybe real-world reasoning tasks (long videos, agents) are even more complicated.

---

## 6. Simple conclusion (my own summary)

This paper shows that:

> Vision-Language Models often trust text more than vision, even when text is wrong.

This leads to performance drop and safety risks.

To make VLMs more reliable,  
we need better training balance and better evaluation methods.

---

(As a master student new to this area, I feel this paper is very helpful for understanding multimodal bias. It also gives me ideas about studying modality conflict in video models.)
