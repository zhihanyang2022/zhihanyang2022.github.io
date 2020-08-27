---
layout: rl_post
title:  "Rollout Algorithms"
date:   2020-08-26 23:00:00 -0500
permalink: /rl/rollout_algorithms
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- toc
{:toc}
Quote from the book:

> Rollout algorithms are decision-time planning algorithms based on Monte Carlo control applied to simulated trajectories that all begin at the current environment state.

## How they work?

The basic version of the rollout algorithm is very easy to understand and implement because it doesn’t keep track of any values. Consider an agent currently in some state $$s$$ that needs to take an action $$a \in \mathcal{A}(s)$$. The agent needs to decide which action(s) is/are the best. If it is using the rollout algorithm, here’s what it would do:

```python
average_returns = []
available_actions = actions(current_state)
for action in available_actions:
    returns = []
    for _ in range(num_samples):
        return = 0
        while True:
            reward, next_state = env.step(current_state, action)
            return += reward
            if next_state in terminal_states:
                break
            current_state = next_state
            action = rollout_policy(current_state)
    		returns.append(return)
    average_return = mean(returns)
    average_returns.append(average_return)
argmax_action = available_actions[randomly_choose(argmax(average_returns))]
```

In essence, for each action, it collects and averages the returns of `num_samples` number of partial (starting from the current state-action pair) trajectories under the rollout policy. From this perspective, the rollout algorithm uses the idea of Monte Carlo learning but is obviously not a learning method because it discards the average returns and never perform any value updates.

Perhaps surprisingly, the procedure described above generalizes perfectly well to two-player games such a chess, where players take actions one after another. We simply treat the two players as one player because they would both use the same rollout policy.

## Demo using tic-tac-toe (2 player game)

In this demo, the rollout policy is a random policy, but the AI plays near optimally. Here's a relevant quote from the book:

> In some applications, a rollout algorithm can produce good performance even if the rollout policy is completely random.

1000 partial trajectories are sampled per action available. Upon the end of a trajectory, the agent checks whether it has a victory (+1 reward), a draw (0 reward) or a loss (-100 reward). The -100 reward was hand-tuned so that the agent focuses more on blocking potential wins of the human player. 

Code will be released soon.

### Human first

<iframe style="width:100%; height:300px" src="https://www.youtube.com/embed/jAJEwmlu9Vo" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>

### AI first

<iframe style="width:100%; height:300px"  src="https://www.youtube.com/embed/zdiyJqw3_oM" frameborder="0" allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"></iframe>

## Why they work?

By collecting average returns of partial trajectories, the agent has value estimates of all actions available in the current state $$s$$, $$\{q_{\pi}(s, a) \mid a \in \mathcal{A}(s)\}$$. The rollout algorithm acts greedily, i.e., picks the action that maximizes $$q_{\pi}(s, a)$$. By the policy improvement theorem, $$\max_{a'} q_{\pi}(s, a')$$ is strictly greater than $$q_{\pi}(s, \pi(s))$$ unless the rollout policy $$\pi$$ is already optimal, which means that first following the greedy action yields a higher return in expectation. As mentioned in the book,

> the aim of a rollout algorithm is to improve upon the rollout policy; not to ﬁnd an optimal policy.



