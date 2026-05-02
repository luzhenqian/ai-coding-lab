import {Layout, Line, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
import {
  Reference,
  all,
  createRef,
  delay,
  easeOutCubic,
  sequence,
  waitFor,
} from '@motion-canvas/core';
import {COLORS, FONTS} from '../lib/design';
import {BrandCorner} from '../lib/brand';

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ---- title (~3s) ----
  const titleCN = createRef<Txt>();
  const titleEN = createRef<Txt>();

  view.add(
    <>
      <Txt
        ref={titleCN}
        text="实际项目怎么选？"
        fontFamily={FONTS.display}
        fontWeight={900}
        fontSize={92}
        fill={COLORS.text}
        y={-460}
        opacity={0}
      />
      <Txt
        ref={titleEN}
        text="一句话的判断标准"
        fontFamily={FONTS.cn}
        fontSize={36}
        fill={COLORS.textDim}
        y={-380}
        opacity={0}
      />
    </>,
  );

  yield* sequence(0.2, titleCN().opacity(1, 0.5), titleEN().opacity(1, 0.4));
  yield* waitFor(3);

  // ---- 4 quadrant diagram (~12s) ----
  const xAxis = createRef<Line>();
  const yAxis = createRef<Line>();
  const xLabelL = createRef<Txt>();
  const xLabelR = createRef<Txt>();
  const yLabelT = createRef<Txt>();
  const yLabelB = createRef<Txt>();
  const xAxisName = createRef<Txt>();
  const yAxisName = createRef<Txt>();

  // axes centered around (0, 50) — slightly below screen center
  const cx = 0;
  const cy = 50;
  const halfW = 720;
  const halfH = 280;

  view.add(
    <>
      <Line
        ref={xAxis}
        points={[[cx - halfW, cy], [cx + halfW, cy]]}
        stroke={COLORS.cardBorder}
        lineWidth={2}
        endArrow
        startArrow
        arrowSize={10}
        end={0}
      />
      <Line
        ref={yAxis}
        points={[[cx, cy + halfH], [cx, cy - halfH]]}
        stroke={COLORS.cardBorder}
        lineWidth={2}
        endArrow
        startArrow
        arrowSize={10}
        end={0}
      />
      <Txt ref={xLabelL} text="开放路径 ←" fontFamily={FONTS.cn} fontSize={24} fill={COLORS.muted} position={[cx - halfW + 80, cy + 40]} opacity={0} />
      <Txt ref={xLabelR} text="→ 钉死路径" fontFamily={FONTS.cn} fontSize={24} fill={COLORS.muted} position={[cx + halfW - 80, cy + 40]} opacity={0} />
      <Txt ref={yLabelT} text="分布式" fontFamily={FONTS.cn} fontSize={24} fill={COLORS.muted} position={[cx + 80, cy - halfH + 30]} opacity={0} />
      <Txt ref={yLabelB} text="中心化" fontFamily={FONTS.cn} fontSize={24} fill={COLORS.muted} position={[cx + 80, cy + halfH - 30]} opacity={0} />
      <Txt ref={xAxisName} text="路径确定性" fontFamily={FONTS.cn} fontWeight={700} fontSize={26} fill={COLORS.textDim} position={[cx, cy + halfH + 60]} opacity={0} />
      <Txt ref={yAxisName} text="控制方式" fontFamily={FONTS.cn} fontWeight={700} fontSize={26} fill={COLORS.textDim} position={[cx - halfW - 80, cy]} rotation={-90} opacity={0} />
    </>,
  );

  yield* all(xAxis().end(1, 0.6), yAxis().end(1, 0.6));
  yield* all(
    xLabelL().opacity(1, 0.3),
    xLabelR().opacity(1, 0.3),
    yLabelT().opacity(1, 0.3),
    yLabelB().opacity(1, 0.3),
    xAxisName().opacity(1, 0.3),
    yAxisName().opacity(1, 0.3),
  );

  // 4 quadrant cards
  // bottom-left: Supervisor (开放 + 中心化)
  // bottom-right: Workflow (钉死 + 中心化)
  // top-left: Handoff (开放 + 分布式)
  // top-right: Council (并行 + 分布式)
  const quadrantData = [
    {pos: [cx - 380, cy + 160], color: COLORS.supervisor, name: 'Supervisor', tip: '任务开放 · 分工清晰'},
    {pos: [cx + 380, cy + 160], color: COLORS.workflow, name: 'Workflow', tip: '路径确定 · 审批 ETL'},
    {pos: [cx - 380, cy - 160], color: COLORS.handoff, name: 'Handoff', tip: '对话切专家 · 多领域客服'},
    {pos: [cx + 380, cy - 160], color: COLORS.council, name: 'Council', tip: '追质量 · 不怕花钱'},
  ] as const;

  const quadCards: Reference<Rect>[] = quadrantData.map(() => createRef<Rect>());

  view.add(
    <>
      {quadrantData.map((q, i) => (
        <Rect
          ref={quadCards[i]}
          width={400}
          height={130}
          radius={16}
          fill={COLORS.panel}
          stroke={q.color}
          lineWidth={3}
          position={q.pos as [number, number]}
          opacity={0}
        >
          <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
            <Txt text={q.name} fontFamily={FONTS.mono} fontWeight={700} fontSize={36} fill={q.color} />
            <Txt text={q.tip} fontFamily={FONTS.cn} fontSize={22} fill={COLORS.text} />
          </Layout>
        </Rect>
      ))}
    </>,
  );

  yield* sequence(
    0.2,
    ...quadCards.map(c => c().opacity(1, 0.4)),
  );
  yield* waitFor(19);

  // ---- pivot — "但是真实项目..." (~2s) ----
  yield* all(
    xAxis().opacity(0.3, 0.5),
    yAxis().opacity(0.3, 0.5),
    xLabelL().opacity(0.3, 0.5),
    xLabelR().opacity(0.3, 0.5),
    yLabelT().opacity(0.3, 0.5),
    yLabelB().opacity(0.3, 0.5),
    xAxisName().opacity(0.3, 0.5),
    yAxisName().opacity(0.3, 0.5),
    ...quadCards.map(c => c().opacity(0.4, 0.5)),
  );

  const truth = createRef<Txt>();
  const truthEm = createRef<Txt>();
  view.add(
    <>
      <Txt ref={truth} text="但真实项目里，不是四选一" fontFamily={FONTS.cn} fontWeight={700} fontSize={56} fill={COLORS.textDim} y={-30} opacity={0} />
      <Txt ref={truthEm} text="是 · 混 · 着 · 用" fontFamily={FONTS.display} fontWeight={900} fontSize={120} fill={COLORS.brand} y={100} opacity={0} />
    </>,
  );
  yield* truth().opacity(1, 0.5);
  yield* truthEm().opacity(1, 0.6);
  yield* waitFor(8);

  yield* all(
    titleCN().opacity(0, 0.5),
    titleEN().opacity(0, 0.5),
    truth().opacity(0, 0.5),
    truthEm().opacity(0, 0.5),
    xAxis().opacity(0, 0.5),
    yAxis().opacity(0, 0.5),
    xLabelL().opacity(0, 0.5),
    xLabelR().opacity(0, 0.5),
    yLabelT().opacity(0, 0.5),
    yLabelB().opacity(0, 0.5),
    xAxisName().opacity(0, 0.5),
    yAxisName().opacity(0, 0.5),
    ...quadCards.map(c => c().opacity(0, 0.5)),
  );
});
