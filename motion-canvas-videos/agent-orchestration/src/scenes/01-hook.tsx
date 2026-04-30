import {Circle, Layout, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  Reference,
  all,
  chain,
  createRef,
  delay,
  easeInCubic,
  easeOutCubic,
  sequence,
  spawn,
  waitFor,
} from '@motion-canvas/core';
import {COLORS, FONTS} from '../lib/design';
import {BrandCorner} from '../lib/brand';

const TOOLS = [
  '查订单', '改地址', '催发货', '退款', '查物流', '申请发票',
  '修改订单', '取消订单', '查会员', '查积分', '换券', '查促销',
  '推荐', '评价', '转人工', '投诉', '工单', '风控',
  '验手机', '验邮箱', '查余额', '充值', '提现', '实名',
  '改密', '解绑', '申诉', '黑名单', '解封', '冻结',
];

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ------------------------------------------------------------
  // Phase 1 — chaotic single-agent with 30 tools (~12s)
  // ------------------------------------------------------------
  const agent = createRef<Rect>();
  const agentLabel = createRef<Txt>();
  const toolNodes: Reference<Rect>[] = TOOLS.map(() => createRef<Rect>());
  const stage = createRef<Layout>();

  const radius = 480;

  // Tools layer (bottom)
  view.add(
    <Layout ref={stage} opacity={0}>
      {TOOLS.map((label, i) => {
        const angle = (i / TOOLS.length) * Math.PI * 2 - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius * 0.55; // ellipse to fit 16:9
        return (
          <Rect
            ref={toolNodes[i]}
            width={120}
            height={44}
            radius={10}
            fill={COLORS.panel}
            stroke={COLORS.cardBorder}
            lineWidth={2}
            position={[x, y]}
            opacity={0}
          >
            <Txt
              text={label}
              fontFamily={FONTS.cn}
              fontSize={20}
              fill={COLORS.textDim}
            />
          </Rect>
        );
      })}
    </Layout>,
  );

  // Call lines layer (middle) — added before agent so the agent card paints
  // on top and arrows can never visually pierce its label.
  const callLayer = createRef<Layout>();
  view.add(<Layout ref={callLayer} />);

  // Agent card layer (top)
  view.add(
    <Rect
      ref={agent}
      width={260}
      height={140}
      radius={20}
      fill={COLORS.card}
      stroke={COLORS.warm}
      lineWidth={4}
      opacity={0}
    >
      <Layout direction="column" alignItems="center" gap={8} layout>
        <Txt
          ref={agentLabel}
          text="客服 Agent"
          fontFamily={FONTS.cn}
          fontWeight={700}
          fontSize={36}
          fill={COLORS.text}
        />
        <Txt
          text="30 tools"
          fontFamily={FONTS.mono}
          fontSize={20}
          fill={COLORS.warm}
        />
      </Layout>
    </Rect>,
  );

  yield* all(stage().opacity(1, 0.4), agent().opacity(1, 0.4));
  yield* sequence(
    0.03,
    ...toolNodes.map(n => n().opacity(1, 0.3)),
  );

  // Project line endpoints onto each card's edge so the arrow leaves the
  // agent and lands at the tool's border — never piercing the labels.
  const agentHalfW = 130;
  const agentHalfH = 70;
  const toolHalfW = 60;
  const toolHalfH = 22;

  function edgeOnAgent(tx: number, ty: number): [number, number] {
    const ax = Math.abs(tx);
    const ay = Math.abs(ty);
    if (ax < 1e-6 && ay < 1e-6) return [0, 0];
    const tH = ax > 0 ? agentHalfW / ax : Infinity;
    const tV = ay > 0 ? agentHalfH / ay : Infinity;
    const t = Math.min(tH, tV);
    const offset = 12;
    const len = Math.sqrt(tx * tx + ty * ty);
    return [tx * t + (tx / len) * offset, ty * t + (ty / len) * offset];
  }

  function edgeOnTool(tx: number, ty: number): [number, number] {
    // Project from tool center back toward agent (origin) onto tool's edge.
    const dx = -tx;
    const dy = -ty;
    const ax = Math.abs(dx);
    const ay = Math.abs(dy);
    const tH = ax > 0 ? toolHalfW / ax : Infinity;
    const tV = ay > 0 ? toolHalfH / ay : Infinity;
    const t = Math.min(tH, tV);
    const offset = 6; // small gap so arrow head doesn't kiss the border
    const len = Math.sqrt(dx * dx + dy * dy);
    return [tx + dx * t + (dx / len) * offset, ty + dy * t + (dy / len) * offset];
  }

  function* fireCall(toIdx: number, color: string, duration = 0.25) {
    const target = toolNodes[toIdx]();
    const tp = target.position();
    const start = edgeOnAgent(tp.x, tp.y);
    const end = edgeOnTool(tp.x, tp.y);
    const line = (
      <Line
        points={[start, end]}
        stroke={color}
        lineWidth={3}
        endArrow
        arrowSize={10}
        end={0}
        opacity={0.9}
      />
    ) as Line;
    callLayer().add(line);
    yield* line.end(1, duration, easeOutCubic);
    yield* all(line.opacity(0, 0.3), target.stroke(color, 0.1));
    line.remove();
    yield* target.stroke(COLORS.cardBorder, 0.2);
  }

  // ~11s of overlapping chaotic firing — spawn each call so they run in
  // parallel (without spawn the loop became 27s of strictly sequential
  // animations and the chaos felt orderly, not chaotic).
  const chaosDuration = 14;
  const fps = 4; // calls per second
  const totalCalls = Math.round(chaosDuration * fps);
  const stagger = 1 / fps;

  for (let i = 0; i < totalCalls; i++) {
    const idx = Math.floor(Math.random() * TOOLS.length);
    const color = i > totalCalls * 0.6 && Math.random() < 0.4 ? COLORS.warm : COLORS.accent;
    spawn(fireCall(idx, color, 0.4));
    yield* waitFor(stagger);
  }
  // Allow last few in-flight fireCalls to finish + brief beat.
  yield* waitFor(1.2);

  // ------------------------------------------------------------
  // Phase 2 — highlight specific wrong calls (~4s)
  // ------------------------------------------------------------
  const idxOrder = TOOLS.indexOf('查订单');
  const idxAddress = TOOLS.indexOf('改地址');
  const idxRush = TOOLS.indexOf('催发货');

  const errorBox = createRef<Rect>();
  view.add(
    <Rect
      ref={errorBox}
      width={760}
      height={90}
      radius={14}
      fill="#3a1a1a"
      stroke={COLORS.warm}
      lineWidth={3}
      y={420}
      opacity={0}
    >
      <Txt
        text="查订单 → 调成了催发货"
        fontFamily={FONTS.cn}
        fontWeight={700}
        fontSize={36}
        fill={COLORS.warm}
      />
    </Rect>,
  );

  yield* all(
    fireCall(idxOrder, COLORS.warm, 0.35),
    delay(0.15, fireCall(idxRush, COLORS.warm, 0.35)),
    delay(0.3, errorBox().opacity(1, 0.3)),
  );
  yield* waitFor(1);
  yield* errorBox().findFirst((n): n is Txt => n instanceof Txt).text('催发货 → 跳成改地址', 0);
  yield* all(
    fireCall(idxRush, COLORS.warm, 0.35),
    delay(0.15, fireCall(idxAddress, COLORS.warm, 0.35)),
  );
  yield* waitFor(1.4);

  // ------------------------------------------------------------
  // Phase 3 — collapse, punchline (~5s)
  // ------------------------------------------------------------
  const punchline = createRef<Txt>();
  view.add(
    <Txt
      ref={punchline}
      text="一个 Agent 干了三个 Agent 的活"
      fontFamily={FONTS.cn}
      fontWeight={900}
      fontSize={92}
      fill={COLORS.warm}
      opacity={0}
    />,
  );

  yield* all(
    stage().opacity(0, 0.6),
    agent().opacity(0, 0.6),
    errorBox().opacity(0, 0.6),
    callLayer().opacity(0, 0.6),
  );
  yield* punchline().opacity(1, 0.6);
  yield* waitFor(3.3);
  yield* punchline().opacity(0, 0.6);

  // ------------------------------------------------------------
  // Phase 4 — title card (~5s)
  // ------------------------------------------------------------
  const titleCN = createRef<Txt>();
  const titleEN = createRef<Txt>();
  const titleSub = createRef<Txt>();
  const accentBar = createRef<Rect>();

  view.add(
    <>
      <Rect
        ref={accentBar}
        width={0}
        height={6}
        radius={3}
        fill={COLORS.accent}
        y={-360}
      />
      <Txt
        ref={titleEN}
        text="Agent Orchestration"
        fontFamily={FONTS.mono}
        fontSize={52}
        fill={COLORS.accent}
        y={-270}
        opacity={0}
      />
      <Txt
        ref={titleCN}
        text="Agent 编排"
        fontFamily={FONTS.display}
        fontWeight={900}
        fontSize={200}
        fill={COLORS.text}
        y={-20}
        opacity={0}
      />
      <Txt
        ref={titleSub}
        text="—— 四种模式，到底谁说了算？"
        fontFamily={FONTS.cn}
        fontSize={44}
        fill={COLORS.textDim}
        y={240}
        opacity={0}
      />
    </>,
  );

  yield* accentBar().width(420, 0.5, easeOutCubic);
  yield* all(
    titleEN().opacity(1, 0.5),
    titleCN().opacity(1, 0.7),
    titleCN().y(0, 0.7, easeOutCubic),
  );
  yield* titleSub().opacity(1, 0.5);
  yield* waitFor(4.5);
  yield* all(
    titleEN().opacity(0, 0.5),
    titleCN().opacity(0, 0.5),
    titleSub().opacity(0, 0.5),
    accentBar().opacity(0, 0.5),
  );
});
