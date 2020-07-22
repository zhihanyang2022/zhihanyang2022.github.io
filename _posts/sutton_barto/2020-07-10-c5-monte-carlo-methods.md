---
layout: post
title:  "Sutton & Barto Chapter 5: Monte Carlo Methods"
date:   2020-07-10 10:30:00 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- toc
{:toc}
## Off-policy Prediction via Importance Sampling



## Incremental implementation

### Weighted importance sampling

#### State-value function (off-policy Monte Carlo prediction)

Suppose $$G_1, G_2, \cdots, G_{n-1}$$ are a sequence of returns starting in the same state $$S$$. Each $$G_i$$ is associated with a random weight $$W_i$$. The weighted importance sampling method states that the estimate of $$v(s)$$ is given by:
$$
\begin{align*}
V_n(s) = \frac{\sum_{k=1}^{n-1} W_k G_k}{\sum_{k=1}^{n-1}G_k}
\end{align*}
$$
where $$V_n(s)$$ is the $$n$$-th estimate of $$v(s)$$ that depends on the first $$n-1$$ returns and weights because $$V_1(s)$$ is set to be arbitrary and depends on no experiences with the environment. Since $$V_n(s)$$ has to depend on at least one return and one weight, $$n \geq 2$$ so that $$n-1 \geq 1$$.

However, if we use the update rule above, then whenever we calculate $$V_{n+1}(s)$$, we need access to $$n$$ returns and weights, which can take up large amounts of memory when the state space $$\mathcal{S}$$ is large. Therefore, we are interested in an iterative update rule, where $$V_{n+1}$$ can be determined using $$V_n(s)$$. **Solution to exercise 5.10.**
$$
\begin{align*}
V_{n+1} &= \frac{1}{\sum_{k=1}^nW_k} \sum_{k=1}^n W_k G_k\\
&= \frac{1}{\sum_{k=1}^nW_k}  \left( W_n G_n + \sum_{k=1}^{n-1} W_k G_k \right) \\
&= \frac{1}{\sum_{k=1}^nW_k} \left( W_n G_n + \left( \sum_{k=1}^{n}W_k - W_n \right) \left( \frac{1}{ \sum_{k=1}^{n}W_k - W_n} \right) \left(\sum_{k=1}^{n-1} W_k G_k \right) \right) \\
&= \frac{1}{\sum_{k=1}^nW_k} \left( W_n G_n + \left( \sum_{k=1}^{n}W_k - W_n \right)V_n \right) \\
&= \frac{1}{\sum_{k=1}^nW_k} \left( W_n G_n + V_n\sum_{k=1}^{n}W_k - V_nW_n \right) \\
&= V_n + \frac{W_n}{\sum_{k=1}^nW_k} \left( G_n - V_n\right)
\end{align*}
$$
At this point, we have found an expression of $$V_{n+1}$$ in terms of $$V_n$$, but the sum $$\sum_{k=1}^n W_k$$ still requires the memory of $$n$$ $$W_k$$’s. Therefore, we can let $$C_{n-1} = \sum_{k=1}^{n-1} W_k$$ and then $$C_n = \sum_{k=1}^{n} W_k = W_n + \sum_{k=1}^{n-1} W_k = W_n + C_{n-1}$$.

**Note. ** $$V_n$$: weighted average of $$n - 1$$ returns. $$C_n$$: sum of $$n$$ weights. Both of them use the same subcript but they each denote a different number of terms. I think $$C_n$$ is used this way so that everything in the update rule has the same subscript. For example,

For a state $$S$$, initialize $$V_1(S)$$ as arbitrary and $$C_0(S)=0$$.

- Collect a return starting from $$S$$ and a weight
- $$C_1 = W_1 + C_0$$  
- $$V_2 = V_1 + \frac{W_1}{C_1} (G_1 - V_1)$$ (the update rule)

**Conclusion.** Now organize the results of this derivation as the following algorithm.

<img src="https://i.loli.net/2020/07/11/eptx6IswSFAPcCg.png">

#### Action-value function (off-policy Monte Carlo control)

 



