const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

const toast = (message) => {
  const el = $('#toast');
  el.textContent = message;
  el.classList.add('show');
  window.clearTimeout(window.__toastTimer);
  window.__toastTimer = window.setTimeout(() => el.classList.remove('show'), 2200);
};

const overlay = $('#platformOverlay');
const openPlatform = () => {
  overlay.classList.add('open');
  overlay.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closePlatform = () => {
  overlay.classList.remove('open');
  overlay.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = '';
};
$('#openPlatform').addEventListener('click', openPlatform);
$('#closePlatform').addEventListener('click', closePlatform);
overlay.addEventListener('click', (event) => {
  if (event.target === overlay) closePlatform();
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && overlay.classList.contains('open')) closePlatform();
});

let isPlaying = false;
let elapsed = 0;
let playbackTimer;
const progress = $('#progressBar');
const timeLabel = $('#timeLabel');
const playButton = $('#playButton');
const formatTime = (seconds) => `00:${String(Math.min(59, seconds)).padStart(2, '0')}`;
const renderPlayback = () => {
  progress.style.width = `${Math.max(8, Math.min(100, (elapsed / 88) * 100))}%`;
  timeLabel.textContent = formatTime(elapsed);
  playButton.innerHTML = isPlaying ? '<span class="pause-bars"><i></i><i></i></span>' : '<span class="play-triangle"></span>';
};
const togglePlayback = () => {
  isPlaying = !isPlaying;
  toast(isPlaying ? '视频开始播放' : '视频已暂停');
  window.clearInterval(playbackTimer);
  if (isPlaying) playbackTimer = window.setInterval(() => {
    elapsed = elapsed >= 88 ? 0 : elapsed + 1;
    renderPlayback();
  }, 1000);
  renderPlayback();
};
playButton.addEventListener('click', togglePlayback);
$('#soundButton').addEventListener('click', (event) => {
  event.currentTarget.textContent = event.currentTarget.textContent === '⌁' ? '⌁̸' : '⌁';
  toast(event.currentTarget.textContent.includes('̸') ? '已静音' : '已开启声音');
});

$$('.social-action').forEach((button) => {
  button.addEventListener('click', () => {
    const action = button.dataset.action;
    if (action === 'like') {
      const count = $('#likeCount');
      const liked = button.classList.toggle('active');
      count.textContent = liked ? '35' : '34';
      toast(liked ? '已点赞' : '已取消点赞');
    } else if (action === 'favorite') {
      const count = $('#favoriteCount');
      const saved = button.classList.toggle('active');
      count.textContent = saved ? '13' : '12';
      toast(saved ? '已收藏到稍后再看' : '已取消收藏');
    } else if (action === 'share') {
      toast('分享链接已复制');
    } else if (action === 'comment') {
      toast('评论区将在产品版中展开');
    }
  });
});

const panelTitles = { overview: '总览', model: '本体建模', charts: '图表工作台', agents: '本体智能体', reports: '智能报告', knowledge: '企业知识' };
$$('.nav-item').forEach((button) => {
  button.addEventListener('click', () => {
    const panel = button.dataset.panel;
    $$('.nav-item').forEach((item) => item.classList.toggle('active', item === button));
    $$('.panel-view').forEach((view) => view.classList.toggle('active', view.dataset.view === panel));
    $('#breadcrumbTitle').textContent = panelTitles[panel];
  });
});

$$('[data-toast]').forEach((button) => button.addEventListener('click', () => toast(button.dataset.toast)));

$$('.entity-card').forEach((card) => {
  card.addEventListener('click', () => {
    $$('.entity-card').forEach((item) => item.classList.remove('selected'));
    card.classList.add('selected');
    $('#entityName').textContent = card.dataset.entity;
    toast(`已选中实体：${card.dataset.entity}`);
  });
});

$('#generateReport').addEventListener('click', () => {
  const status = $('#reportStatus');
  status.textContent = '生成中';
  toast('正在基于本体关系生成报告…');
  window.setTimeout(() => {
    status.textContent = '已完成';
    toast('报告已生成，可查看完整内容');
  }, 1700);
});

const knowledgeInput = $('#knowledgeInput');
knowledgeInput.addEventListener('input', (event) => {
  const query = event.target.value.trim().toLowerCase();
  let visible = 0;
  $$('.knowledge-item', $('#knowledgeItems')).forEach((item) => {
    const matches = !query || item.dataset.search.toLowerCase().includes(query);
    item.style.display = matches ? 'grid' : 'none';
    if (matches) visible += 1;
  });
  $('#knowledgeResultHint').textContent = query ? `找到 ${visible} 条匹配内容` : '共 1,248 条知识内容';
});

$('#platformSearch').addEventListener('click', () => {
  const currentPanel = $('.panel-view.active')?.dataset.view;
  if (currentPanel !== 'knowledge') {
    $('.nav-item[data-panel="knowledge"]').click();
  }
  knowledgeInput.focus();
  toast('已切换到企业知识搜索');
});
$('#helpButton').addEventListener('click', () => toast('这是 JBoltAI 本体语义平台演示页'));
renderPlayback();

// 文档到本体的演示流程：只模拟解析与写入，不执行真实文件上传。
const importModal = $('#importModal');
const importStages = $$('[data-import-stage]');
const importSteps = $$('.import-step');
const setImportStage = (stage) => {
  importStages.forEach((item) => item.classList.toggle('active', item.dataset.importStage === stage));
  const stepByStage = { upload: 1, analyzing: 2, preview: 3, success: 3 };
  const current = stepByStage[stage];
  importSteps.forEach((item) => item.classList.toggle('active', Number(item.dataset.step) <= current));
};
const openImport = () => {
  setImportStage('upload');
  importModal.classList.add('open');
  importModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeImport = () => {
  importModal.classList.remove('open');
  importModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
  if (previewGraph) previewGraph.pause();
  if (instGraph) instGraph.pause();
};
$('#openImport').addEventListener('click', openImport);
$('#closeImport').addEventListener('click', closeImport);
importModal.addEventListener('click', (event) => {
  if (event.target === importModal) closeImport();
});

let previewView = 'tbox';

/* 抽取流水线：文档解析过程中，本体骨架（TBox）与实例数据（ABox）同步累计。 */
const PIPELINE = [
  { key: 'seg', total: 4860, from: 0, to: 34 },
  { key: 'concept', total: 54, from: 10, to: 48 },
  { key: 'property', total: 186, from: 24, to: 64 },
  { key: 'relation', total: 68, from: 38, to: 78 },
  { key: 'instance', total: 34, from: 56, to: 94 },
  { key: 'triple', total: 130, from: 64, to: 100 },
];

function resetPipeline() {
  PIPELINE.forEach((row) => {
    const el = document.getElementById(`es${row.key[0].toUpperCase()}${row.key.slice(1)}`);
    if (el) el.textContent = '0';
    const wrap = document.querySelector(`.es-row[data-es="${row.key}"]`);
    if (wrap) wrap.className = `es-row${row.key === 'instance' || row.key === 'triple' ? ' es-inst' : ''}`;
  });
}

function tickPipeline(progress) {
  PIPELINE.forEach((row) => {
    const el = document.getElementById(`es${row.key[0].toUpperCase()}${row.key.slice(1)}`);
    const wrap = document.querySelector(`.es-row[data-es="${row.key}"]`);
    const ratio = Math.max(0, Math.min(1, (progress - row.from) / (row.to - row.from)));
    if (el) el.textContent = fmtNum(Math.round(row.total * ratio));
    if (!wrap) return;
    const base = `es-row${row.key === 'instance' || row.key === 'triple' ? ' es-inst' : ''}`;
    const state = progress >= row.to ? ' done' : progress >= row.from ? ' active' : '';
    wrap.className = base + state;
  });
}

let analysisTimer;
const startDemoImport = () => {
  setImportStage('analyzing');
  const progressBar = $('#analysisProgress');
  const percent = $('#analysisPercent');
  const message = $('#analysisMessage');
  const messages = [
    '读取文档结构与语义上下文…',
    '识别投资组合、持仓与标的概念…',
    '抽取属性字段与语义关系…',
    '实例化实体：识别组合、债券与指标实例…',
    '按 rdf:type 挂载实例并生成 RDF 三元组…',
  ];
  resetPipeline();
  let value = 0;
  window.clearInterval(analysisTimer);
  analysisTimer = window.setInterval(() => {
    value += 4;
    const p = Math.min(value, 100);
    progressBar.style.width = `${p}%`;
    percent.textContent = `${p}%`;
    message.textContent = messages[Math.min(Math.floor(p / 21), messages.length - 1)];
    tickPipeline(p);
    if (value >= 100) {
      window.clearInterval(analysisTimer);
      tickPipeline(100);
      window.setTimeout(() => {
        setImportStage('preview');
        fillExtractionStats();
        switchPreviewView(previewView);
      }, 320);
    }
  }, 88);
};
$('#demoFilePick').addEventListener('click', startDemoImport);
$('#useDemoFile').addEventListener('click', startDemoImport);

$('#confirmOntology').addEventListener('click', () => {
  setImportStage('success');
  toast('本体已创建，正在同步到工作空间');
  markOntologyCreated(false);
});

$('#viewImportedModel').addEventListener('click', () => {
  closeImport();
  $('.nav-item[data-panel="model"]').click();
  switchOntologyTab('invest');
  const graph = ensureModelGraph();
  graph.resume();
  graph.resize();
  startModelGrowth(true);
  toast('投资分析本体关系图谱已生成');
});

$('#ogEmptyImport').addEventListener('click', openImport);

// 关闭导入弹窗时暂停预览仿真，避免隐藏画布持续计算。


// 智能体演示工作区：展示选择智能体、快速提问与示例洞察结果。
const agentModal = $('#agentModal');
const agentInput = $('#agentInput');
const agentData = {
  insight: { name: '洞察引擎', icon: '✦', subline: '发现趋势、异常与潜在机会，生成可追溯的业务洞察。', context: '销售业务本体 · 企业知识', calls: '238', response: '基于客户、项目和交付物之间的语义关系，我发现华东区域有 3 个高风险客户。主要信号集中在续约周期 30 天内，建议优先查看「星河科技」与「远航制造」。', result: [['3', '高风险客户'], ['12.4%', '流失率环比'], ['2', '挽回路径']], suggestions: ['分析本季度客户流失风险', '找出交付响应最慢的项目'] },
  customer: { name: '客户雷达', icon: '⌁', subline: '关联客户、项目与服务记录，识别客户健康度与流失风险。', context: '客户本体 · 服务知识', calls: '186', response: '客户雷达已完成健康度扫描：星河科技当前评分 62，近 30 天交付响应下降 18%；远航制造评分 68，存在 2 个未闭环服务问题。', result: [['62', '星河科技健康度'], ['18%', '响应下降'], ['2', '未闭环问题']], suggestions: ['哪些客户存在流失风险', '查看近 30 天服务问题'] },
  project: { name: '项目管家', icon: '◈', subline: '结合项目本体和知识库，汇总进度、资源与交付风险。', context: '项目本体 · 交付文档', calls: '待发布', response: '这是一个草稿智能体演示：已读取 8 个项目实体，发现「华东交付项目」延期风险较高，主要受供应商交付节点影响。', result: [['8', '项目实体'], ['1', '高风险项目'], ['4', '关联供应商']], suggestions: ['汇总本周项目进度', '哪些项目存在延期风险'] }
};
let selectedAgent = 'insight';
const openAgentDemo = (agent = 'insight') => {
  selectedAgent = agent;
  updateAgentWorkspace(agent);
  agentModal.classList.add('open');
  agentModal.setAttribute('aria-hidden', 'false');
  document.body.style.overflow = 'hidden';
};
const closeAgentDemo = () => {
  agentModal.classList.remove('open');
  agentModal.setAttribute('aria-hidden', 'true');
  document.body.style.overflow = overlay.classList.contains('open') ? 'hidden' : '';
};
const updateAgentWorkspace = (agent) => {
  const data = agentData[agent];
  selectedAgent = agent;
  $$('.agent-picker').forEach((item) => item.classList.toggle('active', item.dataset.agentPicker === agent));
  $('#agentLiveIcon').textContent = data.icon;
  $('#agentDialogTitle').textContent = data.name;
  $('#agentDialogSubline').textContent = data.subline;
  $('#agentContext').textContent = data.context;
  $('#agentCalls').textContent = data.calls;
  $('#agentChat').innerHTML = `<div class="agent-message agent-message-ai"><span class="chat-avatar">${data.icon}</span><div><small>${data.name} · 刚刚</small><p>你好，我已经连接到你的企业本体空间。你可以让我分析实体之间的语义关系。</p><div class="suggestion-row">${(data.suggestions || []).map((text) => `<button class="suggestion" data-prompt="${text}">${text}</button>`).join('')}</div></div></div>`;
  bindSuggestions();
};
const bindSuggestions = () => $$('.suggestion').forEach((button) => button.addEventListener('click', () => {
  agentInput.value = button.dataset.prompt;
  sendAgentMessage();
}));
const sendAgentMessage = () => {
  const prompt = agentInput.value.trim();
  if (!prompt) { toast('请先输入一个问题'); return; }
  const data = agentData[selectedAgent];
  const chat = $('#agentChat');
  const userMessage = document.createElement('div');
  userMessage.className = 'agent-message agent-message-user';
  userMessage.innerHTML = `<div><small>你 · 刚刚</small><p>${prompt.replace(/[&<>]/g, (char) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[char]))}</p></div>`;
  chat.appendChild(userMessage);
  agentInput.value = '';
  chat.scrollTop = chat.scrollHeight;
  window.setTimeout(() => {
    const aiMessage = document.createElement('div');
    aiMessage.className = 'agent-message agent-message-ai';
    aiMessage.innerHTML = `<span class="chat-avatar">${data.icon}</span><div><small>${data.name} · 已完成</small><p>${data.response}</p><div class="agent-result">${data.result.map(([value, label]) => `<div><strong>${value}</strong><span>${label}</span></div>`).join('')}</div><div class="agent-output-actions"><button class="agent-add-chart" type="button"><span aria-hidden="true">▥</span> 图表工作台</button><span>将本次输出与指标添加到工作台</span></div></div>`;
    aiMessage.querySelector('.agent-add-chart').addEventListener('click', () => addAgentResultToChart({ agent: data.name, prompt, response: data.response, result: data.result }));
    chat.appendChild(aiMessage);
    chat.scrollTop = chat.scrollHeight;
    toast(`${data.name} 已完成语义分析`);
  }, 700);
};
$$('.agent-open').forEach((button) => button.addEventListener('click', () => openAgentDemo(button.dataset.agent)));
$$('.agent-picker').forEach((button) => button.addEventListener('click', () => updateAgentWorkspace(button.dataset.agentPicker)));
$('#closeAgent').addEventListener('click', closeAgentDemo);
agentModal.addEventListener('click', (event) => { if (event.target === agentModal) closeAgentDemo(); });
$('#sendAgent').addEventListener('click', sendAgentMessage);
agentInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter' && !event.shiftKey) { event.preventDefault(); sendAgentMessage(); }
});
window.addEventListener('keydown', (event) => {
  if (event.key === 'Escape' && agentModal.classList.contains('open')) closeAgentDemo();
});
bindSuggestions();

// 图表工作台：以本地样例数据演示配置、绘制、保存和导出流程。
const chartDatasets = {
  sales: { title: '月度合同金额趋势', subtitle: '按月份汇总 · 最近 6 个月', categories: ['4月', '5月', '6月', '7月', '8月', '9月'], values: [42, 58, 49, 72, 86, 100], kpi: '¥ 2,486,300' },
  project: { title: '项目交付完成率', subtitle: '按月份汇总 · 最近 6 个月', categories: ['4月', '5月', '6月', '7月', '8月', '9月'], values: [54, 61, 57, 74, 81, 93], kpi: '93.4%' },
  customer: { title: '客户健康度分布', subtitle: '按月份汇总 · 最近 6 个月', categories: ['4月', '5月', '6月', '7月', '8月', '9月'], values: [66, 72, 68, 79, 87, 96], kpi: '86.2 分' }
};
let activeChartType = 'bar';
const chartSvg = (type, values, labels) => {
  const w = 720, h = 224, left = 42, right = 16, top = 14, bottom = 33;
  const innerW = w - left - right, innerH = h - top - bottom;
  const grid = [0, 25, 50, 75, 100].map((v) => `<line x1="${left}" y1="${top + innerH * (1 - v / 100)}" x2="${w-right}" y2="${top + innerH * (1-v/100)}" stroke="#edf0f5"/><text x="${left-10}" y="${top + innerH * (1-v/100) + 3}" text-anchor="end" fill="#a6aab5" font-size="9">${v}</text>`).join('');
  const xs = values.map((_, i) => left + innerW * (i + .5) / values.length);
  const tick = labels.map((label, i) => `<text x="${xs[i]}" y="${h-8}" text-anchor="middle" fill="#9297a4" font-size="10">${label}</text>`).join('');
  if (type === 'number') return `<div class="chart-number-view"><span>当前指标</span><strong>${chartDatasets[$('#chartDataset').value].kpi}</strong><small>较上期 <b>↗ 12.8%</b></small></div>`;
  if (type === 'pie') {
    const colors = ['#7568cd','#a49ae8','#c5bdf3','#e3e0fa']; let offset = 0;
    const parts = [42, 28, 19, 11].map((value, i) => { const part = `<circle cx="110" cy="110" r="72" fill="none" stroke="${colors[i]}" stroke-width="24" stroke-dasharray="${value*4.52} ${452-value*4.52}" stroke-dashoffset="-${offset*4.52}" transform="rotate(-90 110 110)"/>`; offset += value; return part; }).join('');
    return `<div class="donut-chart"><svg viewBox="0 0 220 220">${parts}<text x="110" y="105" text-anchor="middle" fill="#303443" font-size="23" font-weight="700">186</text><text x="110" y="128" text-anchor="middle" fill="#979ca9" font-size="10">成交客户</text></svg><div class="donut-legend"><span><i style="background:#7568cd"></i>华东 <b>42%</b></span><span><i style="background:#a49ae8"></i>华南 <b>28%</b></span><span><i style="background:#c5bdf3"></i>华北 <b>19%</b></span><span><i style="background:#e3e0fa"></i>其他 <b>11%</b></span></div></div>`;
  }
  if (type === 'line') {
    const points = values.map((v,i)=>`${xs[i]},${top+innerH*(1-v/110)}`).join(' ');
    return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${grid}<polyline points="${points}" fill="none" stroke="#7669d2" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"/>${values.map((v,i)=>`<circle cx="${xs[i]}" cy="${top+innerH*(1-v/110)}" r="4" fill="#fff" stroke="#7669d2" stroke-width="2"/>`).join('')}${tick}</svg>`;
  }
  const bars = values.map((v,i)=>{const bw=38, bh=innerH*v/110;return `<rect x="${xs[i]-bw/2}" y="${top+innerH-bh}" width="${bw}" height="${bh}" rx="5" fill="${i===values.length-1?'#6d60c5':'#c5c0eb'}"><title>${labels[i]}：${v}</title></rect>`;}).join('');
  return `<svg class="chart-svg" viewBox="0 0 ${w} ${h}" preserveAspectRatio="none">${grid}${bars}${tick}</svg>`;
};
const renderChart = () => {
  const data = chartDatasets[$('#chartDataset').value];
  const dimension = $('#chartDimension').value, metric = $('#chartMetric').value;
  $('#chartTitle').textContent = activeChartType === 'pie' ? '区域成交客户占比' : activeChartType === 'number' ? metric : data.title;
  $('#chartSubtitle').textContent = activeChartType === 'pie' ? '按区域汇总 · 本季度' : `${dimension}汇总 · 最近 6 个月`;
  $('#chartKpi').textContent = data.kpi;
  $('#visualChart').innerHTML = chartSvg(activeChartType, data.values, data.categories);
  $$('.chart-type').forEach((button) => button.classList.toggle('active', button.dataset.type === activeChartType));
};
const agentChartStorageKey = 'kk-owl-agent-chart-results';
const addAgentResultCard = (item, persist = true) => {
  const area = $('.chart-board-area');
  if (!area) return;
  const card = document.createElement('section');
  card.className = 'chart-canvas module-card agent-chart-result-card';
  const head = document.createElement('div'); head.className = 'chart-card-head';
  const titleWrap = document.createElement('div');
  const title = document.createElement('strong'); title.textContent = `${item.agent} · 对话洞察`;
  const subtitle = document.createElement('span'); subtitle.textContent = `来自智能体对话：${item.prompt}`;
  titleWrap.append(title, subtitle);
  const remove = document.createElement('button'); remove.className = 'remove-added-chart'; remove.type = 'button'; remove.setAttribute('aria-label', '移除对话洞察'); remove.textContent = '×';
  head.append(titleWrap, remove);
  const response = document.createElement('p'); response.className = 'agent-chart-response'; response.textContent = item.response;
  const metrics = document.createElement('div'); metrics.className = 'agent-chart-metrics';
  item.result.forEach(([value, label], index) => {
    const metric = document.createElement('div'); metric.className = 'agent-chart-metric';
    const number = document.createElement('strong'); number.textContent = value;
    const caption = document.createElement('span'); caption.textContent = label;
    const track = document.createElement('i'); track.style.setProperty('--metric-level', `${Math.max(18, 92 - index * 22)}%`);
    metric.append(number, caption, track); metrics.append(metric);
  });
  const source = document.createElement('small'); source.className = 'agent-chart-source'; source.textContent = '来源：智能体对话结果 · 本体语义上下文';
  card.append(head, response, metrics, source);
  area.insertBefore(card, $('.chart-insight'));
  remove.addEventListener('click', () => {
    card.remove();
    const saved = JSON.parse(localStorage.getItem(agentChartStorageKey) || '[]').filter((savedItem) => savedItem.id !== item.id);
    localStorage.setItem(agentChartStorageKey, JSON.stringify(saved));
    toast('已从图表工作台移除');
  });
  if (persist) {
    const saved = JSON.parse(localStorage.getItem(agentChartStorageKey) || '[]');
    saved.push(item);
    localStorage.setItem(agentChartStorageKey, JSON.stringify(saved));
  }
};
const addAgentResultToChart = (item) => {
  item.id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  addAgentResultCard(item);
  closeAgentDemo();
  $('.nav-item[data-panel="charts"]').click();
  toast('已将智能体输出与指标添加到图表工作台');
};
if ($('#chartDataset')) {
  $('#chartDataset').addEventListener('change', renderChart);
  $('#chartDimension').addEventListener('change', renderChart);
  $('#chartMetric').addEventListener('change', renderChart);
  $$('.chart-type').forEach((button) => button.addEventListener('click', () => { activeChartType = button.dataset.type; renderChart(); }));
  renderChart();
  JSON.parse(localStorage.getItem(agentChartStorageKey) || '[]').forEach((item) => addAgentResultCard(item, false));
  $('#saveChartBoard').addEventListener('click', () => {
    const config = { dataset: $('#chartDataset').value, dimension: $('#chartDimension').value, metric: $('#chartMetric').value, type: activeChartType, savedAt: new Date().toISOString() };
    localStorage.setItem('kk-owl-chart-board', JSON.stringify(config));
    toast('工作台配置已保存在当前浏览器');
  });
  $('#addChart').addEventListener('click', () => {
    const area = $('.chart-board-area');
    const card = document.createElement('section'); card.className = 'chart-canvas module-card added-chart';
    card.innerHTML = `<div class="chart-card-head"><div><strong>新建可视化</strong><span>从当前数据集中选择图表类型</span></div><button class="remove-added-chart" aria-label="移除图表">×</button></div><div class="added-chart-placeholder"><span>▥</span><p>已添加一个图表卡片</p><button class="configure-added-chart">使用当前配置</button></div>`;
    area.insertBefore(card, $('.chart-insight'));
    card.querySelector('.remove-added-chart').addEventListener('click', () => card.remove());
    card.querySelector('.configure-added-chart').addEventListener('click', () => { card.querySelector('.added-chart-placeholder').outerHTML = `<div class="visual-chart">${chartSvg(activeChartType, chartDatasets[$('#chartDataset').value].values, chartDatasets[$('#chartDataset').value].categories)}</div>`; toast('已应用当前图表配置'); });
    toast('已添加图表卡片');
  });
  $('#chartFilter').addEventListener('click', (event) => { const current = event.currentTarget.querySelector('span'); current.textContent = current.textContent === '全部区域' ? '华东区域 ×' : '全部区域'; toast(`语义筛选：${current.textContent}`); });
  $('#chartRefresh').addEventListener('click', () => { renderChart(); toast('图表数据已刷新'); });
  $('#chartExport').addEventListener('click', () => {
    const data = chartDatasets[$('#chartDataset').value];
    const csv = '\ufeff维度,指标\n' + data.categories.map((label, i) => `${label},${data.values[i]}`).join('\n');
    const link = document.createElement('a'); link.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' })); link.download = '销售经营分析.csv'; link.click(); URL.revokeObjectURL(link.href); toast('CSV 数据已导出');
  });
  $('#chartShare').addEventListener('click', async () => { try { await navigator.clipboard.writeText(location.href); toast('工作台链接已复制'); } catch { toast('工作台链接已准备分享'); } });
  $('#chartInsightDetails').addEventListener('click', () => toast('已定位华东区域的客户与合同归因'));
  $('#chartMore').addEventListener('click', () => toast('图表操作：复制、重命名或移除'));
}

/* =========================================================
   投资分析本体：知识文档 → 语义解析 → 本体关系图谱
   数据来自 ontology-data.js，渲染由 force-graph.js 提供
   ========================================================= */
const ONTO = window.INVEST_ONTOLOGY;
const INS = window.INVEST_INSTANCES;
const ontoState = { created: false, tab: 'sales', growthDone: false, instances: true };
let modelGraph = null;
let previewGraph = null;
let instGraph = null;
let revealTimer = null;
let modelTimer = null;
let instTimer = null;

const setText = (id, text) => {
  const el = document.getElementById(id);
  if (el) el.textContent = text;
};
const fmtNum = (n) => n.toLocaleString('en-US');

/* ---------- 抽取统计 ---------- */
function fillExtractionStats() {
  if (!ONTO) return;
  setText('exOntology', `已发现 ${ONTO.stats.ontology} 类本体 · ${ONTO.stats.concepts} 个概念`);
  setText('exProperty', `已发现 ${ONTO.stats.properties} 个`);
  setText('exRelation', `已发现 ${ONTO.stats.relations} 条`);
  setText('suOntology', ONTO.stats.ontology);
  setText('suConcept', ONTO.stats.concepts);
  setText('suRelation', ONTO.stats.relations);
  setText('previewTotal', ONTO.stats.ontology);
  if (INS) {
    setText('exInstance', `已发现 ${INS.stats.instances} 个 · ${INS.stats.assertions} 条断言`);
    setText('suInstance', INS.stats.instances);
    setText('instTotal', INS.stats.instances);
    setText('suInstanceLink', `✓ 已写入 ${INS.stats.instances} 个实例与 ${INS.stats.assertions} 条断言`);
  }
}

/* ---------- 导入预览：本体骨架渐进生长 ---------- */
function ensurePreviewGraph() {
  if (previewGraph) { previewGraph.resume(); return previewGraph; }
  previewGraph = window.OntoGraph.create($('#ogPreviewStage'), ONTO, { compact: true, tip: false });
  return previewGraph;
}

function runPreviewGrowth() {
  if (!ONTO) return;
  window.clearTimeout(revealTimer);
  const graph = ensurePreviewGraph();
  graph.resize();
  graph.resetReveal();
  setText('previewRevealed', '0');
  setText('ogPreviewHint', '正在抽取本体骨架…');
  let index = 0;
  const grow = () => {
    if (index >= ONTO.groups.length) {
      setText('ogPreviewHint', `抽取完成 · ${ONTO.stats.concepts} 个概念 · ${ONTO.stats.relations} 条语义关系`);
      setText('previewRevealed', ONTO.groups.length);
      graph.fit(false);
      return;
    }
    const group = ONTO.groups[index];
    graph.revealGroup(group.id);
    graph.fit(true);
    setText('previewRevealed', index + 1);
    setText('ogPreviewHint', `正在生长：${group.name}`);
    index += 1;
    revealTimer = window.setTimeout(grow, 320);
  };
  grow();
}

/* ---------- 导入预览：实例层（ABox）图谱 ---------- */
function ensureInstGraph() {
  if (!INS) return null;
  if (instGraph) { instGraph.resume(); return instGraph; }
  instGraph = window.OntoGraph.create($('#ogInstStage'), INS.graph, { compact: true, tip: false });
  instGraph.resetReveal();
  instGraph.on('select', renderInstanceDetail);
  return instGraph;
}

function runInstanceGrowth() {
  const graph = ensureInstGraph();
  if (!graph) return;
  window.clearTimeout(instTimer);
  graph.resize();
  graph.resetReveal();
  setText('instMounted', '0');
  setText('ogInstHint', '正在按本体挂载实例…');
  let index = 0;
  const grow = () => {
    if (index >= INS.groups.length) {
      graph.fit(false);
      setText('instMounted', INS.stats.instances);
      setText('ogInstHint', `挂载完成 · ${INS.stats.instances} 个实例 · ${INS.stats.relations} 条实例关系`);
      return;
    }
    const group = INS.groups[index];
    graph.revealGroup(group.id);
    graph.fit(true);
    const mounted = INS.instances.filter((i) => INS.groups.findIndex((g) => g.id === i.g) <= index).length;
    setText('instMounted', mounted);
    setText('ogInstHint', `正在挂载：${group.name}`);
    index += 1;
    instTimer = window.setTimeout(grow, 300);
  };
  grow();
}

function renderInstanceChips() {
  const box = $('#instChips');
  if (!box || !INS) return;
  box.innerHTML = INS.instances.map((i) => `<button class="inst-chip" data-inst="${i.id}">${i.label}<i>${i.id}</i></button>`).join('');
  box.querySelectorAll('.inst-chip').forEach((chip) => {
    chip.addEventListener('click', () => {
      if (instGraph) instGraph.select(chip.dataset.inst);
      else renderInstanceDetail(INS.get(chip.dataset.inst));
    });
  });
}

function renderInstanceDetail(node) {
  const box = $('#instDetail');
  if (!box || !INS) return;
  if (instGraph) instGraph.setSearch('');
  const chips = $('#instChips');
  if (chips) chips.querySelectorAll('.inst-chip').forEach((c) => {
    c.classList.toggle('active', !!node && c.dataset.inst === node.id);
  });
  if (!node) {
    box.innerHTML = `<h5>实例层概览</h5><p class="id-sub">文档中的实体已按 rdf:type 实例化，并挂载到对应本体概念。点击左侧任一实例查看它的属性与 RDF 断言。</p>
      <div class="id-sec"><span>实例总数</span><b>${INS.stats.instances}</b></div>
      <div class="id-sec"><span>实例关系</span><b>${INS.stats.relations}</b></div>
      <div class="id-sec"><span>属性断言</span><b>${INS.stats.literals}</b></div>
      <div class="id-sec"><span>RDF 三元组</span><b>${INS.stats.triples}</b></div>`;
    return;
  }
  const inst = INS.get(node.id) || node;
  const triples = INS.triplesOf(inst.id);
  box.innerHTML = `
    <h5>${inst.label}</h5>
    <p class="id-uri">inv:${inst.id} a inv:${inst.cls}</p>
    <p class="id-sub">${inst.desc}</p>
    <div class="id-sec"><span>实例属性</span><b>${inst.props.length}</b></div>
    ${inst.props.length ? inst.props.map(([name, value]) => `<div class="prop-row"><span>${name}</span><em>${value}</em></div>`).join('') : '<div class="ins-empty">该实例以引用关系描述为主</div>'}
    <div class="id-sec" style="margin-top:8px"><span>RDF 三元组</span><b>${triples.length}</b></div>
    ${triples.map(([s, p, o]) => `<div class="trip-row"><span class="tp">${s}</span><span>${p}</span><span class="tv">${o}</span></div>`).join('')}`;
}

/* ---------- 预览视图切换：本体骨架 / 实例图谱 ---------- */
function switchPreviewView(view) {
  previewView = view;
  $$('.pv-opt').forEach((btn) => btn.classList.toggle('active', btn.dataset.pv === view));
  $$('.pv-view').forEach((box) => box.classList.toggle('active', box.dataset.pvView === view));
  if (view === 'tbox') {
    if (previewGraph) previewGraph.pause();
    window.clearTimeout(instTimer);
    runPreviewGrowth();
  } else {
    if (instGraph) instGraph.resume();
    window.clearTimeout(revealTimer);
    if (previewGraph) previewGraph.pause();
    renderInstanceChips();
    runInstanceGrowth();
    renderInstanceDetail(null);
  }
}

$$('.pv-opt').forEach((btn) => btn.addEventListener('click', () => switchPreviewView(btn.dataset.pv)));
$('#replayPreview').addEventListener('click', () => switchPreviewView(previewView));

/* ---------- 建模画布：本体关系图谱 ---------- */
function ensureModelGraph() {
  if (modelGraph) { modelGraph.resume(); return modelGraph; }
  modelGraph = window.OntoGraph.create($('#ogStage'), ONTO, {
    badge: (n) => (INS ? INS.ofConcept(n.id).length : 0),
  });
  modelGraph.resetReveal();
  modelGraph.setBadges(ontoState.instances);
  modelGraph.on('select', renderOntoInspector);
  modelGraph.on('stats', updateModelStats);
  buildLegend();
  renderOntoInspector(null);
  return modelGraph;
}

function startModelGrowth(force) {
  if (!modelGraph) return;
  if (ontoState.growthDone && !force) return;
  window.clearTimeout(modelTimer);
  modelGraph.resetReveal();
  let index = 0;
  const grow = () => {
    if (index >= ONTO.groups.length) {
      ontoState.growthDone = true;
      modelGraph.fit(true);
      updateModelStats();
      // 力仿真收敛后再校正一次视角，避免标签贴边。
      window.setTimeout(() => { if (modelGraph) modelGraph.fit(true); }, 900);
      return;
    }
    modelGraph.revealGroup(ONTO.groups[index].id);
    modelGraph.fit(true);
    index += 1;
    modelTimer = window.setTimeout(grow, 300);
  };
  grow();
}

function buildLegend() {
  const legend = $('#ogLegend');
  if (!legend || !modelGraph) return;
  const counts = modelGraph.countByGroup();
  const instCount = (gid) => (INS ? INS.instances.filter((i) => i.g === gid).length : 0);
  legend.innerHTML = ONTO.groups.map((g) => `<div class="og-lg" data-g="${g.id}"><span class="dot" style="background:${g.color}"></span><span>${g.name}</span><b>${counts[g.id].concepts}</b><i class="og-lg-inst" title="实例数">${instCount(g.id)}</i></div>`).join('');
  legend.querySelectorAll('.og-lg').forEach((item) => {
    item.addEventListener('click', () => {
      const gid = Number(item.dataset.g);
      modelGraph.setGroupVisible(gid, !modelGraph.groupVisible(gid));
      item.classList.toggle('off', !modelGraph.groupVisible(gid));
    });
  });
}

function syncLegend() {
  if (!modelGraph) return;
  $$('#ogLegend .og-lg').forEach((item) => {
    item.classList.toggle('off', !modelGraph.groupVisible(Number(item.dataset.g)));
  });
}

function updateModelStats() {
  if (!modelGraph) return;
  const visibleGroups = ONTO.groups.filter((g) => modelGraph.groupVisible(g.id)).length;
  setText('ogStatO', `${visibleGroups} 本体`);
  setText('ogStatN', `${modelGraph.stats().nodes} 概念`);
  setText('ogStatE', `${modelGraph.stats().edges} 关系`);
  const visibleInst = INS ? INS.instances.filter((i) => modelGraph.groupVisible(i.g)).length : 0;
  setText('ogStatI', `${visibleInst} 实例`);
}

/* ---------- 右侧检视面板 ---------- */
const relRow = (rel) => `<div class="rel-row"><span class="rel-arrow">${rel.dir === 'out' ? '→' : '←'}</span><span><span class="rel-lbl">${rel.label || (rel.cross ? '关联' : '本体内部结构')}</span><a class="rel-peer" data-peer="${rel.peer.id}">${rel.peer.label}<i>${rel.peer.group.name}</i></a></span></div>`;

function renderOntoInspector(node) {
  const box = $('#ogInspector');
  if (!box) return;
  if (!node) {
    const counts = modelGraph ? modelGraph.countByGroup() : {};
    box.innerHTML = `
      <div class="inspector-head"><span>本体概览</span><button data-toast="本体关系图谱已就绪">···</button></div>
      <div class="inspector-icon">⌬</div>
      <h3>投资分析本体</h3>
      <p class="muted">Investment Analysis Ontology</p>
      <p class="ins-desc">由《投资分析方法论与指标体系》自动抽取，贯通组合、持仓、标的、指标、风险与分析的完整语义链路。</p>
      <div class="ins-chips"><span class="ins-chip">${ONTO.stats.ontology} 类本体</span><span class="ins-chip">${ONTO.stats.concepts} 个概念</span><span class="ins-chip">${ONTO.stats.relations} 条关系</span></div>
      <div class="ins-block"><div class="ins-block-title"><span>本体清单</span><b>${ONTO.stats.concepts} 概念</b></div>
        ${ONTO.groups.map((g) => `<div class="prop-row"><span>${g.name}</span><em>${(counts[g.id] && counts[g.id].concepts) || 0} 概念</em></div>`).join('')}
      </div>
      <div class="ins-block"><div class="ins-block-title"><span>如何阅读</span><b>提示</b></div>
        <div class="ins-empty">点击画布中任一概念，查看它的属性字段、出向与入向关系。</div>
      </div>`;
    bindInspectorEvents(null);
    return;
  }
  box.innerHTML = `
    <div class="inspector-head"><span>本体概念详情</span><button data-clear="1">清除</button></div>
    <div class="inspector-icon" style="background:${node.group.color}1f;color:${node.group.color}">⌬</div>
    <h3>${node.label}</h3>
    <p class="ins-group" style="margin:-6px 0 0">${node.group.name}</p>
    <p class="ins-desc">${node.desc}</p>
    <div class="ins-chips"><span class="ins-chip">关联度 ${node.degree}</span><span class="ins-chip">出向 ${node.out.length}</span><span class="ins-chip">入向 ${node.in.length}</span></div>
    <div class="ins-block"><div class="ins-block-title"><span>属性字段</span><b>${node.props.length}</b></div>
      ${node.props.length ? node.props.map(([name, type]) => `<div class="prop-row"><span>${name}</span><em>${type}</em></div>`).join('') : '<div class="ins-empty">该概念以语义关系描述为主</div>'}
    </div>
    <div class="ins-block"><div class="ins-block-title"><span>出向关系</span><b>${node.out.length}</b></div>
      ${node.out.length ? node.out.map(relRow).join('') : '<div class="ins-empty">—</div>'}
    </div>
    <div class="ins-block"><div class="ins-block-title"><span>入向关系</span><b>${node.in.length}</b></div>
      ${node.in.length ? node.in.map(relRow).join('') : '<div class="ins-empty">—</div>'}
    </div>
    ${instBlock(node)}
    <button class="full-button" data-focus-selected="1">在画布中聚焦</button>`;
  bindInspectorEvents(node);
}

/* 概念下的实例样本：展示随文档导入的 ABox 实例 */
function instBlock(node) {
  if (!INS) return '';
  const list = INS.ofConcept(node.id);
  if (!list.length) return '<div class="ins-block"><div class="ins-block-title"><span>实例样本</span><b>0 个</b></div><div class="ins-empty">该概念暂无导入实例</div></div>';
  return `<div class="ins-block"><div class="ins-block-title"><span>实例样本</span><b>${list.length} 个</b></div>
    ${list.slice(0, 8).map((i) => `<div class="ins-inst-row"><span>${i.label}</span><em>${i.props.length ? i.props[0][1] : i.cls}</em><a data-inst="${i.id}">${i.uri}</a></div>`).join('')}
    ${list.length > 8 ? `<div class="ins-empty">另有 ${list.length - 8} 个实例，可在导入预览中查看</div>` : ''}
  </div>`;
}

/* 实例详情：从概念检视面板点实例 URI 进入 */
function renderInstanceInspector(instId) {
  const box = $('#ogInspector');
  const inst = INS && INS.get(instId);
  if (!box || !inst) return;
  const group = INS.groups.find((g) => g.id === inst.g);
  const triples = INS.triplesOf(inst.id);
  box.innerHTML = `
    <div class="inspector-head"><span>本体实例详情</span><button data-back-concept="${inst.concept}">返回概念</button></div>
    <div class="inspector-icon" style="background:${group.color}1f;color:${group.color}">◉</div>
    <h3>${inst.label}</h3>
    <p class="ins-group" style="margin:-6px 0 0">${group.name}</p>
    <p class="ins-desc">${inst.desc}</p>
    <div class="ins-chips"><span class="ins-chip">inv:${inst.id}</span><span class="ins-chip">${inst.cls}</span></div>
    <div class="ins-block"><div class="ins-block-title"><span>实例属性</span><b>${inst.props.length}</b></div>
      ${inst.props.length ? inst.props.map(([name, value]) => `<div class="prop-row"><span>${name}</span><em>${value}</em></div>`).join('') : '<div class="ins-empty">该实例以引用关系描述为主</div>'}
    </div>
    <div class="ins-block"><div class="ins-block-title"><span>RDF 三元组</span><b>${triples.length}</b></div>
      <div class="ins-triples">${triples.map(([s, p, o]) => `<div class="trip-row"><span class="tp">${s}</span><span>${p}</span><span class="tv">${o}</span></div>`).join('')}</div>
    </div>
    <button class="full-button" data-toast="该实例已随文档写入本体库">同步实例到知识库</button>`;
  box.querySelectorAll('[data-back-concept]').forEach((btn) => {
    btn.addEventListener('click', () => { if (modelGraph) modelGraph.select(btn.dataset.backConcept); });
  });
  box.querySelectorAll('[data-toast]').forEach((btn) => btn.addEventListener('click', () => toast(btn.dataset.toast)));
}

/* 概念 → 实例的挂载说明：点击概念上的实例角标或样本行 */
function bindInstanceLinks() {
  const box = $('#ogInspector');
  box.querySelectorAll('[data-inst]').forEach((item) => {
    item.addEventListener('click', () => renderInstanceInspector(item.dataset.inst));
  });
}

function bindInspectorEvents(node) {
  const box = $('#ogInspector');
  bindInstanceLinks();
  box.querySelectorAll('[data-peer]').forEach((item) => {
    item.addEventListener('click', () => {
      if (modelGraph) modelGraph.select(item.dataset.peer);
    });
  });
  box.querySelectorAll('[data-clear]').forEach((item) => item.addEventListener('click', () => {
    if (modelGraph) modelGraph.clearSelection();
  }));
  box.querySelectorAll('[data-focus-selected]').forEach((item) => item.addEventListener('click', () => {
    if (modelGraph && node) modelGraph.focusNode(node.id);
  }));
  box.querySelectorAll('[data-toast]').forEach((item) => item.addEventListener('click', () => toast(item.dataset.toast)));
}

/* ---------- 本体签页切换 ---------- */
function switchOntologyTab(tab) {
  ontoState.tab = tab;
  $$('.cg-tab').forEach((btn) => btn.classList.toggle('active', btn.dataset.ontology === tab));
  const investOn = tab === 'invest';
  const salesGraph = $('[data-graph="sales"].interactive-graph');
  const workspace = $('.og-workspace[data-graph="invest"]');
  if (salesGraph) salesGraph.style.display = investOn ? 'none' : '';
  if (workspace) workspace.classList.toggle('active', investOn);
  $('#ogInspector').hidden = !investOn;
  $('#salesInspector').hidden = investOn;
  if (!investOn) return;
  if (!ontoState.created) {
    $('#ogEmpty').style.display = '';
    $('#ogInspector').innerHTML = `
      <div class="inspector-head"><span>本体详情</span></div>
      <div class="inspector-icon">⌬</div>
      <h3>本体尚未创建</h3>
      <p class="muted">No Ontology Yet</p>
      <p class="ins-desc">从「企业知识」导入领域文档后，语义引擎会在这里展示概念属性、出向与入向关系。</p>
      <div class="ins-block"><div class="ins-block-title"><span>链路</span><b>4 步</b></div>
        <div class="prop-row"><span>① 导入知识文档</span><em>PDF/DOCX</em></div>
        <div class="prop-row"><span>② 语义解析抽取</span><em>概念 · 属性</em></div>
        <div class="prop-row"><span>③ 确认并创建本体</span><em>写回平台</em></div>
        <div class="prop-row"><span>④ 查看关系图谱</span><em>可追溯</em></div>
      </div>`;
    bindInspectorEvents(null);
    return;
  }
  $('#ogEmpty').style.display = 'none';
  const graph = ensureModelGraph();
  graph.resize();
  if (!ontoState.growthDone) startModelGrowth(false);
  else updateModelStats();
}

$$('.cg-tab').forEach((btn) => btn.addEventListener('click', () => switchOntologyTab(btn.dataset.ontology)));

/* ---------- 画布工具栏 ---------- */
$('#ogLayout').addEventListener('click', (event) => {
  if (!modelGraph) { toast('请先从知识文档创建本体'); return; }
  const clustered = !modelGraph.isClustered();
  modelGraph.setLayout(clustered);
  event.currentTarget.classList.toggle('active', clustered);
  event.currentTarget.textContent = clustered ? '本体聚类' : '自由布局';
});
$('#ogLabels').addEventListener('click', (event) => {
  if (!modelGraph) { toast('请先从知识文档创建本体'); return; }
  const on = !modelGraph.labelsVisible();
  modelGraph.setLabels(on);
  event.currentTarget.classList.toggle('active', on);
  event.currentTarget.textContent = on ? '关系标签' : '隐藏标签';
});
$('#ogFit').addEventListener('click', () => { if (modelGraph) modelGraph.fit(true); });
$('#ogInstances').addEventListener('click', (event) => {
  if (!modelGraph) { toast('请先从知识文档创建本体'); return; }
  const on = !modelGraph.badgesVisible();
  ontoState.instances = on;
  modelGraph.setBadges(on);
  event.currentTarget.classList.toggle('active', on);
  toast(on ? '已显示概念上的实例数量角标' : '已隐藏实例角标');
});
$('#ogAll').addEventListener('click', () => {
  if (!modelGraph) return;
  modelGraph.showAll();
  syncLegend();
  modelGraph.fit(true);
  toast('已显示全部本体与关系');
});
$('#ogFitSmall').addEventListener('click', () => {
  if (ontoState.tab === 'invest' && modelGraph) modelGraph.fit(true);
  else toast('画布已适配窗口');
});
$('#ogSearch').addEventListener('input', (event) => {
  if (!modelGraph) return;
  const hits = modelGraph.setSearch(event.target.value);
  if (!event.target.value.trim()) modelGraph.clearSelection();
  else if (hits.length) toast(`命中 ${hits.length} 个概念`);
});
$$('.nav-item').forEach((btn) => btn.addEventListener('click', () => {
  if (btn.dataset.panel !== 'model' && modelGraph) modelGraph.pause();
}));
window.addEventListener('resize', () => {
  if (!modelGraph) return;
  modelGraph.resize();
  window.clearTimeout(window.__ontoResizeTimer);
  window.__ontoResizeTimer = window.setTimeout(() => {
    if (modelGraph && ontoState.tab === 'invest' && ontoState.created) modelGraph.fit(true);
  }, 260);
});

/* ---------- 写入工作空间：知识、指标、智能体联动 ---------- */
function bumpOverviewCounters() {
  const cards = $$('.stat-grid .stat-card strong');
  const bump = (el, delta) => {
    if (!el) return;
    const value = Number(String(el.textContent).replace(/[^\d.]/g, ''));
    if (!Number.isNaN(value)) el.textContent = fmtNum(Math.round(value + delta));
  };
  bump(cards[0], ONTO.stats.concepts);
  bump(cards[1], ONTO.stats.relations);
}

function pushOntologyActivity() {
  const list = $('.activity-list');
  if (!list || $('#ontologyActivity')) return;
  const item = document.createElement('div');
  item.id = 'ontologyActivity';
  item.className = 'activity-item';
  item.innerHTML = `<span class="activity-avatar blue-bg">本</span><div><strong>本体建模</strong><p>从《投资分析方法论与指标体系》创建投资分析本体 · ${ONTO.stats.ontology} 类本体 / ${ONTO.stats.concepts} 个概念 / ${INS ? INS.stats.instances : 0} 个实例</p><small>刚刚</small></div>`;
  list.prepend(item);
}

function markOntologyCreated(silent) {
  if (!ONTO) return;
  const first = !ontoState.created;
  ontoState.created = true;
  setText('investVersion', ONTO.version);
  const empty = $('#ogEmpty');
  if (empty) empty.style.display = 'none';

  const list = $('#knowledgeItems');
  if (list && first && !$('#importedKnowledge')) {
    const item = document.createElement('div');
    item.id = 'importedKnowledge';
    item.className = 'knowledge-item imported-knowledge';
    item.dataset.search = '投资分析方法论 本体索引 投资管理';
    item.innerHTML = `<span class="file-icon purple">DOC</span><div><strong>投资分析方法论与指标体系 · 本体索引</strong><p>投资管理 · 已关联 ${ONTO.stats.concepts} 个概念、${ONTO.stats.relations} 条关系与 ${INS ? INS.stats.instances : 0} 个实例</p></div><span>刚刚</span><span>•••</span>`;
    list.prepend(item);
  }

  if (first) {
    bumpOverviewCounters();
    pushOntologyActivity();
  }

  agentData.insight.context = '投资分析本体 · 企业知识';
  agentData.insight.suggestions = ['组合久期是否超出限额', '哪些持仓集中度偏高', '本期超额收益来自哪里'];
  agentData.insight.response = '基于投资分析本体的语义关系：组合当前久期 3.8 年，低于限额 0.7 年；前三大持仓权重合计 41%，其中两只债券同属同一发行人，存在集中度风险；本期超额收益 1.6% 主要来自久期敞口的贡献。';
  agentData.insight.result = [['3.8年', '组合久期'], ['41%', '前三大持仓'], ['1.6%', '超额收益']];
  if (agentModal.classList.contains('open') && selectedAgent === 'insight') updateAgentWorkspace('insight');
  else if (selectedAgent === 'insight') setText('agentContext', agentData.insight.context);

  if (!silent) toast('本体已写入建模画布');
}

fillExtractionStats();
switchOntologyTab('sales');
