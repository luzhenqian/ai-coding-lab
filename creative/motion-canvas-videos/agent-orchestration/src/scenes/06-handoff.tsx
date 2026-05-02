import {Circle, Icon, Layout, Line, Polygon, Rect, Txt, makeScene2D} from '@motion-canvas/2d';
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

const ACCENT = COLORS.handoff;

export default makeScene2D(function* (view) {
  view.add(<BrandCorner />);
  // ---- title (~4s) ----
  const titleIdx = createRef<Txt>();
  const titleCN = createRef<Txt>();
  const titleEN = createRef<Txt>();
  const titleBar = createRef<Rect>();
  const shape = createRef<Layout>();

  view.add(
    <>
      {/* ⌒ shape watermark — Handoff's chevron-chain signature */}
      <Layout ref={shape} direction="row" gap={-30} layout opacity={0}>
        {[0, 1, 2].map(i => (
          <Polygon
            sides={3}
            size={[180, 320]}
            stroke={ACCENT}
            lineWidth={5}
            rotation={90}
          />
        ))}
      </Layout>
      <Rect ref={titleBar} width={0} height={6} radius={3} fill={ACCENT} y={-180} />
      <Txt ref={titleIdx} text="03 / 交接模式" fontFamily={FONTS.mono} fontSize={36} fill={ACCENT} y={-110} opacity={0} />
      <Txt ref={titleCN} text="Handoff" fontFamily={FONTS.mono} fontWeight={700} fontSize={140} fill={COLORS.text} y={20} opacity={0} />
      <Txt ref={titleEN} text="没总管 · 当前 Agent 自己交棒" fontFamily={FONTS.cn} fontSize={40} fill={COLORS.textDim} y={150} opacity={0} />
    </>,
  );

  yield* shape().opacity(0.16, 0.5);
  yield* titleBar().width(380, 0.4, easeOutCubic);
  yield* sequence(0.18, titleIdx().opacity(1, 0.4), titleCN().opacity(1, 0.5), titleEN().opacity(1, 0.4));
  yield* waitFor(6);
  yield* all(
    shape().opacity(0, 0.5),
    titleBar().opacity(0, 0.5),
    titleIdx().opacity(0, 0.5),
    titleCN().opacity(0, 0.5),
    titleEN().opacity(0, 0.5),
  );

  // ---- metaphor — ER triage (~6s) ----
  const brollLabel = createRef<Txt>();
  const triage: Reference<Rect>[] = Array.from({length: 3}, () => createRef<Rect>());
  const triageNames = ['分诊台', '心内科', '胸外科'];
  const triageHints = ['先到这', '像心脏问题', '其实是肺栓塞'];

  view.add(
    <>
      <Txt ref={brollLabel} text="比方说 · 医院急诊" fontFamily={FONTS.cn} fontSize={32} fill={COLORS.muted} y={-260} opacity={0} />
      {triageNames.map((name, i) => (
        <Rect
          ref={triage[i]}
          width={300}
          height={150}
          radius={16}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[-560 + i * 560, 0]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={6} layout>
            <Txt text={name} fontFamily={FONTS.cn} fontWeight={700} fontSize={40} fill={COLORS.text} />
            <Txt text={triageHints[i]} fontFamily={FONTS.cn} fontSize={22} fill={ACCENT} />
          </Layout>
        </Rect>
      ))}
    </>,
  );

  yield* brollLabel().opacity(1, 0.4);
  yield* sequence(0.2, ...triage.map(r => r().opacity(1, 0.4)));
  yield* waitFor(10);
  yield* all(brollLabel().opacity(0, 0.5), ...triage.map(r => r().opacity(0, 0.5)));

  // ---- topology — handoff chain (~16s) ----
  const agents: Reference<Rect>[] = Array.from({length: 3}, () => createRef<Rect>());
  const agentInfo = [
    {name: '分诊 Agent', sub: 'triage', icon: 'lucide:arrow-right', handoff: 'cardiology'},
    {name: '心内科 Agent', sub: 'cardiology', icon: 'lucide:arrow-right', handoff: 'thoracic'},
    {name: '胸外科 Agent', sub: 'thoracic', icon: ICONS.finalState, handoff: '终态'},
  ];
  const arrows: Reference<Line>[] = Array.from({length: 2}, () => createRef<Line>());
  const handoffTags: Reference<Rect>[] = Array.from({length: 2}, () => createRef<Rect>());

  const agentXs = [-560, 0, 560];
  const agentY = 50;

  view.add(
    <>
      {agentInfo.map((info, i) => (
        <Rect
          ref={agents[i]}
          width={340}
          height={170}
          radius={16}
          fill={COLORS.card}
          stroke={COLORS.cardBorder}
          lineWidth={3}
          position={[agentXs[i], agentY]}
          opacity={0}
        >
          <Layout direction="column" alignItems="center" gap={8} layout>
            <Txt text={info.name} fontFamily={FONTS.cn} fontWeight={700} fontSize={32} fill={COLORS.text} />
            <Txt text={info.sub} fontFamily={FONTS.mono} fontSize={20} fill={COLORS.textDim} />
            <Rect width={260} height={1} fill={COLORS.cardBorder} />
            <Layout direction="row" alignItems="center" gap={6} layout>
              <Icon icon={info.icon} color={ACCENT} size={20} />
              <Txt text={info.handoff} fontFamily={FONTS.mono} fontSize={20} fill={ACCENT} />
            </Layout>
          </Layout>
        </Rect>
      ))}

      {/* handoff arrows with curved labels */}
      {[0, 1].map(i => (
        <Line
          ref={arrows[i]}
          points={[
            [agentXs[i] + 175, agentY],
            [agentXs[i + 1] - 175, agentY],
          ]}
          stroke={ACCENT}
          lineWidth={4}
          endArrow
          arrowSize={14}
          end={0}
        />
      ))}

      {[0, 1].map(i => (
        <Rect
          ref={handoffTags[i]}
          width={180}
          height={52}
          radius={26}
          fill={COLORS.panel}
          stroke={ACCENT}
          lineWidth={2}
          position={[(agentXs[i] + agentXs[i + 1]) / 2, agentY - 160]}
          opacity={0}
        >
          <Txt text="handoff()" fontFamily={FONTS.mono} fontWeight={700} fontSize={22} fill={ACCENT} />
        </Rect>
      ))}
    </>,
  );

  yield* sequence(0.15, ...agents.map(a => a().opacity(1, 0.4)));
  yield* waitFor(0.3);

  // user pill — represents "where the conversation currently is".
  // Placed ABOVE the agents so the indicator never overlaps card content.
  const userY = agentY - 220;
  const userLabelY = agentY - 280;
  const user = (
    <Circle size={44} fill={ACCENT} position={[-900, userY]} opacity={0} />
  ) as Circle;
  const userLabel = (
    <Txt
      text="user"
      fontFamily={FONTS.mono}
      fontSize={22}
      fill={COLORS.textDim}
      position={[-900, userLabelY]}
      opacity={0}
    />
  ) as Txt;
  view.add(user);
  view.add(userLabel);

  yield* all(user.opacity(1, 0.3), userLabel.opacity(1, 0.3));
  yield* user.position.x(agentXs[0], 0.5, easeInOutCubic);
  yield* userLabel.position.x(agentXs[0], 0.5, easeInOutCubic);

  // each agent: glows active, then hands off
  for (let i = 0; i < 3; i++) {
    yield* all(
      agents[i]().stroke(ACCENT, 0.25),
      agents[i]().fill('#2a1a25', 0.25),
      agents[i]().scale(1.05, 0.25),
    );
    yield* waitFor(6);

    if (i < 2) {
      yield* all(
        arrows[i]().end(1, 0.4),
        delay(0.2, handoffTags[i]().opacity(1, 0.3)),
      );
      yield* all(
        user.position.x(agentXs[i + 1], 0.55, easeInOutCubic),
        userLabel.position.x(agentXs[i + 1], 0.55, easeInOutCubic),
        // previous agent steps off — dims
        agents[i]().stroke(COLORS.cardBorder, 0.4),
        agents[i]().fill(COLORS.card, 0.4),
        agents[i]().scale(1, 0.4),
        agents[i]().opacity(0.45, 0.4),
      );
      yield* handoffTags[i]().opacity(0.6, 0.3);
    }
  }
  yield* waitFor(0.6);

  // ---- decision + pros/cons (~9s) ----
  const badge = createRef<Rect>();
  const prosBox = createRef<Rect>();
  const consBox = createRef<Rect>();

  view.add(
    <>
      <Rect ref={badge} width={520} height={120} radius={16} fill={COLORS.panel} stroke={ACCENT} lineWidth={3} position={[-540, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <Txt text="决策者" fontFamily={FONTS.cn} fontSize={24} fill={COLORS.muted} />
          <Txt text="当前 Agent 自己" fontFamily={FONTS.cn} fontWeight={700} fontSize={40} fill={ACCENT} />
        </Layout>
      </Rect>
      <Rect ref={prosBox} width={380} height={120} radius={16} fill={COLORS.panel} stroke={COLORS.council} lineWidth={2} position={[40, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.pros} text="优势" color={COLORS.council} />
          <Txt text="对话流自然" fontFamily={FONTS.cn} fontWeight={700} fontSize={28} fill={COLORS.text} />
        </Layout>
      </Rect>
      <Rect ref={consBox} width={460} height={120} radius={16} fill={COLORS.panel} stroke={COLORS.warm} lineWidth={2} position={[560, 420]} opacity={0}>
        <Layout direction="column" alignItems="start" gap={6} padding={24} layout>
          <IconLabel icon={ICONS.cons} text="代价" color={COLORS.warm} />
          <Txt text="链路长 · 难追踪" fontFamily={FONTS.cn} fontWeight={700} fontSize={28} fill={COLORS.text} />
        </Layout>
      </Rect>
    </>,
  );

  yield* sequence(0.18, badge().opacity(1, 0.4), prosBox().opacity(1, 0.4), consBox().opacity(1, 0.4));
  yield* waitFor(15);

  yield* all(
    ...agents.map(a => a().opacity(0, 0.5)),
    ...arrows.map(a => a().opacity(0, 0.5)),
    ...handoffTags.map(t => t().opacity(0, 0.5)),
    user.opacity(0, 0.5),
    userLabel.opacity(0, 0.5),
    badge().opacity(0, 0.5),
    prosBox().opacity(0, 0.5),
    consBox().opacity(0, 0.5),
  );
});
