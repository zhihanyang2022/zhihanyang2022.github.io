---
layout: post
title:  "TD Prediction - On- and Off-policy"
date:   2020-07-27 10:00:00 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

- toc
{:toc}
## On-policy prediction

The Bellman equation for $$v_{\pi}$$:

$$
\begin{align}
v_{\pi}(s) &= \sum_{a} \pi(a \mid s) q_{\pi}(s, a) \\
&= \sum_{a} \pi(a \mid s)\sum_{s', r} p(s', r \mid s, a) \left[ r + \gamma v_{\pi}(s') \right]
\end{align}
$$

In TD, we make both the outer and inner expectation implicit through sampling. We simply estimate the value of $$s$$ as the average of all boostrapped returns following visits to $$s$$. Note that each boostrapped return is a sample of $$R + v_{\pi}(S')$$, where $$R$$ is the reward of taking $$\pi(s)$$ in $$s$$ and $$S’$$ is the next state of taking $$\pi(s)$$ in $$s$$. The online update rule is shown below. A relevant derivation can be found in the TD Control post. 

$$
V(S) \leftarrow V(S) + \frac{1}{n} \left[ R + \gamma V(S') - V(S) \right]
$$

Since value estimates are more accurate over time, we would like to give recent updates more weight; the new online update rule is:

$$
V(S) \leftarrow V(S) + \alpha \left[ R + \gamma V(S') - V(S) \right] = (1 - \alpha) V(S) + \alpha (R + \gamma V(S'))
$$

where $$\alpha \in (0, 1]$$ is a constant stepsize, unlike $$\frac{1}{n}$$.

Finally, we arrive at the algorithm below:

![image-20200727113505484](https://i.loli.net/2020/07/28/rbXAlVI4tye1JKg.png)

## Off-policy prediction

The idea behind off-policy methods is actually strikingly simple:

- A behavior policy is used to meet all the states.
- The update rule estimates the value function with respect to the target policy.

Following this idea, we can easily design an off-policy version of TD prediction:

```
Input: an arbitrary target policy pi
Algorithm parameter: alpha in (0, 1]
Initialize V(s), for all s in S+, with V(terminal) = 0

Loop for each episode:
    b <- any policy with coverage of pi
    Loop for each step of episode:
        
        # the behavior policy is justed for visiting all states
        # we don't care about the returns
        
        A <- action given by b for S
        Take action A, observe S'
        
        # the target policy is used for actual value updates
        
        A* <- action given by pi for S
        Take action A*, observe R*, S*'
        
        V(S) <- V(S) + alpha[R* + gamma * V(S*') - V(S*)]
        
        S <- S'
        
    until S is terminal.
```

But this algorithm assumes that we can take an action in some state, and then immediately return to that state and take a different action. In general, this is not possible. To get rid of this assumption, we 1) use the reward and next state under the behavior policy in the value update formula but 2) correct that formula with a weighted importance sampling ratio to account for the fact that what we really want are samples under the target policy.

```
Input: an arbitrary target policy pi
Algorithm parameter: alpha in (0, 1]
Initialize V(s), for all s in S+, with V(terminal) = 0
Initialize, for all s in S:
    Q(S) in R
    C(S) <- 0

Loop for each episode:
    b <- ay policy with coverage of pi
    Loop for each step of episode:
        
        A <- action given by b for S
        Take action A, observe R, S'
        
        W = pi(A|S) / b(A|S)  # importance sampling ratio
        C(S) <- C(S) + W
        V(S) <- V(S) + (W / C(S))[R + gamma * V(S') - V(S)]
        
        S <- S'
        
    until S is terminal.
```

The relevant derivation of these update rules can be found in section 5.6 of Sutton & Barto (2018), although there were derived in terms of Monte Carlo methods. Unfortunately, I don’t think these update rules take into account of the fact that recent samples are more “correct” than old samples.

