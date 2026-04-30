import {Circle, Layout, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  Reference,
  all,
  createRef,
  delay,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {COLORS, FONTS} from '../lib/design';
import {BrandCorner} from '../lib/brand';

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ------------------------------------------------------------
  // Phase 1 — single agent (~6s)
  // ------------------------------------------------------------
  const singleAgent = createRef<Rect>();
  const singleLabel = createRef<Txt>();

  view.add(
    <>
      <Rect
        ref={singleAgent}
        width={280}
        height={160}
        radius={20}
        fill={COLORS.card}
        stroke={COLORS.accent}
        lineWidth={4}
        opacity={0}
        scale={0.8}
      >
        <Layout direction="column" alignItems="center" gap={6} layout>
          <Txt
            text="Agent"
            fontFamily={FONTS.cn}
            fontWeight={700}
            fontSize={42}
            fill={COLORS.text}
          />
          <Txt
            text="1 of 1"
            fontFamily={FONTS.mono}
            fontSize={22}
            fill={COLORS.textDim}
          />
        </Layout>
      </Rect>
      <Txt
        ref={singleLabel}
        text="一个 Agent · 没编排可言"
        fontFamily={FONTS.cn}
        fontSize={42}
        fill={COLORS.textDim}
        y={180}
        opacity={0}
      />
    </>,
  );

  yield* all(
    singleAgent().opacity(1, 0.6),
    singleAgent().scale(1, 0.6),
  );
  yield* singleLabel().opacity(1, 0.5);
  yield* waitFor(4.6);

  // ------------------------------------------------------------
  // Phase 2 — explode into multiple agents (~7s)
  // ------------------------------------------------------------
  const multiAgents: Reference<Rect>[] = Array.from({length: 5}, () => createRef<Rect>());
  const positions: Array<[number, number]> = [
    [-560, -120],
    [-280, 120],
    [0, -160],
    [280, 100],
    [560, -100],
  ];

  view.add(
    <>
      {positions.map((pos, i) => (
        <Rect
          ref={multiAgents[i]}
          width={180}
          height={100}
          radius={14}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={pos}
          opacity={0}
          scale={0.6}
        >
          <Txt
            text={`Agent ${i + 1}`}
            fontFamily={FONTS.cn}
            fontWeight={700}
            fontSize={28}
            fill={COLORS.text}
          />
        </Rect>
      ))}
    </>,
  );

  yield* all(
    singleAgent().opacity(0, 0.5),
    singleLabel().opacity(0, 0.5),
  );
  yield* sequence(
    0.12,
    ...multiAgents.map(a => all(a().opacity(1, 0.4), a().scale(1, 0.4))),
  );

  // chaotic question marks
  const qMarks: Reference<Txt>[] = Array.from({length: 4}, () => createRef<Txt>());
  const qPositions: Array<[number, number]> = [
    [-420, -260],
    [-100, 240],
    [200, -260],
    [430, 220],
  ];
  view.add(
    <>
      {qPositions.map((pos, i) => (
        <Txt
          ref={qMarks[i]}
          text="?"
          fontFamily={FONTS.mono}
          fontWeight={900}
          fontSize={120}
          fill={COLORS.warm}
          position={pos}
          opacity={0}
        />
      ))}
    </>,
  );

  yield* sequence(0.15, ...qMarks.map(q => q().opacity(1, 0.3)));
  yield* waitFor(4.4);

  // ------------------------------------------------------------
  // Phase 3 — the BIG question (~10s)
  // ------------------------------------------------------------
  const bigQ = createRef<Txt>();
  const bigQ2 = createRef<Txt>();
  const underline = createRef<Rect>();

  view.add(
    <>
      <Txt
        ref={bigQ}
        text="谁来决定"
        fontFamily={FONTS.display}
        fontWeight={900}
        fontSize={140}
        fill={COLORS.text}
        y={-60}
        opacity={0}
      />
      <Txt
        ref={bigQ2}
        text="下一步谁干活？"
        fontFamily={FONTS.display}
        fontWeight={900}
        fontSize={140}
        fill={COLORS.brand}
        y={100}
        opacity={0}
      />
      <Rect
        ref={underline}
        width={0}
        height={8}
        radius={4}
        fill={COLORS.yellow}
        y={200}
      />
    </>,
  );

  yield* all(
    ...multiAgents.map(a => a().opacity(0, 0.5)),
    ...qMarks.map(q => q().opacity(0, 0.5)),
  );
  yield* all(
    bigQ().opacity(1, 0.6),
    bigQ().y(-80, 0.6, easeOutCubic),
  );
  yield* all(
    bigQ2().opacity(1, 0.6),
    bigQ2().y(80, 0.6, easeOutCubic),
  );
  yield* underline().width(820, 0.5, easeOutCubic);
  yield* waitFor(7.4);

  // ------------------------------------------------------------
  // Phase 4 — four answers preview (~10s)
  // ------------------------------------------------------------
  const modes = [
    {name: 'Supervisor', who: '总管 LLM', color: COLORS.supervisor},
    {name: 'Workflow', who: '你的代码', color: COLORS.workflow},
    {name: 'Handoff', who: '当前 Agent', color: COLORS.handoff},
    {name: 'Council', who: '靠汇总', color: COLORS.council},
  ];

  const modeCards: Reference<Rect>[] = modes.map(() => createRef<Rect>());
  const baseX = -660;
  const gap = 440;

  view.add(
    <>
      {modes.map((m, i) => (
        <Rect
          ref={modeCards[i]}
          width={380}
          height={220}
          radius={20}
          fill={COLORS.panel}
          stroke={m.color}
          lineWidth={3}
          position={[baseX + i * gap, 200]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={16} padding={28} layout>
            <Txt
              text={`0${i + 1}`}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fontSize={28}
              fill={m.color}
            />
            <Txt
              text={m.name}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fontSize={42}
              fill={COLORS.text}
            />
            <Txt
              text={`决策者：${m.who}`}
              fontFamily={FONTS.cn}
              fontSize={26}
              fill={COLORS.textDim}
            />
          </Layout>
        </Rect>
      ))}
    </>,
  );

  yield* all(
    bigQ().y(-360, 0.7, easeInOutCubic),
    bigQ().fontSize(70, 0.7),
    bigQ2().y(-260, 0.7, easeInOutCubic),
    bigQ2().fontSize(70, 0.7),
    underline().y(-180, 0.7, easeInOutCubic),
    underline().width(620, 0.5),
  );
  yield* sequence(
    0.18,
    ...modeCards.map(c => all(c().opacity(1, 0.5), c().position.y(180, 0.5, easeOutCubic))),
  );
  yield* waitFor(8.9);

  yield* all(
    bigQ().opacity(0, 0.5),
    bigQ2().opacity(0, 0.5),
    underline().opacity(0, 0.5),
    ...modeCards.map(c => c().opacity(0, 0.5)),
  );
});
