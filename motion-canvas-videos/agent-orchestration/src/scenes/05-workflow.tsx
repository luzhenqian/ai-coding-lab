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
import {COLORS, FONTS, ICONS, IconLabel} from '../lib/design';
import {BrandCorner} from '../lib/brand';

const ACCENT = COLORS.workflow;

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ---- title (~4s) ----
  const titleIdx = createRef<Txt>();
  const titleCN = createRef<Txt>();
  const titleEN = createRef<Txt>();
  const titleBar = createRef<Rect>();
  const shape = createRef<Rect>();

  view.add(
    <>
      {/* ▱ shape watermark — Workflow's slanted parallelogram signature */}
      <Rect
        ref={shape}
        width={680}
        height={380}
        stroke={ACCENT}
        lineWidth={5}
        skew={[14, 0]}
        opacity={0}
      />
      <Rect ref={titleBar} width={0} height={6} radius={3} fill={ACCENT} y={-180} />
      <Txt
        ref={titleIdx}
        text="02 / 工作流模式"
        fontFamily={FONTS.mono}
        fontSize={36}
        fill={ACCENT}
        y={-110}
        opacity={0}
      />
      <Txt
        ref={titleCN}
        text="Workflow"
        fontFamily={FONTS.mono}
        fontWeight={700}
        fontSize={140}
        fill={COLORS.text}
        y={20}
        opacity={0}
      />
      <Txt
        ref={titleEN}
        text="路径写死 · 你的代码说了算"
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
  yield* sequence(0.18, titleIdx().opacity(1, 0.4), titleCN().opacity(1, 0.5), titleEN().opacity(1, 0.4));
  yield* waitFor(4);
  yield* all(
    shape().opacity(0, 0.5),
    titleBar().opacity(0, 0.5),
    titleIdx().opacity(0, 0.5),
    titleCN().opacity(0, 0.5),
    titleEN().opacity(0, 0.5),
  );

  // ---- metaphor — assembly line (~6s) ----
  const brollLabel = createRef<Txt>();
  const conveyor = createRef<Rect>();
  const stationStrip: Reference<Rect>[] = Array.from({length: 4}, () => createRef<Rect>());
  const stationNames = ['装底盘', '装引擎', '装内饰', '喷漆'];

  view.add(
    <>
      <Txt
        ref={brollLabel}
        text="比方说 · 汽车装配流水线"
        fontFamily={FONTS.cn}
        fontSize={32}
        fill={COLORS.muted}
        y={-260}
        opacity={0}
      />
      <Rect
        ref={conveyor}
        width={0}
        height={12}
        radius={6}
        fill={COLORS.cardBorder}
        y={20}
      />
      {stationNames.map((name, i) => (
        <Rect
          ref={stationStrip[i]}
          width={240}
          height={120}
          radius={14}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[-540 + i * 360, -80]}
          opacity={0}
        >
          <Txt
            text={`Station ${i + 1}`}
            fontFamily={FONTS.mono}
            fontSize={22}
            fill={COLORS.textDim}
            y={-26}
          />
          <Txt
            text={name}
            fontFamily={FONTS.cn}
            fontWeight={700}
            fontSize={32}
            fill={COLORS.text}
            y={20}
          />
        </Rect>
      ))}
    </>,
  );

  yield* brollLabel().opacity(1, 0.4);
  yield* conveyor().width(1500, 0.6, easeOutCubic);
  yield* sequence(0.15, ...stationStrip.map(s => s().opacity(1, 0.4)));
  yield* waitFor(4);
  yield* all(
    brollLabel().opacity(0, 0.5),
    conveyor().opacity(0, 0.5),
    ...stationStrip.map(s => s().opacity(0, 0.5)),
  );

  // ---- topology — code-driven chain (~16s) ----
  const codeBox = createRef<Rect>();
  const codeLines = [
    '.then(classify)',
    '.branch({...})',
    '.parallel([a, b])',
    '.then(format)',
  ];
  const codeRefs: Reference<Txt>[] = codeLines.map(() => createRef<Txt>());

  const steps: Reference<Rect>[] = Array.from({length: 4}, () => createRef<Rect>());
  const stepNames = [
    {cn: '分类', mono: 'classify'},
    {cn: '分支', mono: 'branch'},
    {cn: '并行', mono: 'parallel'},
    {cn: '汇总', mono: 'format'},
  ];
  const arrows: Reference<Line>[] = Array.from({length: 4}, () => createRef<Line>());

  const stepXs = [-660, -220, 220, 660];
  const stepY = 80;

  view.add(
    <>
      <Rect
        ref={codeBox}
        width={1280}
        height={180}
        radius={20}
        fill={COLORS.panel}
        stroke={COLORS.cardBorder}
        lineWidth={2}
        y={-280}
        opacity={0}
      >
        <Layout direction="row" gap={48} padding={32} layout>
          {codeLines.map((c, i) => (
            <Txt
              ref={codeRefs[i]}
              text={c}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fontSize={28}
              fill={COLORS.textDim}
              opacity={0.3}
            />
          ))}
        </Layout>
      </Rect>

      {/* input pill */}
      <Rect
        width={140}
        height={70}
        radius={35}
        fill={COLORS.cardBorder}
        position={[-1000, stepY]}
        opacity={0}
      >
        <Txt
          text="Input"
          fontFamily={FONTS.mono}
          fontSize={26}
          fill={COLORS.text}
        />
      </Rect>

      {stepNames.map((s, i) => (
        <Rect
          ref={steps[i]}
          width={300}
          height={140}
          radius={16}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[stepXs[i], stepY]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={6} layout>
            <Txt
              text={`Step ${i + 1}`}
              fontFamily={FONTS.mono}
              fontSize={22}
              fill={COLORS.textDim}
            />
            <Txt
              text={s.cn}
              fontFamily={FONTS.cn}
              fontWeight={700}
              fontSize={36}
              fill={COLORS.text}
            />
            <Txt
              text={s.mono}
              fontFamily={FONTS.mono}
              fontSize={20}
              fill={ACCENT}
            />
          </Layout>
        </Rect>
      ))}

      {/* arrows between steps + from input */}
      <Line
        ref={arrows[0]}
        points={[[-920, stepY], [stepXs[0] - 160, stepY]]}
        stroke={ACCENT}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />
      <Line
        ref={arrows[1]}
        points={[[stepXs[0] + 160, stepY], [stepXs[1] - 160, stepY]]}
        stroke={ACCENT}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />
      <Line
        ref={arrows[2]}
        points={[[stepXs[1] + 160, stepY], [stepXs[2] - 160, stepY]]}
        stroke={ACCENT}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />
      <Line
        ref={arrows[3]}
        points={[[stepXs[2] + 160, stepY], [stepXs[3] - 160, stepY]]}
        stroke={ACCENT}
        lineWidth={4}
        endArrow
        arrowSize={14}
        end={0}
      />
    </>,
  );

  yield* codeBox().opacity(1, 0.4);
  yield* sequence(0.12, ...steps.map(s => s().opacity(1, 0.4)));
  yield* sequence(0.1, ...arrows.map(a => a().end(1, 0.3)));
  yield* waitFor(0.4);

  // Token rides ABOVE the step row (so it never overlaps card content) and
  // each step + matching code line lights up as the token passes overhead.
  const tokenY = stepY - 130;
  const token = (
    <Circle size={28} fill={ACCENT} position={[-1000, tokenY]} opacity={0} />
  ) as Circle;
  view.add(token);
  yield* token.opacity(1, 0.2);

  for (let i = 0; i < 4; i++) {
    yield* token.position.x(stepXs[i], 0.7, easeInOutCubic);
    yield* all(
      steps[i]().stroke(ACCENT, 0.15),
      steps[i]().scale(1.05, 0.15),
      codeRefs[i]().opacity(1, 0.15),
      codeRefs[i]().fill(ACCENT, 0.15),
    );
    yield* waitFor(1);
    yield* all(
      steps[i]().stroke(COLORS.cardBorder, 0.25),
      steps[i]().scale(1, 0.25),
      codeRefs[i]().opacity(0.4, 0.25),
      codeRefs[i]().fill(COLORS.textDim, 0.25),
    );
  }
  yield* token.position.x(1000, 0.5, easeInOutCubic);
  yield* token.opacity(0, 0.3);
  yield* waitFor(2);

  // ---- decision + pros/cons (~9s) ----
  const badge = createRef<Rect>();
  const prosBox = createRef<Rect>();
  const consBox = createRef<Rect>();

  view.add(
    <>
      <Rect ref={badge} width={520} height={120} radius={16} fill={COLORS.panel} stroke={ACCENT} lineWidth={3} position={[-540, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <Txt text="决策者" fontFamily={FONTS.cn} fontSize={24} fill={COLORS.muted} />
          <Txt text="你的代码" fontFamily={FONTS.cn} fontWeight={700} fontSize={40} fill={ACCENT} />
        </Layout>
      </Rect>
      <Rect ref={prosBox} width={380} height={120} radius={16} fill={COLORS.panel} stroke={COLORS.council} lineWidth={2} position={[40, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.pros} text="优势" color={COLORS.council} />
          <Txt text="确定，好回归测试" fontFamily={FONTS.cn} fontWeight={700} fontSize={28} fill={COLORS.text} />
        </Layout>
      </Rect>
      <Rect ref={consBox} width={460} height={120} radius={16} fill={COLORS.panel} stroke={COLORS.warm} lineWidth={2} position={[560, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.cons} text="代价" color={COLORS.warm} />
          <Txt text="僵硬，遇变就改线" fontFamily={FONTS.cn} fontWeight={700} fontSize={28} fill={COLORS.text} />
        </Layout>
      </Rect>
    </>,
  );

  yield* sequence(0.18, badge().opacity(1, 0.4), prosBox().opacity(1, 0.4), consBox().opacity(1, 0.4));
  yield* waitFor(17);

  yield* all(
    codeBox().opacity(0, 0.5),
    ...steps.map(s => s().opacity(0, 0.5)),
    ...arrows.map(a => a().opacity(0, 0.5)),
    badge().opacity(0, 0.5),
    prosBox().opacity(0, 0.5),
    consBox().opacity(0, 0.5),
  );
});
