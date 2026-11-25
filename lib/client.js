window.__ModuleLoader__.load({
	id: "dsh-slider-fusion",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		let react = require("react");
		let react_jsx_runtime = require("react/jsx-runtime");
		//#region src/client/ReasoningBar.tsx
		function groupLabel(group) {
			const namedGroup = group;
			return namedGroup.name ?? namedGroup.label ?? namedGroup.title ?? group.id;
		}
		function modelFor(state) {
			const current = state.current;
			if (current === null) return void 0;
			for (const group of state.groups) {
				if (group.id !== current.provider) continue;
				const model = group.models.find((candidate) => candidate.id === current.model);
				if (model !== void 0) return {
					current,
					group,
					model
				};
			}
		}
		function clamp(value, min, max) {
			return Math.max(min, Math.min(max, value));
		}
		const DSF_STARS = 18;
		function dsfClamp01(value) {
			return Math.max(0, Math.min(1, value));
		}
		function dsfHash(index, salt) {
			const raw = Math.sin((index + 1) * 12.9898 + salt * 78.233) * 43758.5453;
			return raw - Math.floor(raw);
		}
		/** 位置(0..1) -> 能量(0..1)：1/3 处开始通电，最高档为 1。 */
		function dsfEnergyFor(ratio) {
			return dsfClamp01((dsfClamp01(ratio) - 1 / 3) / (2 / 3));
		}
		/** 能量 -> 填充右端的颜色：从蓝渐变到紫。 */
		function dsfMixRGB(energy) {
			const from = [61, 141, 247];
			const to = [168, 85, 247];
			return from.map((value, index) => Math.round(value + (to[index] - value) * energy));
		}
		function dsfMixColor(energy) {
			const channels = dsfMixRGB(energy);
			return "rgb(" + channels[0] + " " + channels[1] + " " + channels[2] + ")";
		}
		/** A Codex-style thick, pointer-draggable discrete slider. */
		function EffortSlider({ efforts, index, disabled, onChange, onCommit }) {
			const trackRef = (0, react.useRef)(null);
			const draggingRef = (0, react.useRef)(false);
			const [dragging, setDragging] = (0, react.useState)(false);
			const lastIndex = Math.max(1, efforts.length - 1);
			const shownIndex = clamp(Math.round(index), 0, lastIndex);
			const positionForIndex = (value) => {
				const ratio = efforts.length <= 1 ? 0 : clamp(value / lastIndex, 0, 1);
				const percent = ratio * 100;
				const offset = 15 - 30 * ratio;
				const sign = offset < 0 ? "- " : "+ ";
				return "calc(" + percent + "% " + sign + Math.abs(offset) + "px)";
			};
			const positionFor = (clientX) => {
				const track = trackRef.current;
				if (track === null || efforts.length <= 1) return 0;
				const rect = track.getBoundingClientRect();
				return clamp((clientX - rect.left - 30) / Math.max(1, rect.width - 60) * lastIndex, 0, lastIndex);
			};
			const snap = (position) => clamp(Math.round(position), 0, lastIndex);
			const energy = dsfEnergyFor(efforts.length <= 1 ? 1 : shownIndex / lastIndex);
			const fillBackground = "linear-gradient(90deg,#339cff 0%," + dsfMixColor(energy) + " 100%)";
			const glowEnergy = dsfClamp01(energy);
			const glowChannels = dsfMixRGB(glowEnergy);
			const glowRGB = glowChannels[0] + " " + glowChannels[1] + " " + glowChannels[2];
			const glowSpread = Math.round(6 + 24 * glowEnergy);
			const glowOpacity = (0.92 * glowEnergy * glowEnergy).toFixed(3);
			const glowShadow = "0 0 " + glowSpread + "px rgb(" + glowRGB + " / 68%), 0 0 " + Math.round(glowSpread * 2.2) + "px rgb(" + glowRGB + " / 34%)";
			const sweepDuration = (2.6 - 1.4 * glowEnergy).toFixed(2) + "s";
			const starNodes = [];
			for (let starIndex = 0; starIndex < DSF_STARS; starIndex += 1) {
				const threshold = starIndex / DSF_STARS * 0.82;
				const reveal = dsfClamp01((energy - threshold) / 0.26);
				const brightness = 0.55 + 0.45 * dsfHash(starIndex, 3);
				const duration = (2.6 + 2.2 * dsfHash(starIndex, 7)) * (1 - 0.72 * glowEnergy);
				const delay = -duration * dsfHash(starIndex, 11);
				const streak = (1 + 16 * glowEnergy * (0.55 + 0.45 * dsfHash(starIndex, 23))).toFixed(1) + "px";
				starNodes.push((0, react_jsx_runtime.jsx)("span", {
					className: "dsh-slider-fusion__star",
					style: {
						top: (6 + 88 * dsfHash(starIndex, 17)).toFixed(1) + "%",
						animationDuration: duration.toFixed(2) + "s",
						animationDelay: delay.toFixed(2) + "s"
					},
					children: (0, react_jsx_runtime.jsx)("span", {
						className: "dsh-slider-fusion__star-dot",
						style: {
							"--dsf-b": brightness.toFixed(2),
							"--dsf-len": streak,
							opacity: reveal.toFixed(3)
						}
					})
				}, "star-" + starIndex));
			}
			const onPointerDown = (event) => {
				if (disabled) return;
				event.preventDefault();
				event.currentTarget.setPointerCapture(event.pointerId);
				draggingRef.current = true;
				setDragging(true);
				onChange(snap(positionFor(event.clientX)));
			};
			const onPointerMove = (event) => {
				if (!draggingRef.current) return;
				onChange(snap(positionFor(event.clientX)));
			};
			const finishPointer = (event) => {
				if (!draggingRef.current) return;
				const next = snap(positionFor(event.clientX));
				draggingRef.current = false;
				setDragging(false);
				onChange(next);
				onCommit(next);
				if (event.currentTarget.hasPointerCapture(event.pointerId)) event.currentTarget.releasePointerCapture(event.pointerId);
			};
			const onKeyDown = (event) => {
				if (disabled) return;
				const direction = event.key === "ArrowRight" || event.key === "ArrowUp" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowDown" ? -1 : 0;
				if (direction === 0) return;
				event.preventDefault();
				const next = clamp(shownIndex + direction, 0, lastIndex);
				onChange(next);
				onCommit(next);
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
				ref: trackRef,
				className: "dsh-slider-fusion__slider",
				"data-dragging": dragging,
				role: "slider",
				tabIndex: disabled ? -1 : 0,
				"aria-label": "推理等级",
				"aria-valuemin": 0,
				"aria-valuemax": lastIndex,
				"aria-valuenow": shownIndex,
				"aria-valuetext": efforts[shownIndex]?.name ?? "",
				onPointerDown,
				onPointerMove,
				onPointerUp: finishPointer,
				onPointerCancel: finishPointer,
				onKeyDown,
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-slider-fusion__range",
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { className: "dsh-slider-fusion__rail" }),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-slider-fusion__glow",
							"aria-hidden": "true",
							style: { opacity: glowOpacity, boxShadow: glowShadow }
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-slider-fusion__fill",
							style: {
								width: positionForIndex(shownIndex),
								background: fillBackground,
								"--dsf-energy": energy.toFixed(3)
							},
							children: [
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-slider-fusion__energy",
									style: { "--dsf-sweep": sweepDuration }
								}),
								/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
									className: "dsh-slider-fusion__stars",
									children: starNodes
								})
							]
						}),
						efforts.map((effort, effortIndex) => /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-slider-fusion__tick",
							"data-active": effortIndex <= shownIndex,
							"data-major": effortIndex === shownIndex,
							style: { left: positionForIndex(effortIndex) },
							title: effort.description
						}, effort.id)),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-slider-fusion__thumb",
							style: { left: positionForIndex(shownIndex) }
						})
					]
				})
			});
		}
		function BoltIcon() {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dsh-slider-model__bolt",
				viewBox: "0 0 24 24",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "M13.2 2.7 5.5 13h5.1l-.8 8.3L18.5 11h-5.1l-.2-8.3Z",
					fill: "currentColor"
				})
			});
		}
		function ChevronIcon({ open }) {
			return /* @__PURE__ */ (0, react_jsx_runtime.jsx)("svg", {
				className: "dsh-slider-model__chevron",
				"data-open": open,
				viewBox: "0 0 24 24",
				"aria-hidden": "true",
				children: /* @__PURE__ */ (0, react_jsx_runtime.jsx)("path", {
					d: "m7 9 5 5 5-5",
					fill: "none",
					stroke: "currentColor",
					strokeWidth: "2.2",
					strokeLinecap: "round",
					strokeLinejoin: "round"
				})
			});
		}
		/** Model seat replacement: model name, Chinese effort label, and the thick Codex-style slider. */
		function ReasoningBar({ locked, directory, load, select, t }) {
			const state = (0, react.useSyncExternalStore)((listener) => directory.subscribe(listener), () => directory.getSnapshot());
			const [open, setOpen] = (0, react.useState)(false);
			const [pendingEffort, setPendingEffort] = (0, react.useState)(null);
			const [pendingModel, setPendingModel] = (0, react.useState)(null);
			const [committing, setCommitting] = (0, react.useState)(false);
			const [modelsScrolling, setModelsScrolling] = (0, react.useState)(false);
			const [expandedProviders, setExpandedProviders] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const rootRef = (0, react.useRef)(null);
			const modelScrollTimerRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				load();
			}, [load]);
			(0, react.useEffect)(() => () => {
				if (modelScrollTimerRef.current !== null) window.clearTimeout(modelScrollTimerRef.current);
			}, []);
			const currentModel = (0, react.useMemo)(() => modelFor(state), [state]);
			const visibleGroup = pendingModel?.group ?? currentModel?.group;
			const visibleModel = pendingModel?.model ?? currentModel?.model;
			const reasoning = visibleModel?.reasoning;
			const efforts = reasoning?.efforts ?? [];
			const fallbackEffort = reasoning?.defaultEffort ?? efforts[Math.floor(efforts.length / 2)]?.id;
			const selectedId = pendingModel === null ? state.current?.reasoningEffort ?? fallbackEffort : pendingModel.effortId ?? fallbackEffort;
			const selectedIndex = Math.max(0, efforts.findIndex((effort) => effort.id === selectedId));
			const selected = efforts[selectedIndex];
			const visibleModelKey = visibleModel === void 0 || visibleGroup === void 0 ? void 0 : visibleGroup.id + ":" + visibleModel.id + ":" + efforts.map((effort) => effort.id).join(",");
			const displayIndex = pendingEffort !== null && pendingEffort.modelKey === visibleModelKey && pendingEffort.effortId !== selected?.id && state.error === null ? clamp(pendingEffort.index, 0, Math.max(0, efforts.length - 1)) : selectedIndex;
			const displaySelected = efforts[displayIndex];
			const isMax = efforts.length > 1 && displayIndex === efforts.length - 1;
			const busy = locked === true || committing || state.status === "selecting";
			const modelLabel = visibleModel?.name ?? state.current?.model ?? t("chooseModel");
			const activeProvider = pendingModel?.group.id ?? state.current?.provider;
			const activeModelId = pendingModel?.model.id ?? state.current?.model;
			const closePicker = (0, react.useCallback)(() => {
				if (!open || committing) return;
				const staged = pendingModel;
				setOpen(false);
				setPendingEffort(null);
				if (staged === null || state.current === null) {
					setPendingModel(null);
					return;
				}
				const selection = {
					provider: staged.group.id,
					model: staged.model.id
				};
				if (staged.effortId !== void 0) selection.reasoningEffort = staged.effortId;
				setCommitting(true);
				select(selection).catch(() => {}).finally(() => {
					setCommitting(false);
					setPendingModel(null);
				});
			}, [
				committing,
				open,
				pendingModel,
				select,
				state.current
			]);
			(0, react.useEffect)(() => {
				if (!open) return;
				const closeOutside = (event) => {
					const target = event.target;
					if (target instanceof Node && rootRef.current?.contains(target)) return;
					closePicker();
				};
				document.addEventListener("mousedown", closeOutside);
				return () => document.removeEventListener("mousedown", closeOutside);
			}, [closePicker, open]);
			(0, react.useEffect)(() => {
				if (pendingEffort === null) return;
				if (pendingEffort.modelKey !== visibleModelKey || pendingEffort.effortId === selected?.id || state.error !== null) setPendingEffort(null);
			}, [
				pendingEffort,
				selected?.id,
				state.error,
				visibleModelKey
			]);
			const chooseModel = (provider, modelId) => {
				const targetGroup = state.groups.find((group) => group.id === provider);
				const target = targetGroup?.models.find((model) => model.id === modelId);
				if (target === void 0 || targetGroup === void 0 || state.current === null) return;
				if (pendingModel?.group.id === provider && pendingModel.model.id === modelId) return;
				if (pendingModel === null && state.current.provider === provider && state.current.model === modelId) return;
				const targetEfforts = target.reasoning?.efforts ?? [];
				const currentEffort = pendingModel?.effortId ?? state.current.reasoningEffort;
				const effort = currentEffort !== void 0 && targetEfforts.some((item) => item.id === currentEffort) ? currentEffort : target.reasoning?.defaultEffort ?? targetEfforts[Math.floor(targetEfforts.length / 2)]?.id;
				setPendingEffort(null);
				setPendingModel({
					group: targetGroup,
					model: target,
					effortId: effort
				});
			};
			const toggleProvider = (provider) => {
				setExpandedProviders((previous) => {
					const next = new Set(previous);
					if (next.has(provider)) next.delete(provider);
					else next.add(provider);
					return next;
				});
			};
			const commitEffort = (index) => {
				const effort = efforts[index];
				if (effort === void 0 || effort.id === selected?.id) return;
				if (pendingModel !== null) {
					setPendingModel((previous) => previous === null ? previous : {
						...previous,
						effortId: effort.id
					});
					setPendingEffort(null);
					return;
				}
				if (state.current === null) return;
				select({
					provider: state.current.provider,
					model: state.current.model,
					reasoningEffort: effort.id
				}).catch(() => {});
			};
			const previewEffort = (index) => {
				const effort = efforts[index];
				if (effort === void 0 || visibleModelKey === void 0) return;
				if (pendingModel !== null) {
					setPendingModel((previous) => previous === null ? previous : {
						...previous,
						effortId: effort.id
					});
					setPendingEffort(null);
					return;
				}
				setPendingEffort({
					modelKey: visibleModelKey,
					effortId: effort.id,
					index
				});
			};
			const markModelsScrolling = () => {
				setModelsScrolling(true);
				if (modelScrollTimerRef.current !== null) window.clearTimeout(modelScrollTimerRef.current);
				modelScrollTimerRef.current = window.setTimeout(() => {
					modelScrollTimerRef.current = null;
					setModelsScrolling(false);
				}, 100);
			};
			const toggle = () => {
				if (busy) return;
				if (open) {
					closePicker();
					return;
				}
				load();
				setOpen(true);
			};
			const onKeyDown = (event) => {
				if (event.key !== "Escape" || !open) return;
				event.preventDefault();
				closePicker();
			};
			return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: "dsh-slider-model",
				"data-busy": busy,
				"data-max": isMax,
				"data-open": open,
				onKeyDown,
				children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
					className: "dsh-slider-model__trigger",
					type: "button",
					"aria-haspopup": "dialog",
					"aria-expanded": open,
					"aria-label": reasoning === void 0 ? modelLabel : modelLabel + "，" + t("label") + " " + (displaySelected?.name ?? t("unsupported")),
					disabled: busy,
					onClick: toggle,
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(BoltIcon, {}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
							className: "dsh-slider-model__model",
							title: modelLabel,
							children: modelLabel
						}),
						reasoning !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
							className: "dsh-slider-model__effort",
							title: t("label") + " " + (displaySelected?.name ?? t("unsupported")),
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-slider-model__effort-label",
								children: t("label")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: displaySelected?.name ?? t("unsupported") })]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronIcon, { open })
					]
				}), open && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
					className: "dsh-slider-model__popover",
					role: "dialog",
					"aria-label": t("menu"),
					children: [
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-slider-model__model-head",
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-slider-model__section-label",
								children: t("model")
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
								className: "dsh-slider-model__model-head-value",
								title: modelLabel,
								children: modelLabel
							})]
						}),
						/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
							className: "dsh-slider-model__models",
							"data-scrolling": modelsScrolling,
							"aria-label": t("chooseModel"),
							onWheel: markModelsScrolling,
							onScroll: markModelsScrolling,
							children: [
								state.groups.map((group) => {
									const expanded = expandedProviders.has(group.id);
									const name = groupLabel(group);
									const activeModel = pendingModel?.group.id === group.id ? pendingModel.model.name : currentModel?.group.id === group.id ? currentModel.model.name : void 0;
									return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
										className: "dsh-slider-model__provider",
										"data-expanded": expanded,
										children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
											className: "dsh-slider-model__provider-toggle",
											type: "button",
											"aria-expanded": expanded,
											"aria-label": name,
											disabled: busy,
											onClick: () => toggleProvider(group.id),
											children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
												className: "dsh-slider-model__provider-copy",
												children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dsh-slider-model__provider-name",
													children: name
												}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
													className: "dsh-slider-model__provider-meta",
													children: activeModel ?? t("providerCount", { count: group.models.length })
												})]
											}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(ChevronIcon, { open: expanded })]
										}), expanded && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
											className: "dsh-slider-model__provider-models",
											role: "listbox",
											"aria-label": name,
											children: group.models.map((model) => {
												const active = activeProvider === group.id && activeModelId === model.id;
												return /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("button", {
													className: "dsh-slider-model__option",
													type: "button",
													role: "option",
													"aria-selected": active,
													disabled: busy,
													onClick: () => chooseModel(group.id, model.id),
													children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("span", {
														className: "dsh-slider-model__option-copy",
														children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															className: "dsh-slider-model__option-name",
															children: model.name
														}), model.description !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
															className: "dsh-slider-model__option-description",
															children: model.description
														})]
													}), active && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", {
														className: "dsh-slider-model__check",
														"aria-hidden": "true",
														children: "✓"
													})]
												}, group.id + ":" + model.id);
											})
										})]
									}, group.id);
								}),
								state.status === "ready" && state.groups.length === 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
									className: "dsh-slider-model__status",
									children: t("empty")
								})
							]
						}),
						reasoning !== void 0 && /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("section", {
							className: "dsh-slider-fusion",
							"data-max": isMax,
							children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-slider-fusion__header",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("label") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("strong", { children: displaySelected?.name ?? t("unsupported") })]
							}), efforts.length > 1 ? /* @__PURE__ */ (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [/* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-slider-fusion__scale",
								"aria-hidden": "true",
								children: [/* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("efficient") }), /* @__PURE__ */ (0, react_jsx_runtime.jsx)("span", { children: t("capable") })]
							}), /* @__PURE__ */ (0, react_jsx_runtime.jsx)(EffortSlider, {
								efforts,
								index: displayIndex,
								disabled: busy,
								onChange: previewEffort,
								onCommit: commitEffort
							})] }) : /* @__PURE__ */ (0, react_jsx_runtime.jsxs)("div", {
								className: "dsh-slider-fusion__single",
								children: [
									t("supported"),
									": ",
									displaySelected?.name ?? t("unsupported")
								]
							})]
						}),
						state.error !== null && /* @__PURE__ */ (0, react_jsx_runtime.jsx)("div", {
							className: "dsh-slider-model__error",
							role: "status",
							children: t("error", { message: state.error })
						})
					]
				})]
			});
		}
		//#endregion
		//#region src/client/locales.ts
		/** Localized copy for the model-seat reasoning control. */
		const zh = {
			label: "推理强度",
			model: "模型",
			chooseModel: "选择模型",
			providerCount: "{count} 个模型",
			menu: "模型与推理强度",
			efficient: "更高效",
			capable: "更智能",
			loading: "正在刷新模型列表…",
			empty: "没有可用的模型。",
			supported: "支持档位",
			unsupported: "不可用",
			aria: "推理强度：{effort}",
			hint: "打开模型菜单调整推理强度",
			error: "设置失败：{message}"
		};
		const en = {
			label: "Reasoning",
			model: "Model",
			chooseModel: "Choose a model",
			providerCount: "{count} models",
			menu: "Model and reasoning effort",
			efficient: "More efficient",
			capable: "More capable",
			loading: "Refreshing models…",
			empty: "No models available.",
			supported: "Supported effort",
			unsupported: "Unavailable",
			aria: "Reasoning effort: {effort}",
			hint: "Open the model menu to adjust reasoning effort",
			error: "Unable to update effort: {message}"
		};
		//#endregion
		//#region src/client/styles.ts
		/** Self-contained Codex-style model-seat and reasoning-effort styles. */
		const STYLE_ID = "dsh-slider-fusion-styles";
		const PLUGIN_ID = "dsh-slider-fusion";
		const CSS = `
.dsh-slider-model{position:relative;z-index:4;display:flex;min-width:0;max-width:min(100%,420px);align-items:center}
.dsh-slider-model__trigger{box-sizing:border-box;display:flex;min-width:0;max-width:100%;height:32px;align-items:center;gap:6px;padding:0 7px 0 9px;border:1px solid transparent;border-radius:999px;background:var(--dsw-alias-interactive-bg-hover,#f1f2f4);color:var(--dsw-alias-label-secondary,#4f5867);font:inherit;font-size:11px;font-weight:500;line-height:17px;cursor:pointer;transition:background-color .14s ease,border-color .14s ease,box-shadow .14s ease}
.dsh-slider-model__trigger:hover:not(:disabled){border-color:var(--dsw-alias-border-l2,#d8dce3);background:var(--dsw-alias-interactive-bg-hover,#eceef1)}
.dsh-slider-model__trigger:focus-visible{outline:0;border-color:var(--dsw-alias-state-business-primary,#3b82f6);box-shadow:0 0 0 3px rgb(59 130 246 / 18%)}
.dsh-slider-model__trigger:disabled{color:var(--dsw-alias-label-dimmed,#a1a7b1);cursor:default;opacity:.72}
.dsh-slider-model[data-busy='true'] .dsh-slider-model__trigger:disabled{color:var(--dsw-alias-label-secondary,#4f5867);opacity:1}
.dsh-slider-model__bolt{width:16px;height:16px;flex:none;color:var(--dsw-alias-label-primary,#17191d)}
.dsh-slider-model__model{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.dsh-slider-model__effort{display:inline-flex;min-width:0;align-items:center;gap:4px;color:var(--dsw-alias-state-business-primary,#3b82f6);font-weight:600;white-space:nowrap}
.dsh-slider-model__effort-label{color:var(--dsw-alias-label-tertiary,#7d8592);font-weight:500}
.dsh-slider-model[data-max='true'] .dsh-slider-model__effort{color:#9751e8}
.dsh-slider-model__chevron{width:15px;height:15px;flex:none;color:var(--dsw-alias-label-tertiary,#838b98);transition:transform .14s ease}
.dsh-slider-model__chevron[data-open='true']{transform:rotate(180deg)}
.dsh-slider-model__popover{position:absolute;right:0;bottom:calc(100% + 9px);box-sizing:border-box;width:min(360px,calc(100vw - 24px));max-height:min(600px,calc(100vh - 96px));overflow:auto;padding:12px;border:1px solid var(--dsw-alias-border-l2,#d9dde4);border-radius:16px;background:color-mix(in srgb,var(--dsw-specific-menu,#fff) 80%,transparent);backdrop-filter:blur(6px);box-shadow:0 12px 30px rgb(20 28 42 / 16%),0 3px 10px rgb(20 28 42 / 8%);color:var(--dsw-alias-label-primary,#17191d)}
.dsh-slider-model__model-head{display:flex;min-width:0;align-items:baseline;justify-content:space-between;gap:14px;padding:0 4px 10px}
.dsh-slider-model__section-label{color:var(--dsw-alias-label-primary,#17191d);font-size:11px;font-weight:600;white-space:nowrap}
.dsh-slider-model__model-head-value{min-width:0;overflow:hidden;color:var(--dsw-alias-label-secondary,#5b6472);font-size:11px;text-overflow:ellipsis;white-space:nowrap}
.dsh-slider-model__models{display:flex;max-height:260px;flex-direction:column;gap:1px;overflow:auto;overscroll-behavior:contain;scrollbar-gutter:stable;padding:2px 0 4px}
.dsh-slider-model__models[data-scrolling='true'] .dsh-slider-model__provider-toggle,.dsh-slider-model__models[data-scrolling='true'] .dsh-slider-model__option{transition:none}
.dsh-slider-model__models[data-scrolling='true'] .dsh-slider-model__provider:not([data-expanded='true']) .dsh-slider-model__provider-toggle:hover:not(:disabled){background:transparent}
.dsh-slider-model__models[data-scrolling='true'] .dsh-slider-model__option:hover:not(:disabled):not([aria-selected='true']){background:transparent}
.dsh-slider-model__provider{min-width:0}
.dsh-slider-model__provider-toggle{display:flex;width:100%;min-height:34px;align-items:center;justify-content:space-between;gap:9px;padding:5px 8px;border:0;border-radius:9px;background:transparent;color:inherit;text-align:left;font:inherit;font-size:11px;line-height:16px;cursor:pointer;transition:background-color .14s ease}
.dsh-slider-model__provider-toggle:hover:not(:disabled),.dsh-slider-model__provider[data-expanded='true'] .dsh-slider-model__provider-toggle{background:var(--dsw-alias-interactive-bg-hover,#f2f3f5)}
.dsh-slider-model__provider-toggle:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#3b82f6);outline-offset:-2px}
.dsh-slider-model__provider-toggle:disabled{color:var(--dsw-alias-label-dimmed,#a1a7b1);cursor:wait}
.dsh-slider-model[data-busy='true'] .dsh-slider-model__provider-toggle:disabled{color:inherit}
.dsh-slider-model__provider-copy{display:flex;min-width:0;flex:1;align-items:baseline;justify-content:space-between;gap:10px}
.dsh-slider-model__provider-name{overflow:hidden;font-weight:600;text-overflow:ellipsis;white-space:nowrap}
.dsh-slider-model__provider-meta{max-width:55%;overflow:hidden;color:var(--dsw-alias-label-tertiary,#858d99);font-size:9px;font-weight:500;text-overflow:ellipsis;white-space:nowrap}
.dsh-slider-model__provider-models{display:flex;flex-direction:column;gap:1px;padding:1px 0 3px 8px}
.dsh-slider-model__option{display:flex;width:100%;min-height:32px;align-items:center;gap:9px;padding:4px 8px;border:0;border-radius:9px;background:transparent;color:inherit;text-align:left;font:inherit;cursor:pointer}
.dsh-slider-model__option:hover:not(:disabled),.dsh-slider-model__option[aria-selected='true']{background:var(--dsw-alias-interactive-bg-hover,#f2f3f5)}
.dsh-slider-model__option:focus-visible{outline:2px solid var(--dsw-alias-state-business-primary,#3b82f6);outline-offset:-2px}
.dsh-slider-model__option:disabled{color:var(--dsw-alias-label-dimmed,#a1a7b1);cursor:wait}
.dsh-slider-model[data-busy='true'] .dsh-slider-model__option:disabled{color:inherit}
.dsh-slider-model__option-copy{display:flex;min-width:0;flex:1;flex-direction:column}
.dsh-slider-model__option-name{overflow:hidden;font-size:11px;font-weight:550;line-height:16px;text-overflow:ellipsis;white-space:nowrap}
.dsh-slider-model__option-description{overflow:hidden;color:var(--dsw-alias-label-tertiary,#858d99);font-size:9px;line-height:12px;text-overflow:ellipsis;white-space:nowrap}
.dsh-slider-model__check{flex:none;color:var(--dsw-alias-state-business-primary,#3b82f6);font-size:13px;font-weight:700}
.dsh-slider-model__status{padding:10px 8px;color:var(--dsw-alias-label-tertiary,#858d99);font-size:10px;line-height:15px}
.dsh-slider-fusion{margin-top:6px;padding:12px 4px 2px;border-top:1px solid var(--dsw-alias-border-l1,#eceef1)}
.dsh-slider-fusion__header{display:flex;align-items:baseline;justify-content:space-between;gap:10px;color:var(--dsw-alias-label-secondary,#616a78);font-size:10px;line-height:16px}
.dsh-slider-fusion__header strong{color:var(--dsw-alias-state-business-primary,#3b82f6);font-size:11px;font-weight:650}
.dsh-slider-fusion[data-max='true'] .dsh-slider-fusion__header strong{color:#9751e8}
.dsh-slider-fusion__scale{display:flex;align-items:center;justify-content:space-between;margin:7px 2px 0;color:var(--dsw-alias-label-tertiary,#858d99);font-size:9px;line-height:13px}
.dsh-slider-fusion__slider{height:40px;margin:1px 0 2px;touch-action:none;cursor:grab;outline:0}
.dsh-slider-fusion__slider:active,.dsh-slider-fusion__slider[data-dragging='true']{cursor:grabbing}
.dsh-slider-fusion__slider:focus-visible{border-radius:12px;box-shadow:0 0 0 3px rgb(59 130 246 / 18%)}
.dsh-slider-fusion__range{position:relative;height:40px;margin:0 15px}
.dsh-slider-fusion__rail{position:absolute;top:50%;right:0;left:0;height:24px;transform:translateY(-50%);border-radius:12px;background:#e7e7e9;box-shadow:inset 0 1px 2px rgb(25 30 40 / 7%)}
.dsh-slider-fusion__fill{position:absolute;z-index:1;top:50%;left:0;height:24px;min-width:0;overflow:hidden;transform:translateY(-50%);border-radius:12px;box-shadow:inset 0 1px 1px rgb(255 255 255 / 14%);transition:width .2s cubic-bezier(.2,.8,.3,1),background .25s ease}
.dsh-slider-fusion__energy{position:absolute;inset:0;pointer-events:none;opacity:var(--dsf-energy,0);transition:opacity .2s ease;background:linear-gradient(90deg,#3b1178 0%,#6d28d9 30%,#9333ea 62%,#c084fc 100%)}
.dsh-slider-fusion__energy::after{position:absolute;inset:0;content:'';background:linear-gradient(100deg,transparent 18%,rgb(255 255 255 / 34%) 50%,transparent 82%);transform:translateX(100%);animation:dsf-sweep var(--dsf-sweep,2.4s) linear infinite}
.dsh-slider-fusion__glow{position:absolute;z-index:0;top:50%;right:0;left:0;height:24px;transform:translateY(-50%);border-radius:12px;pointer-events:none;opacity:0;transition:opacity .25s ease,box-shadow .25s ease}
.dsh-slider-fusion__stars{position:absolute;inset:0;overflow:hidden;pointer-events:none}
.dsh-slider-fusion__star{position:absolute;right:0;left:0;height:3px;margin-top:-1.5px;pointer-events:none;animation-name:dsf-star-sweep;animation-timing-function:linear;animation-iteration-count:infinite}
.dsh-slider-fusion__star-dot{position:absolute;top:0;left:100%;width:3px;height:3px;margin-left:-1.5px;border-radius:50%;background:#fff;box-shadow:0 0 4px rgb(255 255 255 / 88%),0 0 7px rgb(214 178 255 / 40%);opacity:var(--dsf-b,1);transform:scale(var(--dsf-b,1))}
.dsh-slider-fusion__tick{position:absolute;z-index:2;top:50%;width:5px;height:5px;border-radius:50%;transform:translate(-50%,-50%);background:#b8b9bd;transition:background-color .16s ease,transform .16s ease}
.dsh-slider-fusion__tick[data-active='true']{background:#7bbdff}
.dsh-slider-fusion[data-max='true'] .dsh-slider-fusion__tick[data-active='true']{background:#c29af6}
.dsh-slider-fusion__tick[data-major='true']{width:8px;height:8px;transform:translate(-50%,-50%);background:#fff;box-shadow:0 0 0 1px rgb(59 130 246 / 28%)}
.dsh-slider-fusion[data-max='true'] .dsh-slider-fusion__tick[data-major='true']{box-shadow:0 0 0 1px rgb(168 85 247 / 40%)}
.dsh-slider-fusion__thumb{position:absolute;z-index:3;top:50%;width:30px;height:30px;margin-left:0;transform:translate(-50%,-50%);border:1px solid #dadadd;border-radius:50%;background:#fff;box-shadow:0 1px 2px rgb(20 30 50 / 12%),0 3px 8px rgb(20 30 50 / 8%);transition:left .18s cubic-bezier(.2,.9,.25,1),box-shadow .18s ease,transform .18s ease}
.dsh-slider-fusion__slider:hover .dsh-slider-fusion__thumb{box-shadow:0 1px 2px rgb(20 30 50 / 14%),0 4px 10px rgb(20 30 50 / 10%);transform:translate(-50%,-50%) scale(1.04)}
.dsh-slider-fusion[data-max='true'] .dsh-slider-fusion__glow{animation:dsf-glow-pulse 1.5s ease-in-out infinite}
.dsh-slider-fusion[data-max='true'] .dsh-slider-fusion__thumb{border-color:#cdb2ef;box-shadow:0 0 0 3px rgb(168 85 247 / 14%),0 0 16px rgb(168 85 247 / 58%),0 2px 6px rgb(20 30 50 / 12%);animation:dsh-reasoning-max-pulse 1.35s ease-in-out infinite}
.dsh-slider-fusion__single{padding:9px 0 2px;color:var(--dsw-alias-label-tertiary,#858d99);font-size:10px}
.dsh-slider-model__error{margin:8px 4px 2px;padding:7px 8px;border-radius:8px;background:var(--dsw-alias-interactive-bg-hover-danger,#fff1f2);color:var(--dsw-alias-state-error-primary,#d92d48);font-size:9px;line-height:14px}
@keyframes dsh-reasoning-max-flash{0%,100%{filter:saturate(1) brightness(1);box-shadow:inset 0 1px 1px rgb(255 255 255 / 14%),0 0 6px rgb(168 85 247 / 20%)}50%{filter:saturate(1.45) brightness(1.16);box-shadow:inset 0 1px 1px rgb(255 255 255 / 24%),0 0 16px rgb(168 85 247 / 72%),0 0 30px rgb(192 132 252 / 28%)}}
@keyframes dsh-reasoning-max-tail{0%,100%{opacity:.35;transform:scale(.78)}50%{opacity:1;transform:scale(1.15)}}
@keyframes dsh-reasoning-max-sweep{0%{transform:translateX(-130%);opacity:0}25%{opacity:.85}75%{opacity:.85}100%{transform:translateX(520%);opacity:0}}
@keyframes dsh-reasoning-max-pulse{0%,100%{filter:saturate(1);transform:translate(-50%,-50%) scale(1)}50%{filter:saturate(1.35) brightness(1.12);transform:translate(-50%,-50%) scale(1.1)}}
@keyframes dsf-star-sweep{0%{transform:translate3d(0,0,0);opacity:0}6%{opacity:1}94%{opacity:1}100%{transform:translate3d(-100%,0,0);opacity:0}}
@keyframes dsf-sweep{0%{transform:translateX(100%)}100%{transform:translateX(-100%)}}
@keyframes dsf-glow-pulse{0%,100%{opacity:calc(var(--dsf-glow-pulse-top,1) * .78)}50%{opacity:var(--dsf-glow-pulse-top,1)}}
@media (max-width:760px){.dsh-slider-model__trigger{max-width:calc(100vw - 90px)}.dsh-slider-model__effort-label{display:none}.dsh-slider-model__popover{right:-6px;width:min(340px,calc(100vw - 20px))}}
@media (prefers-reduced-motion:reduce){.dsh-slider-model__chevron,.dsh-slider-fusion__fill,.dsh-slider-fusion__energy,.dsh-slider-fusion__energy::after,.dsh-slider-fusion__star,.dsh-slider-fusion__glow,.dsh-slider-fusion__thumb{transition:none;animation:none}}
`;
		/** Mount the stylesheet for the owning plugin lifetime. */
		function installReasoningStyles() {
			if (typeof document === "undefined") return () => {};
			if (document.getElementById(STYLE_ID) !== null) return () => {};
			const style = document.createElement("style");
			style.id = STYLE_ID;
			style.dataset.plugin = PLUGIN_ID;
			style.dataset.pluginCss = PLUGIN_ID + "/reasoning-model.css";
			style.textContent = CSS;
			document.head.appendChild(style);
			return () => {
				style.remove();
			};
		}
		//#endregion
				//#region local patch: ACP (dsh-ntr) seat
		/**
		 * LOCAL PATCH 2026-11-20 — NTR coexistence, step 2.
		 *
		 * Step 1 proved the seat hand-off works; steps 1b/1c made a hand-rolled
		 * pill show the right model fast. This revision drops the hand-rolled UI
		 * entirely (user request, m01632): in ACP mode the composer must look and
		 * behave EXACTLY like this plugin's own seat — same trigger, same model
		 * popover, same reasoning-effort slider — only sourced from dsh-ntr.
		 *
		 * The trick is that `ReasoningBar` never touches the model directory
		 * directly: it takes { directory, load, select, t } and only needs the
		 * directory to answer subscribe() / getSnapshot() with
		 * { current, groups, status, error }. So an "ACP directory" shaped like the
		 * native one lets us reuse the real component and its real styles, instead
		 * of imitating them (which is how the pill drifted from the design in the
		 * first place).
		 *
		 * Data mapping (verified against dsh-ntr's host code):
		 *   groups   <- agents/list, one group per configured ACP agent ("代理源")
		 *   models   <- agent/catalog(agentId).variants, already filtered by the
		 *               agent's `exposedModels` (what the NTR settings panel writes)
		 *   efforts  <- catalog.reasoningByModel[value].efforts ?? catalog.reasoning.efforts
		 *               (NTR's own per-model thought levels)
		 *   current  <- session/chat-list .choice {agentId, modelId, effort}
		 *   select   -> session/chat-model-set (modelId = `<agent>@<value>`) and
		 *               session/chat-effort-set (effort + agentId)
		 */
		const ACP_CHANNEL = "/acp";
		/** dsh-ntr's own ACP verdict marker: on `html` while the gate confirms the
		 *  staged conversation runs the ACP preset. Its honest, same-frame signal. */
		const ACP_MARKER = "data-ntr-acp";
		function acpMarkerOn() {
			try {
				return typeof document !== "undefined" && document.documentElement.hasAttribute(ACP_MARKER);
			} catch {
				return false;
			}
		}
		/** Adapter ids are `<agentId>@<value>`; the value half is the agent's model id. */
		function acpVariantValue(id) {
			if (typeof id !== "string") return void 0;
			const at = id.indexOf("@");
			return at >= 0 ? id.slice(at + 1) : id;
		}
		/** The agent's catalog names its models `<agentId>/<name>`; the trigger already
		 *  sits next to the agent chip, so drop the repeated prefix. */
		function acpDisplayName(model, agentId) {
			const raw = (model && (model.name || model.id)) || "";
			const prefix = agentId ? String(agentId) + "/" : "";
			return prefix && raw.length > prefix.length && raw.slice(0, prefix.length) === prefix ? raw.slice(prefix.length) : raw;
		}
		/** One sole-model pin attempt per conversation+agent+model (never a loop). */
		const acpPinned = new Set();
		/**
		 * A native-directory-shaped view over dsh-ntr's ACP state, so the real
		 * `ReasoningBar` can render it unchanged.
		 */
		/**
			 * Slider position means intensity. `default` is not an intensity — it means
			 * "let the agent decide" — so leaving it at the end of the ladder makes the
			 * bar claim the strongest rung is the default one (and lights up the max
			 * styling on it). Park it at the left end instead: "nothing dialed in".
			 */
		function acpOrderedEfforts(efforts) {
			if (!Array.isArray(efforts) || efforts.length < 2) return efforts;
			const head = efforts.filter((effort) => effort && effort.id === "default");
			if (head.length === 0) return efforts;
			return head.concat(efforts.filter((effort) => !(effort && effort.id === "default")));
		}
		function createAcpSeatDirectory({ acpCall, sessionId }) {
			let snapshot = {
				current: null,
				groups: [],
				status: "loading",
				error: null
			};
			const listeners = new Set();
			let inflight = null;
			const emit = () => {
				for (const listener of Array.from(listeners)) {
					try {
						listener();
					} catch {}
				}
			};
			const patch = (next) => {
				snapshot = Object.assign({}, snapshot, next);
				emit();
			};
			const load = () => {
				if (inflight !== null) return inflight;
				patch({ status: snapshot.status === "selecting" ? "selecting" : "loading" });
				inflight = Promise.resolve().then(async () => {
					const view = await acpCall("session/chat-list", { dshSessionId: sessionId });
					const sessions = (view && view.sessions) || [];
					const row = sessions[0];
					const choice = (view && view.choice) || undefined;
					const boundAgentId = (view && (view.boundAgentId || view.lockedAgentId)) || (choice && choice.agentId) || (row && row.agentId);
					let listed = [];
					try {
						const res = await acpCall("agents/list", {});
						listed = (res && res.agents) || [];
					} catch {
						listed = [];
					}
					if (listed.length === 0 && boundAgentId !== undefined) listed = [{ id: boundAgentId }];
					const groups = [];
					const catalogs = {};
					for (const agent of listed) {
						const agentId = agent && agent.id;
						if (!agentId) continue;
						let catalog;
						try {
							catalog = await acpCall("agent/catalog", { agentId });
						} catch {
							continue;
						}
						catalogs[agentId] = catalog;
						const variants = (catalog && (catalog.variants || catalog.models)) || [];
						const baseReasoning = (catalog && catalog.reasoning) || undefined;
						const byModel = (catalog && catalog.reasoningByModel) || {};
						const models = [];
						for (const variant of variants) {
							const value = acpVariantValue(variant.id);
							if (value === undefined) continue;
							const perModel = byModel[value];
							const efforts = acpOrderedEfforts(perModel && perModel.efforts && perModel.efforts.length > 0 ? perModel.efforts : baseReasoning && baseReasoning.efforts ? baseReasoning.efforts : []);
							const model = {
								id: value,
								name: acpDisplayName(variant, agentId)
							};
							if (variant.description !== undefined) model.description = variant.description;
							// An agent-level default only describes the agent's CURRENT model;
							// applying it to every row would fake a default that is not there.
							if (efforts.length > 0) model.reasoning = {
								efforts,
								...(agentId === boundAgentId && baseReasoning && baseReasoning.defaultEffort !== undefined ? { defaultEffort: baseReasoning.defaultEffort } : {})
							};
							models.push(model);
						}
						if (models.length === 0) continue;
						groups.push({
							id: agentId,
							label: (catalog && catalog.title) || (agent && agent.title) || agentId,
							models
						});
					}
					const wantedAgentId = boundAgentId !== undefined ? boundAgentId : groups[0] ? groups[0].id : undefined;
					const group = groups.find((entry) => entry.id === wantedAgentId) || groups[0];
					const pickedId = (choice && choice.modelId) || (row && row.modelId);
					const catalogOfAgent = group ? catalogs[group.id] : undefined;
					const reported = catalogOfAgent && catalogOfAgent.currentModel ? catalogOfAgent.currentModel.value : undefined;
					let modelId = pickedId !== undefined ? acpVariantValue(pickedId) : reported !== undefined ? acpVariantValue(reported) : group && group.models[0] ? group.models[0].id : undefined;
					// A settings panel that narrows an agent to ONE model is stating an
					// intent, not decorating a menu: `exposedModels` is only a filter, so
					// without this the conversation would keep running whatever the agent
					// happens to be on while the menu offers a single different model.
					if (group && choice === undefined && group.models.length === 1 && group.models[0].id !== modelId) {
						const sole = group.models[0].id;
						const key = sessionId + "|" + group.id + "|" + sole;
						if (!acpPinned.has(key)) {
							acpPinned.add(key);
							try {
								await acpCall("session/chat-model-set", {
									dshSessionId: sessionId,
									modelId: group.id + "@" + sole
								});
								modelId = sole;
							} catch {}
						}
					}
					let current = null;
					if (group && modelId !== undefined) {
						current = {
							provider: group.id,
							model: modelId
						};
						if (choice && choice.effort !== undefined) current.reasoningEffort = choice.effort;
						else if (row && row.reasoningEffort !== undefined) current.reasoningEffort = row.reasoningEffort;
					}
					patch({
						current,
						groups,
						status: "ready",
						error: null
					});
				}).catch((error) => {
					patch({
						status: "ready",
						error: String((error && error.message) || error)
					});
				}).finally(() => {
					inflight = null;
				});
				return inflight;
			};
			const select = (selection) => {
				const provider = selection && selection.provider;
				const model = selection && selection.model;
				if (provider === undefined || model === undefined) return Promise.reject(new Error("slider-fusion: incomplete ACP selection"));
				const previous = snapshot.current;
				const modelChanged = previous === null || previous.provider !== provider || previous.model !== model;
				const effort = selection.reasoningEffort;
				const next = {
					provider,
					model
				};
				const effortNext = effort !== undefined ? effort : previous !== null ? previous.reasoningEffort : undefined;
				if (effortNext !== undefined) next.reasoningEffort = effortNext;
				patch({
					status: "selecting",
					current: next,
					error: null
				});
				return Promise.resolve().then(async () => {
					// `<agent>@<value>` is dsh-ntr's adapter id; switching agents rides the
					// same call, so a model chosen under another agent also switches source.
					if (modelChanged) await acpCall("session/chat-model-set", {
						dshSessionId: sessionId,
						modelId: provider + "@" + model
					});
					if (effort !== undefined && (modelChanged || previous === null || previous.reasoningEffort !== effort)) await acpCall("session/chat-effort-set", {
						dshSessionId: sessionId,
						effort,
						agentId: provider
					});
					await load();
				}).catch((error) => {
					patch({
						status: "ready",
						error: String((error && error.message) || error)
					});
					throw error;
				});
			};
			return {
				subscribe: (listener) => {
					listeners.add(listener);
					return () => {
						listeners.delete(listener);
					};
				},
				getSnapshot: () => snapshot,
				load,
				select,
				dispose: () => {
					listeners.clear();
				}
			};
		}
		/** The real seat, fed by dsh-ntr instead of the native model directory. */
		function AcpSliderSeat(props) {
			const { sessionId, acpCall } = props;
			const store = react.useMemo(() => createAcpSeatDirectory({ acpCall, sessionId }), [sessionId, acpCall]);
			react.useEffect(() => () => store.dispose(), [store]);
			return react_jsx_runtime.jsx(ReasoningBar, {
				locked: props.locked,
				directory: store,
				load: store.load,
				select: store.select,
				t: props.t
			});
		}
		/** ACP verdict first (dsh-ntr's own marker, same-frame), native bar otherwise. */
		function SliderFusionSeat(props) {
			const { sessionId, acpCall } = props;
			const [acp, setAcp] = react.useState(() => acpMarkerOn());
			react.useEffect(() => {
				let alive = true;
				let last = acpMarkerOn();
				// No marker yet: the gate may not have run since this page loaded, so ask
				// its verdict once instead of waiting for the 1s safety net.
				if (!last) acpCall("session/chat-list", {
					dshSessionId: sessionId,
					refresh: true
				}).then((view) => {
					if (!alive) return;
					if (view && view.acpMode === true) {
						last = true;
						setAcp(true);
					}
				}).catch(() => {});
				// Fast path: the gate toggles the attribute on every preset switch.
				const observer = new MutationObserver(() => {
					const now = acpMarkerOn();
					if (now === last) return;
					last = now;
					if (now) {
						setAcp(true);
						return;
					}
					// Marker gone — possibly a standDown before a retake, so confirm with
					// the verdict instead of snapping back to the native bar.
					acpCall("session/chat-list", {
						dshSessionId: sessionId,
						refresh: true
					}).then((view) => {
						if (alive) setAcp(!!(view && view.acpMode === true));
					}).catch(() => {});
				});
				try {
					observer.observe(document.documentElement, {
						attributes: true,
						attributeFilter: [ACP_MARKER]
					});
				} catch {}
				const timer = window.setInterval(() => {
					const now = acpMarkerOn();
					if (now === last) return;
					last = now;
					setAcp(now);
				}, 1000);
				return () => {
					alive = false;
					observer.disconnect();
					window.clearInterval(timer);
				};
			}, [sessionId, acpCall]);
			if (acp === true) return react_jsx_runtime.jsx(AcpSliderSeat, props);
			return react_jsx_runtime.jsx(ReasoningBar, props);
		}
		//#endregion

		//#region src/client/index.tsx
		const NS = "slider-fusion";
		const inject = [
			"slots",
			"locale",
			"modelDirectories",
			"sessions",
			"remote",
			"remote.session"
		];
		function apply(ctx) {
			// LOCAL PATCH: the ACP channel (dsh-ntr's /acp RPC) + the yield handshake.
			const acpCall = (endpoint, payload) => {
				const rpc = ctx.get("connection")?.rpc;
				if (rpc === void 0) return Promise.reject(new Error("slider-fusion: browser rpc is unavailable"));
				return Promise.resolve(rpc.call(ACP_CHANNEL, endpoint, payload || {})).then((result) => {
					if (!result || result.ok !== true) {
						const detail = result && result.error && result.error.message;
						throw new Error(detail ? String(detail) : "slider-fusion: acp rpc failed");
					}
					return result.value;
				});
			};
			// Tells dsh-ntr to yield the model seat to this renderer (see its createModelSeatClaim).
			globalThis.__dshModelSeatRenderer = "dsh-slider-fusion";
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en
			}), "dsh-slider-fusion: dictionaries");
			ctx.effect(() => installReasoningStyles(), "dsh-slider-fusion: styles");
			const t = ctx.locale.bind(NS);
			ctx.inject(["slots", "modelDirectories"], (scope) => {
				const models = scope.modelDirectories;
				scope.slots.inject("conversation.input.model", () => scope.slots.register({
					name: "conversation.input.model",
					priority: -1,
					label: () => t("label"),
					locale: NS,
					inject: (sessionId) => {
						const directory = models.directoryFor(sessionId);
						return {
							sessionId,
							acpCall,
							t,
							directory: directory.store,
							load: () => {
								directory.load().catch(() => {});
							},
							select: (selection) => directory.select(selection)
						};
					}
				}, SliderFusionSeat));
			});
		}
		//#endregion
		exports.apply = apply;
		exports.inject = inject;
		return module.exports;
	}
});

//# sourceMappingURL=client.js.map