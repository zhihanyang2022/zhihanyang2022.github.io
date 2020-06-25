---
layout: post
title:  "Notes on Policy Gradient"
date:   2020-06-23 23:02:25 -0500
categories: math
---

<script src="https://cdn.mathjax.org/mathjax/latest/MathJax.js?config=TeX-AMS-MML_HTMLorMML" type="text/javascript"></script>

* Do not remove this line (it will not be displayed)
{:toc}
## Vanilla policy gradient

The policy gradient, just like any other gradient, point to the direction of fastest increase of some objective funcion.

**Goal.** We seek to maximize the following quantity:
$$
\begin{align*}
&J(\theta)\\ 
=& \mathbb{E}_{\tau \sim \pi_\theta(\tau)} \left[ r(\tau) \right] \\
=& \mathbb{E}_{\tau \sim \pi_\theta(\tau)} \left[ \sum_{t=1}^T r(s_t, a_t) \right]
\end{align*}
$$
where:

- $$\theta$$ is the parameters of a neural network.
- $$\tau = \left\{s_1, a_1, r_1, s_2, a_2, r_2, \cdots, s_{T-1}, a_{T-1}, r_{T-1}, s_T \right\}$$ is a **finite** trajectory of alternating states, actions and rewards.
- $$\pi_{\theta}(\tau) = p(s_1) \prod_{t=1}^{T-1} \pi_\theta(a_t \mid s_t) p(s_{t+1} \mid s_t, a_t)$$ is the probability of $$\tau$$ under $$\pi_{\theta}$$.
- $$r$$ is the reward function (built-in to the environment). 

**Idea.** $$\theta_{\text{new}} = \theta_{\text{old}} + \alpha \nabla_{\theta} J(\theta)$$, now we need to consider how to evaluate $$\nabla_{\theta} J(\theta)$$.

**Derivation.** Here we derive an easy-to-evaluate form of $$\nabla_{\theta} J(\theta)$$. 

Identity 1: $$\nabla_v f(v) = f(v) \frac{\nabla_v f(v)}{f(v)}=f(v) \nabla_v \log f(v)$$


$$
\begin{align*}
\nabla_{\theta} J(\theta) 
&= \nabla_\theta \left\{ \mathbb{E}_{\tau \sim \pi_\theta(\tau)} \left[ r(\tau) \right] \right\} \\
&= \nabla_\theta \left\{ \int \pi_\theta(\tau) r(\tau) d\tau \right\} \tag*{Assume continuous environment}\\
&= \int \nabla_\theta \left\{ \pi_\theta(\tau) \right\} r(\tau) d\tau\\
&= \int \pi_\theta(\tau) \nabla_\theta \left\{ \log\pi_\theta(\tau) \right\} r(\tau) d\tau \tag*{By identity 1} \\
&= \mathbb{E}_{\tau \sim \pi_{\theta}(\tau)} \left[ \nabla_\theta \left\{ \log \pi_\theta(\tau) \right\} r(\tau) \right] \\
&= \mathbb{E}_{\tau \sim \pi_{\theta}(\tau)} \left[ \nabla_\theta \left\{ \log p(s_1) + \sum_{t=1}^{T-1} \log(\pi_\theta(a_t \mid s_t)) + \sum_{t=1}^{T-1} \log(p(s_{t+1} \mid s_t, a_t)) \right\} r(\tau) \right] \tag*{By definition of $\pi_\theta(\tau)$}\\
&= \mathbb{E}_{\tau \sim \pi_{\theta}(\tau)} \left[ \nabla_\theta \left\{\sum_{t=1}^{T-1} \log(\pi_\theta(a_t \mid s_t))\right\} r(\tau) \right] \tag*{Cancelled irrelevant terms}\\
&= 
\mathbb{E}_{\tau \sim \pi_{\theta}(\tau)} \left[ 
\underbrace{
\left( \sum_{t=1}^{T-1} \nabla_\theta \left\{ \log(\pi_\theta(a_t \mid s_t)) \right\} \right) 
}_{\text{gradient in favor of } \tau}
\underbrace{r(\tau)}_{\text{ reward of } \tau} 
\right] \\
\end{align*}
$$



In practice, this expectation can be evaluated by sampling trajectories using $\pi_{\theta}$ (does not need to be optimal).

We can interpret the purpose of this gradient as increasing the probability of high reward trajectories and decreasing the probability of low reward trajectories.

## Comparison to supervised learning

We seek to maximize the following quantity using the maximum likelihood approach:


$$
\begin{align*}
&J_{\text{ML}}(\theta) \\
=&\mathbb{E}_{\tau \sim p_{\text{train}}(\tau)}\left[\log \pi_{\theta} (\tau)\right] \\
=&\mathbb{E}_{\tau \sim p_{\text{train}}(\tau)}\left[\sum_{t=1}^T \log \pi_{\theta} (a_t \mid s_t)\right] \tag*{Cancelled irrelevant terms} \\
\end{align*}
$$

This is what we did last time in behavior cloning.

Note that the expectation is over trajectories sampled from the training distribution, not the on-policy distribution.

The easy-to-evaluate form of its gradient can be derived as follows. The important thing to note that is we no longer need to differentiate the distribution of $\tau$ w.r.t. $\theta$ anymore.

$$
\begin{align*}
\nabla_{\theta} \left\{ J_{\text{ML}}(\theta) \right\} &=\nabla_{\theta} \left\{ \mathbb{E}_{\tau \sim p_{\text{train}}(\tau)}\left[\sum_{t=1}^T \log p_{\theta} (a_t | s_t)\right]  \right\} \\
&= \nabla_{\theta} \left\{ \int p_{\text{train}}(\tau) \left[\sum_{t=1}^T \log p_{\theta} (a_t | s_t)\right] d\tau \right\} \\
&= \int  p_{\text{train}}(\tau) \nabla_{\theta} \left\{ \sum_{t=1}^T \log p_{\theta} (a_t | s_t)\right\} d\tau\\
&= \int  p_{\text{train}}(\tau) \left\{ \sum_{t=1}^T  \nabla_{\theta}\log p_{\theta} (a_t | s_t)\right\} d\tau\\
&= \mathbb{E}_{\tau \sim p_{\text{train}}(\tau)} \left[ 
\underbrace{\sum_{t=1}^T  \nabla_{\theta}\log p_{\theta} (a_t | s_t)}_{\text{gradient in favor of }\tau} 
\right]
\end{align*}
$$


The differences between behavior cloning and vanilla policy gradient are summarized below:

|        Method        |                       Policy gradient                        |            Maximum likelihood (behavior cloning)             |
| :------------------: | :----------------------------------------------------------: | :----------------------------------------------------------: |
| Function to maximize | $$J(\theta)=\mathbb{E}_{\tau \sim \pi_\theta(\tau)} \left[ \sum_{t=1}^T r(s_t, a_t) \right]$$ | $$J_{\text{ML}}(\theta) = \mathbb{E}_{\tau \sim p_{\text{train}}(\tau)}\left[\sum_{t=1}^T \log \pi_{\theta} (a_t, s_t)\right]$$ |
|       Gradient       | $$\nabla_{\theta} J(\theta) = \mathbb{E}_{\tau \sim \pi_{\theta}(\tau)} \left[ \underbrace{\left( \sum_{t=1}^{T-1} \nabla_\theta \left\{ \log(\pi_\theta(a_t \mid s_t)) \right\} \right) }_{\text{gradient in favor of } \tau}\underbrace{r(\tau)}_{\text{ reward of } \tau} \right]$$ | $$\nabla_{\theta}J_{\text{ML}}(\theta) = \mathbb{E}_{\tau \sim p_{\text{train}}(\tau)} \left[ \sum_{t=1}^T \nabla_{\theta}\log p_{\theta} (a_t, s_t) \right]$$ |
| MC gradient estimate | $$\nabla_{\theta}J(\theta) \approx \frac{1}{N} \sum_{n=1}^N \left\{ \underbrace{\left( \sum_{t=1}^{T-1} \nabla_\theta \left\{ \log(\pi_\theta(a_{n, t} \mid s_{n, t})) \right\} \right) }_{\text{gradient in favor of } \tau_n}\underbrace{r(\tau_n)}_{\text{ reward of } \tau_n} \right\}$$ | $$\nabla_{\theta}J_{\text{ML}}(\theta) \approx \frac{1}{N} \sum_{n=1}^N \left\{ \underbrace{\sum_{t=1}^T \nabla_{\theta}\log p_{\theta} (a_{n, t} \mid s_{n, t})}_{\text{gradient in favor of } \tau_n} \right\}$$ |

Notes:

- In English, $$\nabla_{\theta} J(\theta)$$ weights the gradient in favor of $$\tau_n$$ by its reward, while $$\nabla_{\theta}J_{\text{ML}}(\theta)$$ weights all gradients equally. 
- The similarity between two gradients will help us compute the policy gradient.

## Vanilla REINFORCE

- Initialize $$\theta$$. 
- Loop:
    - Sample set of $$\tau_n$$ by running $$\pi_{\theta}(a_t \mid s_t)$$ in some environment.
    - Compute $$\nabla_{\theta}J(\theta)$$ by using its MC gradient estimate rule in the table above.
    - $$\theta_{\text{new}} \leftarrow \theta_{\text{old}} + \alpha \nabla_{\theta}J(\theta)$$. (A more advanced optimizer can be used in practice.)

## Variants of vanilla REINFORCE

Reference: answer by Jerry Liu: [Why does the policy gradient method have a high variance?](https://www.quora.com/Why-does-the-policy-gradient-method-have-a-high-variance)

### Reward-to-go

Since we will be estimating policy gradients by sampling trajectories, the variance of the resulting gradients can be high. To reduce this variance, we need to eliminate as many random variables as possible from the MC gradient estimate formula. To do so, we first re-write the MC gradient estimate formula as follows:


$$
\begin{align*}
&\nabla_{\theta}J(\theta) \\
\approx& \frac{1}{N} \sum_{n=1}^N \left\{ \left( \sum_{t=1}^{T-1} \nabla_\theta \left\{ \log(\pi_\theta(a_{n, t} \mid s_{n, t})) \right\} \right) \left( \sum_{t=1}^{T-1} r(s_{n, t}, a_{n, t}) \right)\right\} \\
=& \frac{1}{N} \sum_{n=1}^N \left\{ \left( \sum_{t=1}^{T-1} \nabla_\theta \left\{ \log(\pi_\theta(a_{n, t} \mid s_{n, t})) \right\} \left( \sum_{t'=1}^{T-1} r(s_{n, t'}, a_{n, t'}) \right)\right) \right\} \\
=& \frac{1}{N} \sum_{n=1}^N \left\{ \left( \sum_{t=1}^{T-1} \nabla_\theta \left\{ \log(\pi_\theta(a_{n, t} \mid s_{n, t})) \right\} \left( \sum_{t'=t}^{T-1} r(s_{n, t'}, a_{n, t'}) \right)\right) \right\} \\
\end{align*}
$$


where we exploited causality (future actions do not impact past rewards) in the last step to remove all $$r(s_{n, t’}, a_{n, t’})$$ where $$t’ < t$$. 

To see why each reward is a random variable, consider the reward of the $$k$$-th state on the $$i$$-th sampled trajectory. Obviously, this reward, $$r(s_{i, k}, a_{i, k})$$ can be a random variable depending on the outcomes of following random processes:

- Randomness in reward (aka. the reward function itself maybe stochastic).
- Randomness in what $$s_{i, k}$$ is.
- Randomness in what $$a_{i, k}$$ is given $$s_{i, k}$$.

### Simple baseline (normalized advantages)

The reason why this trick is called “normalized advantages” is because the scalar multiplier of each gradient term can be seen as its *advantage*: if a gradient term has a larger multiplier relative to other gradient terms, a gradient-descent step benefits its objective function more than that of other gradient terms. What *normalized* mean below is described below.

Vanilla policy gradient + simple baseline:
$$
\begin{align*}
\nabla_{\theta}J(\theta) \approx \frac{1}{N} \sum_{n=1}^N \left\{ \nabla_\theta \left\{ \log\pi_\theta(\tau_{n}) \right\} \left( \frac{r(\tau_n) - \mu}{\sigma}\right) \right\}
\end{align*}
$$
where $\mu$ and $\sigma$ are the mean and standard deviation of $\left\{ r(\tau_n) \right\}$. Doing so does not change the expected value of the gradient because:
$$
\begin{align*}
&\mathbb{E}\left[ \nabla_{\theta} \left\{ \log \pi_{\theta}(\tau) b \right\} \right] \\
=& \int \pi_{\theta}(\tau) \nabla_{\theta} \left\{ \log \pi_{\theta}(\tau) b \right\} d\tau \\
=& b \int \pi_{\theta}(\tau) \nabla_{\theta} \left\{ \log \pi_{\theta}(\tau) \right\} d\tau \\
=& b \int \nabla_{\theta} \pi_{\theta}(\tau) d\tau \\
=& b \nabla_{\theta} \int \pi_{\theta}(\tau) d\tau \\
=& b \nabla_{\theta} 1 = 0
\end{align*}
$$
In practice, it is often more convenient to compute the mean and standard deviation of $\left\{ r(a_{n, t} \mid s_{n, t}) \right\}$ and normalize these. For example, in reward-to-go, there is no such thing as "the reward of an entire trajectory" because the reward assigned to each state along a trajectory is different.

In terms of performance, using this trick can drastically improve the stability of vanilla REINFORCE.

#### Intuition of subtracting mean

Suppose we sampled three trajectory and all of them yielded large positive rewards: 999, 1000, 1111. Then by the vanilla policy gradient, all three trajectories are made more likely. However, to further improve, we only care about trajectories that yield *higher-than-average* rewards. Therefore, we subtract $\mu$ from each reward. In this way, the updated rewards are: -1, 0, 1. In other words, the third trajectories is made more likely and the first trajectory is made less likely. 

#### Intuition of dividing by variance

Let's consider a hypothetical environment. This environment is initialized such that it satisfies some condition $A$. At each time-step, the agent interacts with the environment, receives an reward of 1 and observes the updated environment. This continues on until the updated environment no longer satisfies condition $A$. We force the environment to terminate after 200 time-steps.

Suppose we have a competent RL agent. Then its expected reward of each trajectory should look like this:

- Early phase of learning: very small
- Final phase of learning: close to 200 (200 time-steps in total; for each time-step, only consider the total reward in the future, according to reward-to-go)

To see why this can be a problem, consider the vanilla policy gradient:
$$
\begin{align*}
\nabla_{\theta}J(\theta) \approx \frac{1}{N} \sum_{n=1}^N \left\{ \underbrace{\nabla_\theta \left\{ \log(\pi_\theta(\tau_{n}) \right\}}_{\text{gradient term}} \underbrace{r(\tau_n)}_{\text{scalar multiplier}} \right\}
\end{align*}
$$
Each gradient term gets multiplied by a small scalar in the early phase of learning but gets multiplied by a much large scalar later on. This might be very undesirable for gradient descent, and this problem will get worse if we put a large cap on episode length. Therefore, normalization of rewards can help gradient descent perform better, provided that a proper optimizer and a proper learning rate have been chosen.

#### Analyze variance

For some trajectory $\tau_n$, its contribution to the vanilla policy gradient $\nabla_{\theta}J(\theta)$ is $\nabla_{\theta} \left\{ \log\pi_\theta(\tau_{n}) \right\} r(\tau_n)$. Since $\tau_n$ is the outcome of a random process and $\nabla_{\theta} \left\{ \log\pi_\theta(\tau_{n}) \right\} r(\tau_n)$ depends on this outcome, $\nabla_{\theta} \left\{ \log\pi_\theta(\tau_{n}) \right\} r(\tau_n)$ is the product of two random variables. The variance of two independent variables $X$ and $Y$ is $\mu_X^2 \sigma_Y^2 + \mu_Y^2 \sigma_X^2 + \sigma_X^2 \sigma_Y^2$. Assuming that $\nabla_{\theta} \left\{ \log\pi_\theta(\tau_{n}) \right\}$ and $ r(\tau_n)$ are independent, the variance of their product can be written as
$$
\begin{align*}
E[\nabla_{\theta} \left\{ \log\pi_\theta(\tau) \right\}]^2 \text{Var}[r(\tau)] + E[r(\tau)]^2 \text{Var}[\nabla_{\theta} \left\{ \log\pi_\theta(\tau_{n}) \right\}] + \text{Var}[\nabla_{\theta} \left\{ \log\pi_\theta(\tau_{n}) \right\}]\text{Var}[r(\tau)].
\end{align*}
$$
If $r(\tau_n)$ is normalized (has a mean of zero and a variance of one), the variance of their product is now
$$
\begin{align*}
E[\nabla_{\theta} \left\{ \log\pi_\theta(\tau) \right\}]^2 + 2 \text{Var}[\nabla_{\theta} \left\{ \log\pi_\theta(\tau_{n}) \right\}],
\end{align*}
$$
which is reduced. A more involved analysis can be used to select $b$ that not only reduces but also minimizes the variance.

### Optimal baseline (minimize variance)

TODO

### Neural network baseline

TODO