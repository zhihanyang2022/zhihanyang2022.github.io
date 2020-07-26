---
layout: post
title:  "The Intuition of SARSA and Q-Learning"
date:   2020-07-25 18:00:00 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- toc
{:toc}
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

The concept of asynchronous DP from Sutton & Barto (2018):

> Asynchronous DP algorithms are in-place iterative DP algorithms that are not organized in terms of systematic sweeps of the state set. These algorithms update the values of states in any order whatsoever, using whatever values of other states happen to be available. The values of some states may be updated several times before the values of others are updated once. To converge correctly, however, an asynchronous algorithm must continue to update the values of all the states: it can’t ignore any state after some point in the computation. 

Therefore, updating the values all state-action pairs at the same frequency **(getting rid of Assumption 2)**, as done in value iteration, is not actually required for convergence. The requirement of convergence can be met simply by:

- Run a non-deterministic behavior policy (which we shall denote by $$b$$) from the starting state and sending it back to the starting state whenever it arrives in the terminal state. In other words, run this policy for an infinite number episodes. 
    - This guarantees that the behavior policy continue to encounter all state-action pairs and thus update their values, which **eliminates Assumption 1** that all state-action pairs must be known beforehand for looping.
- Update the values of each state-action pair (with respect to the target policy) whenever it is encountered by the behavior policy. 
    - The update rule can be used to evaluate a target policy (which we shall denote by $$\pi$$) that is different from the behavior policy. This is because the behavior policy, just like looping in value iteration, is merely used to encounter all state-action pairs.
        - Nevertheless, a behavior policy that assigns the most probability to actions that are also the most probable under the target policy would mean that the values of state-action pairs that are more relevant to optimal behavior are updated more frequently.

**Assumption 3 can be tackled** by making both the outer and inner expectation of the update rule implicit through sampling:

- From $$q_{\pi}(s, a) \leftarrow \sum_{s’, r} p(s’, r \mid s, a) \left[ r + \sum_{a'} \pi(a' \mid s’) q_{\pi}(s’, a’) \right]$$
- To $$q_{\pi}(s, a) \leftarrow \text{the average of all samples}$$ 
    - Each sample looks something like $$r + q_{\pi}(s’, \pi(s'))$$, where $$r$$ is the actual reward received by taking $$a$$ in $$s$$.

If $$\pi=b$$, we have SARSA. SARSA is on-policy because it is behaving according to and evaluating the same policy.

If $$\pi$$ is a greedy policy, we have Q-learning. Q-learning is off-policy because it evaluates a target policy that is different from the behavior policy used for acting.

The practical differences between SARSA and Q-learning will be addressed in the upcoming blog post.

## Pseudocode of SARSA and Q-learning

```
Initialize Q(s, a) for all (s, a) pairs with Q(terminal, .) = 0.
Initialize Sum(s, a) to be zero for all (s, a) pairs.
Initialize Count(s, a) to be 1e-16 (to avoid division by zero) for all (s, a) pairs.
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
    		Sum(s, a) += r + Q(s', a')
    		Count(s, a) += 1
    		Q = Sum / Count (element-wise)
    		s = s'
    until s is terminal.
```
The incremental implementation allows for adjustment of stepsize. However, I personally find the sampling and averaging implementation better for understanding these two algorithms.