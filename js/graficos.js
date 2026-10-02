// Gráficos simples em SVG, feitos à mão (sem biblioteca), com leitura ao passar o dedo/mouse.
(function () {
  const NS = "http://www.w3.org/2000/svg";
  const el = (tag, attrs = {}, pai) => {
    const n = document.createElementNS(NS, tag);
    for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, v);
    if (pai) pai.appendChild(n);
    return n;
  };

  // Escala "bonita" para o eixo Y
  function ticks(min, max, alvo = 4) {
    const span = max - min || 1;
    const passo0 = span / alvo, mag = Math.pow(10, Math.floor(Math.log10(passo0)));
    const passo = [1, 2, 2.5, 5, 10].map(m => m * mag).find(p => span / p <= alvo + 0.5) || 10 * mag;
    const ini = Math.floor(min / passo) * passo, fim = Math.ceil(max / passo) * passo;
    const out = [];
    for (let v = ini; v <= fim + passo / 2; v += passo) out.push(+v.toFixed(10));
    return out;
  }

  function tooltip(caixa) {
    let t = caixa.querySelector(".graf-tip");
    if (!t) { t = document.createElement("div"); t.className = "graf-tip"; t.hidden = true; caixa.appendChild(t); }
    return t;
  }
  function preencherTip(t, titulo, linhas) {
    t.replaceChildren();
    const h = document.createElement("div"); h.className = "graf-tip-titulo"; h.textContent = titulo; t.appendChild(h);
    for (const l of linhas) {
      const r = document.createElement("div"); r.className = "graf-tip-linha";
      if (l.cor) { const k = document.createElement("span"); k.className = "graf-tip-chave"; k.style.background = l.cor; r.appendChild(k); }
      const v = document.createElement("strong"); v.textContent = l.valor; r.appendChild(v);
      if (l.nome) { const nm = document.createElement("span"); nm.textContent = " " + l.nome; r.appendChild(nm); }
      t.appendChild(r);
    }
  }
  function posicionarTip(t, caixa, x, y) {
    const w = caixa.clientWidth;
    t.hidden = false;
    const tw = t.offsetWidth;
    t.style.left = Math.min(Math.max(8, x + 14), w - tw - 8) + "px";
    t.style.top = Math.max(0, y - 10) + "px";
  }

  // Legenda acima do gráfico (sempre que houver duas séries ou mais)
  function legenda(caixa, itens) {
    const l = document.createElement("div"); l.className = "graf-legenda";
    for (const it of itens) {
      const s = document.createElement("span");
      const k = document.createElement("i"); k.className = "graf-leg-" + (it.tipo || "linha"); k.style.background = it.cor;
      s.appendChild(k); s.appendChild(document.createTextNode(it.nome)); l.appendChild(s);
    }
    caixa.appendChild(l);
  }

  // ---------- Linhas ----------
  // series: [{ nome, cor, valores: [números] }], rotulosX: [textos], fmtY(v), fmtX(i)
  function linhas(caixa, { series, rotulosX, fmtY, fmtTip, altura = 300, yMin = null, marcarFim = true, selecionado = null, aoEscolher = null }) {
    caixa.classList.add("graf");
    caixa.replaceChildren();
    if (series.length > 1) legenda(caixa, series);
    const W = Math.max(300, caixa.clientWidth || 800), H = altura;
    if (W < 560) marcarFim = false; // tela estreita: sem rótulos na ponta, a leitura fica no toque
    const m = { t: 16, r: marcarFim ? 150 : 16, b: 34, l: 74 };
    const n = rotulosX.length;
    const todos = series.flatMap(s => s.valores).filter(v => v != null);
    let lo = yMin != null ? yMin : Math.min(0, ...todos), hi = Math.max(...todos);
    const tk = ticks(lo, hi); lo = tk[0]; hi = tk[tk.length - 1];
    const X = i => m.l + (n <= 1 ? 0 : i * (W - m.l - m.r) / (n - 1));
    const Y = v => m.t + (H - m.t - m.b) * (1 - (v - lo) / (hi - lo || 1));
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: H, role: "img" }, caixa);
    // grade
    for (const v of tk) {
      el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), class: Math.abs(v) < 1e-9 && lo < 0 ? "graf-zero" : "graf-grade" }, svg);
      el("text", { x: m.l - 10, y: Y(v) + 4, "text-anchor": "end", class: "graf-eixo" }, svg).textContent = fmtY(v);
    }
    const passoX = Math.max(1, Math.ceil(n / 8));
    for (let i = 0; i < n; i += passoX) el("text", { x: X(i), y: H - 10, "text-anchor": "middle", class: "graf-eixo" }, svg).textContent = rotulosX[i];
    // séries
    series.forEach(s => {
      const d = s.valores.map((v, i) => v == null ? null : `${X(i)},${Y(v)}`).filter(Boolean);
      el("polyline", { points: d.join(" "), fill: "none", stroke: s.cor, "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round" }, svg);
      if (marcarFim) {
        const ult = s.valores.length - 1, v = s.valores[ult];
        el("circle", { cx: X(ult), cy: Y(v), r: 5, fill: s.cor, stroke: "#101F3D", "stroke-width": 2 }, svg);
        const tx = el("text", { x: X(ult) + 12, y: Y(v) + 4, class: "graf-rotulo" }, svg);
        tx.textContent = fmtY(v, true);
        const nm = el("text", { x: X(ult) + 12, y: Y(v) + 20, class: "graf-rotulo-nome" }, svg);
        nm.textContent = s.nome;
      }
    });
    // ponto escolhido (fica marcado)
    if (selecionado != null && selecionado >= 0 && selecionado < n) {
      el("line", { x1: X(selecionado), x2: X(selecionado), y1: m.t, y2: H - m.b, class: "graf-escolhido" }, svg);
      series.forEach(s => el("circle", { cx: X(selecionado), cy: Y(s.valores[selecionado]), r: 7, fill: s.cor, stroke: "#FFFFFF", "stroke-width": 2 }, svg));
    }
    // camada de leitura
    const guia = el("line", { y1: m.t, y2: H - m.b, class: "graf-guia", visibility: "hidden" }, svg);
    const pontos = series.map(s => el("circle", { r: 5, fill: s.cor, stroke: "#101F3D", "stroke-width": 2, visibility: "hidden" }, svg));
    const area = el("rect", { x: m.l, y: m.t, width: W - m.l - m.r, height: H - m.t - m.b, fill: "transparent", tabindex: 0 }, svg);
    const tip = tooltip(caixa);
    const mostrar = i => {
      i = Math.max(0, Math.min(n - 1, i));
      guia.setAttribute("x1", X(i)); guia.setAttribute("x2", X(i)); guia.setAttribute("visibility", "visible");
      series.forEach((s, k) => { pontos[k].setAttribute("cx", X(i)); pontos[k].setAttribute("cy", Y(s.valores[i])); pontos[k].setAttribute("visibility", "visible"); });
      preencherTip(tip, rotulosX[i], series.map(s => ({ cor: s.cor, nome: s.nome, valor: (fmtTip || fmtY)(s.valores[i]) })));
      const r = svg.getBoundingClientRect(), esc = r.width / W;
      posicionarTip(tip, caixa, X(i) * esc, Y(Math.max(...series.map(s => s.valores[i]))) * esc);
    };
    const esconder = () => { guia.setAttribute("visibility", "hidden"); pontos.forEach(p => p.setAttribute("visibility", "hidden")); tip.hidden = true; };
    let foco = n - 1;
    area.addEventListener("pointermove", e => {
      const r = svg.getBoundingClientRect(), x = (e.clientX - r.left) * W / r.width;
      foco = Math.round((x - m.l) / ((W - m.l - m.r) / (n - 1 || 1)));
      mostrar(foco);
    });
    area.addEventListener("pointerleave", esconder);
    if (aoEscolher) {
      area.style.cursor = "pointer";
      area.addEventListener("click", () => aoEscolher(Math.max(0, Math.min(n - 1, foco))));
      area.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); aoEscolher(Math.max(0, Math.min(n - 1, foco))); } });
    }
    area.addEventListener("focus", () => mostrar(foco));
    area.addEventListener("blur", esconder);
    area.addEventListener("keydown", e => {
      if (e.key === "ArrowRight" || e.key === "ArrowLeft") { e.preventDefault(); e.stopPropagation(); foco += e.key === "ArrowRight" ? 1 : -1; mostrar(foco); }
    });
  }

  // ---------- Barras verticais ----------
  // itens: [{ rotulo, valor, destaque }]; valores negativos ficam abaixo da linha zero.
  // linha (opcional): { nome, cor, valores } desenhada por cima das barras, no mesmo eixo.
  // Cada item pode trazer cor própria (it.cor); sem ela, positivo = corPos e negativo = corNeg.
  function barras(caixa, { itens, fmtY, fmtTip, altura = 300, aoEscolher, corPos = "#F84434", corNeg = "#5B8DEF", linha = null, legendaItens = null }) {
    caixa.classList.add("graf");
    caixa.replaceChildren();
    if (legendaItens) legenda(caixa, legendaItens);
    const W = Math.max(320, caixa.clientWidth || 800), H = altura;
    const m = { t: 18, r: 12, b: 34, l: 74 };
    const vals = itens.map(i => i.valor).concat(linha ? linha.valores : []);
    const tk = ticks(Math.min(0, ...vals), Math.max(0, ...vals));
    const lo = tk[0], hi = tk[tk.length - 1];
    const Y = v => m.t + (H - m.t - m.b) * (1 - (v - lo) / (hi - lo || 1));
    const n = itens.length, faixa = (W - m.l - m.r) / n, bw = Math.max(6, Math.min(44, faixa - 6));
    const svg = el("svg", { viewBox: `0 0 ${W} ${H}`, width: "100%", height: H, role: "img" }, caixa);
    for (const v of tk) {
      el("line", { x1: m.l, x2: W - m.r, y1: Y(v), y2: Y(v), class: v === 0 ? "graf-zero" : "graf-grade" }, svg);
      el("text", { x: m.l - 10, y: Y(v) + 4, "text-anchor": "end", class: "graf-eixo" }, svg).textContent = fmtY(v);
    }
    const tip = tooltip(caixa);
    const passoX = Math.max(1, Math.ceil(n / 12));
    itens.forEach((it, i) => {
      const cx = m.l + faixa * i + faixa / 2;
      const y0 = Y(0), y1 = Y(it.valor);
      const top = Math.min(y0, y1), h = Math.max(2, Math.abs(y1 - y0));
      const r = Math.min(4, bw / 2, h / 2);
      // canto arredondado só na ponta da barra
      const x = cx - bw / 2;
      const d = it.valor >= 0
        ? `M${x},${y0} V${top + r} Q${x},${top} ${x + r},${top} H${x + bw - r} Q${x + bw},${top} ${x + bw},${top + r} V${y0} Z`
        : `M${x},${y0} V${top + h - r} Q${x},${top + h} ${x + r},${top + h} H${x + bw - r} Q${x + bw},${top + h} ${x + bw},${top + h - r} V${y0} Z`;
      const g = el("g", { class: "graf-barra" + (it.destaque ? " destaque" : ""), tabindex: 0 }, svg);
      el("rect", { x: cx - faixa / 2, y: m.t, width: faixa, height: H - m.t - m.b, fill: "transparent" }, g);
      el("path", { d, fill: it.cor || (it.valor >= 0 ? corPos : corNeg), opacity: it.destaque ? 1 : 0.55 }, g);
      if (i % passoX === 0) el("text", { x: cx, y: H - 10, "text-anchor": "middle", class: "graf-eixo" }, svg).textContent = it.rotulo;
      const mostrar = () => {
        const linhasTip = [{ cor: it.cor || (it.valor >= 0 ? corPos : corNeg), valor: (fmtTip || fmtY)(it.valor), nome: it.nomeTip || "" }];
        if (linha) linhasTip.push({ cor: linha.cor, valor: (fmtTip || fmtY)(linha.valores[i]), nome: linha.nome });
        preencherTip(tip, it.rotulo, linhasTip);
        const rr = svg.getBoundingClientRect(), es = rr.width / W;
        posicionarTip(tip, caixa, cx * es, top * es);
      };
      g.addEventListener("pointerenter", mostrar);
      g.addEventListener("focus", mostrar);
      g.addEventListener("pointerleave", () => { tip.hidden = true; });
      g.addEventListener("blur", () => { tip.hidden = true; });
      if (aoEscolher) {
        g.addEventListener("click", () => aoEscolher(i));
        g.addEventListener("keydown", e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); aoEscolher(i); } });
      }
    });
    if (linha) {
      const pts = linha.valores.map((v, i) => `${m.l + faixa * i + faixa / 2},${Y(v)}`).join(" ");
      el("polyline", { points: pts, fill: "none", stroke: linha.cor, "stroke-width": 3, "stroke-linejoin": "round", "stroke-linecap": "round", "pointer-events": "none" }, svg);
      linha.valores.forEach((v, i) => el("circle", { cx: m.l + faixa * i + faixa / 2, cy: Y(v), r: 4, fill: linha.cor, stroke: "#101F3D", "stroke-width": 2, "pointer-events": "none" }, svg));
    }
  }

  window.Graficos = { linhas, barras };
})();
