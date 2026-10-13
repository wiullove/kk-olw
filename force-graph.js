/* 本体关系力导向图引擎
 * 独立于业务的渲染与交互模块，可同时挂接多个实例（建模画布 / 导入预览）。
 * create(container, data, options) -> api
 *   data: { groups:[{id,name,color}], nodes:[{id,label,g,props,desc}], links:[[src,target,label]] }
 *   api: onSelect/onHover/onStats/setLayout/setLabels/setSearch/fit/resize/
 *        setGroupVisible/revealGroup/revealAll/resetReveal/select/clearSelection/focus/
 *        setAnimated/pause/resume/stats/destroy
 */
window.OntoGraph = (function () {
  const NS = 'http://www.w3.org/2000/svg';

  const svgEl = (name, attrs) => {
    const node = document.createElementNS(NS, name);
    if (attrs) Object.keys(attrs).forEach((key) => node.setAttribute(key, attrs[key]));
    return node;
  };

  function create(container, data, options) {
    const opts = Object.assign({ compact: false, showLabels: true, rScale: 1, linkScale: 1, hud: true, tip: true, badge: null }, options || {});
    let badgesOn = true;
    if (opts.compact) {
      opts.showLabels = false;
      opts.hud = false;
      if (opts.rScale === 1) opts.rScale = 0.58;
      if (opts.linkScale === 1) opts.linkScale = 0.62;
    }

    /* ---------- 数据准备 ---------- */
    const groups = data.groups.map((g) => Object.assign({ off: false }, g));
    const groupById = new Map(groups.map((g) => [g.id, g]));
    const nodes = data.nodes.map((n) => Object.assign({}, n));
    const byId = new Map();
    nodes.forEach((n) => {
      n.out = []; n.in = []; n.deg = 0;
      n.group = groupById.get(n.g);
      byId.set(n.id, n);
    });

    const edges = [];
    (data.links || []).forEach(([s, t, label]) => {
      const a = byId.get(s); const b = byId.get(t);
      if (!a || !b) return;
      const e = { s: a, t: b, label: label || '', cross: a.g !== b.g };
      edges.push(e);
      a.out.push(e); b.in.push(e);
      a.deg += 1; b.deg += 1;
    });
    nodes.forEach((n) => { n.r = (7 + Math.min(13.5, Math.sqrt(n.deg) * 3.1)) * opts.rScale; });

    groups.forEach((g, i) => {
      const ang = -Math.PI / 2 + (i * 2 * Math.PI) / groups.length;
      g.ux = Math.cos(ang); g.uy = Math.sin(ang);
    });

    /* ---------- DOM 骨架 ---------- */
    container.classList.add('og-root');
    container.innerHTML = '';

    const svg = svgEl('svg', { class: 'og-svg' });
    const defs = svgEl('defs');
    [['og-ar', '#a8b0c2'], ['og-arh', '#5b57c9'], ['og-arw', '#cdd3e0']].forEach(([id, color]) => {
      const marker = svgEl('marker', {
        id, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse',
      });
      marker.appendChild(svgEl('path', { d: 'M0,0 L10,5 L0,10 z', fill: color }));
      defs.appendChild(marker);
    });
    svg.appendChild(defs);

    const root = svgEl('g', { class: 'og-viewport' });
    const gLink = svgEl('g'); const gLabel = svgEl('g', { class: 'og-labels' }); const gNode = svgEl('g');
    root.appendChild(gLink); root.appendChild(gLabel); root.appendChild(gNode);
    svg.appendChild(root);
    container.appendChild(svg);

    const tip = opts.tip ? document.createElement('div') : null;
    if (tip) { tip.className = 'og-tip'; container.appendChild(tip); }
    const hud = opts.hud ? document.createElement('div') : null;
    if (hud) { hud.className = 'og-hud'; container.appendChild(hud); }

    /* ---------- 状态 ---------- */
    let W = 800; let H = 600;
    let alpha = 1;
    let clustered = true;
    let showLabels = opts.showLabels;
    let dragging = null;
    let panning = null; let justPanned = false;
    let selected = null; let hovered = null;
    let revealed = new Set(groups.map((g) => g.id));
    const listeners = { select: [], hover: [], stats: [] };

    const emit = (name, payload) => listeners[name].forEach((fn) => fn(payload));
    const measure = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width > 40 && rect.height > 40) { W = rect.width; H = rect.height; }
    };
    measure();

    const anchor = (g) => ({
      x: W / 2 + g.ux * Math.max(90, W * 0.33),
      y: H / 2 + g.uy * Math.max(70, H * 0.31),
    });

    nodes.forEach((n) => {
      const a = anchor(n.group);
      const ang = Math.random() * Math.PI * 2;
      const rr = (30 + Math.random() * 70) * opts.linkScale;
      n.x = a.x + Math.cos(ang) * rr;
      n.y = a.y + Math.sin(ang) * rr;
      n.vx = 0; n.vy = 0;
    });

    const visibleNode = (n) => revealed.has(n.g) && !n.group.off;

    /* ---------- 元素创建 ---------- */
    edges.forEach((e) => {
      e.el = svgEl('line', { class: 'og-link' + (e.cross ? ' cross' : '') });
      e.el.setAttribute('marker-end', 'url(#og-arw)');
      gLink.appendChild(e.el);
      if (e.label) {
        e.tx = svgEl('text', { class: 'og-elabel' });
        e.tx.textContent = e.label;
        gLabel.appendChild(e.tx);
      }
    });

    nodes.forEach((n) => {
      const g = svgEl('g', { class: 'og-node' });
      const c = svgEl('circle', { r: n.r, fill: n.group.color });
      const t = svgEl('text', { dy: n.r + (opts.compact ? 10 : 13) });
      t.textContent = n.label;
      t.setAttribute('font-size', opts.compact ? 8.5 : 11);
      // 紧凑模式（导入预览）只为关联度较高的概念显示标签，避免小画布上文字拥挤。
      if (opts.compact && n.deg < 4) t.style.display = 'none';
      g.appendChild(c); g.appendChild(t);
      // 实例角标：由宿主通过 opts.badge(n) 返回数量，>0 时在节点右上角绘制计数徽标。
      if (typeof opts.badge === 'function') {
        const count = Number(opts.badge(n)) || 0;
        if (count > 0) {
          const bg = svgEl('g', { class: 'og-badge' });
          const bx = n.r * 0.72; const by = -n.r * 0.72;
          const dot = svgEl('circle', { cx: bx, cy: by, r: opts.compact ? 4.6 : 6 });
          const bt = svgEl('text', { x: bx, y: by + 2.6 });
          bt.textContent = count > 99 ? '99+' : String(count);
          bg.appendChild(dot); bg.appendChild(bt);
          g.appendChild(bg);
          n.badgeEl = bg;
        }
      }
      gNode.appendChild(g);
      n.el = g; n.circle = c; n.labelEl = t;

      g.addEventListener('pointerdown', (ev) => {
        ev.stopPropagation();
        dragging = n;
        alpha = Math.max(alpha, 0.4);
        try { g.setPointerCapture(ev.pointerId); } catch (err) { /* noop */ }
      });
      g.addEventListener('click', (ev) => { ev.stopPropagation(); internalSelect(n === selected ? null : n); });
      g.addEventListener('pointerenter', () => { hovered = n; applyHighlight(); showTip(n); emit('hover', nodeView(n)); });
      g.addEventListener('pointerleave', () => { hovered = null; applyHighlight(); hideTip(); emit('hover', null); });
    });
    gLabel.style.display = showLabels ? '' : 'none';

    /* ---------- 视图变换 ---------- */
    let animTimer = null;
    const view = { k: 1, x: 0, y: 0 };
    const applyView = () => { root.setAttribute('transform', `translate(${view.x},${view.y}) scale(${view.k})`); };
    const toGraph = (mx, my) => ({ x: (mx - view.x) / view.k, y: (my - view.y) / view.k });

    function fit(animated) {
      measure();
      let minX = 1e9; let minY = 1e9; let maxX = -1e9; let maxY = -1e9;
      nodes.forEach((n) => {
        if (!visibleNode(n)) return;
        minX = Math.min(minX, n.x - n.r - 46); maxX = Math.max(maxX, n.x + n.r + 46);
        minY = Math.min(minY, n.y - n.r - 34); maxY = Math.max(maxY, n.y + n.r + (opts.compact ? 24 : 42));
      });
      if (minX > maxX) { minX = 0; maxX = W; minY = 0; maxY = H; }
      const pad = 0.9;
      const k = Math.min(W / (maxX - minX), H / (maxY - minY), 1.7) * pad;
      if (animated) {
        root.classList.add('og-anim');
        window.clearTimeout(animTimer);
        animTimer = window.setTimeout(() => root.classList.remove('og-anim'), 640);
      }
      view.k = Math.max(opts.minZoom || 0.22, Math.min(1.7, k));
      view.x = W / 2 - ((minX + maxX) / 2) * view.k;
      view.y = H / 2 - ((minY + maxY) / 2) * view.k;
      applyView();
    }

    svg.addEventListener('wheel', (ev) => {
      ev.preventDefault();
      const rect = svg.getBoundingClientRect();
      const mx = ev.clientX - rect.left; const my = ev.clientY - rect.top;
      const factor = ev.deltaY < 0 ? 1.12 : 1 / 1.12;
      const next = Math.max(0.2, Math.min(3.2, view.k * factor));
      view.x = mx - (mx - view.x) * (next / view.k);
      view.y = my - (my - view.y) * (next / view.k);
      view.k = next;
      applyView();
    }, { passive: false });

    svg.addEventListener('pointerdown', (ev) => {
      if (ev.target.closest('.og-node')) return;
      panning = { x: ev.clientX, y: ev.clientY, vx: view.x, vy: view.y, moved: false };
      svg.classList.add('panning');
      try { svg.setPointerCapture(ev.pointerId); } catch (err) { /* noop */ }
    });
    svg.addEventListener('click', () => {
      if (justPanned) { justPanned = false; return; }
      internalSelect(null);
    });

    const onMove = (ev) => {
      if (panning) {
        const dx = ev.clientX - panning.x; const dy = ev.clientY - panning.y;
        if (Math.abs(dx) + Math.abs(dy) > 3) panning.moved = true;
        view.x = panning.vx + dx; view.y = panning.vy + dy;
        applyView();
      } else if (dragging) {
        const rect = svg.getBoundingClientRect();
        const p = toGraph(ev.clientX - rect.left, ev.clientY - rect.top);
        dragging.x = p.x; dragging.y = p.y; dragging.vx = 0; dragging.vy = 0;
        alpha = Math.max(alpha, 0.35);
        render();
      }
    };
    const onUp = () => {
      if (panning) { justPanned = panning.moved; panning = null; svg.classList.remove('panning'); }
      dragging = null;
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);

    function showTip(n) {
      if (!tip) return;
      tip.textContent = `${n.label} · ${n.group.name} · ${n.deg} 条关系`;
      tip.style.left = `${n.x * view.k + view.x}px`;
      tip.style.top = `${n.y * view.k + view.y - n.r * view.k - 6}px`;
      tip.classList.add('show');
    }
    const hideTip = () => tip && tip.classList.remove('show');

    function focus(n) {
      measure();
      view.k = Math.max(view.k, 1.05);
      view.x = W / 2 - n.x * view.k;
      view.y = H / 2 - n.y * view.k;
      applyView();
    }

    /* ---------- 力仿真 ---------- */
    function step() {
      const cx = W / 2; const cy = H / 2;
      nodes.forEach((n) => { n.fx = 0; n.fy = 0; });

      const gx = {}; const gy = {}; const gc = {};
      groups.forEach((g) => { gx[g.id] = 0; gy[g.id] = 0; gc[g.id] = 0; });
      nodes.forEach((n) => { if (!visibleNode(n)) return; gx[n.g] += n.x; gy[n.g] += n.y; gc[n.g] += 1; });
      groups.forEach((g) => {
        if (gc[g.id]) { gx[g.id] /= gc[g.id]; gy[g.id] /= gc[g.id]; } else { gx[g.id] = cx; gy[g.id] = cy; }
      });

      for (let i = 0; i < nodes.length; i += 1) {
        const a = nodes[i]; if (!visibleNode(a)) continue;
        for (let j = i + 1; j < nodes.length; j += 1) {
          const b = nodes[j]; if (!visibleNode(b)) continue;
          let dx = b.x - a.x; let dy = b.y - a.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 0.01) { dx = Math.random() - 0.5; dy = Math.random() - 0.5; d2 = 0.01; }
          const d = Math.sqrt(d2);
          let f = (4900 * opts.linkScale) / d2;
          const minD = a.r + b.r + (clustered ? 30 : 34);
          if (d < minD) f += (minD - d) * 0.9;
          if (f > 90) f = 90;
          const fx = (dx / d) * f; const fy = (dy / d) * f;
          a.fx -= fx; a.fy -= fy; b.fx += fx; b.fy += fy;
        }
      }

      edges.forEach((e) => {
        const a = e.s; const b = e.t;
        if (!visibleNode(a) || !visibleNode(b)) return;
        const dx = b.x - a.x; const dy = b.y - a.y;
        const d = Math.max(0.001, Math.hypot(dx, dy));
        const L = (e.cross ? 178 : 108) * opts.linkScale;
        const f = (d - L) * (e.cross ? 0.03 : 0.055);
        const fx = (dx / d) * f; const fy = (dy / d) * f;
        a.fx += fx; a.fy += fy; b.fx -= fx; b.fy -= fy;
      });

      nodes.forEach((n) => {
        if (!visibleNode(n)) return;
        let tx; let ty; let k;
        if (clustered) {
          const a = anchor(n.group);
          tx = a.x; ty = a.y; k = 0.013;
        } else {
          tx = cx; ty = cy; k = 0.0045;
          n.fx += (gx[n.g] - n.x) * 0.012;
          n.fy += (gy[n.g] - n.y) * 0.012;
        }
        n.fx += (tx - n.x) * k;
        n.fy += (ty - n.y) * k;
      });

      nodes.forEach((n) => {
        if (!visibleNode(n)) return;
        if (n === dragging) { n.vx = 0; n.vy = 0; return; }
        n.vx = (n.vx + n.fx * alpha) * 0.6;
        n.vy = (n.vy + n.fy * alpha) * 0.6;
        n.vx = Math.max(-26, Math.min(26, n.vx));
        n.vy = Math.max(-26, Math.min(26, n.vy));
        n.x += n.vx; n.y += n.vy;
      });

      alpha *= 0.986;
      if (alpha < 0.02) alpha = 0.02;
    }

    function render() {
      edges.forEach((e) => {
        const visible = visibleNode(e.s) && visibleNode(e.t);
        const display = visible ? '' : 'none';
        if (e.el.style.display !== display) e.el.style.display = display;
        if (!visible) { if (e.tx) e.tx.style.display = 'none'; return; }
        const dx = e.t.x - e.s.x; const dy = e.t.y - e.s.y;
        const d = Math.max(0.001, Math.hypot(dx, dy));
        const ux = dx / d; const uy = dy / d;
        const x1 = e.s.x + ux * (e.s.r + 1); const y1 = e.s.y + uy * (e.s.r + 1);
        const x2 = e.t.x - ux * (e.t.r + 7); const y2 = e.t.y - uy * (e.t.r + 7);
        e.el.setAttribute('x1', x1); e.el.setAttribute('y1', y1);
        e.el.setAttribute('x2', x2); e.el.setAttribute('y2', y2);
        if (e.tx) {
          e.tx.style.display = '';
          e.tx.setAttribute('x', (x1 + x2) / 2);
          e.tx.setAttribute('y', (y1 + y2) / 2 - 3);
        }
      });
      nodes.forEach((n) => {
        const display = visibleNode(n) ? '' : 'none';
        if (n.el.style.display !== display) n.el.style.display = display;
        if (!visibleNode(n)) return;
        n.el.setAttribute('transform', `translate(${n.x},${n.y})`);
      });
      if (tip && tip.classList.contains('show') && hovered) showTip(hovered);
    }

    let rafId = null;
    let running = true;
    const loop = () => {
      if (running) { step(); render(); }
      rafId = window.requestAnimationFrame(loop);
    };

    /* ---------- 高亮与选中 ---------- */
    function applyHighlight() {
      const active = hovered || selected;
      if (!active) {
        svg.classList.remove('dimmed');
        nodes.forEach((n) => {
          n.el.classList.remove('hl');
          n.el.classList.toggle('sel', n === selected);
        });
        edges.forEach((e) => {
          e.el.classList.remove('hl');
          e.el.setAttribute('marker-end', 'url(#og-arw)');
          if (e.tx) e.tx.classList.remove('hl');
        });
        return;
      }
      const set = new Set([active.id]);
      active.out.forEach((e) => set.add(e.t.id));
      active.in.forEach((e) => set.add(e.s.id));
      svg.classList.add('dimmed');
      nodes.forEach((n) => {
        n.el.classList.toggle('hl', set.has(n.id));
        n.el.classList.toggle('sel', n === selected);
      });
      edges.forEach((e) => {
        const on = e.s === active || e.t === active;
        e.el.classList.toggle('hl', on);
        e.el.setAttribute('marker-end', on ? 'url(#og-arh)' : 'url(#og-arw)');
        if (e.tx) e.tx.classList.toggle('hl', on);
      });
    }

    function nodeView(n) {
      return {
        id: n.id,
        label: n.label,
        desc: n.desc || '',
        props: n.props || [],
        degree: n.deg,
        group: { id: n.group.id, name: n.group.name, color: n.group.color },
        out: n.out.map((e) => ({ dir: 'out', label: e.label, cross: e.cross, peer: { id: e.t.id, label: e.t.label, group: e.t.group } })),
        in: n.in.map((e) => ({ dir: 'in', label: e.label, cross: e.cross, peer: { id: e.s.id, label: e.s.label, group: e.s.group } })),
      };
    }

    function internalSelect(n) {
      selected = n;
      applyHighlight();
      emit('select', selected ? nodeView(selected) : null);
      updateHud();
    }

    function updateHud() {
      const visNodes = nodes.filter(visibleNode).length;
      const visEdges = edges.filter((e) => visibleNode(e.s) && visibleNode(e.t)).length;
      if (hud) {
        hud.innerHTML = `可见概念 ${visNodes} / ${nodes.length} ｜ 可见关系 ${visEdges} / ${edges.length}`
          + (selected ? ` ｜ 已选中 <b>${selected.label}</b>` : '');
      }
      emit('stats', { nodes: visNodes, total: nodes.length, edges: visEdges, totalEdges: edges.length, selected: selected ? selected.id : null });
    }

    /* ---------- 对外接口 ---------- */
    const api = {
      groups,
      nodes,
      edges,
      raw: () => ({ groups, nodes, edges }),
      on(event, fn) { if (listeners[event]) listeners[event].push(fn); return api; },
      start() { if (!rafId) rafId = window.requestAnimationFrame(loop); running = true; return api; },
      pause() { running = false; return api; },
      resume() { running = true; alpha = Math.max(alpha, 0.35); return api; },
      isRunning: () => running,
      setLayout(clusteredNext) {
        clustered = !!clusteredNext;
        alpha = 1;
        return api;
      },
      toggleLayout() { return api.setLayout(!clustered); },
      isClustered: () => clustered,
      setLabels(on) {
        showLabels = !!on;
        gLabel.style.display = showLabels ? '' : 'none';
        return api;
      },
      labelsVisible: () => showLabels,
      setBadges(on) {
        badgesOn = !!on;
        nodes.forEach((n) => { if (n.badgeEl) n.badgeEl.style.display = badgesOn ? '' : 'none'; });
        return api;
      },
      badgesVisible: () => badgesOn,
      setGroupVisible(groupId, visible) {
        const g = groupById.get(groupId);
        if (!g) return api;
        g.off = !visible;
        alpha = Math.max(alpha, 0.5);
        if (selected && selected.group.off) internalSelect(null, true);
        applyHighlight(); updateHud();
        return api;
      },
      groupVisible: (groupId) => {
        const g = groupById.get(groupId);
        return !!g && !g.off;
      },
      revealGroup(groupId) {
        if (!groupById.has(groupId)) return api;
        revealed.add(groupId);
        groupById.get(groupId).off = false;
        alpha = Math.max(alpha, 0.85);
        updateHud();
        return api;
      },
      revealAll() {
        revealed = new Set(groups.map((g) => g.id));
        groups.forEach((g) => { g.off = false; });
        alpha = Math.max(alpha, 0.85);
        updateHud();
        return api;
      },
      resetReveal() {
        revealed = new Set();
        groups.forEach((g) => { g.off = false; });
        internalSelect(null, true);
        updateHud();
        return api;
      },
      revealedCount: () => revealed.size,
      showAll() {
        groups.forEach((g) => { g.off = false; });
        revealed = new Set(groups.map((g) => g.id));
        alpha = Math.max(alpha, 0.5);
        updateHud();
        return api;
      },
      select(id, options2) {
        const n = typeof id === 'string' ? byId.get(id) : id;
        if (!n) return api;
        if (!visibleNode(n)) api.revealGroup(n.g);
        internalSelect(n, true);
        if (!(options2 && options2.noFocus)) focus(n);
        return api;
      },
      clearSelection() { internalSelect(null, true); return api; },
      selectedNode: () => (selected ? nodeView(selected) : null),
      focusNode(id) { const n = typeof id === 'string' ? byId.get(id) : id; if (n) focus(n); return api; },
      setSearch(query) {
        const q = String(query || '').trim().toLowerCase();
        nodes.forEach((n) => n.el.classList.remove('hit'));
        if (!q) return [];
        const hits = nodes.filter((n) => n.label.toLowerCase().includes(q) || String(n.id).toLowerCase().includes(q));
        hits.forEach((n) => n.el.classList.add('hit'));
        if (hits.length) {
          if (!visibleNode(hits[0])) api.revealGroup(hits[0].g);
          internalSelect(hits[0], true);
          focus(hits[0]);
        }
        return hits.map((n) => n.id);
      },
      fit(animated) { fit(!!animated); return api; },
      setAnimated(on) { root.classList.toggle('og-anim', !!on); return api; },
      resize() { measure(); return api; },
      stats() {
        return {
          nodes: nodes.filter(visibleNode).length,
          total: nodes.length,
          edges: edges.filter((e) => visibleNode(e.s) && visibleNode(e.t)).length,
          totalEdges: edges.length,
        };
      },
      countByGroup() {
        const map = {};
        groups.forEach((g) => {
          map[g.id] = {
            concepts: nodes.filter((n) => n.g === g.id).length,
            relations: edges.filter((e) => e.s.g === g.id || e.t.g === g.id).length,
          };
        });
        return map;
      },
      destroy() {
        window.removeEventListener('pointermove', onMove);
        window.removeEventListener('pointerup', onUp);
        if (rafId) window.cancelAnimationFrame(rafId);
        container.innerHTML = '';
        container.classList.remove('og-root');
      },
    };

    api.start();
    api.resetReveal();
    applyHighlight();
    updateHud();
    return api;
  }

  return { create };
})();
