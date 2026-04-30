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
import {COLORS, FONTS, ICONS, IconLabel} from '../lib/design';
import {BrandCorner} from '../lib/brand';

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ---- title (~3s) ----
  const title = createRef<Txt>();
  const sub = createRef<Txt>();

  view.add(
    <>
      <Txt ref={title} text="VIP 客服系统 · 混合编排" fontFamily={FONTS.display} fontWeight={900} fontSize={68} fill={COLORS.text} y={-460} opacity={0} />
      <Txt ref={sub} text="Supervisor · Workflow · Council 三层套娃" fontFamily={FONTS.cn} fontSize={32} fill={COLORS.textDim} y={-390} opacity={0} />
    </>,
  );
  yield* sequence(0.18, title().opacity(1, 0.5), sub().opacity(1, 0.4));
  yield* waitFor(2.5);

  // ---- Layer 1: outer Supervisor (~5s) ----
  const outerBox = createRef<Rect>();
  const outerLabel = createRef<Layout>();
  const queryPath = createRef<Rect>();
  const txnPath = createRef<Rect>();
  const branchLine1 = createRef<Line>();
  const branchLine2 = createRef<Line>();

  view.add(
    <>
      <Rect
        ref={outerBox}
        width={1700}
        height={760}
        radius={28}
        fill="#1a1d35"
        stroke={COLORS.supervisor}
        lineWidth={4}
        position={[0, 60]}
        opacity={0}
      />
      <Rect
        width={300}
        height={64}
        radius={16}
        fill={COLORS.bg}
        stroke={COLORS.supervisor}
        lineWidth={3}
        position={[-680, -300]}
        ref={outerLabel}
        opacity={0}
      >
        <Layout direction="row" alignItems="center" gap={12} padding={16} layout>
          <Rect width={10} height={32} radius={2} fill={COLORS.supervisor} />
          <Txt text="Supervisor" fontFamily={FONTS.mono} fontWeight={700} fontSize={28} fill={COLORS.text} />
        </Layout>
      </Rect>
    </>,
  );

  yield* outerBox().opacity(1, 0.5);
  yield* outerLabel().opacity(1, 0.4);
  yield* waitFor(0.4);

  // branch into Query / Txn
  view.add(
    <>
      <Rect ref={queryPath} width={240} height={90} radius={14} fill={COLORS.card} stroke={COLORS.cardBorder} lineWidth={2} position={[-700, -150]} opacity={0}>
        <Layout direction="column" alignItems="center" gap={4} layout>
          <Txt text="Query 路径" fontFamily={FONTS.cn} fontWeight={700} fontSize={22} fill={COLORS.text} />
          <Txt text="自由发挥 OK" fontFamily={FONTS.cn} fontSize={16} fill={COLORS.muted} />
        </Layout>
      </Rect>
      <Rect ref={txnPath} width={1300} height={520} radius={20} fill={COLORS.bg} stroke={COLORS.workflow} lineWidth={3} position={[120, 110]} opacity={0} />
      <Line
        ref={branchLine1}
        points={[[-700, -240], [-700, -195]]}
        stroke={COLORS.supervisor}
        lineWidth={3}
        endArrow
        arrowSize={10}
        end={0}
      />
      <Line
        ref={branchLine2}
        points={[[120, -240], [120, -150]]}
        stroke={COLORS.supervisor}
        lineWidth={3}
        endArrow
        arrowSize={10}
        end={0}
      />
    </>,
  );

  yield* all(
    branchLine1().end(1, 0.4),
    branchLine2().end(1, 0.4),
    delay(0.2, queryPath().opacity(1, 0.4)),
  );
  yield* waitFor(8);

  // ---- Layer 2: inner Workflow on Txn path (~7s) ----
  const wfLabel = createRef<Rect>();
  const wfSteps: Reference<Rect>[] = Array.from({length: 4}, () => createRef<Rect>());
  const wfStepNames = ['身份核验', '余额校验', '风险评估', '执行交易'];
  const wfArrows: Reference<Line>[] = Array.from({length: 3}, () => createRef<Line>());

  const wfStepXs = [-360, -120, 120, 360];
  const wfStepY = -10;

  view.add(
    <>
      <Rect ref={wfLabel} width={300} height={56} radius={14} fill={COLORS.bg} stroke={COLORS.workflow} lineWidth={2} position={[-340, -150]} opacity={0}>
        <Layout direction="row" alignItems="center" gap={12} padding={14} layout>
          <Rect width={8} height={26} radius={2} fill={COLORS.workflow} />
          <Txt text="Workflow · 钉死流程" fontFamily={FONTS.cn} fontWeight={700} fontSize={20} fill={COLORS.text} />
        </Layout>
      </Rect>
      {wfStepNames.map((name, i) => (
        <Rect
          ref={wfSteps[i]}
          width={200}
          height={120}
          radius={14}
          fill={COLORS.card}
          stroke={i === 2 ? COLORS.council : COLORS.cardBorder}
          lineWidth={i === 2 ? 3 : 2}
          position={[wfStepXs[i], wfStepY]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={4} layout>
            <Txt text={`Step ${i + 1}`} fontFamily={FONTS.mono} fontSize={18} fill={COLORS.textDim} />
            <Txt text={name} fontFamily={FONTS.cn} fontWeight={700} fontSize={24} fill={COLORS.text} />
            {i === 2 && (
              <IconLabel
                icon={ICONS.drillDown}
                text="内嵌 Council"
                color={COLORS.council}
                iconSize={18}
                fontSize={16}
              />
            )}
          </Layout>
        </Rect>
      ))}
      {[0, 1, 2].map(i => (
        <Line
          ref={wfArrows[i]}
          points={[
            [wfStepXs[i] + 100, wfStepY],
            [wfStepXs[i + 1] - 100, wfStepY],
          ]}
          stroke={COLORS.workflow}
          lineWidth={3}
          endArrow
          arrowSize={10}
          end={0}
        />
      ))}
    </>,
  );

  yield* txnPath().opacity(1, 0.5);
  yield* wfLabel().opacity(1, 0.4);
  yield* sequence(0.12, ...wfSteps.map(s => s().opacity(1, 0.35)));
  yield* sequence(0.08, ...wfArrows.map(a => a().end(1, 0.3)));
  yield* waitFor(9);

  // ---- Layer 3: Council inside step 3 (~7s) ----
  const councilBox = createRef<Rect>();
  const councilLabel = createRef<Rect>();
  const councilAgents: Reference<Rect>[] = Array.from({length: 3}, () => createRef<Rect>());
  const councilOut = createRef<Rect>();
  const councilArrows: Reference<Line>[] = Array.from({length: 3}, () => createRef<Line>());
  const councilArrowsOut: Reference<Line>[] = Array.from({length: 3}, () => createRef<Line>());

  const cBoxX = wfStepXs[2];
  const cBoxY = 280;

  view.add(
    <>
      <Rect ref={councilBox} width={620} height={260} radius={20} fill={COLORS.bg} stroke={COLORS.council} lineWidth={3} position={[cBoxX, cBoxY]} opacity={0} />
      <Rect ref={councilLabel} width={260} height={48} radius={12} fill={COLORS.bg} stroke={COLORS.council} lineWidth={2} position={[cBoxX - 170, cBoxY - 130]} opacity={0}>
        <Layout direction="row" alignItems="center" gap={10} padding={12} layout>
          <Rect width={6} height={22} radius={2} fill={COLORS.council} />
          <Txt text="Council · 三 Agent 投票" fontFamily={FONTS.cn} fontWeight={700} fontSize={18} fill={COLORS.text} />
        </Layout>
      </Rect>
      {[-180, 0, 180].map((dx, i) => (
        <Rect ref={councilAgents[i]} width={140} height={80} radius={12} fill={COLORS.card} stroke={COLORS.council} lineWidth={2} position={[cBoxX + dx, cBoxY + 10]} opacity={0}>
          <Layout direction="column" alignItems="center" gap={2} layout>
            <Txt text={['风险 A', '风险 B', '风险 C'][i]} fontFamily={FONTS.cn} fontWeight={700} fontSize={20} fill={COLORS.text} />
            <Txt text={['gpt-4o', 'claude', 'gemini'][i]} fontFamily={FONTS.mono} fontSize={14} fill={COLORS.textDim} />
          </Layout>
        </Rect>
      ))}
      {/* arrow connecting Workflow step 3 down to Council box */}
      <Line
        points={[[wfStepXs[2], wfStepY + 60], [wfStepXs[2], cBoxY - 130]]}
        stroke={COLORS.council}
        lineWidth={3}
        endArrow
        arrowSize={10}
        lineDash={[8, 6]}
        end={0}
        ref={councilOut}
      />
    </>,
  );

  yield* councilBox().opacity(1, 0.5);
  yield* councilLabel().opacity(1, 0.4);
  yield* sequence(0.1, ...councilAgents.map(a => a().opacity(1, 0.35)));
  yield* councilOut().end(1, 0.4);
  yield* waitFor(9);

  // ---- payoff line (~4s) ----
  const payoff = createRef<Txt>();
  view.add(
    <Txt
      ref={payoff}
      text="灵活 · 确定 · 保险 — 三种全用上"
      fontFamily={FONTS.cn}
      fontWeight={700}
      fontSize={42}
      fill={COLORS.yellow}
      y={490}
      opacity={0}
    />,
  );
  yield* payoff().opacity(1, 0.5);
  yield* waitFor(9);

  yield* all(
    title().opacity(0, 0.5),
    sub().opacity(0, 0.5),
    outerBox().opacity(0, 0.5),
    outerLabel().opacity(0, 0.5),
    queryPath().opacity(0, 0.5),
    txnPath().opacity(0, 0.5),
    branchLine1().opacity(0, 0.5),
    branchLine2().opacity(0, 0.5),
    wfLabel().opacity(0, 0.5),
    ...wfSteps.map(s => s().opacity(0, 0.5)),
    ...wfArrows.map(a => a().opacity(0, 0.5)),
    councilBox().opacity(0, 0.5),
    councilLabel().opacity(0, 0.5),
    ...councilAgents.map(a => a().opacity(0, 0.5)),
    councilOut().opacity(0, 0.5),
    payoff().opacity(0, 0.5),
  );
});
