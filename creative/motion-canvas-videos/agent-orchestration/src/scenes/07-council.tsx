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

const ACCENT = COLORS.council;

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ---- title (~4s) ----
  const titleIdx = createRef<Txt>();
  const titleCN = createRef<Txt>();
  const titleEN = createRef<Txt>();
  const titleBar = createRef<Rect>();
  const shape = createRef<Circle>();

  view.add(
    <>
      {/* ◯ shape watermark — Council's circular gathering signature */}
      <Circle
        ref={shape}
        size={520}
        stroke={ACCENT}
        lineWidth={5}
        opacity={0}
      />
      <Rect ref={titleBar} width={0} height={6} radius={3} fill={ACCENT} y={-180} />
      <Txt ref={titleIdx} text="04 / 议会模式" fontFamily={FONTS.mono} fontSize={36} fill={ACCENT} y={-110} opacity={0} />
      <Txt ref={titleCN} text="Council" fontFamily={FONTS.mono} fontWeight={700} fontSize={140} fill={COLORS.text} y={20} opacity={0} />
      <Txt ref={titleEN} text="并行执行 · 结果靠汇总" fontFamily={FONTS.cn} fontSize={40} fill={COLORS.textDim} y={150} opacity={0} />
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

  // ---- metaphor — 3 reviewers (~6s) ----
  const brollLabel = createRef<Txt>();
  const reviewers: Reference<Rect>[] = Array.from({length: 3}, () => createRef<Rect>());
  const reviewerLabels = ['Reviewer A', 'Reviewer B', 'Reviewer C'];
  const reviewerOpinions = ['这里有 race', '命名要改', 'API 设计 OK'];

  view.add(
    <>
      <Txt ref={brollLabel} text="比方说 · 三个人独立 Code Review" fontFamily={FONTS.cn} fontSize={32} fill={COLORS.muted} y={-260} opacity={0} />
      {reviewerLabels.map((name, i) => (
        <Rect
          ref={reviewers[i]}
          width={320}
          height={170}
          radius={16}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[-560 + i * 560, 0]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={10} layout>
            <Txt text={name} fontFamily={FONTS.mono} fontWeight={700} fontSize={28} fill={COLORS.text} />
            <Rect width={240} height={1} fill={COLORS.cardBorder} />
            <Txt text={`"${reviewerOpinions[i]}"`} fontFamily={FONTS.cn} fontSize={24} fill={ACCENT} />
          </Layout>
        </Rect>
      ))}
    </>,
  );

  yield* brollLabel().opacity(1, 0.4);
  yield* sequence(0.0, ...reviewers.map(r => r().opacity(1, 0.4)));
  yield* waitFor(8);
  yield* all(brollLabel().opacity(0, 0.5), ...reviewers.map(r => r().opacity(0, 0.5)));

  // ---- topology — fan-out + fan-in (~16s) ----
  const input = createRef<Rect>();
  const inputLabel = createRef<Txt>();
  const aggregator = createRef<Rect>();
  const output = createRef<Rect>();
  const outputLabel = createRef<Txt>();
  const agents: Reference<Rect>[] = Array.from({length: 3}, () => createRef<Rect>());
  const agentNames = [
    {name: 'Agent A', sub: 'gpt-4o'},
    {name: 'Agent B', sub: 'claude-4'},
    {name: 'Agent C', sub: 'gemini-pro'},
  ];
  const agentYs = [-260, 0, 260];
  const fanOutLines: Reference<Line>[] = Array.from({length: 3}, () => createRef<Line>());
  const fanInLines: Reference<Line>[] = Array.from({length: 3}, () => createRef<Line>());
  const deliveryLine = createRef<Line>();

  view.add(
    <>
      <Rect ref={input} width={200} height={100} radius={50} fill={COLORS.cardBorder} position={[-780, 0]} opacity={0}>
        <Txt text="Question" fontFamily={FONTS.mono} fontWeight={700} fontSize={26} fill={COLORS.text} />
      </Rect>

      {agentNames.map((info, i) => (
        <Rect
          ref={agents[i]}
          width={300}
          height={140}
          radius={16}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[-100, agentYs[i]]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={6} layout>
            <Txt text={info.name} fontFamily={FONTS.cn} fontWeight={700} fontSize={32} fill={COLORS.text} />
            <Txt text={info.sub} fontFamily={FONTS.mono} fontSize={20} fill={COLORS.textDim} />
          </Layout>
        </Rect>
      ))}

      <Rect ref={aggregator} width={260} height={140} radius={20} fill={COLORS.panel} stroke={ACCENT} lineWidth={4} position={[480, 0]} opacity={0}>
        <Layout direction="column" alignItems="center" gap={6} layout>
          <Txt text="Aggregator" fontFamily={FONTS.mono} fontWeight={700} fontSize={28} fill={COLORS.text} />
          <Txt text="vote · merge · LLM" fontFamily={FONTS.mono} fontSize={18} fill={ACCENT} />
        </Layout>
      </Rect>

      <Rect ref={output} width={200} height={100} radius={50} fill={COLORS.cardBorder} position={[820, 0]} opacity={0}>
        <Txt text="Final" fontFamily={FONTS.mono} fontWeight={700} fontSize={26} fill={COLORS.text} />
      </Rect>

      {/* fan-out lines: Question right edge → each agent's left edge.
          Source spreads vertically within Question's height so the lines
          look like 3 distinct branches rather than radiating from one dot. */}
      {agentYs.map((y, i) => {
        const srcY = (i - 1) * 22; // -22, 0, 22 → distinct exit points
        return (
          <Line
            ref={fanOutLines[i]}
            points={[[-680, srcY], [-258, y]]}
            stroke={ACCENT}
            lineWidth={3}
            endArrow
            arrowSize={12}
            end={0}
          />
        );
      })}

      {/* fan-in lines: agent right edge → spread points on aggregator's
          left edge (vertical stagger) so the 3 arrow tips don't pile up. */}
      {agentYs.map((y, i) => {
        const dstY = (i - 1) * 45; // -45, 0, 45 → 3 distinct landing spots on aggregator
        return (
          <Line
            ref={fanInLines[i]}
            points={[[58, y], [342, dstY]]}
            stroke={ACCENT}
            lineWidth={3}
            endArrow
            arrowSize={12}
            end={0}
          />
        );
      })}

      {/* delivery line: aggregator right edge → Final left edge.
          Dashed + thinner so it reads as "output delivery", visually
          distinct from the solid fan-out/fan-in parallel lines. */}
      <Line
        ref={deliveryLine}
        points={[[610, 0], [715, 0]]}
        stroke={ACCENT}
        lineWidth={2}
        lineDash={[8, 6]}
        endArrow
        arrowSize={10}
        end={0}
      />
    </>,
  );

  yield* input().opacity(1, 0.4);
  yield* sequence(0.1, ...agents.map(a => a().opacity(1, 0.35)));
  yield* aggregator().opacity(1, 0.4);
  yield* output().opacity(1, 0.4);
  yield* sequence(
    0.06,
    ...fanOutLines.map(l => l().end(1, 0.3)),
    ...fanInLines.map(l => l().end(1, 0.3)),
    deliveryLine().end(1, 0.3),
  );
  yield* waitFor(3);

  // 3 parallel tokens
  const tokens: Reference<Circle>[] = Array.from({length: 3}, () => createRef<Circle>());
  view.add(
    <>
      {agentYs.map((y, i) => (
        <Circle ref={tokens[i]} size={26} fill={ACCENT} position={[-680, 0]} opacity={0} />
      ))}
    </>,
  );

  yield* all(...tokens.map(t => t().opacity(1, 0.2)));

  // fan-out simultaneously — tokens land on each agent's left edge
  yield* all(
    ...tokens.map((t, i) => t().position([-258, agentYs[i]], 0.55, easeInOutCubic)),
  );
  yield* all(
    ...agents.map(a => all(a().stroke(ACCENT, 0.2), a().scale(1.06, 0.2))),
    ...tokens.map(t => t().opacity(0, 0.2)),
  );

  // simultaneous processing — pulse
  yield* all(
    ...agents.map(a => a().fill('#1a2a22', 0.6).to(COLORS.card, 0.6)),
  );
  yield* all(
    ...agents.map(a => all(a().stroke(COLORS.cardBorder, 0.2), a().scale(1, 0.2))),
    ...tokens.map((t, i) => all(t().position([58, agentYs[i]], 0.01), t().opacity(1, 0.2))),
  );

  // fan-in — each token lands on its own spot of aggregator's left edge
  // (vertical stagger so 3 arrow tips don't pile up at one point).
  const fanInDsts: Array<[number, number]> = agentYs.map((_, i) => [342, (i - 1) * 45]);
  yield* all(
    ...tokens.map((t, i) => t().position(fanInDsts[i], 0.55, easeInOutCubic)),
    delay(0.3, all(aggregator().scale(1.06, 0.2).to(1, 0.3), aggregator().stroke(ACCENT, 0.2))),
  );
  yield* all(...tokens.map(t => t().opacity(0, 0.3)));

  // single output token — stops at Final pill's left edge and is "absorbed"
  // (shrinks + fades + Final pill highlights) so it never covers the label.
  const finalToken = (
    <Circle size={32} fill={ACCENT} position={[610, 0]} opacity={0} />
  ) as Circle;
  view.add(finalToken);
  yield* finalToken.opacity(1, 0.2);
  yield* finalToken.position.x(720, 0.5, easeInOutCubic);
  yield* all(
    finalToken.size(0, 0.3),
    finalToken.opacity(0, 0.3),
    output().scale(1.06, 0.2).to(1, 0.3),
  );

  yield* waitFor(6);

  // ---- decision + pros/cons (~9s) ----
  const badge = createRef<Rect>();
  const prosBox = createRef<Rect>();
  const consBox = createRef<Rect>();

  view.add(
    <>
      <Rect ref={badge} width={520} height={120} radius={16} fill={COLORS.panel} stroke={ACCENT} lineWidth={3} position={[-540, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <Txt text="决策者" fontFamily={FONTS.cn} fontSize={24} fill={COLORS.muted} />
          <Txt text="没人 · 靠汇总" fontFamily={FONTS.cn} fontWeight={700} fontSize={40} fill={ACCENT} />
        </Layout>
      </Rect>
      <Rect ref={prosBox} width={380} height={120} radius={16} fill={COLORS.panel} stroke={COLORS.council} lineWidth={2} position={[40, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.pros} text="优势" color={COLORS.council} />
          <Txt text="质量高 · 看盲区" fontFamily={FONTS.cn} fontWeight={700} fontSize={28} fill={COLORS.text} />
        </Layout>
      </Rect>
      <Rect ref={consBox} width={460} height={120} radius={16} fill={COLORS.panel} stroke={COLORS.warm} lineWidth={2} position={[560, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.cons} text="代价" color={COLORS.warm} />
          <Txt text="贵 · token 三倍" fontFamily={FONTS.cn} fontWeight={700} fontSize={28} fill={COLORS.text} />
        </Layout>
      </Rect>
    </>,
  );

  yield* sequence(0.18, badge().opacity(1, 0.4), prosBox().opacity(1, 0.4), consBox().opacity(1, 0.4));
  yield* waitFor(22);

  yield* all(
    input().opacity(0, 0.5),
    output().opacity(0, 0.5),
    aggregator().opacity(0, 0.5),
    ...agents.map(a => a().opacity(0, 0.5)),
    ...fanOutLines.map(l => l().opacity(0, 0.5)),
    ...fanInLines.map(l => l().opacity(0, 0.5)),
    badge().opacity(0, 0.5),
    prosBox().opacity(0, 0.5),
    consBox().opacity(0, 0.5),
  );
});
