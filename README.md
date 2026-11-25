# dsh-slider-fusion

推理强度滑条（reasoning effort slider）的**加强版**：在 [dsh-reasoning-effort](https://github.com/deepseek-ai) 的功能之上，叠加了 [dsh-codex-effort-slider](https://github.com/deepseek-ai) 的能量背景——拖动档位时下方的充能条会随强度点亮星云与星尘，越高越快、外发光越重。

> ⚠️ 本项目由构建产物直接改造而来（不含 `src/`），以 `lib/` 里的编译文件为源码。改造自 DeepSeek Harness 官方的 reasoning-effort 与 codex-effort-slider，原作品版权归原作者所有。

## 它长什么样

- 输入框右下角的模型选择器下方多一条**充能滑条**，按当前模型的推理档位（`off → minimal → low → medium → high → xhigh → max`）取值。
- 档位越高：填充色的**扫光速度**越快、**外发光**（glow）越重，`max` 档带一层缓慢的呼吸脉冲。
- 粒子是**干净圆点**，靠速度表现冲击力，**不做拖尾/长条**——这是刻意的设计取舍。
- 档位之间必须肉眼可辨：不会出现「high 和 max 只差一点点」的情况。

## 安装

DeepSeek Harness（桌面版 / `dsh web`）通过 profile 的 `dsh.profile.bundles` 挂载插件：

```bash
# 从本地目录挂载（开发态）
dsh plugin add link:/path/to/dsh-slider-fusion --profile desktop
```

或直接把目录放进 `node_modules` 并在 profile 的 `package.json` 里加入：

```json
{
  "dependencies": { "dsh-slider-fusion": "link:/path/to/dsh-slider-fusion" },
  "dsh": { "profile": { "bundles": ["...", "dsh-slider-fusion"] } }
}
```

装好后刷新页面（Ctrl+R）即可生效，无需重启。

## 配置

插件自身没有设置项，档位与标签全部跟随 Harness 里 provider/model 的 `reasoning` 配置：

```yaml
- id: llm-pi-ai
  config:
    providers:
      your-provider:
        efforts: { low: low, medium: medium, high: high, xhigh: xhigh, max: max }
        models:
          your-model:
            efforts: { high: high }   # 单模型覆盖
```

参数覆盖优先级：模型级 `efforts` > provider 级 `efforts` > provider API 的协议默认值。

## ACP 桥（实验特性）

配合 [dsh-ntr](https://github.com) 使用时（NTR 模式 = 由外部 ACP agent 接单），本插件会把座位让给 ACP 分支：它读取 `html[data-ntr-acp]` 标记，用 NTR 暴露的**代理源 / 模型 / 思考档位**渲染与原生完全相同的滑条 UI，提交走 `session/chat-model-set` 与 `session/chat-effort-set`。

- 需要 **dsh-ntr** 在场，单独装本插件不会出现 ACP 分支。
- 与 dsh-ntr 的让座握手基于 `globalThis.__dshModelSeatRenderer`，两边版本不匹配时可能回落到原生选择器。
- 这段是本地补丁性质，**未经上游审核**，标记为实验特性；不用 NTR 的话它不会触发。

## 兼容性

- 开发/验证环境：DeepSeek Harness 0.2.2-rc.3（desktop profile）。
- `lib/` 为预编译产物，用 `node --check` 校验语法，不依赖构建步骤。

## License

MIT
