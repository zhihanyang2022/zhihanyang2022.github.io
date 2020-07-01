---
layout: post
title:  “Sutton 2019 C3 Markov Decision Process"
date:   2020-07-01 18:00:00 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- sd
{:toc}
## 3.1 Agent-environment interface

**Dynamics of MDP.** Let $$p:\mathcal{S} \times \mathcal{R} \times \mathcal{S} \times \mathcal{A} \to \left[0, 1\right]$$ be defined as $$p(s', r \mid s, a ) = \Pr \left\{ S_t=s', R_t=r \mid S_{t-1} = s, A_{t-1} =a \right\}$$.



## 3.2 Goals and rewards

**The reward hypothesis.** That all of what we mean by goals and purposes can be well thought of as the maximization of the expected value of the cumulative sum of a received scalar signal (called reward).



## 3.3 Returns and episodes

**Expected return (episodic tasks).** $$G_t = R_{t+1} + R_{t+2} + \cdots + R_{T}$$

**Expected return (continuing tasks).** 

There are three equivalent expressions:


$$
\begin{align*}
G_t &= R_{t+1} + \gamma R_{t+2} + \gamma^2 R_{t+3} + \cdots = \sum_{k=0}^{\infty} \gamma^{k}R_{t+k+1} = R_{t+1} + \gamma G_{t+1}
\end{align*}
$$


If the reward received at each time-step is just one, then $$G_t = \sum_{k=0}^{\infty}\gamma^k = \frac{1}{1 - \gamma}$$.



## 3.5 Policies and value functions

**Policy.** A function that maps from $$\mathcal{S} \times \mathcal{A}$$ to $$\left[0, 1\right]$$ and is denoted by $$\pi$$.

**State-value function.** The state-value function of a policy (denoted by $$v_{\pi}$$) maps each <u>state</u> to the expected return of starting in that state and following $$\pi$$. 


$$
\begin{align*}
v_{\pi}(s) = \mathbb{E}_{\pi} \left[ G_t | S_t=s\right]
\end{align*}
$$


**Action-value function.** The action-value function of a policy (denoted by $$q_{\pi}$$ maps each <u>state-action pair</u> to the expected return of starting in that state, taking that action and then following $$\pi$$.


$$
\begin{align*}
q_{\pi}(s, a) = \mathbb{E}_{\pi} \left[ G_t | S_t=s, A_t = a \right]
\end{align*}
$$


**Recursive definitions of $$v_{\pi}$$ and $$q_{\pi}$$ in terms of $$v_{\pi}$$ and $$q_{\pi}$$.** Discrete state, action and reward spaces are assumed for convenience. I’ve also included the cases of where $$\pi$$ is the optimal policy; in those cases, $$\pi$$ is replace with $$\ast$$.

---

Express $$v_{\pi}(s)$$ in terms of $$q_{\pi}(s, a)$$:


$$
\begin{align*}
v_{\pi}(s) &= \mathbb{E}_{a \sim \pi(s)} \left[ q_{\pi}(s, a) \right] \\
&= \sum_{a \in \mathcal{A}} \pi(a \mid s) q_{\pi}(s, a)
\end{align*}
$$


Express $$v_{\ast}(s)$$ in terms of $$q_{\ast}(s, a)$$:


$$
\begin{align*}
v_{\ast}(s) &= \max_{a \in \mathcal{A}} q_{\pi}(s, a) \\
\end{align*}
$$

---

Express $$q_{\pi}(s, a)$$ in terms of $$v_{\pi}(s)$$:


$$
\begin{align*}
q_{\pi}(s, a) &= \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma v_{\pi}(s')\right] \\
&= \sum_{s'\in \mathcal{S}, r \in \mathcal{R}} p(s’, r \mid s, a) \left[ r + \gamma v_{\pi}(s') \right]
\end{align*}
$$


Express $$q_{\ast}(s, a)$$ in terms of $$v_{\ast}(s)$$:


$$
\begin{align*}
q_{\ast}(s, a) &= \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma v_{\ast}(s')\right] \\
&= \sum_{s'\in \mathcal{S}, r \in \mathcal{R}} p(s’, r \mid s, a) \left[ r + \gamma v_{\ast}(s') \right]
\end{align*}
$$

---

By nesting the two identities above, we can easily demonstrate the following two identities.

---

Express $v_{\pi}(s)$ in terms of $v_{\pi}(s)$:


$$
\begin{align*}
v_{\pi}(s) &= \mathbb{E}_{a \sim \pi(s)} \left[ q_{\pi}(s, a) \right] \\
&= \mathbb{E}_{a \sim \pi(s)} \left[ \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma v_{\pi}(s')\right] \right]\\
&= \sum_{a \in \mathcal{A}(s)} \pi(a \mid s) \sum_{s’ \in \mathcal{S}, r \in \mathcal{R}} p(s’, r \mid s, a)\left[ r + \gamma v_{\pi}(s’) \right]
\end{align*}
$$


Express  $$v_{\ast}(s)$$ in terms of  $$v_{\ast}(s)$$:
$$
\begin{align*}
v_{\ast}(s) &= \max_{a \in \mathcal{A}} q_{\ast}(s, a) \\
&= \max_{a \in \mathcal{A}} \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma v_{\ast}(s')\right]\\
&= \max_{a \in \mathcal{A}} \sum_{s’ \in \mathcal{S}, r \in \mathcal{R}} p(s’, r \mid s, a)\left[ r + \gamma v_{\ast}(s’) \right]
\end{align*}
$$

---

Express $$q_{\pi}(s, a)$$ in terms of $$q_{\pi}(s, a)$$:


$$
\begin{align*}
q_{\pi}(s, a) &= \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma v_{\pi}(s')\right] \\
&= \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma \mathbb{E}_{a' \sim \pi(s')} \left[ q_{\pi}(s', a') \right] \right] \\
&= \sum_{s'\in \mathcal{S}, r \in \mathcal{R}} p(s’, r \mid s, a) \left[ r + \gamma \sum_{a' \in \mathcal{A}} \pi(a' \mid s') q_{\pi}(s', a') \right]
\end{align*}
$$


Express $$q_{\ast}(s, a)$$ in terms of $$q_{\ast}(s, a)$$:


$$
\begin{align*}
q_{\ast}(s, a) &= \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma v_{\ast}(s')\right] \\
&= \mathbb{E}_{(s', r) \sim p(s', r|s, a)} \left[ r + \gamma \max_{a \in \mathcal{A}} q_{\pi}(s', a') \right] \\
&= \sum_{s'\in \mathcal{S}, r \in \mathcal{R}} p(s’, r \mid s, a) \left[ r + \gamma \max_{a \in \mathcal{A}} q_{\pi}(s', a') \right]
\end{align*}
$$

---

All the identities above will prove to be very useful in understanding the motivation of deep RL algorithms.



## 3.6 Optimal policies and optimal value functions

**Optimal state-value function.** $$v_{\ast}(s)=\max_{\pi} v_{\pi}(s)$$ for all $$s \in \mathcal{S}$$.

**Optimal action-value function.** $$q_{\ast}(s, a) = \max_{\pi} q_{\pi}(s, a)$$ for all $$s \in \mathcal{S}$$ and $$a \in \mathcal{A}$$.

**Recusive definitions of $$v_{\ast}(s)$$ and $$q_{\ast}(s, a)$$ in terms of $$v_{\ast}(s)$$ and $$q_{\ast}(s, a)$$.** Shown in the previous section for convenience.

