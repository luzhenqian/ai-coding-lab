import {Circle, Layout, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  all,
  chain,
  createRef,
  createSignal,
  delay,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  waitFor,
} from '@motion-canvas/core';

const COLORS = {
  bg: '#0f1020',
  card: '#1a1d35',
  cardBorder: '#2a3050',
  accent: '#00d9ff',
  accentSoft: '#0090a8',
  warm: '#ff6b6b',
  warmSoft: '#a83a3a',
  yellow: '#ffe66d',
  text: '#f4f5fb',
  muted: '#8892b0',
};

const FONT_CN = 'Noto Sans SC, sans-serif';
const FONT_MONO = 'JetBrains Mono, monospace';

export default makeScene2D(function* (view) {
  // ============================================================
  // SECTION 1 — Title card
  // ============================================================
  const title = createRef<Txt>();
  const subtitle = createRef<Txt>();

  view.add(
    <>
      <Txt
        ref={title}
        text="AI Agent 编排"
        fontFamily={FONT_CN}
        fontWeight={900}
        fontSize={140}
        fill={COLORS.text}
        opacity={0}
        y={-40}
      />
      <Txt
        ref={subtitle}
        text="Orchestration · 顺序 vs 并行"
        fontFamily={FONT_MONO}
        fontSize={44}
        fill={COLORS.accent}
        opacity={0}
        y={70}
      />
    </>,
  );

  yield* sequence(
    0.3,
    all(title().opacity(1, 0.8), title().y(-80, 0.8, easeOutCubic)),
    all(subtitle().opacity(1, 0.6), subtitle().y(50, 0.6, easeOutCubic)),
  );
  yield* waitFor(1.4);
  yield* all(
    title().opacity(0, 0.5),
    subtitle().opacity(0, 0.5),
    title().y(-160, 0.5),
    subtitle().y(-30, 0.5),
  );
  title().remove();
  subtitle().remove();

  // ============================================================
  // SECTION 2 — Sequential pattern
  // ============================================================
  const seqLabel = createRef<Txt>();
  const seqBoxes: ReturnType<typeof createRef<Rect>>[] = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];
  const seqArrows: ReturnType<typeof createRef<Line>>[] = [
    createRef<Line>(),
    createRef<Line>(),
    createRef<Line>(),
    createRef<Line>(),
  ];
  const seqTimer = createRef<Txt>();
  const token = createRef<Circle>();
  const seqInput = createRef<Txt>();
  const seqOutput = createRef<Txt>();

  const seqContainer = createRef<Layout>();

  view.add(
    <Layout ref={seqContainer} opacity={0}>
      <Txt
        ref={seqLabel}
        text="顺序模式 · Sequential"
        fontFamily={FONT_CN}
        fontWeight={700}
        fontSize={56}
        fill={COLORS.warm}
        y={-340}
      />

      <Txt
        ref={seqInput}
        text="Input"
        fontFamily={FONT_MONO}
        fontSize={32}
        fill={COLORS.muted}
        position={[-820, -10]}
      />

      {/* 3 agent boxes */}
      {[-360, 0, 360].map((x, i) => (
        <Rect
          ref={seqBoxes[i]}
          width={220}
          height={160}
          radius={20}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[x, 0]}
        >
          <Txt
            text={`Agent ${String.fromCharCode(65 + i)}`}
            fontFamily={FONT_CN}
            fontWeight={700}
            fontSize={36}
            fill={COLORS.text}
          />
          <Txt
            text="3s"
            fontFamily={FONT_MONO}
            fontSize={24}
            fill={COLORS.muted}
            y={48}
          />
        </Rect>
      ))}

      {/* arrows: input → A, A → B, B → C, C → output */}
      <Line
        ref={seqArrows[0]}
        points={[
          [-740, 0],
          [-470, 0],
        ]}
        stroke={COLORS.cardBorder}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />
      <Line
        ref={seqArrows[1]}
        points={[
          [-250, 0],
          [-110, 0],
        ]}
        stroke={COLORS.cardBorder}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />
      <Line
        ref={seqArrows[2]}
        points={[
          [110, 0],
          [250, 0],
        ]}
        stroke={COLORS.cardBorder}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />
      <Line
        ref={seqArrows[3]}
        points={[
          [470, 0],
          [740, 0],
        ]}
        stroke={COLORS.cardBorder}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />

      <Txt
        ref={seqOutput}
        text="Output"
        fontFamily={FONT_MONO}
        fontSize={32}
        fill={COLORS.muted}
        position={[820, -10]}
        opacity={0}
      />

      {/* token that travels through */}
      <Circle
        ref={token}
        size={32}
        fill={COLORS.warm}
        position={[-820, 0]}
        opacity={0}
      />

      {/* total time counter */}
      <Txt
        ref={seqTimer}
        text="总耗时: 0.0s"
        fontFamily={FONT_MONO}
        fontSize={42}
        fill={COLORS.warm}
        y={300}
        opacity={0}
      />
    </Layout>,
  );

  yield* seqContainer().opacity(1, 0.6);
  yield* sequence(
    0.15,
    seqArrows[0]().end(1, 0.4),
    seqArrows[1]().end(1, 0.4),
    seqArrows[2]().end(1, 0.4),
    seqArrows[3]().end(1, 0.4),
  );
  yield* all(token().opacity(1, 0.3), seqTimer().opacity(1, 0.3));

  const seqTime = createSignal(0);
  seqTimer().text(() => `总耗时: ${seqTime().toFixed(1)}s`);

  // travel through chain — each agent: enter → pulse → exit
  for (let i = 0; i < 3; i++) {
    const targetX = [-360, 0, 360][i];
    yield* token().position.x(targetX, 0.5, easeInOutCubic);
    // agent processes (pulse + token disappears into agent)
    yield* all(
      seqBoxes[i]().stroke(COLORS.warm, 0.2),
      seqBoxes[i]().scale(1.08, 0.2),
      token().opacity(0, 0.2),
    );
    // simulate processing time
    yield* all(
      seqTime(seqTime() + 3, 1.2),
      seqBoxes[i]().fill(COLORS.warmSoft, 0.6).to(COLORS.card, 0.6),
    );
    // token re-emerges
    yield* all(
      seqBoxes[i]().stroke(COLORS.cardBorder, 0.2),
      seqBoxes[i]().scale(1, 0.2),
      token().opacity(1, 0.2),
    );
  }
  // final hop to output
  yield* all(
    token().position.x(820, 0.5, easeInOutCubic),
    delay(0.2, seqOutput().opacity(1, 0.3)),
  );
  yield* token().opacity(0, 0.3);

  yield* waitFor(0.8);
  yield* seqContainer().opacity(0, 0.6);
  seqContainer().remove();

  // ============================================================
  // SECTION 3 — Parallel pattern
  // ============================================================
  const parContainer = createRef<Layout>();
  const parLabel = createRef<Txt>();
  const parBoxes: ReturnType<typeof createRef<Rect>>[] = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];
  const parArrowsIn: ReturnType<typeof createRef<Line>>[] = [
    createRef<Line>(),
    createRef<Line>(),
    createRef<Line>(),
  ];
  const parArrowsOut: ReturnType<typeof createRef<Line>>[] = [
    createRef<Line>(),
    createRef<Line>(),
    createRef<Line>(),
  ];
  const parInput = createRef<Circle>();
  const parOutput = createRef<Circle>();
  const parInputLabel = createRef<Txt>();
  const parOutputLabel = createRef<Txt>();
  const parTimer = createRef<Txt>();

  const yPositions = [-220, 0, 220];

  view.add(
    <Layout ref={parContainer} opacity={0}>
      <Txt
        ref={parLabel}
        text="并行模式 · Parallel"
        fontFamily={FONT_CN}
        fontWeight={700}
        fontSize={56}
        fill={COLORS.accent}
        y={-380}
      />

      <Circle
        ref={parInput}
        size={56}
        fill={COLORS.accent}
        position={[-720, 0]}
      />
      <Txt
        ref={parInputLabel}
        text="Input"
        fontFamily={FONT_MONO}
        fontSize={28}
        fill={COLORS.muted}
        position={[-720, 60]}
      />

      {yPositions.map((y, i) => (
        <Rect
          ref={parBoxes[i]}
          width={220}
          height={140}
          radius={20}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[0, y]}
        >
          <Txt
            text={`Agent ${i + 1}`}
            fontFamily={FONT_CN}
            fontWeight={700}
            fontSize={32}
            fill={COLORS.text}
          />
          <Txt
            text="3s"
            fontFamily={FONT_MONO}
            fontSize={22}
            fill={COLORS.muted}
            y={42}
          />
        </Rect>
      ))}

      {/* input arrows: from input to each agent */}
      {yPositions.map((y, i) => (
        <Line
          ref={parArrowsIn[i]}
          points={[
            [-680, 0],
            [-110, y],
          ]}
          stroke={COLORS.cardBorder}
          lineWidth={4}
          endArrow
          arrowSize={14}
          end={0}
        />
      ))}

      {/* output arrows: from each agent to output */}
      {yPositions.map((y, i) => (
        <Line
          ref={parArrowsOut[i]}
          points={[
            [110, y],
            [680, 0],
          ]}
          stroke={COLORS.cardBorder}
          lineWidth={4}
          endArrow
          arrowSize={14}
          end={0}
        />
      ))}

      <Circle
        ref={parOutput}
        size={56}
        fill={COLORS.accent}
        position={[720, 0]}
        opacity={0}
      />
      <Txt
        ref={parOutputLabel}
        text="Merge"
        fontFamily={FONT_MONO}
        fontSize={28}
        fill={COLORS.muted}
        position={[720, 60]}
        opacity={0}
      />

      <Txt
        ref={parTimer}
        text="总耗时: 0.0s"
        fontFamily={FONT_MONO}
        fontSize={42}
        fill={COLORS.accent}
        y={380}
        opacity={0}
      />
    </Layout>,
  );

  yield* parContainer().opacity(1, 0.6);
  yield* sequence(
    0.1,
    parArrowsIn[0]().end(1, 0.35),
    parArrowsIn[1]().end(1, 0.35),
    parArrowsIn[2]().end(1, 0.35),
    parArrowsOut[0]().end(1, 0.35),
    parArrowsOut[1]().end(1, 0.35),
    parArrowsOut[2]().end(1, 0.35),
  );
  yield* parTimer().opacity(1, 0.3);

  const parTime = createSignal(0);
  parTimer().text(() => `总耗时: ${parTime().toFixed(1)}s`);

  // 3 tokens fly into the 3 agents simultaneously
  const parTokens = [
    createRef<Circle>(),
    createRef<Circle>(),
    createRef<Circle>(),
  ];
  for (let i = 0; i < 3; i++) {
    parContainer().add(
      <Circle
        ref={parTokens[i]}
        size={26}
        fill={COLORS.accent}
        position={[-720, 0]}
      />,
    );
  }

  yield* all(
    ...parTokens.map((t, i) =>
      t().position([0, yPositions[i]], 0.6, easeInOutCubic),
    ),
  );
  // simultaneous processing
  yield* all(
    ...parBoxes.map(b =>
      all(b().stroke(COLORS.accent, 0.2), b().scale(1.08, 0.2)),
    ),
    ...parTokens.map(t => t().opacity(0, 0.2)),
  );
  yield* all(
    parTime(3, 1.2),
    ...parBoxes.map(b => b().fill(COLORS.accentSoft, 0.6).to(COLORS.card, 0.6)),
  );
  yield* all(
    ...parBoxes.map(b =>
      all(b().stroke(COLORS.cardBorder, 0.2), b().scale(1, 0.2)),
    ),
    ...parTokens.map(t => t().opacity(1, 0.2)),
  );

  // tokens converge to output
  yield* all(
    ...parTokens.map(t => t().position([720, 0], 0.6, easeInOutCubic)),
    delay(
      0.3,
      all(parOutput().opacity(1, 0.3), parOutputLabel().opacity(1, 0.3)),
    ),
  );
  yield* all(...parTokens.map(t => t().opacity(0, 0.3)));

  yield* waitFor(0.8);
  yield* parContainer().opacity(0, 0.6);
  parContainer().remove();

  // ============================================================
  // SECTION 4 — Comparison summary
  // ============================================================
  const cmpTitle = createRef<Txt>();
  const seqBar = createRef<Rect>();
  const parBar = createRef<Rect>();
  const seqBarLabel = createRef<Txt>();
  const parBarLabel = createRef<Txt>();
  const seqBarValue = createRef<Txt>();
  const parBarValue = createRef<Txt>();
  const punchline = createRef<Txt>();

  const cmpContainer = createRef<Layout>();

  view.add(
    <Layout ref={cmpContainer} opacity={0}>
      <Txt
        ref={cmpTitle}
        text="速度对比"
        fontFamily={FONT_CN}
        fontWeight={900}
        fontSize={72}
        fill={COLORS.text}
        y={-340}
      />

      <Txt
        ref={seqBarLabel}
        text="顺序"
        fontFamily={FONT_CN}
        fontWeight={700}
        fontSize={36}
        fill={COLORS.warm}
        position={[-560, -120]}
      />
      <Rect
        ref={seqBar}
        width={0}
        height={70}
        radius={12}
        fill={COLORS.warm}
        position={[-440, -120]}
        offset={[-1, 0]}
      />
      <Txt
        ref={seqBarValue}
        text="9.0s"
        fontFamily={FONT_MONO}
        fontWeight={700}
        fontSize={40}
        fill={COLORS.warm}
        position={[440, -120]}
        opacity={0}
      />

      <Txt
        ref={parBarLabel}
        text="并行"
        fontFamily={FONT_CN}
        fontWeight={700}
        fontSize={36}
        fill={COLORS.accent}
        position={[-560, 40]}
      />
      <Rect
        ref={parBar}
        width={0}
        height={70}
        radius={12}
        fill={COLORS.accent}
        position={[-440, 40]}
        offset={[-1, 0]}
      />
      <Txt
        ref={parBarValue}
        text="3.0s"
        fontFamily={FONT_MONO}
        fontWeight={700}
        fontSize={40}
        fill={COLORS.accent}
        position={[440, 40]}
        opacity={0}
      />

      <Txt
        ref={punchline}
        text="≈ 3× 加速"
        fontFamily={FONT_CN}
        fontWeight={900}
        fontSize={88}
        fill={COLORS.yellow}
        y={260}
        opacity={0}
      />
    </Layout>,
  );

  yield* cmpContainer().opacity(1, 0.5);
  yield* all(seqBar().width(900, 1.2, easeOutCubic), seqBarValue().opacity(1, 1.2));
  yield* all(parBar().width(300, 0.6, easeOutCubic), parBarValue().opacity(1, 0.6));
  yield* waitFor(0.4);
  yield* all(punchline().opacity(1, 0.6), punchline().scale(1.05, 0.6).to(1, 0.3));
  yield* waitFor(2.5);
});
