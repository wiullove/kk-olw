/* 投资分析领域本体数据
 * 来源：从《投资分析方法论与指标体系》文档中抽取的领域语义
 * 结构：groups（本体分组） / nodes（概念，含简述与属性） / links（语义关系）
 */
window.INVEST_ONTOLOGY = (() => {
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

  const P = (...rows) => rows;

  const nodes = [
    // 1 投资组合本体
    { id: 'Portfolio', label: '投资组合', g: 1, desc: '由若干持仓构成的资产集合，是收益核算、风险度量与约束检查的基本单位。',
      props: P(['组合名称', 'string'], ['组合类型', 'enum'], ['组合状态', 'enum'], ['建仓日期', 'date'], ['组合净值', 'number'], ['计价币种', 'string']) },
    { id: 'PortfolioType', label: '组合类型', g: 1, desc: '按投资目标与管理方式划分的类别，如稳健型、平衡型、进取型。',
      props: P(['类型编码', 'string'], ['目标波动区间', 'range'], ['权益中枢', 'percent']) },
    { id: 'PortfolioStatus', label: '组合状态', g: 1, desc: '组合的生命周期状态，如建仓期、正常运作、暂停申赎、清盘中。',
      props: P(['状态编码', 'enum'], ['变更时间', 'datetime'], ['状态说明', 'text']) },

    // 2 持仓本体
    { id: 'Position', label: '持仓', g: 2, desc: '组合持有的某一具体标的份额，承载数量、市值与权重等度量。',
      props: P(['持仓数量', 'number'], ['持仓市值', 'number'], ['持仓权重', 'percent'], ['持仓成本', 'number'], ['浮动盈亏', 'number'], ['建仓日期', 'date']) },
    { id: 'Quantity', label: '持仓数量', g: 2, desc: '持有标的的份额或面值数量，是市值与权重计算的基础。',
      props: P(['数量', 'number'], ['计量单位', 'string'], ['可用数量', 'number']) },
    { id: 'MarketValue', label: '持仓市值', g: 2, desc: '按最新市场价格计算的持仓市值。',
      props: P(['市值', 'number'], ['估值时间', 'datetime'], ['计价币种', 'string']) },
    { id: 'Weight', label: '持仓权重', g: 2, desc: '持仓市值占组合净值的比例，用于集中度与归因分析。',
      props: P(['权重值', 'percent'], ['基准权重', 'percent'], ['权重偏离', 'percent']) },

    // 3 投资标的本体
    { id: 'Asset', label: '投资标的', g: 3, desc: '可被持有的金融资产抽象，下分为股票、债券、基金、指数与现金。',
      props: P(['标的代码', 'string'], ['标的名称', 'string'], ['资产类别', 'enum'], ['计价币种', 'string'], ['上市地', 'string']) },
    { id: 'Stock', label: '股票', g: 3, desc: '权益类标的，收益来自分红与资本利得。',
      props: P(['股票代码', 'string'], ['所属行业', 'enum'], ['总股本', 'number']) },
    { id: 'Bond', label: '债券', g: 3, desc: '固定收益类标的，现金流由票息与本金构成。',
      props: P(['债券代码', 'string'], ['票面利率', 'percent'], ['到期日', 'date'], ['剩余期限', 'number']) },
    { id: 'Fund', label: '基金', g: 3, desc: '由基金管理人运作的集合投资工具。',
      props: P(['基金代码', 'string'], ['基金类型', 'enum'], ['管理费率', 'percent'], ['基金规模', 'number']) },
    { id: 'Index', label: '指数', g: 3, desc: '反映一篮子标的价格表现的统计口径，可作为业绩基准。',
      props: P(['指数代码', 'string'], ['编制机构', 'string'], ['成分数量', 'number'], ['加权方式', 'enum']) },
    { id: 'Cash', label: '现金', g: 3, desc: '货币资金及等价物，用于流动性管理与备付。',
      props: P(['账户余额', 'number'], ['币种', 'string'], ['计息方式', 'enum']) },
    { id: 'AssetType', label: '资产类别', g: 3, desc: '标的在大类资产层面的归类，决定其估值、核算与风控口径。',
      props: P(['类别编码', 'enum'], ['风险等级', 'enum'], ['估值方法', 'enum']) },

    // 4 机构主体本体
    { id: 'Issuer', label: '发行人', g: 4, desc: '发行证券并承担偿付义务的主体，是信用风险的直接来源。',
      props: P(['机构名称', 'string'], ['主体评级', 'enum'], ['所属行业', 'enum'], ['注册地', 'string']) },
    { id: 'Manager', label: '基金管理人', g: 4, desc: '负责基金投资运作与信息披露的持牌机构。',
      props: P(['机构名称', 'string'], ['管理人编码', 'string'], ['在管规模', 'number']) },
    { id: 'Counterparty', label: '交易对手', g: 4, desc: '在回购、衍生品等交易中与组合形成债权债务关系的另一方。',
      props: P(['对手名称', 'string'], ['授信额度', 'number'], ['结算方式', 'enum']) },

    // 5 市场数据本体
    { id: 'MarketData', label: '市场数据', g: 5, desc: '描述标的价格、收益率、利率与汇率等行情信息及其对应的时点。',
      props: P(['行情时点', 'datetime'], ['数据来源', 'string'], ['更新频率', 'enum'], ['复权方式', 'enum']) },
    { id: 'Price', label: '市场价格', g: 5, desc: '标的在市场上的成交价或估值价。',
      props: P(['收盘价', 'number'], ['涨跌幅', 'percent'], ['成交量', 'number']) },
    { id: 'Yield', label: '收益率数据', g: 5, desc: '标的到期收益率或当期收益率序列。',
      props: P(['到期收益率', 'percent'], ['收益率变动', 'bp'], ['曲线期限', 'number']) },
    { id: 'InterestRate', label: '利率数据', g: 5, desc: '各期限无风险利率曲线，是贴现定价与久期计算的输入。',
      props: P(['期限', 'number'], ['利率值', 'percent'], ['利率变动', 'bp']) },
    { id: 'FX', label: '汇率数据', g: 5, desc: '币种之间的兑换价格，影响跨境持仓的本币估值。',
      props: P(['货币对', 'string'], ['中间价', 'number'], ['升贴水', 'percent']) },
    { id: 'DataTime', label: '行情时点', g: 5, desc: '市场数据对应的时间截面，保证不同来源数据口径可比。',
      props: P(['交易日', 'date'], ['快照时间', 'datetime'], ['时区', 'string']) },

    // 6 投资指标本体
    { id: 'Metric', label: '指标', g: 6, desc: '用于刻画组合或标的特征的量化度量，具有明确的定义与计算口径。',
      props: P(['指标名称', 'string'], ['计算口径', 'text'], ['统计区间', 'enum'], ['计量单位', 'string'], ['更新频率', 'enum']) },
    { id: 'MetricDefinition', label: '指标定义与计算口径', g: 6, desc: '指标的计算公式、样本区间与缺失值处理规则的约定。',
      props: P(['计算公式', 'text'], ['样本区间', 'enum'], ['数据清洗规则', 'text']) },
    { id: 'MetricResult', label: '指标结果', g: 6, desc: '在特定对象与统计区间上计算得到的指标数值。',
      props: P(['指标数值', 'number'], ['统计区间', 'enum'], ['计算时间', 'datetime'], ['数据来源', 'string']) },
    { id: 'MetricDependency', label: '指标依赖', g: 6, desc: '复合指标对其他原子指标的输入依赖，支撑口径追溯。',
      props: P(['上游指标', 'ref'], ['依赖关系', 'enum'], ['权重系数', 'number']) },
    { id: 'Return', label: '收益率', g: 6, desc: '区间内净值或价格变动带来的收益水平。',
      props: P(['区间收益率', 'percent'], ['年化收益率', 'percent'], ['收益贡献', 'number']) },
    { id: 'Volatility', label: '波动率', g: 6, desc: '收益率序列的标准差，衡量收益的不确定程度。',
      props: P(['年化波动率', 'percent'], ['下行波动率', 'percent'], ['样本长度', 'number']) },
    { id: 'Drawdown', label: '最大回撤', g: 6, desc: '区间内从峰值到谷值的最大跌幅，刻画极端下行损失。',
      props: P(['最大回撤', 'percent'], ['回撤起始日', 'date'], ['修复天数', 'number']) },
    { id: 'Duration', label: '久期', g: 6, desc: '债券现金流加权回收期限，衡量价格对利率的敏感度。',
      props: P(['麦考林久期', 'number'], ['修正久期', 'number'], ['凸性', 'number']) },
    { id: 'Concentration', label: '集中度', g: 6, desc: '组合在单一标的、行业或发行人上的暴露集中程度。',
      props: P(['前十大权重', 'percent'], ['赫芬达尔指数', 'number'], ['单一主体上限', 'percent']) },
    { id: 'ExcessReturn', label: '超额收益', g: 6, desc: '组合收益相对业绩基准收益的超出部分。',
      props: P(['超额收益率', 'percent'], ['信息比率', 'number'], ['胜率', 'percent']) },

    // 7 业绩基准本体
    { id: 'Benchmark', label: '业绩基准', g: 7, desc: '用于评价组合表现的比较锚点。',
      props: P(['基准名称', 'string'], ['生效日期', 'date'], ['计算方式', 'enum']) },
    { id: 'BenchmarkIndex', label: '基准指数', g: 7, desc: '作为业绩基准的具体指数及其编制规则。',
      props: P(['指数代码', 'string'], ['权重口径', 'enum'], ['是否含息', 'boolean']) },
    { id: 'BenchmarkReturn', label: '基准收益率', g: 7, desc: '业绩基准在相同统计区间内的收益率。',
      props: P(['区间收益率', 'percent'], ['年化收益率', 'percent'], ['跟踪误差', 'percent']) },

    // 8 风险因子本体
    { id: 'RiskType', label: '风险类型', g: 8, desc: '按来源划分的风险类别，如市场风险、信用风险、利率风险与流动性风险。',
      props: P(['风险编码', 'enum'], ['计量方法', 'enum'], ['报告频率', 'enum']) },
    { id: 'MarketRisk', label: '市场风险', g: 8, desc: '由市场价格整体波动引发的潜在损失。',
      props: P(['VaR', 'number'], ['置信水平', 'percent'], ['压力情景', 'enum']) },
    { id: 'CreditRisk', label: '信用风险', g: 8, desc: '由发行人违约或评级下调引发的潜在损失。',
      props: P(['评级分布', 'enum'], ['违约概率', 'percent'], ['违约损失率', 'percent']) },
    { id: 'RateRisk', label: '利率风险', g: 8, desc: '利率变动导致固定收益持仓价格波动的风险。',
      props: P(['久期敞口', 'number'], ['关键期限 DV01', 'number'], ['利率情景', 'bp']) },
    { id: 'LiquidityRisk', label: '流动性风险', g: 8, desc: '无法按合理价格及时变现的风险。',
      props: P(['变现天数', 'number'], ['冲击成本', 'percent'], ['赎回比例上限', 'percent']) },
    { id: 'RiskFactor', label: '风险因子', g: 8, desc: '驱动资产收益共同波动的共同因素，是归因与风控的解释变量。',
      props: P(['因子名称', 'string'], ['因子方向', 'enum'], ['因子收益', 'number'], ['因子波动率', 'percent']) },
    { id: 'RiskExposure', label: '风险暴露', g: 8, desc: '组合在特定风险因子或风险类型上的敞口大小。',
      props: P(['暴露值', 'number'], ['暴露占比', 'percent'], ['限额占用', 'percent'], ['计量时间', 'datetime']) },

    // 9 投资策略与约束本体
    { id: 'Strategy', label: '投资策略', g: 9, desc: '指导资产配置与交易执行的规则集合。',
      props: P(['策略名称', 'string'], ['策略类别', 'enum'], ['调仓频率', 'enum'], ['启用状态', 'enum']) },
    { id: 'Objective', label: '投资目标', g: 9, desc: '策略需要实现的收益、风险或期限目标。',
      props: P(['目标收益率', 'percent'], ['目标波动率', 'percent'], ['投资期限', 'enum']) },
    { id: 'Constraint', label: '配置约束', g: 9, desc: '对资产类别、个券比例、行业分布等的限制性要求。',
      props: P(['约束类型', 'enum'], ['约束对象', 'ref'], ['上/下限', 'range'], ['是否硬约束', 'boolean']) },
    { id: 'RiskLimit', label: '风险限额', g: 9, desc: '约束在风险维度上的量化阈值，如久期上限、回撤阈值。',
      props: P(['限额指标', 'ref'], ['限额值', 'number'], ['当前占用', 'percent'], ['超限处理', 'enum']) },

    // 10 投资分析本体
    { id: 'AnalysisTask', label: '分析任务', g: 10, desc: '针对组合开展的一次具体分析活动，如业绩归因、风险排查或合规检查。',
      props: P(['任务名称', 'string'], ['分析区间', 'enum'], ['分析维度', 'enum'], ['任务状态', 'enum'], ['创建时间', 'datetime']) },
    { id: 'AnalysisDimension', label: '分析维度', g: 10, desc: '分析的切入视角，如收益归因、风险拆解、流动性检查。',
      props: P(['维度编码', 'enum'], ['关联指标集', 'ref'], ['输出形态', 'enum']) },
    { id: 'AnalysisResult', label: '分析结果', g: 10, desc: '分析任务产出的结构化结果。',
      props: P(['结果类型', 'enum'], ['结果摘要', 'text'], ['产出时间', 'datetime']) },
    { id: 'Finding', label: '分析发现', g: 10, desc: '从分析结果中识别出的现象、异常或新出现的风险信号。',
      props: P(['发现描述', 'text'], ['影响对象', 'ref'], ['严重等级', 'enum']) },
    { id: 'Conclusion', label: '分析结论', g: 10, desc: '由证据支撑的判断性输出，可进一步形成行动建议。',
      props: P(['结论描述', 'text'], ['置信度', 'percent'], ['结论时间', 'datetime']) },
    { id: 'Evidence', label: '分析证据', g: 10, desc: '支持结论的指标结果与市场数据，保证结论可追溯。',
      props: P(['证据类型', 'enum'], ['来源对象', 'ref'], ['采集时间', 'datetime']) },
    { id: 'Recommendation', label: '分析建议', g: 10, desc: '基于结论给出的调仓、风控或持续跟踪建议。',
      props: P(['建议内容', 'text'], ['优先级', 'enum'], ['建议对象', 'ref'], ['处理状态', 'enum']) },
  ];

  // [源, 目标, 关系标签(空 = 本体内部关系)]
  const links = [
    ['Portfolio', 'PortfolioType', ''], ['Portfolio', 'PortfolioStatus', ''],
    ['Position', 'Quantity', ''], ['Position', 'MarketValue', ''], ['Position', 'Weight', ''],
    ['Stock', 'Asset', ''], ['Bond', 'Asset', ''], ['Fund', 'Asset', ''], ['Index', 'Asset', ''], ['Cash', 'Asset', ''],
    ['Asset', 'AssetType', ''],
    ['MarketData', 'Price', ''], ['MarketData', 'Yield', ''], ['MarketData', 'InterestRate', ''],
    ['MarketData', 'FX', ''], ['MarketData', 'DataTime', ''],
    ['Metric', 'MetricDefinition', ''], ['Metric', 'MetricResult', ''],
    ['Return', 'Metric', ''], ['Volatility', 'Metric', ''], ['Drawdown', 'Metric', ''],
    ['Duration', 'Metric', ''], ['Concentration', 'Metric', ''], ['ExcessReturn', 'Metric', ''],
    ['Benchmark', 'BenchmarkIndex', ''], ['Benchmark', 'BenchmarkReturn', ''],
    ['MarketRisk', 'RiskType', ''], ['CreditRisk', 'RiskType', ''], ['RateRisk', 'RiskType', ''],
    ['LiquidityRisk', 'RiskType', ''], ['RiskExposure', 'RiskFactor', ''],
    ['Strategy', 'Objective', ''], ['Strategy', 'Constraint', ''], ['Constraint', 'RiskLimit', ''],
    ['AnalysisTask', 'AnalysisDimension', ''], ['AnalysisTask', 'AnalysisResult', ''],
    ['AnalysisResult', 'Finding', ''], ['AnalysisResult', 'Conclusion', ''],
    ['Conclusion', 'Recommendation', ''], ['Conclusion', 'Evidence', ''],

    // 跨本体语义关系
    ['Portfolio', 'Position', '包含持仓'],
    ['Position', 'Asset', '持有标的'],
    ['Asset', 'Issuer', '由其发行'],
    ['Asset', 'Manager', '由其管理'],
    ['Position', 'Counterparty', '关联交易对手'],
    ['Asset', 'MarketData', '关联市场数据'],
    ['Portfolio', 'MetricResult', '具有指标结果'],
    ['Asset', 'MetricResult', '具有指标结果'],
    ['MetricResult', 'MetricDefinition', '依据指标定义'],
    ['MetricDefinition', 'MetricDependency', '依赖其他指标'],
    ['MetricDependency', 'Metric', '引用'],
    ['Portfolio', 'Benchmark', '具有业绩基准'],
    ['Benchmark', 'Index', '引用指数'],
    ['Portfolio', 'RiskExposure', '具有风险暴露'],
    ['Asset', 'RiskFactor', '暴露于'],
    ['RiskExposure', 'RiskFactor', '对应风险因子'],
    ['RiskExposure', 'RiskType', '按风险类型分类'],
    ['Portfolio', 'Strategy', '遵循'],
    ['Portfolio', 'Constraint', '受约束'],
    ['AnalysisTask', 'Portfolio', '分析对象'],
    ['AnalysisTask', 'Metric', '使用指标'],
    ['AnalysisTask', 'MetricResult', '评价指标结果'],
    ['AnalysisTask', 'Benchmark', '对照基准评价'],
    ['AnalysisTask', 'RiskFactor', '评价风险'],
    ['AnalysisTask', 'Constraint', '检查约束'],
    ['AnalysisTask', 'MarketData', '引用市场数据'],
    ['Evidence', 'MetricResult', '包含指标结果'],
    ['Evidence', 'MarketData', '包含市场数据'],
  ];

  const nsiblings = new Map();
  nodes.forEach((n) => nsiblings.set(n.id, n));

  return {
    source: '《投资分析方法论与指标体系》',
    version: 'v1.0',
    groups,
    nodes,
    links,
    stats: {
      ontology: groups.length,
      concepts: nodes.length,
      relations: links.length,
      cross: links.filter(([, , label]) => label).length,
      properties: nodes.reduce((sum, n) => sum + n.props.length, 0),
    },
    find: (id) => nsiblings.get(id),
  };
})();
