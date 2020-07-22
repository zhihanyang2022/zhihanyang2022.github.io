---
layout: post
title:  "Policy Iteration in Practice"
date:   2020-07-21 11:30:00 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- toc
{:toc}
## Introduction

Algorithms introduced in Chapter 5 (Monte-Carlo methods) and Chapter 6 (TD methods) of Sutton & Barto 2018 approximate the optimal q-table to achieve control. Since these methods were a bit hard to debug and only converge in the limit, I needed a tool to compute the exact optimal q-table to evaluate their performance. Therefore, I went back to Chapter 4 (dynamic programming) and implemented the policy iteration algorithm using q-tables with this question in mind:

> Can policy iteration be used to learn optimal deterministic policies and their corresponding optimal value functions?

I also show some galleries of learned value functions in the end along with their source code.

## Book: Yes, but use either discounting or non-deterministic policy.

In many problems, our goal is to learn the optimal **deterministic** policy. This is because deterministic policies perform optimally **all the time** and thus obtain the highest reward. 

Policy iteration is an algorithmic that allows us to find the optimal policy and the optimal value function, but it has certain requirements. Here’s a quote on this from section 4.1 of Sutton & Barto 2018:

> The existence and uniqueness of $$v_{\pi}$$ are guaranteed as long as either $$\gamma < 1$$ or eventual termination is guaranteed from all states under the policy $$\pi$$.

To really understand this quote, let’s consider an **example**.

For simplicity, suppose there are only two states in a gridworld: one start state and one terminal state. The start state is on the left of the terminal state. Legal actions in non-terminal states (in this case, the start state only) are up, right, down and left and each action costs a reward of -1. After the agent arrives at the terminal state, the episode terminates and no further rewards are incurred. If the agent takes an action that makes itself outside of the gridworld, it is moved back to its last grid cell and receives a reward of -1.

To solve this problem, we store the value of each state-action pair (i.e., store the q-table) and do policy iteration.

Suppose we use $$\gamma = 1$$ and the agent’s policy is deterministic. First, we randomly initialize the q-table, which is the initial uninformed estimate of the true q-table given the environment and the policy. Then we set the agent’s policy to be greedy with respect to this q-table.

Suppose this q-table looks like this:

|    State    | Action | Q-value |
| :---------: | :----: | :-----: |
| start state |   up   |  0.15   |
| start state | right  |  -0.09  |
| start state |  down  |  0.015  |
| start state |  left  |  -0.2   |

**Policy evaluation.** First, we do policy evaluation. Note that the agent’s policy is NOT updated at all during this procedure. Let’s derive an update rule for policy evaluation. The relationship between $$V_{\pi}$$ and $$Q_\pi$$ is listed below:


$$
V_{\pi}(s) = \sum_{a} \pi(a \mid s) Q_{\pi}(s, a)
$$

$$
Q_{\pi}(s, a) = \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma V_{\pi}(s) \right]
$$



Since we store the q-table, we would like both the LHS and RHS to be expressed in terms of $$Q_\pi$$. To do this, we substitue equation 1 into equation 2 and get:


$$
Q_{\pi}(s, a) = \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma \sum_{a'} \pi(a' \mid s') Q_{\pi}(s', a') \right]
$$


which can be easily turned into the following update rule:


$$
Q_{\pi}(s, a) \leftarrow \sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma \sum_{a'} \pi(a' \mid s') Q_{\pi}(s', a') \right]
$$
---

**Problem.** Given that we are using $$\gamma =1$$ (no discounting) and a deterministic policy, the action given by the policy when the agent is in the start state is up, since (state, up) has the highest q-value (I’m intentionally doing so to illustrate the problem, but this can of course occur in practice). But moving up in start state, according to the rules of this environment, return the agent back to the start state and the story repeats for an infinite number of times. In terms of the update rule:


$$
Q_{\pi}(\text{start}, \uparrow) \leftarrow (-1) + Q_{\pi}(\text{start}, \uparrow)
$$



which clearly does not make $$Q_\pi(\text{start}, \uparrow)$$ converge and drives it to negative infinity. 

**Discounting.** Let’s consider using $$\gamma < 1$$ and a deterministic policy. The corresponding update rule looks like:


$$
Q_{\pi}(\text{start}, \uparrow) \leftarrow (-1) + \gamma Q_{\pi}(\text{start}, \uparrow)
$$


which will drive $$Q_\pi(\text{start}, \uparrow)$$ to convergence when:


$$
\begin{align}
Q_{\pi}(\text{start}, \uparrow) &= (-1) + \gamma Q_{\pi}(\text{start}, \uparrow) \\
(1 - \gamma) Q_{\pi}(\text{start}, \uparrow) &= -1 \\
Q_{\pi}(\text{start}, \uparrow) &= \frac{-1}{1-\gamma}
\end{align}
$$


**Epsilon-greedy policy.** Let’s consider using $$\gamma=1$$ and a epsilon-greedy policy (where $$\epsilon$$ is the probability of random chosing an action).


$$
Q_{\pi}(s, a) \leftarrow (-1) + (1 - \epsilon)Q_{\pi}(\text{start}, \uparrow) + \frac{\epsilon}{\mid A \mid}  \left[ Q_{\pi}(\text{start}, \uparrow) +Q_{\pi}(\text{start}, \rightarrow) + Q_{\pi}(\text{start}, \downarrow) + Q_{\pi}(\text{start}, \rightarrow) \right]
$$


If may be slightly harder to see why this update rule will drive $$Q_\pi(\text{start}, \uparrow)$$ to convergence, since $$Q_\pi(\text{start}, \uparrow)$$ also depends on the values of other state-action pairs (unlike in discounting), so this may require a proof. But assuming that policy evaluation will drive $$Q_\pi(\text{start}, \uparrow)$$ closer and closer to its true value, convergence is guaranteed as long as its true value is finite. By definition, $$Q_\pi(\text{start}, \uparrow)$$ is the expected cumulative reward of taking $$\uparrow$$ into the start state and then follow $$\pi$$. If $$\pi$$ is epsilon-greedy, then the expected length of the trajectory from the start state to the terminal state is finite, since an infinitely long trajectory (always taking the greedy action) will get zero probability, i.e., $$\lim_{n \rightarrow \infty}(1 - \epsilon)^{n} =0$$. It follows that, if a finite reward (in this case, -1) is incurred at each step on the trajectory, the true value of $$Q_\pi(\text{start}, \uparrow)$$ would be finite.

## Me: I would like to learn a deterministic policy without using discounting.

Personally, I find neither of these approaches satisfactory. 

- Discounting is mathematically convenient, but it seems to a bit artificial. For example, in the gridworld setting, without discounting, the value of state-action pair tells us the exact number of actions to take to get to terminal state, given that the reward of every action is -1; however, if we use discounting, this interpretation is not valid anymore.
- Why learn a epsilon-greedy policy when we want a greedy policy more badly?

Here are some of my attempts that use $$\gamma=1$$ and learn a deterministic policy. Both of them worked in practice.

#### Approach 1: Decay the epsilon of a epsilon-greedy policy using Robbins-Monro procedure

Start with $$\gamma=1$$ and an epsilon-greedy policy. During each policy improvement step, decay epsilon by multiplying it by a constant like 0.8 or 0.9. Check for convergence to optimal value function and optimal policy using the Bellman’s optimality equation for epsilon-greedy policies. Eventually, epsilon becomes so small so that the epsilon-greedy policy is essentially a deterministic policy.

#### Approach 2: Truncate policy evaluation

This really came as a surprise. When trying approach 1 for large gridworlds (10 by 10), I find that the first round policy evaluation takes forever, so I allowed a larger precision tolerance. The larger this tolerance was, the fast the algorithm ran. Then I thought, the use of very large policy-evaluation tolerance is essentially to truncated policy evaluation, which was mentioned briefly in the value iteration section of the book.

Out of curiosity, I tried truncated policy evaluation starting from a greedy policy directly, and everything worked like a charm! This approach converged at least 5 times faster than approach 1. My implementation alternatives between truncated policy evaluation (one value update for all state-action pairs) + policy improvement.

This might be why it works so well: truncated policy iteration relies on the fact that policy improvement can avoid a state-action pair as long as the value of that pair is lower than other pairs; it does not need to know that the return for that pair is negative infinity.







