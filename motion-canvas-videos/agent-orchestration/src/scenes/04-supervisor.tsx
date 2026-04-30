import {Circle, Layout, Line, Polygon, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  Reference,
  all,
  chain,
  createRef,
  delay,
  easeInOutCubic,
  easeOutCubic,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {COLORS, FONTS, ICONS, IconLabel} from '../lib/design';
import {BrandCorner} from '../lib/brand';

const ACCENT = COLORS.supervisor;

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ------------------------------------------------------------
  // Title (~4s)
  // ------------------------------------------------------------
  const titleIdx = createRef<Txt>();
  const titleCN = createRef<Txt>();
  const titleEN = createRef<Txt>();
  const titleBar = createRef<Rect>();
  const shape = createRef<Polygon>();

  view.add(
    <>
      {/* ▽ shape watermark — Supervisor's geometric signature */}
      <Polygon
        ref={shape}
        sides={3}
        size={560}
        stroke={ACCENT}
        lineWidth={5}
        rotation={180}
        opacity={0}
      />
      <Rect ref={titleBar} width={0} height={6} radius={3} fill={ACCENT} y={-180} />
      <Txt
        ref={titleIdx}
        text="01 / 总管模式"
        fontFamily={FONTS.mono}
        fontSize={36}
        fill={ACCENT}
        y={-110}
        opacity={0}
      />
      <Txt
        ref={titleCN}
        text="Supervisor"
        fontFamily={FONTS.mono}
        fontWeight={700}
        fontSize={140}
        fill={COLORS.text}
        y={20}
        opacity={0}
      />
      <Txt
        ref={titleEN}
        text="一个总管 · 用 LLM 决定下一步"
        fontFamily={FONTS.cn}
        fontSize={40}
        fill={COLORS.textDim}
        y={150}
        opacity={0}
      />
    </>,
  );

  yield* shape().opacity(0.16, 0.5);
  yield* titleBar().width(380, 0.4, easeOutCubic);
  yield* sequence(
    0.18,
    titleIdx().opacity(1, 0.4),
    titleCN().opacity(1, 0.5),
    titleEN().opacity(1, 0.4),
  );
  yield* waitFor(3.5);
  yield* all(
    shape().opacity(0, 0.5),
    titleBar().opacity(0, 0.5),
    titleIdx().opacity(0, 0.5),
    titleCN().opacity(0, 0.5),
    titleEN().opacity(0, 0.5),
  );

  // ------------------------------------------------------------
  // Metaphor card — 米其林总厨 (~8s)
  // ------------------------------------------------------------
  const broll = createRef<Rect>();
  const brollLabel = createRef<Txt>();
  const chef = createRef<Rect>();
  const stations: Reference<Rect>[] = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];
  const stationLabels = ['水产档口', '面食档口', '酱料档口'];

  view.add(
    <>
      <Rect
        ref={broll}
        width={1500}
        height={620}
        radius={24}
        fill={COLORS.panel}
        stroke={COLORS.cardBorder}
        lineWidth={2}
        opacity={0}
      />
      <Txt
        ref={brollLabel}
        text="比方说 · 米其林餐厅"
        fontFamily={FONTS.cn}
        fontSize={32}
        fill={COLORS.muted}
        y={-260}
        opacity={0}
      />

      <Rect
        ref={chef}
        width={300}
        height={140}
        radius={20}
        fill={COLORS.card}
        stroke={ACCENT}
        lineWidth={4}
        position={[0, -130]}
        opacity={0}
      >
        <Layout direction="column" alignItems="center" gap={6} layout>
          <Txt
            text="总厨"
            fontFamily={FONTS.cn}
            fontWeight={900}
            fontSize={48}
            fill={COLORS.text}
          />
          <Txt
            text="拆任务 · 不动手"
            fontFamily={FONTS.cn}
            fontSize={20}
            fill={ACCENT}
          />
        </Layout>
      </Rect>

      {stationLabels.map((label, i) => (
        <Rect
          ref={stations[i]}
          width={260}
          height={120}
          radius={16}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[-360 + i * 360, 130]}
          opacity={0}
        >
          <Txt
            text={label}
            fontFamily={FONTS.cn}
            fontWeight={700}
            fontSize={36}
            fill={COLORS.text}
          />
        </Rect>
      ))}
    </>,
  );

  yield* all(broll().opacity(0.5, 0.5), brollLabel().opacity(1, 0.5));
  yield* chef().opacity(1, 0.5);
  yield* sequence(
    0.2,
    ...stations.map(s => s().opacity(1, 0.4)),
  );
  yield* waitFor(8);

  // fade out broll, transition to topology
  yield* all(
    broll().opacity(0, 0.5),
    brollLabel().opacity(0, 0.5),
    chef().opacity(0, 0.4),
    ...stations.map(s => s().opacity(0, 0.4)),
  );

  // ------------------------------------------------------------
  // Topology — Supervisor + 3 specialists (~15s)
  // ------------------------------------------------------------
  const sup = createRef<Rect>();
  const supLabel = createRef<Layout>();
  const specs: Reference<Rect>[] = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];
  const specNames = [
    {name: '查询 Agent', tool: 'search()'},
    {name: '分析 Agent', tool: 'analyze()'},
    {name: '撰写 Agent', tool: 'write()'},
  ];
  const dispatchLines: Reference<Line>[] = [
    createRef<Line>(),
    createRef<Line>(),
    createRef<Line>(),
  ];
  const reportLines: Reference<Line>[] = [
    createRef<Line>(),
    createRef<Line>(),
    createRef<Line>(),
  ];

  const supY = -240;
  const specY = 200;
  const specXs = [-440, 0, 440];

  view.add(
    <>
      <Rect
        ref={sup}
        width={360}
        height={150}
        radius={20}
        fill={COLORS.card}
        stroke={ACCENT}
        lineWidth={4}
        position={[0, supY]}
        opacity={0}
      >
        <Layout ref={supLabel} direction="column" alignItems="center" gap={6} layout>
          <Txt
            text="Supervisor"
            fontFamily={FONTS.mono}
            fontWeight={700}
            fontSize={42}
            fill={COLORS.text}
          />
          <Txt
            text="总管 · LLM 决策"
            fontFamily={FONTS.cn}
            fontSize={22}
            fill={ACCENT}
          />
        </Layout>
      </Rect>

      {specNames.map((s, i) => (
        <Rect
          ref={specs[i]}
          width={280}
          height={130}
          radius={16}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[specXs[i], specY]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={6} layout>
            <Txt
              text={s.name}
              fontFamily={FONTS.cn}
              fontWeight={700}
              fontSize={30}
              fill={COLORS.text}
            />
            <Txt
              text={s.tool}
              fontFamily={FONTS.mono}
              fontSize={20}
              fill={COLORS.textDim}
            />
          </Layout>
        </Rect>
      ))}

      {/* dispatch arrows: supervisor → specialist */}
      {specXs.map((x, i) => (
        <Line
          ref={dispatchLines[i]}
          points={[
            [0, supY + 80],
            [x, specY - 70],
          ]}
          stroke={ACCENT}
          lineWidth={3}
          endArrow
          arrowSize={12}
          end={0}
          lineDash={[10, 6]}
        />
      ))}

      {/* report arrows: specialist → supervisor */}
      {specXs.map((x, i) => (
        <Line
          ref={reportLines[i]}
          points={[
            [x + 30, specY - 70],
            [30, supY + 80],
          ]}
          stroke={COLORS.muted}
          lineWidth={2}
          endArrow
          arrowSize={10}
          end={0}
        />
      ))}
    </>,
  );

  yield* sup().opacity(1, 0.5);
  yield* sequence(0.15, ...specs.map(s => s().opacity(1, 0.4)));
  yield* sequence(0.12, ...dispatchLines.map(l => l().end(1, 0.4)));
  yield* waitFor(1);

  // animate dispatch tokens flowing supervisor → specialist
  function* dispatchToken(i: number) {
    const token = (
      <Circle size={26} fill={ACCENT} position={[0, supY + 80]} />
    ) as Circle;
    view.add(token);
    yield* token.position([specXs[i], specY - 70], 0.6, easeInOutCubic);
    yield* all(
      token.opacity(0, 0.2),
      specs[i]().stroke(ACCENT, 0.2),
      specs[i]().scale(1.05, 0.2),
    );
    token.remove();
    yield* all(
      specs[i]().scale(1, 0.4),
      reportLines[i]().end(1, 0.5),
    );
    yield* specs[i]().stroke(COLORS.cardBorder, 0.3);
  }

  for (let i = 0; i < 3; i++) {
    yield* dispatchToken(i);
    yield* waitFor(1.8);
  }

  // 总管收到反馈后再决定下一个动作（高亮 Supervisor）
  const thinkBubble = createRef<Txt>();
  view.add(
    <Txt
      ref={thinkBubble}
      text="LLM 推理：下一步谁干？"
      fontFamily={FONTS.cn}
      fontSize={28}
      fill={ACCENT}
      position={[0, supY - 110]}
      opacity={0}
    />,
  );
  yield* all(
    thinkBubble().opacity(1, 0.3),
    sup().scale(1.05, 0.3).to(1, 0.4),
  );
  yield* waitFor(6);
  yield* thinkBubble().opacity(0, 0.4);
  yield* waitFor(2);

  // ------------------------------------------------------------
  // Decision badge + pros/cons (~9s)
  // ------------------------------------------------------------
  const badge = createRef<Rect>();
  const prosBox = createRef<Rect>();
  const consBox = createRef<Rect>();

  view.add(
    <>
      <Rect
        ref={badge}
        width={520}
        height={120}
        radius={16}
        fill={COLORS.panel}
        stroke={ACCENT}
        lineWidth={3}
        position={[-540, 420]}
        opacity={0}
      >
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <Txt
            text="决策者"
            fontFamily={FONTS.cn}
            fontSize={24}
            fill={COLORS.muted}
          />
          <Txt
            text="总管 LLM"
            fontFamily={FONTS.cn}
            fontWeight={700}
            fontSize={40}
            fill={ACCENT}
          />
        </Layout>
      </Rect>

      <Rect
        ref={prosBox}
        width={380}
        height={120}
        radius={16}
        fill={COLORS.panel}
        stroke={COLORS.council}
        lineWidth={2}
        position={[40, 420]}
        opacity={0}
      >
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.pros} text="优势" color={COLORS.council} />
          <Txt
            text="灵活，随时改路线"
            fontFamily={FONTS.cn}
            fontWeight={700}
            fontSize={28}
            fill={COLORS.text}
          />
        </Layout>
      </Rect>

      <Rect
        ref={consBox}
        width={460}
        height={120}
        radius={16}
        fill={COLORS.panel}
        stroke={COLORS.warm}
        lineWidth={2}
        position={[560, 420]}
        opacity={0}
      >
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.cons} text="代价" color={COLORS.warm} />
          <Txt
            text="路径不固定，调试难"
            fontFamily={FONTS.cn}
            fontWeight={700}
            fontSize={28}
            fill={COLORS.text}
          />
        </Layout>
      </Rect>
    </>,
  );

  yield* sequence(
    0.18,
    badge().opacity(1, 0.4),
    prosBox().opacity(1, 0.4),
    consBox().opacity(1, 0.4),
  );
  yield* waitFor(15.5);

  yield* all(
    sup().opacity(0, 0.5),
    ...specs.map(s => s().opacity(0, 0.5)),
    ...dispatchLines.map(l => l().opacity(0, 0.5)),
    ...reportLines.map(l => l().opacity(0, 0.5)),
    badge().opacity(0, 0.5),
    prosBox().opacity(0, 0.5),
    consBox().opacity(0, 0.5),
  );
});
