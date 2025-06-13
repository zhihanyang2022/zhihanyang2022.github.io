---
layout: post
title:  "Sutton & Barto Chapter 4: Dynamic Programming"
date:   2020-07-04 15:22:00 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- toc
{:toc}
## 4.1 Policy evaluation



<img src='https://i.loli.net/2020/07/05/CjF68HbZAtlMmwD.png'>



Notes:

- All the updates done in DP algorithms are called **expected updates** because they are based on an expectation over all possible next states rather than on a sample next state.
- The algorithm above is the **one-table implementation**; for the two-table version, we keep the new and old $$V$$’s as two tables. In practice, the one-table implementation usually converges faster because it uses new data as soon as they are available.
- The iterative policy evaluation **converges only in the limit**, so a termination condition is required.



## 4.2 Policy improvement



### Policy improvement theorem



**Theorem.** Given the state-value function of an arbitrary policy $$\pi$$, the new policy $$\pi’$$ obtained by acting greedy with respect to $$v_{\pi}$$ is guaranteed to be better than $$\pi$$, unless $$\pi$$ is already optimal. In the later case, $$\pi’$$ would be optimal, too.

**Proof.** Suppose we are in some arbitrary state $$s \in \mathcal{S}$$. The value of $$s$$ under some arbitrary policy $$\pi$$ is given by $$v_{\pi}(s)$$. Define $$\pi’(s)$$ as the new policy that acts greedily with respect $$v$$, that is,

$$
\begin{align*}
\pi'(s) 
&\triangleq \text{argmax}_{a} q_{\pi}(s, a) \\
&= \text{argmax}_{a} \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma v_{\pi}(s') \right]
\end{align*}
$$


We want to show that $$\pi’$$ is guaranteed to be better than $$\pi$$, unless $$\pi$$ is already optimal.

Because of how $$\pi’$$ is defined, it must be that $$q_{\pi}(s, \pi’(s)) \geq q_{\pi}(s, \pi(s)) = v_{\pi}(s)$$ because we have acted greedily. This is because $$\pi$$ is not necessarily greedy with respect to its own value function, which may be counter-intuitive. For an example of this, see Figure 4.1 on page 77.

Since $$s$$ was chosen arbitrarily, we have $$q_{\pi}(s, \pi’(s)) \geq v_{\pi}(s)$$ for all $$s \in \mathcal{S}$$. Then $$v_{\pi'}(s) \geq v_{\pi}(s)$$ for all $$s \in \mathcal{S}$$  by the lemma below.

Case 1. $$v_{\pi’}(s) = v_{\pi}(s)$$ for all $$s \in \mathcal{S}$$.

- Then $$v_{\pi’}(s) = \max_a \sum_{s, a} p(s’, r \mid s, a)\left[ r + \gamma v_{\pi}(s’) \right] \text{(iterative backup rule)}=\max_a \sum_{s, a} p(s’, r \mid s, a)\left[ r + \gamma v_{\pi'}(s’) \right]$$, which is the same the Bellman optimality equation. 
- Recall that the optimal value function is the unique solution to the Bellman optimality equation.
- Therefore, $$v_{\pi} = v_{\pi’} = v_{\ast} $$ (the optimal state-value function) and $$\pi=\pi’=\pi_{\ast}$$ (the optimal policy).

Case 2. $$\exists s \in \mathcal{S} (v_{\pi’}(s) > v_{\pi}(s))$$.

- $$\pi’$$ is better than $$\pi$$ because, for at least one $$s \in \mathcal{S}$$, it collects more return in expectation.



**Lemma.** If $$q_{\pi}(s, \pi’(s)) \geq v_{\pi}(s)$$ for all $$s \in \mathcal{S}$$,  then $$v_{\pi'}(s) \geq v_{\pi}(s)$$ for all $$s \in \mathcal{S}$$. 

**Proof.** 


$$
\begin{aligned} 
v_{\pi}(s) 
& \leq q_{\pi}\left(s, \pi^{\prime}(s)\right) \\ 
&\stackrel{(1)}{=}\mathbb{E}\left[R_{t+1}+\gamma v_{\pi}\left(S_{t+1}\right) \mid S_{t}=s, A_{t}=\pi^{\prime}(s)\right] \\
&\stackrel{(2)}{=}\mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma v_{\pi}\left(S_{t+1}\right) \mid S_{t}=s\right] \\
& \leq \mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma q_{\pi}\left(S_{t+1}, \pi^{\prime}\left(S_{t+1}\right)\right) \mid S_{t}=s\right] \\ 
&\stackrel{(3)}{=}\mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma \mathbb{E}_{\pi^{\prime}}\left[R_{t+2}+\gamma v_{\pi}\left(S_{t+2}\right) \mid S_{t+1} \right] \mid S_{t}=s\right] \\ 
&\stackrel{(4)}{=}\mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma R_{t+2}+\gamma^{2} v_{\pi}\left(S_{t+2}\right) \mid S_{t}=s\right] \\ 
& \leq \mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma R_{t+2}+\gamma^{2} R_{t+3}+\gamma^{3} v_{\pi}\left(S_{t+3}\right) \mid S_{t}=s\right] \\ 
& \vdots \\ 
& \leq \mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma R_{t+2}+\gamma^{2} R_{t+3}+\gamma^{3} R_{t+4}+\cdots \mid S_{t}=s\right] \\ 
&=v_{\pi^{\prime}}(s) \end{aligned}
$$


Notes:

- The way expectations are used here is quite peculiar and therefore worth discussion. 
    - Conventionally, the expectation of a discrete random variable $$X$$ is denoted by $$\mathbb{E}_{X \sim P} \left[ X \right]$$ where the subscript of the expectation tells us how to look for the probability for each value $$x$$ of $$X$$ - simply using $$P(x)$$. 
    - Here, the subscripts merely contain the probability distributions ($$\pi’(a \mid s)$$ explicitly and the 4-argument $$p(s’, r \mid s, a)$$ implicitly) that are necessary to compute the probability distribution of the random variable of interest (which is kind of lazy but neat).
        - In equation 1, $$\mathbb{E} \left[\cdot \right]$$ denotes the expected value of a random variable given the dynamics of the MDP.
        - In equation 2, $$\mathbb{E}_{\pi'} \left[\cdot \right]$$ denotes the expected value of a random variable given the dynamics of the MDP and that the agent follows policy $$\pi’$$ in the current time-step.
- Equation 3: just like what we did in equation 2 (the book made a mistake here but here it has been corrected).
- Equation 4: it may not be super intuitive how this is obtained; here are some intermediate steps that make things easier.
    - Equation a: by linearity of expectations.
    - Equation b: by the law of total expectations (or Adam’s law).
    - Equation c: by linearity of expectations.


$$
\begin{align*}
\mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma \mathbb{E}_{\pi^{\prime}}\left[R_{t+2}+\gamma v_{\pi}\left(S_{t+2}\right) \mid S_{t+1} \right] \mid S_{t}=s\right]

&\stackrel{(a)}{=} \mathbb{E}_{\pi^{\prime}}\left[R_{t+1} \mid S_t=s\right] + \gamma \mathbb{E}_{\pi^{\prime}}\left[ \mathbb{E}_{\pi^{\prime}}\left[R_{t+2}+\gamma v_{\pi}\left(S_{t+2}\right) \mid S_{t+1} \right] \mid S_t=s \right]\\

&\stackrel{(b)}{=} \mathbb{E}_{\pi^{\prime}}\left[R_{t+1} \mid S_t=s\right] + \gamma \mathbb{E}_{\pi^{\prime}}\left[R_{t+2}+\gamma v_{\pi}\left(S_{t+2}\right)\mid S_t=s \right]\\
&\stackrel{(c)}{=}\mathbb{E}_{\pi^{\prime}}\left[R_{t+1}+\gamma R_{t+2}+\gamma^{2} v_{\pi}\left(S_{t+2}\right) \mid S_{t}=s\right] \\ 
\end{align*}
$$



## 4.3 Policy iteration



### Policy iteration using the state-value function



<img src='https://i.loli.net/2020/07/05/RgFlrpceTNsMqLU.png'>



The section of the book that discusses the algorithm above is well-written:



<img src='https://i.loli.net/2020/07/05/rzJukHWjoyFapUb.png'>



Note that the policy improvement step requires full knowledge of the MDP (the 4-argument p) and easy ways to access the possible next rewards and states. This is not required for policy iteration using the action-value function - that’s why algorithms like SARSA estimates the action-value function instead of the state-value function. 



### Policy iteration using the action-value function (answer to Ex 4.5)



$$
\begin{array}{l}
\text { 1. Initialization } \\
\qquad Q(s, a) \in \mathbb{R}^2 \text { arbitrarily for all } (s, a) \in \mathcal{S} \times \mathcal{A}; \pi(s) \in \mathcal{A}(s) \text { arbitrarily for all } s \in \mathcal{S} \\
\text { 2. Policy Evaluation } \\ 
\qquad\text { Loop: } \\ 
\qquad\qquad
\begin{array}{l}
\Delta \leftarrow 0 \\ 
\text { Loop for each } (s, a) \in \mathcal{S} \times \mathcal{A} \text { : } \\
\qquad q \leftarrow Q(s, a) \\
\qquad Q(s, a) \leftarrow \sum_{s^{\prime}, r} p\left(s^{\prime}, r \mid s, a\right)\left[r+\gamma Q\left(s^{\prime}, \pi(s')\right)\right] \\ 
\Delta \leftarrow \max (\Delta,|q-Q(s, a)|) \\
\text { until } \Delta<\theta \text { (a small positive number determining the accuracy of estimation) }
\end{array} \\
% part 3: policy improvement
\begin{array}{l}
\text { 3. Policy Improvement } \\ 
\qquad
\begin{array}{l}
\text {policy-stable } \leftarrow \text { true } \\ 
\text {For each } s \in \mathcal{S} \text { : } \\ 
\qquad \begin{array}{l}
\text {old-action } \leftarrow \pi(s) \\
\pi(s) \leftarrow \arg \max _{a} Q(s, a)\\ 
\text {If old-action } \neq \pi(s) \text{ and } Q(s, \text{old-action}) \neq Q(s, \pi(s)), \text { then policy-stable } \leftarrow \text { false }
\end{array} \\
\text{If policy-stable, then stop and return } Q \approx q_{\ast} \text{ and } \pi \approx \pi_{\ast}; \text{else go to }2.
\end{array}
\end{array}
\end{array}
$$



## 4.4 Value iteration



### Value iteration using the state-value function



<img src='https://i.loli.net/2020/07/05/u6XE8QrRiflypUz.png'>



### Value iteration using the action-value function (answer to Ex 4.10)



$$
\begin{array}{l}
\text {Algorithm parameter: a small threshold } \theta>0 \text { determining accuracy of estimation } \\
\text {Initialize } Q(s, a), \text { for all } (s, a) \in \mathcal{S}^{+} \times \mathcal{A}, \text {arbitrarily except that } Q(\text {terminal}, a)=0 \text{ for all } a \text{ in } \mathcal{A}. \\ 
\text {Loop: } \\ 
\qquad \begin{array}{l}
\Delta \leftarrow 0 \\ 
\qquad \begin{array}{l}
\text {Loop for each } (s, a) \in \mathcal{S} \times \mathcal{A}: \\ 
q \leftarrow Q(s, a) \\ 
Q(s, a) \leftarrow \sum_{s^{\prime}, r} p\left(s^{\prime}, r \mid s, a\right)\left[r+\gamma \max_{a'} Q\left(s^{\prime}, a'\right)\right] \\
\end{array}\\
\end{array}\\
\text {until } \Delta<\theta \\
\text {Output a deterministic policy, } \pi \approx \pi_{*}, \text { such that } \pi(s)=\arg \max _{a} Q(s, a).
\end{array}
$$



## 4.5 Asychronous dynamic programming

**The structure of updates is more flexible.** DP algorithms are in-place iterative DP algorithms that are not organized in terms of systematic sweeps of the state set.

- These algorithms update the values of states in any order whatsoever, using whatever values of other states happen to be available. 
- The values of some states may be updated several times before the values of others are updated once.

**Convergence.** To converge correctly, however, an asynchronous algorithm must continue to update the values of all the states: it can’t ignore any state after some point in the computation.

**The exact benefit of being flexible.** Avoiding sweeps does not necessarily mean that we can get away with less computation. It just means that an algorithm does not need to get locked into any hopelessly long sweep before it can make progress improving a policy.

More specificially, asynchronous algorithms also make it easier to intermix computation with real-time interaction. The agent’s experience can be used to determine the states to which the DP algorithm applies its updates. At the same time, the latest value and policy information from the DP algorithm can guide the agent’s decision making. 

This makes it possible to <u>focus</u> the DP algorithm’s updates onto parts of the state set that are most relevant to the agent, which is a repeated theme in reinforcement learning.



## 4.6 Generalize policy iteration

**What is GPI?** The term generalized policy iteration (GPI) refer to the general idea of letting policy-evaluation and policy evaluation improvement processes interact, independent of the granularity and other details of the two processes. 

**Characteristics of GPI.** Most importantly, <u>almost all</u> reinforcement learning methods are well described as GPI because they have the follow characteristics:

- They have identiﬁable policies and value functions.
- The policy is always being improved with respect to the value function.
- The value function is always being driven toward the value function for the improved policy.
- The value function stabilizes only when it is consistent with the current policy, and the policy stabilizes only when it is greedy with respect to the current value function - we arrive at the Bellman optimality equation and both the policy and the value function are optimal.

**Theoretical value of GPI.** In some cases, GPI can be proved to converge, most notably for the classical DP methods that we have presented in this chapter. In other cases convergence has not been proved, but still the idea of GPI improves our understanding of the methods.



## 4.7 Efficiency of dynamic programming

**Complexity.** Dynamic programming may not be practical for very large problems, but compared with other methods for solving MDPs, DP methods are actually quite efficient. If we ignore a few technical details, then the (worst case) time DP methods take to ﬁnd an optimal policy is <u>polynomial in the number of states and actions</u>. 

If n and k denote the number of states and actions, this means that a DP method takes a number of computational operations that is less than some polynomial function of n and k.

**The curse of dimensionality (large state sets).** Large state sets do create diffiulties, but these are inherent difficulties of the problem, not of DP as a solution method. In fact, DP is comparatively better suited to handling large state spaces than competing methods such as direct search and linear programming.

**Asychronous methods for large state sets.** To complete even one sweep of a synchronous method requires computation and memory for every state. For some problems, even this much memory and computation is impractical, yet the problem is still potentially solvable because relatively few states occur along optimal solution trajectories. 

Asynchronous methods and other variations of GPI can be applied in such cases and may ﬁnd good or optimal policies much faster than synchronous methods can.

**Policy iteration or value iteration?** In practice, standard DP methods can be used with today’s computers to <u>solve MDPs with millions of states</u>. <u>Both policy iteration and value iteration are widely used</u>, and it is not clear which, if either, is better in general. In practice, these methods usually converge much faster than their theoretical worst-case run times, particularly if they are started with good initial value functions or policies.



