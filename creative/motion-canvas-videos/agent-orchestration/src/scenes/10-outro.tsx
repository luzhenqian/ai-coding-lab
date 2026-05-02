import {Icon, Layout, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  Reference,
  all,
  createRef,
  delay,
  easeOutCubic,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {COLORS, FONTS, ICONS} from '../lib/design';
import {BrandCorner} from '../lib/brand';

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ---- Phase 1 — comparison table (~12s) ----
  const titleBig = createRef<Txt>();
  view.add(
    <Txt ref={titleBig} text="四种模式 · 终极对比" fontFamily={FONTS.display} fontWeight={900} fontSize={72} fill={COLORS.text} y={-440} opacity={0} />,
  );
  yield* titleBig().opacity(1, 0.5);

  // table
  const tableContainer = createRef<Layout>();
  const headers = ['模式', '决策者', '灵活性', '确定性', '适用场景'];
  const rows = [
    {name: 'Supervisor', color: COLORS.supervisor, cells: ['总管 LLM', '高', '低', '开放任务 · 多 Agent 协作']},
    {name: 'Workflow', color: COLORS.workflow, cells: ['你的代码', '低', '高', '审批 · ETL · 写死流程']},
    {name: 'Handoff', color: COLORS.handoff, cells: ['当前 Agent', '中', '中', '多领域客服 · 切换专家']},
    {name: 'Council', color: COLORS.council, cells: ['没人 · 靠汇总', '中', '中', '研究 · 审核 · 关键决策']},
  ];

  const colWidths = [260, 280, 180, 180, 540];
  const rowHeight = 90;
  const headerHeight = 80;
  const totalWidth = colWidths.reduce((a, b) => a + b, 0);
  const startX = -totalWidth / 2;
  const tableY = -260;

  const headerRefs: Reference<Rect>[] = headers.map(() => createRef<Rect>());
  const rowRefs: Reference<Rect>[] = rows.map(() => createRef<Rect>());

  view.add(
    <Layout ref={tableContainer}>
      {/* header row */}
      {headers.map((h, i) => {
        const x = startX + colWidths.slice(0, i).reduce((a, b) => a + b, 0) + colWidths[i] / 2;
        return (
          <Rect
            ref={headerRefs[i]}
            width={colWidths[i] - 4}
            height={headerHeight}
            radius={i === 0 ? [12, 0, 0, 12] : i === headers.length - 1 ? [0, 12, 12, 0] : 0}
            fill={COLORS.panel}
            stroke={COLORS.cardBorder}
            lineWidth={1}
            position={[x, tableY]}
            opacity={0}
          >
            <Txt text={h} fontFamily={FONTS.cn} fontWeight={700} fontSize={28} fill={COLORS.textDim} />
          </Rect>
        );
      })}
      {/* data rows */}
      {rows.map((row, ri) => {
        const cells = [row.name, ...row.cells];
        const y = tableY + headerHeight + ri * rowHeight + rowHeight / 2 - rowHeight / 2 + 50;
        return (
          <Rect
            ref={rowRefs[ri]}
            width={totalWidth}
            height={rowHeight}
            radius={ri === rows.length - 1 ? [0, 0, 12, 12] : 0}
            fill={COLORS.bg}
            stroke={row.color}
            lineWidth={ri === 0 ? 2 : 1}
            position={[0, y]}
            opacity={0}
          >
            <Layout layout direction="row" alignItems="center">
              {cells.map((cell, ci) => {
                const cellWidth = colWidths[ci];
                const isName = ci === 0;
                return (
                  <Rect width={cellWidth} height={rowHeight} fill="rgba(0,0,0,0)">
                    <Layout direction="row" alignItems="center" gap={12} padding={20} layout>
                      {isName && <Rect width={8} height={36} radius={2} fill={row.color} />}
                      <Txt
                        text={cell}
                        fontFamily={isName ? FONTS.mono : FONTS.cn}
                        fontWeight={isName ? 700 : 400}
                        fontSize={isName ? 30 : 24}
                        fill={isName ? row.color : COLORS.text}
                      />
                    </Layout>
                  </Rect>
                );
              })}
            </Layout>
          </Rect>
        );
      })}
    </Layout>,
  );

  yield* sequence(0.04, ...headerRefs.map(r => r().opacity(1, 0.3)));
  yield* sequence(0.18, ...rowRefs.map(r => r().opacity(1, 0.4)));
  yield* waitFor(22);

  // ---- Phase 2 — outro card (~6s) ----
  yield* all(
    titleBig().opacity(0, 0.5),
    ...headerRefs.map(r => r().opacity(0, 0.5)),
    ...rowRefs.map(r => r().opacity(0, 0.5)),
  );

  const signOff = createRef<Txt>();
  const repoLink = createRef<Layout>();
  const qrPlaceholder = createRef<Rect>();
  const qrLabel = createRef<Txt>();

  view.add(
    <>
      <Txt
        ref={signOff}
        text="我是 Noah · 我们下期再见"
        fontFamily={FONTS.display}
        fontWeight={900}
        fontSize={72}
        fill={COLORS.text}
        y={-200}
        opacity={0}
      />
      <Layout
        ref={repoLink}
        direction="row"
        alignItems="center"
        gap={14}
        layout
        position={[-360, 80]}
        opacity={0}
      >
        <Icon icon={ICONS.external} color={COLORS.accent} size={32} />
        <Txt
          text="github.com/luzhenqian/ai-coding-lab"
          fontFamily={FONTS.mono}
          fontSize={32}
          fill={COLORS.accent}
        />
      </Layout>
      <Rect
        ref={qrPlaceholder}
        width={220}
        height={220}
        radius={14}
        fill={COLORS.card}
        stroke={COLORS.cardBorder}
        lineWidth={2}
        position={[400, 80]}
        opacity={0}
      >
        <Txt text="WeChat QR" fontFamily={FONTS.mono} fontSize={20} fill={COLORS.textDim} />
      </Rect>
      <Txt
        ref={qrLabel}
        text="加微信进群"
        fontFamily={FONTS.cn}
        fontSize={26}
        fill={COLORS.textDim}
        position={[400, 230]}
        opacity={0}
      />
    </>,
  );

  yield* signOff().opacity(1, 0.6);
  yield* all(
    repoLink().opacity(1, 0.4),
    qrPlaceholder().opacity(1, 0.4),
    qrLabel().opacity(1, 0.4),
  );
  yield* waitFor(19);

  // final fade
  yield* all(
    signOff().opacity(0, 0.6),
    repoLink().opacity(0, 0.6),
    qrPlaceholder().opacity(0, 0.6),
    qrLabel().opacity(0, 0.6),
  );
});
