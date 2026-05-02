import {Icon, Layout, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
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
import {COLORS, FONTS, ICONS} from '../lib/design';
import {BrandCorner} from '../lib/brand';

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ------------------------------------------------------------
  // Phase 1 — channel header centered (~5s)
  // ------------------------------------------------------------
  const headerBar = createRef<Rect>();
  const headerCN = createRef<Txt>();
  const headerSub = createRef<Txt>();

  view.add(
    <>
      <Rect ref={headerBar} width={6} height={0} radius={3} fill={COLORS.accent} y={-30} />
      <Txt
        ref={headerCN}
        text="AI 编程实战"
        fontFamily={FONTS.display}
        fontWeight={900}
        fontSize={160}
        fill={COLORS.text}
        y={-60}
        opacity={0}
      />
      <Txt
        ref={headerSub}
        text="by Noah"
        fontFamily={FONTS.mono}
        fontSize={56}
        fill={COLORS.textDim}
        y={80}
        opacity={0}
      />
    </>,
  );

  yield* headerBar().height(220, 0.45, easeOutCubic);
  yield* all(
    headerCN().opacity(1, 0.6),
    headerCN().y(-80, 0.6, easeOutCubic),
  );
  yield* headerSub().opacity(1, 0.4);
  yield* waitFor(4.6);

  // ------------------------------------------------------------
  // Phase 2 — header shrinks into top badge + repo badge appears (~5s)
  // ------------------------------------------------------------
  const repoBadge = createRef<Rect>();

  view.add(
    <Rect
      ref={repoBadge}
      width={760}
      height={90}
      radius={45}
      fill={COLORS.panel}
      stroke={COLORS.accent}
      lineWidth={3}
      position={[-520, 380]}
      opacity={0}
    >
      <Layout direction="row" alignItems="center" gap={18} padding={28} layout>
        <Icon icon={ICONS.external} color={COLORS.accent} size={36} />
        <Txt
          text="github.com/luzhenqian/ai-coding-lab"
          fontFamily={FONTS.mono}
          fontSize={32}
          fill={COLORS.text}
        />
      </Layout>
    </Rect>,
  );

  yield* all(
    headerBar().height(70, 0.5, easeInOutCubic),
    headerBar().position([-820, -440], 0.5, easeInOutCubic),
    headerCN().fontSize(48, 0.5, easeInOutCubic),
    headerCN().position([-560, -440], 0.5, easeInOutCubic),
    headerSub().fontSize(28, 0.5, easeInOutCubic),
    headerSub().position([-330, -440], 0.5, easeInOutCubic),
    headerSub().fill(COLORS.muted, 0.5),
  );
  yield* all(
    repoBadge().opacity(1, 0.5),
    repoBadge().position.y(360, 0.5, easeOutCubic),
  );
  yield* waitFor(5);

  // ------------------------------------------------------------
  // Phase 3 — today's topic preview (~6s)
  // ------------------------------------------------------------
  const todayLabel = createRef<Txt>();
  const todayMain = createRef<Txt>();
  const todayHint = createRef<Txt>();
  const modeRefs: Reference<Rect>[] = [
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
    createRef<Rect>(),
  ];
  const modeNames = ['Supervisor', 'Workflow', 'Handoff', 'Council'];
  const modeColors = [
    COLORS.supervisor,
    COLORS.workflow,
    COLORS.handoff,
    COLORS.council,
  ];

  // 4 pills in a centered row
  const pillW = 320;
  const pillGap = 40;
  const totalW = pillW * 4 + pillGap * 3;
  const baseX = -totalW / 2 + pillW / 2;

  view.add(
    <>
      <Txt
        ref={todayLabel}
        text="今天讲"
        fontFamily={FONTS.cn}
        fontSize={42}
        fill={COLORS.muted}
        y={-180}
        opacity={0}
      />
      <Txt
        ref={todayMain}
        text="Agent 编排 · 四种主流模式"
        fontFamily={FONTS.display}
        fontWeight={900}
        fontSize={92}
        fill={COLORS.text}
        y={-80}
        opacity={0}
      />
      <Txt
        ref={todayHint}
        text="区别 · 优势 · 实际项目里怎么混着用"
        fontFamily={FONTS.cn}
        fontSize={32}
        fill={COLORS.textDim}
        y={20}
        opacity={0}
      />
      {modeNames.map((name, i) => (
        <Rect
          ref={modeRefs[i]}
          width={pillW}
          height={110}
          radius={16}
          fill={COLORS.panel}
          stroke={modeColors[i]}
          lineWidth={3}
          position={[baseX + i * (pillW + pillGap), 200]}
          opacity={0}
        >
          <Layout direction="row" alignItems="center" gap={20} padding={28} layout>
            <Rect width={12} height={56} radius={3} fill={modeColors[i]} />
            <Txt
              text={name}
              fontFamily={FONTS.mono}
              fontWeight={700}
              fontSize={40}
              fill={COLORS.text}
            />
          </Layout>
        </Rect>
      ))}
    </>,
  );

  yield* sequence(
    0.18,
    todayLabel().opacity(1, 0.4),
    todayMain().opacity(1, 0.5),
    todayHint().opacity(1, 0.4),
  );
  yield* sequence(
    0.14,
    ...modeRefs.map(r =>
      all(
        r().opacity(1, 0.4),
        r().position.y(180, 0.4, easeOutCubic),
      ),
    ),
  );
  yield* waitFor(7.8);

  // fade everything for next scene
  yield* all(
    headerBar().opacity(0, 0.5),
    headerCN().opacity(0, 0.5),
    headerSub().opacity(0, 0.5),
    repoBadge().opacity(0, 0.5),
    todayLabel().opacity(0, 0.5),
    todayMain().opacity(0, 0.5),
    todayHint().opacity(0, 0.5),
    ...modeRefs.map(r => r().opacity(0, 0.5)),
  );
});
