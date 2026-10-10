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
};
$('#openImport').addEventListener('click', openImport);
$('#closeImport').addEventListener('click', closeImport);
importModal.addEventListener('click', (event) => {
  if (event.target === importModal) closeImport();
});

let analysisTimer;
const startDemoImport = () => {
  setImportStage('analyzing');
  const progressBar = $('#analysisProgress');
  const percent = $('#analysisPercent');
  const message = $('#analysisMessage');
  const messages = ['读取文档结构与语义上下文…', '识别项目、客户与交付物实体…', '推理业务关系与属性字段…', '生成可视化本体结构…'];
  let value = 0;
  window.clearInterval(analysisTimer);
  analysisTimer = window.setInterval(() => {
    value += 8;
    progressBar.style.width = `${Math.min(value, 100)}%`;
    percent.textContent = `${Math.min(value, 100)}%`;
    message.textContent = messages[Math.min(Math.floor(value / 27), messages.length - 1)];
    if (value >= 100) {
      window.clearInterval(analysisTimer);
      window.setTimeout(() => setImportStage('preview'), 300);
    }
  }, 95);
};
$('#demoFilePick').addEventListener('click', startDemoImport);
$('#useDemoFile').addEventListener('click', startDemoImport);

$('#confirmOntology').addEventListener('click', () => {
  setImportStage('success');
  toast('本体已创建，正在同步到工作空间');
  const autoAssociate = $('#autoAssociate').checked;
  if (autoAssociate) {
    const knowledgeItems = $('#knowledgeItems');
    if (!$('#importedKnowledge')) {
      const item = document.createElement('div');
      item.id = 'importedKnowledge';
      item.className = 'knowledge-item imported-knowledge';
      item.dataset.search = '2026交付项目手册 自动创建本体 项目文档';
      item.innerHTML = '<span class="file-icon purple">DOC</span><div><strong>2026 交付项目手册 · 本体索引</strong><p>项目文档 · 已关联 8 个实体与 16 条关系</p></div><span>刚刚</span><span>•••</span>';
      knowledgeItems.prepend(item);
    }
  }
});

$('#viewImportedModel').addEventListener('click', () => {
  closeImport();
  $('.nav-item[data-panel="model"]').click();
  const graph = $('.interactive-graph');
  if (!graph.querySelector('.entity-imported')) {
    const imported = document.createElement('button');
    imported.className = 'entity-card entity-imported';
    imported.dataset.entity = '交付物';
    imported.innerHTML = '<span class="entity-type">IMPORTED ENTITY</span><strong>交付物</strong><small>Deliverable · 8 个属性</small>';
    graph.appendChild(imported);
  }
  toast('已打开更新后的本体建模画布');
});

$('.interactive-graph').addEventListener('click', (event) => {
  const card = event.target.closest('.entity-card.entity-imported');
  if (!card) return;
  $$('.entity-card').forEach((item) => item.classList.remove('selected'));
  card.classList.add('selected');
  $('#entityName').textContent = card.dataset.entity;
  toast(`已选中导入实体：${card.dataset.entity}`);
});

// 智能体演示工作区：展示选择智能体、快速提问与示例洞察结果。
const agentModal = $('#agentModal');
const agentInput = $('#agentInput');
const agentData = {
  insight: { name: '洞察引擎', icon: '✦', subline: '发现趋势、异常与潜在机会，生成可追溯的业务洞察。', context: '销售业务本体 · 企业知识', calls: '238', response: '基于客户、项目和交付物之间的语义关系，我发现华东区域有 3 个高风险客户。主要信号集中在续约周期 30 天内，建议优先查看「星河科技」与「远航制造」。', result: [['3', '高风险客户'], ['12.4%', '流失率环比'], ['2', '挽回路径']] },
  customer: { name: '客户雷达', icon: '⌁', subline: '关联客户、项目与服务记录，识别客户健康度与流失风险。', context: '客户本体 · 服务知识', calls: '186', response: '客户雷达已完成健康度扫描：星河科技当前评分 62，近 30 天交付响应下降 18%；远航制造评分 68，存在 2 个未闭环服务问题。', result: [['62', '星河科技健康度'], ['18%', '响应下降'], ['2', '未闭环问题']] },
  project: { name: '项目管家', icon: '◈', subline: '结合项目本体和知识库，汇总进度、资源与交付风险。', context: '项目本体 · 交付文档', calls: '待发布', response: '这是一个草稿智能体演示：已读取 8 个项目实体，发现「华东交付项目」延期风险较高，主要受供应商交付节点影响。', result: [['8', '项目实体'], ['1', '高风险项目'], ['4', '关联供应商']] }
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
  $('#agentChat').innerHTML = `<div class="agent-message agent-message-ai"><span class="chat-avatar">${data.icon}</span><div><small>${data.name} · 刚刚</small><p>你好，我已经连接到你的企业本体空间。你可以让我分析客户、项目、产品之间的语义关系。</p><div class="suggestion-row"><button class="suggestion" data-prompt="分析本季度客户流失风险">分析本季度客户流失风险</button><button class="suggestion" data-prompt="找出交付响应最慢的项目">找出交付响应最慢的项目</button></div></div></div>`;
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
