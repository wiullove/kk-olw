/* 投资分析本体 · 实例数据层（ABox）
 * 来源：随《投资分析方法论与指标体系》文档一并解析出的 RDF 实例（Turtle）
 * 结构：
 *   instances  —— 实例条目（uri / 所属本体 g / 对应概念 concept / 中文标签 / 字面量属性 / 引用关系）
 *   links      —— 实例与实例之间的关系断言
 *   groups     —— 复用本体分组配色，供力导向图直接渲染实例图谱
 * 所有统计值由数据实时计算，不写死文案。
 */
window.INVEST_INSTANCES = (() => {
  const ns = 'https://example.com/investment#';

  /* 复用本体分组（与 ontology-data.js 保持一致） */
  const groups = [
    { id: 1, name: '投资组合本体', color: '#5b57c9' },
    { id: 2, name: '持仓本体', color: '#0f9c8d' },
    { id: 3, name: '投资标的本体', color: '#2fa155' },
    { id: 4, name: '机构主体本体', color: '#c9930f' },
    { id: 5, name: '市场数据本体', color: '#e05a41' },
    { id: 6, name: '投资指标本体', color: '#8b56e8' },
    { id: 7, name: '业绩基准本体', color: '#d4469b' },
    { id: 8, name: '风险因子本体', color: '#ef8a2b' },
    { id: 9, name: '投资策略与约束本体', color: '#4a63e7' },
    { id: 10, name: '投资分析本体', color: '#0e97c4' },
  ];

  const instances = [
    /* ---- 1 投资组合本体 ---- */
    { id: 'P001', cls: 'Portfolio', g: 1, concept: 'Portfolio', label: '投资组合 P001',
      desc: '示例投资组合，管理方式为固定收益策略，当前处于运行中状态。',
      props: [['组合类型', '固定收益组合', 'portfolioType'], ['组合状态', '运行中', 'portfolioStatus']] },

    /* ---- 2 持仓本体 ---- */
    { id: 'POS001', cls: 'Position', g: 2, concept: 'Position', label: '持仓 POS001',
      desc: '组合持有的示例债券仓位，占组合权重 20%。',
      props: [['持仓数量', '1,000,000', 'positionQuantity'], ['持仓市值', '102,000,000.00', 'positionMarketValue'], ['持仓权重', '0.20', 'positionWeight']] },

    /* ---- 3 投资标的本体 ---- */
    { id: 'B001', cls: 'Bond', g: 3, concept: 'Bond', label: '示例债券001',
      desc: '组合持有的固定收益类标的，由示例发行人发行。', props: [] },
    { id: 'FixedIncome', cls: 'AssetType', g: 3, concept: 'AssetType', label: '固定收益类',
      desc: '资产类别实例，用于归类债券等固定收益标的。', props: [] },
    { id: 'IDX001', cls: 'Index', g: 3, concept: 'Index', label: '示例债券指数',
      desc: '业绩基准引用的债券指数。', props: [] },

    /* ---- 4 机构主体本体 ---- */
    { id: 'ORG001', cls: 'Issuer', g: 4, concept: 'Issuer', label: '示例发行人',
      desc: '债券标的的发行主体。', props: [] },
    { id: 'ORG002', cls: 'FundManager', g: 4, concept: 'Manager', label: '示例基金管理人',
      desc: '负责组合投资管理的机构。', props: [] },
    { id: 'ORG003', cls: 'Counterparty', g: 4, concept: 'Counterparty', label: '示例交易对手',
      desc: '持仓交易的对手方机构。', props: [] },

    /* ---- 5 市场数据本体 ---- */
    { id: 'MD001', cls: 'MarketData', g: 5, concept: 'MarketData', label: '行情 MD001',
      desc: '2026-10-09 收盘时点的债券行情快照。',
      props: [['市场价格', '102.00', 'marketPrice'], ['到期收益率', '0.032', 'marketYield'], ['利率', '0.025', 'marketInterestRate'], ['汇率', '1.00', 'marketFXRate'], ['行情时点', '2026-10-09 15:00', 'observationTime']] },

    /* ---- 6 投资指标本体 ---- */
    { id: 'ReturnMetric', cls: 'Metric', g: 6, concept: 'Metric', label: '组合收益率',
      desc: '度量组合在特定区间内的收益水平。', props: [] },
    { id: 'VolatilityMetric', cls: 'Metric', g: 6, concept: 'Metric', label: '组合波动率',
      desc: '度量组合收益的波动水平。', props: [] },
    { id: 'DrawdownMetric', cls: 'Metric', g: 6, concept: 'Metric', label: '最大回撤',
      desc: '度量组合在区间内的最大净值回撤。', props: [] },
    { id: 'DurationMetric', cls: 'Metric', g: 6, concept: 'Metric', label: '久期',
      desc: '度量组合对利率变化的敏感度。', props: [] },
    { id: 'ConcentrationMetric', cls: 'Metric', g: 6, concept: 'Metric', label: '持仓集中度',
      desc: '度量组合持仓的集中程度。', props: [] },
    { id: 'ExcessReturnMetric', cls: 'Metric', g: 6, concept: 'Metric', label: '超额收益率',
      desc: '度量组合相对业绩基准的超额收益。', props: [] },
    { id: 'ReturnDefinition', cls: 'MetricDefinition', g: 6, concept: 'MetricDefinition', label: '收益率计算口径',
      desc: '组合收益率指标的计算口径定义。',
      props: [['口径描述', '示例组合收益率计算口径', 'calculationDescription']] },
    { id: 'MR001', cls: 'MetricResult', g: 6, concept: 'MetricResult', label: '组合收益率结果',
      desc: '近一年组合收益率的计算结果，依赖超额收益结果。',
      props: [['指标值', '0.042', 'metricValue'], ['结果区间', '近一年', 'resultPeriod']] },
    { id: 'MR002', cls: 'MetricResult', g: 6, concept: 'MetricResult', label: '久期结果',
      desc: '债券久期的计算结果。', props: [['指标值', '5.2', 'metricValue']] },
    { id: 'MR003', cls: 'MetricResult', g: 6, concept: 'MetricResult', label: '超额收益结果',
      desc: '相对基准的超额收益计算结果。', props: [['指标值', '0.012', 'metricValue']] },

    /* ---- 7 业绩基准本体 ---- */
    { id: 'BM001', cls: 'Benchmark', g: 7, concept: 'Benchmark', label: '业绩基准 BM001',
      desc: '以示例债券指数为参照的业绩基准。', props: [['基准收益率', '0.030', 'benchmarkReturn']] },

    /* ---- 8 风险因子本体 ---- */
    { id: 'RF001', cls: 'InterestRateRiskFactor', g: 8, concept: 'RiskFactor', label: '利率风险因子',
      desc: '驱动组合利率风险的风险因子。', props: [] },
    { id: 'RE001', cls: 'RiskExposure', g: 8, concept: 'RiskExposure', label: '风险暴露 RE001',
      desc: '组合对利率风险因子的暴露，暴露值 5.2。', props: [['暴露值', '5.2', 'exposureValue']] },
    { id: 'InterestRateRisk', cls: 'RiskType', g: 8, concept: 'RateRisk', label: '利率风险',
      desc: '风险类型实例：利率变动导致的风险。', props: [] },
    { id: 'MarketRisk', cls: 'RiskType', g: 8, concept: 'MarketRisk', label: '市场风险',
      desc: '风险类型实例：市场价格波动导致的风险。', props: [] },
    { id: 'CreditRisk', cls: 'RiskType', g: 8, concept: 'CreditRisk', label: '信用风险',
      desc: '风险类型实例：交易对手违约导致的风险。', props: [] },
    { id: 'LiquidityRisk', cls: 'RiskType', g: 8, concept: 'LiquidityRisk', label: '流动性风险',
      desc: '风险类型实例：资产变现困难导致的风险。', props: [] },

    /* ---- 9 投资策略与约束本体 ---- */
    { id: 'STR001', cls: 'InvestmentStrategy', g: 9, concept: 'Strategy', label: '投资策略 STR001',
      desc: '以稳健获取固定收益为目标的投资策略。', props: [['投资目标', '稳健获取固定收益', 'investmentObjective']] },
    { id: 'CON001', cls: 'AllocationConstraint', g: 9, concept: 'Constraint', label: '配置约束 CON001',
      desc: '固定收益类资产配置比例下限约束。',
      props: [['约束描述', '固定收益类资产配置比例不低于60%', 'constraintDescription'], ['最低比例', '0.60', 'minimumRatio']] },
    { id: 'RL001', cls: 'RiskLimit', g: 9, concept: 'RiskLimit', label: '风险限额 RL001',
      desc: '组合层面的风险限额。',
      props: [['约束描述', '组合风险限额示例', 'constraintDescription'], ['上限值', '6.0', 'maximumValue']] },

    /* ---- 10 投资分析本体 ---- */
    { id: 'TASK001', cls: 'AnalysisTask', g: 10, concept: 'AnalysisTask', label: '分析任务 TASK001',
      desc: '针对组合 P001 的收益、风险与约束符合性的综合分析任务。', props: [] },
    { id: 'AR001', cls: 'AnalysisResult', g: 10, concept: 'AnalysisResult', label: '分析结果 AR001',
      desc: '分析任务产出的结果，包含一个发现与一条结论。', props: [] },
    { id: 'FIND001', cls: 'AnalysisFinding', g: 10, concept: 'Finding', label: '分析发现 FIND001',
      desc: '组合收益率高于基准收益率，由指标结果与行情数据共同支持。',
      props: [['发现描述', '组合收益率高于基准收益率', 'findingDescription']] },
    { id: 'C001', cls: 'AnalysisConclusion', g: 10, concept: 'Conclusion', label: '分析结论 C001',
      desc: '示例组合近一年表现优于基准，并给出后续关注建议。',
      props: [['结论描述', '示例组合近一年表现优于基准', 'conclusionDescription']] },
    { id: 'REC001', cls: 'InvestmentRecommendation', g: 10, concept: 'Recommendation', label: '分析建议 REC001',
      desc: '建议持续关注利率变化对组合的影响。',
      props: [['建议描述', '持续关注利率变化对组合的影响', 'recommendationDescription']] },
  ];

  /* 实例之间的关系断言：[源, 目标, 关系标签] */
  const links = [
    ['P001', 'POS001', '包含持仓'],
    ['P001', 'BM001', '具有业绩基准'],
    ['P001', 'MR001', '具有指标结果'],
    ['P001', 'RE001', '具有风险暴露'],
    ['P001', 'STR001', '遵循策略'],
    ['P001', 'CON001', '受约束'],
    ['POS001', 'B001', '持有标的'],
    ['POS001', 'ORG003', '关联交易对手'],
    ['B001', 'FixedIncome', '资产类别'],
    ['B001', 'ORG001', '由其发行'],
    ['B001', 'MD001', '关联市场数据'],
    ['B001', 'MR002', '具有指标结果'],
    ['B001', 'RF001', '暴露于'],
    ['BM001', 'IDX001', '引用指数'],
    ['RE001', 'RF001', '对应风险因子'],
    ['RE001', 'InterestRateRisk', '风险类型'],
    ['STR001', 'CON001', '包含约束'],
    ['MR001', 'ReturnDefinition', '依据定义'],
    ['MR001', 'MR003', '依赖结果'],
    ['MR002', 'DurationMetric', '依据定义'],
    ['MR003', 'ExcessReturnMetric', '依据定义'],
    ['TASK001', 'P001', '分析对象'],
    ['TASK001', 'ReturnMetric', '使用指标'],
    ['TASK001', 'VolatilityMetric', '使用指标'],
    ['TASK001', 'BM001', '对照基准'],
    ['TASK001', 'RF001', '评价风险'],
    ['TASK001', 'CON001', '检查约束'],
    ['TASK001', 'MD001', '引用数据'],
    ['TASK001', 'AR001', '产出结果'],
    ['AR001', 'FIND001', '分析发现'],
    ['AR001', 'C001', '分析结论'],
    ['FIND001', 'MR001', '证据支持'],
    ['FIND001', 'MR003', '证据支持'],
    ['FIND001', 'MD001', '来源数据'],
    ['C001', 'FIND001', '由发现支持'],
    ['C001', 'MR001', '证据支持'],
    ['C001', 'REC001', '给出建议'],
  ];

  /* ---------- 派生索引 ---------- */
  instances.forEach((i) => { i.uri = `inv:${i.id}`; });
  const byId = new Map(instances.map((i) => [i.id, i]));
  const outMap = new Map();
  const inMap = new Map();
  links.forEach(([s, t, label]) => {
    if (!outMap.has(s)) outMap.set(s, []);
    if (!inMap.has(t)) inMap.set(t, []);
    outMap.get(s).push({ id: t, label });
    inMap.get(t).push({ id: s, label });
  });

  /* 概念 → 实例列表（用于画布角标与检视面板实例样本） */
  const byConcept = new Map();
  instances.forEach((i) => {
    if (!byConcept.has(i.concept)) byConcept.set(i.concept, []);
    byConcept.get(i.concept).push(i);
  });

  const literalCount = instances.reduce((sum, i) => sum + i.props.length, 0);
  const stats = {
    instances: instances.length,
    relations: links.length,
    literals: literalCount,
    assertions: literalCount + links.length,
    triples: instances.length * 2 + literalCount + links.length,
    groups: new Set(instances.map((i) => i.g)).size,
  };

  /* ---------- 供力导向图消费的图数据 ---------- */
  const graphNodes = instances.map((i) => ({
    id: i.id,
    label: i.label,
    g: i.g,
    desc: i.desc,
    cls: i.cls,
    concept: i.concept,
    uri: `inv:${i.id}`,
    props: i.props,
  }));

  const graph = { groups, nodes: graphNodes, links };

  /* ---------- 三元组明细（用于展示该实例相关的 RDF 断言） ---------- */
  function triplesOf(id) {
    const inst = byId.get(id);
    if (!inst) return [];
    const rows = [[`inv:${inst.id}`, 'rdf:type', `inv:${inst.cls}`]];
    inst.props.forEach(([name, value, predicate]) => rows.push([`inv:${inst.id}`, `inv:${predicate}`, `"${value}"`]));
    (outMap.get(inst.id) || []).forEach((rel) => rows.push([`inv:${inst.id}`, `inv:${rel.label}`, `inv:${rel.id}`]));
    (inMap.get(inst.id) || []).forEach((rel) => rows.push([`inv:${rel.id}`, `inv:${rel.label}`, `inv:${inst.id}`]));
    return rows;
  }

  return {
    ns,
    groups,
    instances,
    links,
    graph,
    stats,
    byId,
    outMap,
    inMap,
    byConcept,
    triplesOf,
    get(id) { return byId.get(id); },
    out(id) { return outMap.get(id) || []; },
    inOf(id) { return inMap.get(id) || []; },
    ofConcept(conceptId) { return byConcept.get(conceptId) || []; },
  };
})();
