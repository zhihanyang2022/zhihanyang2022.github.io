---
layout: post
title:  "SARSA and Q-Learning - Theory and Practice"
date:   2020-07-25 18:00:00 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- toc
{:toc}
# Theory

This post discusses the intuition of SARSA and Q-learning, which in my opinion is missing from Sutton & Barto (2018).

## Value iteration

To motivate the TD control algorithm, it is convenient to begin with the value iteration algorithm:

- Initialize $$Q(s, a)$$ for all $$(s, a)$$ pairs arbitrarily except that $$Q(\text{terminal}, \cdot) = 0$$.
- Loop through all $$(s, a)$$’s:
    - Do $$q_{\pi}(s, a) \leftarrow \sum_{s’, r} p(s’, r \mid s, a) \left[ r + \sum_{a'} \pi(a' \mid s’) q_{\pi}(s’, a’) \right]$$.
    - Update $$\pi$$ with respect to $$q_{\pi}(s, a)$$.
- Until $$q_{\pi}(s, a)$$ has converged to $$q_{\ast}(s, a)$$ or $$\pi$$ is stable.

The value iteration algorithm makes the following assumptions:

1. All the state-action pairs are known (otherwise we won’t be able to loop through them in an organized fashion). 
2. All state-action pairs are updated with the same frequency.
3. The dynamics of the environment $$p(s’, r \mid s, a)$$ is known.

## Asychronous dynamic programming

The concept of asynchronous DP is the bridge from value iteration to one-step temporal-difference methods. From Sutton & Barto (2018):

> Asynchronous DP algorithms are in-place iterative DP algorithms that are not organized in terms of systematic sweeps of the state set. These algorithms update the values of states in any order whatsoever, using whatever values of other states happen to be available. The values of some states may be updated several times before the values of others are updated once. To converge correctly, however, an asynchronous algorithm must continue to update the values of all the states: it can’t ignore any state after some point in the computation. 

This means that, instead of sweeping systematically, we can simply use an epsilon-greedy policy to “encounter” all state-action pairs and update their value as they are encountered. **Assumption 1 and 2 are removed.**

The update rule can be used to evaluate a target policy (which we shall denote by $$\pi$$) that is different from the behavior policy (which we shall denote by $$b$$). This is because the mere purpose of the behavior policy, just like systematic sweeping in value iteration, is to encounter all state-action pairs.

Nevertheless, a behavior policy that assigns the most probability to actions that are also the most probable under the target policy would visit the state-action pairs that are more relevant to optimal behavior more often.

**Assumption 3 can be removed** by making both the outer and inner expectation of the update rule implicit through sampling:

- Previously: $$q_{\pi}(s, a) \leftarrow \sum_{s’, r} p(s’, r \mid s, a) \left[ r + \sum_{a'} \pi(a' \mid s’) q_{\pi}(s’, a’) \right]$$
- Now: $$q_{\pi}(s, a) \leftarrow \text{the average of all samples (with more weight given to recent ones)}$$ 
    - Each sample looks like $$r + q_{\pi}(s’, \pi(s'))$$, where $$r$$ is the actual reward received by taking $$a$$ in $$s$$ and $$s’$$ is the actual next state reached by the policy by taking $$a$$ in $$s$$. For convenience, let’s just call this the Bellman sample.

If $$b=\pi$$, we have SARSA. SARSA is on-policy because it is behaving according to and evaluating the same policy.

If $$\pi$$ is a greedy policy, we have Q-learning. Q-learning is off-policy because it evaluates a target policy that is different from the behavior policy used for acting.

The practical differences between SARSA and Q-learning will be addressed later in this post.

# Practice

## Incremental implementation

Before outlining the pseudocode of SARSA and Q-learning, we first consider how to update an average $$A_{n+1}$$ in an online fashion using an one-step-older average $$A_n$$ and a newly available sample $$a_{n}$$. 

$$
\begin{align*}
A_{n+1} &= \frac{1}{n} \sum_{i=1}^n a_i \\
&= \frac{1}{n} \left( a_n + \sum_{i=1}^{n-1} a_i \right) \\
&= \frac{1}{n} \left( a_n + (n-1) \frac{1}{n-1} \sum_{i=1}^{n-1} a_i \right) \\
&= \frac{1}{n} \left( a_n + (n-1) A_{n} \right) \\
&= \frac{1}{n} \left( a_n + nA_{n} - A_n \right) \\
&= A_{n} + \frac{1}{n} \left[ a_n - A_n \right] \\
\end{align*}
$$

The assumption made by the incremental implementation above is that all samples are obtained from the distribution whose mean is what we want to estimate. Under the framework of general policy iteration, the distribution of returns is always changing since we alternate between evaluating the value function of the current policy and improving the current policy by setting the most probable action to be greedy to that value function. As a result, recent Bellman samples are more relevant than old ones. Therefore, we want to give newer updates more weight. This can be done by changing $$\frac{1}{n}$$ to a constant stepsize $$\alpha$$ that lies within the interval (0, 1]:

$$
\begin{align*}
A_{n+1} \leftarrow A_n + \alpha (a_n - A_n) 
\end{align*}
$$

Here’s a perhaps more intuitive way of rewriting this update rule:

$$
\begin{align*}
A_{n+1} \leftarrow (1 - \alpha) A_n + \alpha a_n
\end{align*}
$$

## Pseudocode of SARSA and Q-learning

```
Initialize Q(s, a) for all (s, a) pairs with Q(terminal, .) = 0.
Set alpha.
Set mode to either SARSA or Q-learning.

Loop for each episode:
    Initialize s to be the starting state.
    Loop:
        
        Choose a from the epsilon-greedy policy derived from Q.
        Take action a, observe s' and r.
            
        If mode is SARSA:
             Choose a' from the epsilon-greedy policy derived from Q.
        If mode is Q-learning:
             Choose a' from the greedy policy derived from Q.
            
        Bellman sample = r + Q(s', a')
        
        Q(s, a) = (1 - alpha) * Q(s, a) + alpha * Bellman sample

        s = s'
    
    until s is terminal.
```