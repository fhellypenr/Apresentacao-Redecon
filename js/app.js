// Apresentação Redecon — telas e navegação
(function () {
  const $ = (s, el = document) => el.querySelector(s);
  const $$ = (s, el = document) => [...el.querySelectorAll(s)];

  // ---------- Formatação ----------
  const fmtPct = (v, casas = 0) => v == null ? "—" :
    (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }) + "%";
  const fmtReal = (v, casas = 0) => v == null ? "—" :
    v.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: casas, maximumFractionDigits: casas });
  const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

  let D = null; // dados carregados

  // Texto da planilha, trocando {chave} pelo valor do parâmetro (percentuais formatados).
  function T(chave) {
    const bruto = (D.textos[chave] != null ? D.textos[chave] : (DADOS_PADRAO.textos[chave] || ""));
    return esc(bruto).replace(/\{(\w+)\}/g, (_, k) => {
      const v = D.parametros[k];
      if (typeof v === "number" && v < 1) return fmtPct(v, v * 100 % 1 ? 2 : 0);
      return v == null ? "" : esc(v);
    });
  }

  // ---------- Ajustes da reunião (cliente, apresentador, foco) ----------
  const AJ_CHAVE = "redecon_reuniao_v1";
  const ajustes = (() => {
    let a = { cliente: "", apresentador: "", foco: "geral" };
    try { Object.assign(a, JSON.parse(localStorage.getItem(AJ_CHAVE)) || {}); } catch (e) {}
    const q = new URLSearchParams(location.search);
    ["cliente", "apresentador", "foco"].forEach(k => { if (q.get(k)) a[k] = q.get(k); });
    return a;
  })();
  function salvarAjustes() { try { localStorage.setItem(AJ_CHAVE, JSON.stringify(ajustes)); } catch (e) {} }

  // Telas ligadas/desligadas (fica salvo neste aparelho). Padrão: previdência desligada.
  const TELAS_CHAVE = "redecon_telas_v1";
  const TELAS_PADRAO = { "po-previdencia": false };
  const telasOn = (() => {
    let t = Object.assign({}, TELAS_PADRAO);
    try { Object.assign(t, JSON.parse(localStorage.getItem(TELAS_CHAVE)) || {}); } catch (e) {}
    return t;
  })();
  const telaLigada = id => telasOn[id] !== false;
  function salvarTelas() { try { localStorage.setItem(TELAS_CHAVE, JSON.stringify(telasOn)); } catch (e) {} }

  // ---------- Telas ----------
  function telaCapa() {
    const cliente = ajustes.cliente ? `<div><span>Preparado para</span><strong>${esc(ajustes.cliente)}</strong></div>` : "";
    const apres = ajustes.apresentador ? `<div><span>Apresentado por</span><strong>${esc(ajustes.apresentador)}</strong></div>` : "";
    return `
      <img class="capa-logo" src="img/logo-negativo.png" alt="Redecon Consórcios">
      <div class="capa-meio">
        <h1>${T("capa_titulo")}</h1>
        <p class="sub">${T("capa_subtitulo")}</p>
      </div>
      <div class="capa-rodape">
        ${cliente}${apres}
        <div><span>Redecon Consórcios</span><strong>Parceira HS Consórcios</strong></div>
      </div>
      <svg class="capa-arcos" viewBox="0 0 1000 520" aria-hidden="true">
        <defs><linearGradient id="grad-arco" x1="0" x2="1"><stop offset="0" stop-color="#D81840"/><stop offset="1" stop-color="#F84434"/></linearGradient></defs>
        <path d="M140 520 A360 360 0 0 1 860 520" stroke-width="10" opacity=".9"/>
        <path d="M220 520 A280 280 0 0 1 780 520" stroke-width="10" opacity=".7"/>
        <path d="M300 520 A200 200 0 0 1 700 520" stroke-width="10" opacity=".5"/>
        <path d="M380 520 A120 120 0 0 1 620 520" stroke-width="10" opacity=".35"/>
      </svg>`;
  }

  function telaRegras() {
    const r = (id, destaque) => `
      <div class="regra${destaque ? " destaque" : ""}">
        <h3>${T(id + "_titulo")}</h3><p>${T(id)}</p>
      </div>`;
    return `
      <h2 class="titulo">${T("regras_titulo")}</h2>
      <div class="regras">
        ${r("regra_investimento")}${r("regra_vencimento")}${r("regra_fidelidade", true)}
      </div>`;
  }

  function telaFunil() {
    const passos = [...new Set(D.funil.map(f => f.meses))].sort((a, b) => a - b);
    const etapas = D.funil.map((f, i) => `
      <button class="etapa" data-i="${i}">
        <strong>${esc(f.modalidade)}</strong>
        <span class="etapa-pct">${fmtPct(f.concorrencia)}</span>
        <small>${f.meses ? `libera com ${f.meses} em dia` : "parcela em dia"}</small>
      </button>`).join("");
    return `
      <h2 class="titulo">${T("funil_titulo")}</h2>
      <div class="funil2">
        <div class="placar" aria-live="polite">
          <div class="placar-num">85%</div>
          <p class="placar-frase">De cada 100 cotas, <strong class="placar-qtd">85</strong> disputam a contemplação com você.</p>
          <p>Modalidade: <span class="placar-modalidade"></span></p>
          <p class="placar-meses"></p>
        </div>
        <svg class="funil3d" viewBox="0 0 760 470" role="img" aria-label="Funil de concorrência por modalidade">
          <defs>
            <symbol id="ico-pessoa" viewBox="0 0 24 32"><circle cx="12" cy="7" r="6"/><path d="M1 31c0-8 5-14 11-14s11 6 11 14z"/></symbol>
            <linearGradient id="g-funil" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#274477" stop-opacity=".55"/><stop offset="1" stop-color="#F84434" stop-opacity=".35"/></linearGradient>
            <filter id="f-brilho" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
          </defs>
          <path class="funil-corpo"/>
          <g class="aneis"></g>
          <g class="multid"></g>
          <g class="cliente"><use href="#ico-pessoa" x="-15" y="-46" width="30" height="40"/><text y="12" text-anchor="middle">você</text></g>
        </svg>
        <div class="trilha">${etapas}</div>
        <div class="controle">
          <span class="controle-rotulo">Parcelas seguidas em dia</span>
          <div class="passos" role="group" aria-label="Parcelas seguidas em dia">
            ${passos.map(m => `<button class="passo" data-m="${m}" aria-pressed="false">${m}</button>`).join("")}
          </div>
          <button class="btn btn-atraso" data-acao="atraso">Atrasou 1 dia</button>
        </div>
      </div>
      <p class="aviso">${T("aviso_funil")}</p>`;
  }

  const ICONES = {
    grupo: '<svg viewBox="0 0 56 56"><circle cx="20" cy="20" r="7"/><circle cx="38" cy="22" r="5.5"/><path d="M7 44c1.5-8 7-12 13-12s11.5 4 13 12"/><path d="M33 33c5 0 10 3 11.5 10"/></svg>',
    multicotas: '<svg viewBox="0 0 56 56"><rect x="8" y="18" width="30" height="22" rx="4"/><path d="M15 12h29a4 4 0 0 1 4 4v18"/></svg>',
    lance: '<svg viewBox="0 0 56 56"><circle cx="28" cy="28" r="19"/><path d="M28 38V18"/><path d="M20 26l8-8 8 8"/></svg>',
    fidelidade: '<svg viewBox="0 0 56 56"><rect x="9" y="12" width="38" height="34" rx="5"/><path d="M9 22h38"/><path d="M19 8v8M37 8v8"/><path d="M20 33l6 5 10-10"/></svg>'
  };
  function telaOtimizar() {
    const a = (id, icone) => `
      <div class="alavanca">
        <span aria-hidden="true">${ICONES[icone].replace("<svg", '<svg stroke="url(#grad-icone)" fill="none" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"')}</span>
        <div><h3>${T(id + "_t")}</h3><p>${T(id)}</p>${T(id + "_obs") ? `<p>${T(id + "_obs")}</p>` : ""}</div>
      </div>`;
    return `
      <svg width="0" height="0" style="position:absolute"><defs><linearGradient id="grad-icone" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="#D81840"/><stop offset="1" stop-color="#F84434"/></linearGradient></defs></svg>
      <h2 class="titulo">${T("otimizar_titulo")}</h2>
      <div class="alavancas">
        ${a("otimizar_grupo", "grupo")}${a("otimizar_multicotas", "multicotas")}
        ${a("otimizar_lance", "lance")}${a("otimizar_fidelidade", "fidelidade")}
      </div>`;
  }

  function telaCompromisso() {
    // Itens separados por ponto e vírgula na planilha.
    const itens = T("compromisso_redecon_itens").split(";").map(s => s.trim()).filter(Boolean)
      .map(s => `<li>${s}</li>`).join("");
    return `
      <h2 class="titulo">${T("compromisso_titulo")}</h2>
      <div class="compromisso">
        <div class="lado lado-cliente"><h3>${T("compromisso_cliente_rotulo")}</h3><p>${T("compromisso_cliente")}</p></div>
        <div class="lado lado-redecon"><h3>${T("compromisso_redecon_rotulo")}</h3><ul>${itens}</ul></div>
      </div>`;
  }

  function telaEmBreve(nome) {
    return `<h2 class="titulo">${esc(nome)}</h2><p class="sub">Este módulo entra nas próximas etapas.</p>`;
  }

  // ---------- Estado da simulação (compartilhado entre as telas) ----------
  let estado = null;
  function criarEstado() {
    const p = D.parametros;
    return {
      credito: p.ex_credito || 1000000,
      prazo: p.ex_prazo || 220,
      meia: String(p.ex_parcela || "meia").toLowerCase() !== "cheia",
      mes: 36, modalidade: "sorteio",
      sistema: "Price", // tabela do financiamento nas comparações (Price por padrão; SAC opcional)
      agio: p.agio_venda != null ? p.agio_venda : 0.2
    };
  }
  const ctx = {
    get D() { return D; }, T, esc, fmtPct, fmtReal,
    get estado() { return estado; },
    get ajustes() { return ajustes; },
    // Vai para a primeira tela da lista que estiver ligada
    irPara(ids) { for (const id of [].concat(ids)) { const k = LISTA.findIndex(t => t.id === id); if (k >= 0) { ir(k); return; } } },
    mudou() { document.dispatchEvent(new CustomEvent("redecon:estado")); }
  };

  // Estrutura completa do roteiro. "telas" vazias = módulo ainda não construído.
  // Com um foco escolhido, o pilar do foco vem primeiro.
  function construirRoteiro() {
    const P = window.PILARES || {};
    const ordem = ["aquisicao", "poupanca", "investimento"];
    if (ordem.includes(ajustes.foco)) { ordem.splice(ordem.indexOf(ajustes.foco), 1); ordem.unshift(ajustes.foco); }
    const comCtx = t => Object.assign({}, t, {
      html: () => t.html(ctx),
      iniciar: t.iniciar ? el => t.iniciar(el, ctx) : null
    });
    const E = window.ETAPA4 || {};
    const casosOk = D.casos && D.casos.length;
    return [
      { nome: "Abertura", telas: [{ id: "capa", nome: "Capa", classe: "capa", html: telaCapa }] },
      { nome: "Quem somos", telas: [E.quemRedecon, E.quemHs].filter(Boolean).map(comCtx) },
      { nome: "Virada de chave", telas: [E.virada].filter(Boolean).map(comCtx) },
      { nome: "Método API", telas: [E.mapa].filter(Boolean).map(comCtx) },
      ...ordem.map(k => ({ nome: (P[k] && P[k].nome) || k, telas: P[k] ? P[k].telas.map(comCtx) : [] })),
      { nome: "Como chegar lá", telas: [
        { id: "regras", nome: "Regras do jogo", html: telaRegras },
        { id: "funil", nome: "Disciplina e concorrência", html: telaFunil, iniciar: iniciarFunil },
        { id: "otimizar", nome: "Estratégias", html: telaOtimizar },
        { id: "compromisso", nome: "Compromissos", html: telaCompromisso }
      ] },
      { nome: "Segurança, liberdade e rendimento", telas: [E.sintese].filter(Boolean).map(comCtx) },
      { nome: "Casos reais", telas: casosOk && E.casos ? [comCtx(E.casos)] : [], semCasos: !casosOk },
      { nome: "Fechamento", telas: [E.fechamento].filter(Boolean).map(comCtx) },
      { nome: "Encerramento", telas: [E.encerramento].filter(Boolean).map(comCtx) }
    ];
  }
  let ROTEIRO = [], SECOES = [], LISTA = [];
  let atual = 0;

  // ---------- Funil 3D ----------
  // Um anel de pessoas por modalidade, em perspectiva e girando. O cliente desce até o nível escolhido:
  // os níveis de cima ficam para trás e só o anel atual "disputa" com ele.
  function iniciarFunil(el) {
    const NS = "http://www.w3.org/2000/svg";
    const svg = $(".funil3d", el), gAneis = $(".aneis", svg), gMult = $(".multid", svg), cliente = $(".cliente", svg);
    const placar = $(".placar", el), num = $(".placar-num", el), qtd = $(".placar-qtd", el);
    const reduzir = matchMedia("(prefers-reduced-motion: reduce)").matches;
    const F = D.funil, N = F.length, CX = 380, TOPO = 70, PASSO = (430 - TOPO) / Math.max(1, N - 1);
    // Geometria dos anéis: o raio diminui a cada nível (formato de funil)
    const aneis = F.map((f, i) => {
      const rx = 330 - (330 - 46) * Math.pow(i / Math.max(1, N - 1), 0.85), ry = rx * 0.2, cy = TOPO + i * PASSO;
      const qtdP = Math.max(3, Math.round(f.concorrencia * 40));
      return { f, i, rx, ry, cy, qtdP, fase: i * 0.7, dir: i % 2 ? -1 : 1 };
    });
    // Corpo do funil (silhueta ligando as bordas dos anéis)
    const esq = aneis.map(a => `${CX - a.rx},${a.cy}`), dir = aneis.slice().reverse().map(a => `${CX + a.rx},${a.cy}`);
    $(".funil-corpo", svg).setAttribute("d", `M${esq.join(" L")} L${dir.join(" L")} Z`);
    aneis.forEach(a => {
      const e = document.createElementNS(NS, "ellipse");
      e.setAttribute("cx", CX); e.setAttribute("cy", a.cy); e.setAttribute("rx", a.rx); e.setAttribute("ry", a.ry);
      e.setAttribute("class", "anel"); e.dataset.i = a.i;
      gAneis.appendChild(e);
      a.anel = e;
      a.pessoas = Array.from({ length: a.qtdP }, (_, k) => {
        const u = document.createElementNS(NS, "use");
        u.setAttribute("href", "#ico-pessoa"); u.setAttribute("width", 22); u.setAttribute("height", 29);
        u.setAttribute("class", "p3d"); u.dataset.i = a.i;
        gMult.appendChild(u);
        return { u, th: (k / a.qtdP) * Math.PI * 2 };
      });
    });
    // Clique no anel ou nas pessoas também escolhe o nível
    svg.addEventListener("click", ev => { const t = ev.target.closest("[data-i]"); if (t) escolher(+t.dataset.i); });

    let rot = 0, ultimo = performance.now(), quadro = null, sel = 0, mostrado = 85, anim = null;
    function desenhar(t) {
      const dt = Math.min(0.05, (t - ultimo) / 1000); ultimo = t;
      if (!reduzir) rot += dt * 0.35;
      aneis.forEach(a => a.pessoas.forEach(p => {
        const th = p.th + rot * a.dir + a.fase, s = Math.sin(th);
        const x = CX + a.rx * Math.cos(th), y = a.cy + a.ry * s;
        const prof = (s + 1) / 2; // 0 = fundo, 1 = frente
        const esc = 0.62 + prof * 0.5;
        p.u.setAttribute("transform", `translate(${(x - 11 * esc).toFixed(1)},${(y - 27 * esc).toFixed(1)}) scale(${esc.toFixed(3)})`);
        p.u.style.setProperty("--prof", prof.toFixed(2));
      }));
      quadro = el.isConnected ? requestAnimationFrame(desenhar) : null;
    }
    function contar(alvo) {
      cancelAnimationFrame(anim);
      if (reduzir) { mostrado = alvo; num.textContent = alvo + "%"; qtd.textContent = alvo; return; }
      const de = mostrado, t0 = performance.now();
      const passo = t => {
        const k = Math.min(1, (t - t0) / 900), e = 1 - Math.pow(1 - k, 3);
        mostrado = Math.round(de + (alvo - de) * e);
        num.textContent = mostrado + "%"; qtd.textContent = mostrado;
        if (k < 1) anim = requestAnimationFrame(passo);
      };
      anim = requestAnimationFrame(passo);
    }
    // meses = parcelas em dia; i = nível mostrado (por padrão, a melhor modalidade liberada)
    function aplicar(meses, i) {
      const liberados = F.map((f, k) => k).filter(k => F[k].meses <= meses);
      if (i == null) i = liberados.reduce((a, b) => (F[b].concorrencia < F[a].concorrencia ? b : a), liberados[0]);
      sel = i;
      aneis.forEach(a => {
        const estado = a.i === i ? "atual" : a.i < i ? "atras" : (F[a.i].meses <= meses ? "livre" : "trava");
        a.anel.setAttribute("class", "anel " + estado);
        a.pessoas.forEach(p => p.u.setAttribute("class", "p3d " + estado));
      });
      const a = aneis[i];
      cliente.style.transform = `translate(${CX}px, ${a.cy + a.ry + 6}px)`;
      $$(".etapa", el).forEach(d => {
        const k = +d.dataset.i;
        d.classList.toggle("liberado", F[k].meses <= meses);
        d.classList.toggle("melhor", k === i);
      });
      $$(".passo", el).forEach(b => b.setAttribute("aria-pressed", String(+b.dataset.m === meses)));
      $(".placar-modalidade", el).textContent = F[i].modalidade;
      $(".placar-meses", el).textContent = meses === 0 ? "Com a parcela do mês em dia." : `Com ${meses} parcelas seguidas em dia.`;
      placar.classList.toggle("no-topo", i === N - 1);
      contar(Math.round(F[i].concorrencia * 100));
      mesesAtual = meses;
    }
    let mesesAtual = 0;
    // Escolher um nível direto (quadro ou anel): libera as parcelas em dia que ele exige
    function escolher(i) { aplicar(Math.max(mesesAtual, F[i].meses), i); }
    $$(".etapa", el).forEach(d => d.addEventListener("click", () => escolher(+d.dataset.i)));
    $$(".passo", el).forEach(b => b.addEventListener("click", () => aplicar(+b.dataset.m)));
    $('[data-acao="atraso"]', el).addEventListener("click", () => {
      placar.classList.remove("zerado"); void placar.offsetWidth; placar.classList.add("zerado");
      svg.classList.remove("tremer"); void svg.offsetWidth; svg.classList.add("tremer");
      aplicar(0, 0);
      $(".placar-meses", el).textContent = "Um dia de atraso zerou a contagem.";
    });
    aplicar(0);
    // Só anima enquanto a tela está visível
    el._reiniciar = () => { aplicar(0); if (!quadro) { ultimo = performance.now(); quadro = requestAnimationFrame(desenhar); } };
    el._sair = () => { cancelAnimationFrame(quadro); quadro = null; };
    desenhar(performance.now()); cancelAnimationFrame(quadro); quadro = null;
  }

  // ---------- Montagem ----------
  function montar() {
    const idAtual = LISTA[atual] ? LISTA[atual].id : null;
    ROTEIRO = construirRoteiro();
    SECOES = ROTEIRO.map(sec => Object.assign({}, sec, { telas: sec.telas.filter(t => telaLigada(t.id)) })).filter(sec => sec.telas.length);
    LISTA = SECOES.flatMap((s, si) => s.telas.map(t => Object.assign({ secao: si }, t)));
    if (idAtual) { const k = LISTA.findIndex(t => t.id === idAtual); if (k >= 0) atual = k; }
    if (!estado) estado = criarEstado();
    const palco = $(".palco");
    palco.innerHTML = LISTA.map((t, i) =>
      `<section class="slide ${t.classe || ""}" data-i="${i}" aria-roledescription="tela" aria-label="${esc(t.nome || SECOES[t.secao].nome)}">${t.html()}</section>`).join("");
    LISTA.forEach((t, i) => { if (t.iniciar) t.iniciar($(`.slide[data-i="${i}"]`)); });
    montarProgresso();
    montarMenu();
    montarTelas();
    ir(Math.min(atual, LISTA.length - 1), true);
  }

  function montarProgresso() {
    $(".progresso").innerHTML = SECOES.map((s, si) => {
      const primeiro = LISTA.findIndex(t => t.secao === si);
      return `<button title="${esc(s.nome)}" aria-label="${esc(s.nome)}" data-ir="${primeiro}" class="${primeiro < 0 ? "vazio" : ""}" ${primeiro < 0 ? "disabled" : ""}></button>`;
    }).join("");
    $$(".progresso button").forEach(b => b.addEventListener("click", () => ir(+b.dataset.ir)));
  }

  function montarMenu() {
    $("#lista-menu").innerHTML = SECOES.map((s, si) => {
      return `<div class="menu-secao"><h3>${esc(s.nome)}</h3>${s.telas.map(t => {
        const i = LISTA.findIndex(x => x.id === t.id);
        return `<button data-ir="${i}">${esc(t.nome || s.nome)}</button>`;
      }).join("")}</div>`;
    }).join("");
    $$("#lista-menu [data-ir]").forEach(b => b.addEventListener("click", () => { ir(+b.dataset.ir); fecharPaineis(); }));
  }

  // Lista de telas no painel de ajustes, para ligar ou desligar cada uma
  function montarTelas() {
    const caixa = $("#aj-telas");
    if (!caixa) return;
    caixa.innerHTML = ROTEIRO.map(sec => {
      const itens = sec.telas.map(t => `<label class="tela-op"><input type="checkbox" data-tela="${esc(t.id)}" ${telaLigada(t.id) ? "checked" : ""} ${t.id === "capa" ? "disabled" : ""}> ${esc(t.nome || sec.nome)}</label>`).join("");
      const vazio = sec.semCasos ? `<p class="tela-nota">Nenhum caso autorizado na planilha (aba Casos).</p>` : "";
      return `<div class="tela-grupo"><span>${esc(sec.nome)}</span>${itens}${vazio}</div>`;
    }).join("");
    $$("[data-tela]", caixa).forEach(c => c.addEventListener("change", () => { telasOn[c.dataset.tela] = c.checked; salvarTelas(); montar(); }));
  }

  // ---------- Animações de entrada ----------
  const REVELA = ".titulo, .sub, .controles, .topo-linha, .stat, .cadeia-titulo, .elo, .mapa-ilustra, .opcao, .caminho, .pilar-sint, " +
    ".plano-card, .proximo, .uso, .usos-rodape, .regra, .alavanca, .lado, .virada-antes, .virada-seta, .virada-depois, .hoje li, " +
    ".placar, .degrau, .funil3d, .etapa, .controle, .dois > *, .aluguel-grade > *, .destaque-fim, .economia, .fim-foto, .fim-logo, .fim-corpo > *, .caso, [data-alvo=\"rodape\"]";
  const semMovimento = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function animarEntrada(el) {
    if (semMovimento || !el) return;
    clearTimeout(el._tAnim);
    el.classList.remove("revelar");
    $$(REVELA, el).forEach((x, k) => x.style.setProperty("--k", Math.min(k, 14)));
    void el.offsetWidth;
    el.classList.add("revelar");
    contarNumeros(el);
    // Depois da entrada, recálculos ao vivo não repetem a animação
    el._tAnim = setTimeout(() => el.classList.remove("revelar"), 2200);
  }
  // Números grandes sobem de zero até o valor (ex.: "+3.200", "+R$ 27 bi")
  function contarNumeros(el) {
    $$(".stat strong, .economia strong", el).forEach(n => {
      const orig = n.dataset.orig || n.textContent;
      n.dataset.orig = orig;
      const m = orig.match(/\d[\d.]*(,\d+)?/);
      if (!m) return;
      const casas = m[1] ? m[1].length - 1 : 0;
      const alvo = Number(m[0].replace(/\./g, "").replace(",", "."));
      const t0 = performance.now(), dur = 1300;
      const passo = t => {
        const k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3);
        const v = (alvo * e).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas });
        n.textContent = orig.replace(m[0], v);
        if (k < 1) requestAnimationFrame(passo); else n.textContent = orig;
      };
      requestAnimationFrame(passo);
    });
  }

  function ir(i, inicial) {
    if (i < 0 || i >= LISTA.length) return;
    const antes = atual;
    atual = i;
    document.documentElement.style.setProperty("--dir", i >= antes ? 1 : -1);
    $$(".slide").forEach(s => s.classList.toggle("ativo", +s.dataset.i === i));
    const anterior = $(`.slide[data-i="${antes}"]`);
    if (anterior && anterior._sair && antes !== i) anterior._sair();
    const el = $(`.slide[data-i="${i}"]`);
    if (el && el._reiniciar && (inicial || antes !== i)) el._reiniciar();
    if (el && el._aoMostrar && antes !== i) el._aoMostrar();
    if (antes !== i || inicial) animarEntrada(el);
    const sec = LISTA[i].secao;
    $$(".progresso button").forEach((b, si) => {
      b.classList.toggle("atual", si === sec);
      b.classList.toggle("feito", si < sec && !b.disabled);
    });
    $$("#lista-menu [data-ir]").forEach(b => b.classList.toggle("atual", +b.dataset.ir === i));
    history.replaceState(null, "", location.pathname + location.search + "#" + LISTA[i].id);
  }

  // ---------- Painéis ----------
  function fecharPaineis() { $$(".painel").forEach(p => p.classList.remove("aberto")); }
  function abrir(id) { const p = $(id), aberto = p.classList.contains("aberto"); fecharPaineis(); if (!aberto) p.classList.add("aberto"); }

  function montarAjustes() {
    const sel = $("#aj-apresentador");
    sel.innerHTML = `<option value="">Não mostrar</option>` + CONFIG.apresentadores.map(n => `<option>${esc(n)}</option>`).join("");
    $("#aj-cliente").value = ajustes.cliente;
    sel.value = ajustes.apresentador;
    $("#aj-foco").value = ajustes.foco;
    ["cliente", "apresentador", "foco"].forEach(k => {
      $("#aj-" + k).addEventListener("change", e => { ajustes[k] = e.target.value.trim(); salvarAjustes(); montar(); });
    });
  }

  function mostrarStatus() {
    const p = D.parametros;
    const quando = Dados.quando ? new Date(Dados.quando) : null;
    const quandoTxt = quando && !isNaN(quando) ? quando.toLocaleDateString("pt-BR") + " " + quando.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" }) : "—";
    const origem = { planilha: "Planilha (atualizado agora)", salvo: "Últimos dados salvos", padrao: "Dados de reserva" }[Dados.origem];
    const st = $(".status-dados");
    st.textContent = Dados.origem === "planilha" ? `Selic ${fmtPct(p.selic, 2)}` : `${origem}`;
    st.classList.toggle("alerta", Dados.origem !== "planilha");
    $("#dados-info").innerHTML = `
      <dl>
        <dt>Origem</dt><dd>${origem}</dd>
        <dt>Carregado em</dt><dd>${Dados.origem === "padrao" ? "versão de " + esc(Dados.quando) : quandoTxt}</dd>
        <dt>Selic</dt><dd>${fmtPct(p.selic, 2)} (Banco Central)</dd>
        <dt>Crédito rendendo</dt><dd>${fmtPct(p.rend_credito_am, 2)} ao mês</dd>
        <dt>Reajuste</dt><dd>${fmtPct(p.reajuste_aa, 1)} ao ano</dd>
      </dl>
      ${Dados.erro && Dados.origem !== "planilha" ? `<p>Não foi possível ler a planilha: ${esc(Dados.erro)}.</p>` : ""}`;
  }

  // ---------- Início ----------
  async function iniciar() {
    D = await Dados.carregar();
    montarAjustes();
    montar();
    const pelaUrl = LISTA.findIndex(t => t.id === location.hash.slice(1));
    if (pelaUrl >= 0) ir(pelaUrl, true);
    mostrarStatus();

    $("#bt-ant").addEventListener("click", () => ir(atual - 1));
    $("#bt-prox").addEventListener("click", () => ir(atual + 1));
    $("#bt-menu").addEventListener("click", () => abrir("#menu"));
    $("#bt-ajustes").addEventListener("click", () => abrir("#ajustes"));
    $$(".painel-fechar").forEach(b => b.addEventListener("click", fecharPaineis));
    $("#bt-atualizar").addEventListener("click", async () => {
      $("#bt-atualizar").textContent = "Atualizando…";
      D = await Dados.carregar(); estado = criarEstado(); montar(); mostrarStatus();
      $("#bt-atualizar").textContent = "Atualizar dados";
    });
    const tela = $("#bt-tela");
    if (!document.documentElement.requestFullscreen) tela.hidden = true;
    tela.addEventListener("click", () => document.fullscreenElement ? document.exitFullscreen() : document.documentElement.requestFullscreen());

    let tRes = null;
    window.addEventListener("resize", () => { clearTimeout(tRes); tRes = setTimeout(() => ctx.mudou(), 250); });
    document.addEventListener("keydown", e => {
      if (e.target.closest("input, select, textarea, .graf")) return;
      if (["ArrowRight", "PageDown", " "].includes(e.key)) { e.preventDefault(); ir(atual + 1); }
      if (["ArrowLeft", "PageUp"].includes(e.key)) { e.preventDefault(); ir(atual - 1); }
      if (e.key === "Escape") fecharPaineis();
    });
    window.addEventListener("hashchange", () => {
      const i = LISTA.findIndex(t => t.id === location.hash.slice(1));
      if (i >= 0 && i !== atual) ir(i);
    });
    let x0 = null, y0 = null;
    $(".palco").addEventListener("touchstart", e => { x0 = e.touches[0].clientX; y0 = e.touches[0].clientY; }, { passive: true });
    $(".palco").addEventListener("touchend", e => {
      if (x0 == null) return;
      const dx = e.changedTouches[0].clientX - x0, dy = e.changedTouches[0].clientY - y0;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) ir(atual + (dx < 0 ? 1 : -1));
      x0 = null;
    });
  }
  document.addEventListener("DOMContentLoaded", iniciar);
})();
