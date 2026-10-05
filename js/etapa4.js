// Etapa 4: quem somos, virada de chave, mapa do API, síntese, casos reais, fechamento e encerramento.
// Cada tela tem html(ctx) e, quando precisa, iniciar(el, ctx). Textos vêm da aba Textos da planilha.
(function () {
  const A = () => window.PILARES_AJUDA;
  const lista = s => String(s || "").split(";").map(x => x.trim()).filter(Boolean);
  const inst = (ctx, k) => ctx.esc((ctx.D.institucional || {})[k] || DADOS_PADRAO.institucional[k] || "");
  const rot = (ctx, k) => ctx.esc((ctx.D.inst_rot || {})[k] || (DADOS_PADRAO.inst_rot || {})[k] || "");
  const grande = (ctx, k) => `<div class="stat"><strong>${inst(ctx, k)}</strong><span>${rot(ctx, k)}</span></div>`;

  // ---------- Quem somos ----------
  const quemRedecon = {
    id: "quem-redecon", nome: "Redecon e a estrutura",
    html: ctx => `
      <h2 class="titulo">${ctx.T("quem_titulo")}</h2>
      <div class="quem centro-vertical">
        <div class="stats stats-1">${["rd_clientes", "rd_creditos", "rd_anos", "rd_bens"].map(k => grande(ctx, k)).join("")}</div>
        <img class="mapa-ilustra" src="img/mapa-redecon.svg" alt="" aria-hidden="true">
        <div class="cadeia">
          <p class="cadeia-titulo">${ctx.T("quem_cadeia_titulo")}</p>
          ${["bc", "herval", "hs", "rd"].map((k, i) => `
            <div class="elo${k === "rd" ? " elo-destaque" : ""}">
              <span class="elo-n">${i + 1}</span>
              <div><h3>${ctx.T("cadeia_" + k + "_t")}</h3><p>${ctx.T("cadeia_" + k)}</p></div>
            </div>`).join("")}
        </div>
      </div>`
  };

  const quemHs = {
    id: "quem-hs", nome: "HS no Brasil",
    html: ctx => `
      <h2 class="titulo">${ctx.T("hs_titulo")}</h2>
      <div class="hs-mapa centro-vertical">
        <img class="mapa-ilustra" src="img/mapa-hs.svg" alt="" aria-hidden="true">
        <div class="stats stats-2">${["hs_vendas_ano", "hs_vendas_mes", "hs_contemplacoes", "hs_cotas", "hs_corretores", "hs_cidades"].map(k => grande(ctx, k)).join("")}</div>
      </div>`
  };

  // ---------- Virada de chave ----------
  const ICO = {
    casa: '<path d="M8 26 28 10l20 16"/><path d="M14 22v22h28V22"/><path d="M24 44V32h8v12"/>',
    obra: '<path d="M10 46h36"/><path d="M14 46V24h14v22"/><path d="M28 30h14v16"/><path d="M18 30h6M18 36h6M32 36h6"/><path d="M21 24V14l7-4"/>',
    venda: '<path d="M10 30 26 14h16v16L26 46z"/><circle cx="35" cy="21" r="3"/>',
    rende: '<path d="M10 42 22 30l8 8 16-18"/><path d="M36 20h10v10"/>',
    aluguel: '<rect x="10" y="14" width="36" height="30" rx="4"/><path d="M10 22h36"/><path d="M19 32h8M19 37h14"/>',
    sorteio: '<circle cx="28" cy="28" r="17"/><path d="M28 18v10l7 5"/>',
    apoio: '<circle cx="20" cy="18" r="6"/><circle cx="36" cy="18" r="6"/><path d="M8 44c1-8 6-12 12-12s11 4 12 12"/><path d="M28 34c2-1.5 5-2 8-2 6 0 11 4 12 12"/>',
    escudo: '<path d="M28 8 44 14v12c0 10-7 17-16 22-9-5-16-12-16-22V14z"/><path d="M21 28l5 5 10-10"/>',
    caminhos: '<path d="M28 46V30"/><path d="M28 30 14 16"/><path d="M28 30 42 16"/><path d="M14 16h6M14 16v6M42 16h-6M42 16v6"/>',
    grafico: '<path d="M10 44h36"/><rect x="14" y="30" width="6" height="14"/><rect x="25" y="22" width="6" height="22"/><rect x="36" y="14" width="6" height="30"/>'
  };
  const icone = k => `<svg class="ico" viewBox="0 0 56 56" aria-hidden="true">${ICO[k] || ICO.casa}</svg>`;
  const ICONES_HOJE = ["casa", "venda", "rende", "aluguel", "sorteio", "apoio"];

  // ---------- Virada de chave: o consórcio do passado × o de hoje ----------
  const virada = {
    id: "virada", nome: "Do tradicional à inteligência financeira",
    html: ctx => `
      <h2 class="titulo">${ctx.T("virada_titulo")}</h2>
      <div class="virada centro-vertical">
        <div class="virada-antes">
          <span class="carimbo" aria-hidden="true"></span>
          <h3>${ctx.T("virada_antes_t")}</h3>
          <div class="ccm"><span>Casa</span><span>Carro</span><span>Moto</span></div>
          <p>${ctx.T("virada_antes")}</p>
        </div>
        <div class="virada-seta" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M10 24h28M28 14l10 10-10 10"/></svg></div>
        <div class="virada-depois">
          <h3>${ctx.T("virada_depois_t")}</h3>
          <p class="virada-frase">${ctx.T("virada_frase")}</p>
          <ul class="hoje">${lista(ctx.T("virada_usos")).map((u, i) => `<li>${icone(ICONES_HOJE[i] || "casa")}<span>${u}</span></li>`).join("")}</ul>
        </div>
      </div>`
  };

  // ---------- Mapa do API ----------
  const mapa = {
    id: "mapa-api", nome: "Um produto, três caminhos",
    html: ctx => `
      <h2 class="titulo">${ctx.T("mapa_titulo")}</h2>
      <div class="mapa centro-vertical">
        ${[["aquisicao", "A", "Aquisição"], ["poupanca", "P", "Poupança"], ["investimento", "I", "Investimento"]].map(([k, l, n]) => `
          <button class="caminho" data-pilar="${k}">
            <span class="caminho-letra">${l}</span>
            <h3>${n}</h3>
            <p>${ctx.T("mapa_" + k)}</p>
            <span class="caminho-ir">Ver na prática</span>
          </button>`).join("")}
      </div>`,
    iniciar: (el, ctx) => el.querySelectorAll("[data-pilar]").forEach(b => b.addEventListener("click", () => {
      const telas = ((window.PILARES || {})[b.dataset.pilar] || { telas: [] }).telas.map(t => t.id);
      ctx.irPara(telas);
    }))
  };

  // ---------- Síntese ----------
  const sintese = {
    id: "sintese", nome: "Segurança, liberdade de escolha e rendimento",
    html: ctx => {
      const col = (k, ico) => `
        <div class="pilar-sint">
          ${icone(ico)}
          <h3>${ctx.T("sint_" + k + "_t")}</h3>
          <p class="sint-frase">${ctx.T("sint_" + k + "_frase")}</p>
          <ul>${lista(ctx.T("sintese_" + k)).map(i => `<li>${i}</li>`).join("")}</ul>
        </div>`;
      return `
      <h2 class="titulo">${ctx.T("sintese_titulo")}</h2>
      <div class="sintese centro-vertical">${col("seg", "escudo")}${col("liq", "caminhos")}${col("ren", "grafico")}</div>`;
    }
  };

  // ---------- Casos reais (só aparecem os autorizados na planilha) ----------
  const casos = {
    id: "casos", nome: "Casos reais",
    html: ctx => {
      const cs = ctx.D.casos || [];
      return `
      <h2 class="titulo">${ctx.T("casos_titulo")}</h2>
      <div class="casos centro-vertical">${cs.map(c => `
        <div class="caso">
          ${c.perfil ? `<span class="opcao-selo">${ctx.esc(c.perfil)}</span>` : ""}
          <h3>${ctx.esc(c.titulo)}</h3>
          ${c.credito ? `<p class="caso-cred">${ctx.esc(c.credito)}</p>` : ""}
          ${c.fez ? `<p>${ctx.esc(c.fez)}</p>` : ""}
          ${c.resultado ? `<p class="caso-res">${ctx.esc(c.resultado)}</p>` : ""}
        </div>`).join("")}
      </div>
      <p class="aviso">Casos de clientes Redecon, mostrados com autorização ou sem identificação. Resultados passados não garantem resultados futuros.</p>`;
    }
  };

  // ---------- Fechamento personalizado ----------
  const fechamento = {
    id: "fechamento", nome: "O seu plano",
    html: ctx => {
      const ctl = A().controles(ctx, ["credito", "prazo", "parcela", "mes"]).replace(/^<div class="controles">|<\/div>$/g, "");
      return `
      <h2 class="titulo" data-alvo="titulo"></h2>
      <div class="controles">
        <div class="ctl"><span>Calcular pela</span><div class="seg" role="group">
          <button data-modo="parcela" aria-pressed="false">Parcela</button><button data-modo="credito" aria-pressed="true">Crédito</button></div></div>
        <label class="ctl" data-campo="parcela" hidden><span>Parcela que cabe no mês</span><input data-f="parcela" inputmode="numeric"></label>
        ${ctl}
      </div>
      <div class="plano" data-alvo="plano"></div>
      <div class="proximo"><strong>${ctx.T("fech_proximo_t")}</strong> ${ctx.T("fech_proximo")}</div>
      <div data-alvo="rodape"></div>`;
    },
    iniciar: (el, ctx) => {
      const H = A();
      let modo = "credito", parcelaDesejada = null;
      const campoParc = el.querySelector('[data-campo="parcela"]'), inParc = el.querySelector('[data-f="parcela"]');
      const campoCred = el.querySelector('[data-ctl="credito"]').closest(".ctl");
      const parcelaAtual = () => { const b = H.base(ctx); return Motor.parcela({ credito: b.credito, prazo: b.prazo, taxaTotal: b.taxaTotal, meia: b.meia }); };
      const aplicarModo = () => {
        el.querySelectorAll("[data-modo]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.modo === modo)));
        campoParc.hidden = modo !== "parcela"; campoCred.hidden = modo === "parcela";
        if (modo === "parcela") { parcelaDesejada = parcelaAtual(); inParc.value = ctx.fmtReal(parcelaDesejada, 2); }
      };
      el.querySelectorAll("[data-modo]").forEach(b => b.addEventListener("click", () => { modo = b.dataset.modo; aplicarModo(); }));
      inParc.addEventListener("change", () => {
        const v = Number(String(inParc.value).replace(/[^\d,]/g, "").replace(",", ".")) || 0;
        if (v > 0) { parcelaDesejada = v; ctx.mudou(); }
      });
      H.reagir(el, ctx, () => {
        const e = ctx.estado, f = ctx.fmtReal;
        // No modo parcela, o crédito acompanha a parcela digitada (inclusive ao trocar prazo ou meia/cheia)
        if (modo === "parcela" && parcelaDesejada) {
          const b0 = H.base(ctx);
          e.credito = Math.round(Motor.creditoPelaParcela({ valorParcela: parcelaDesejada, prazo: b0.prazo, taxaTotal: b0.taxaTotal, meia: b0.meia }));
          if (document.activeElement !== inParc) inParc.value = ctx.fmtReal(parcelaDesejada, 2);
        }
        const b = H.base(ctx), p = b.p, V = b.credito;
        const cli = ctx.ajustes.cliente;
        el.querySelector('[data-alvo="titulo"]').innerHTML = cli ? `${ctx.esc(cli)}, este é o seu plano` : ctx.T("fech_titulo");

        const s0 = H.cota(b, { modalidade: "nenhuma" });
        const parc = s0.meses[0].parcela;
        const sistema = e.sistema || "Price";
        const cmp = H.compararFinanciamento(b, { mes: e.mes, comReaj: true, sistema });
        const fin = cmp.fin;
        const m5 = Math.min(61, b.prazo), l5 = s0.meses[m5 - 1];
        const sc = H.cota(b, { mesContemplacao: e.mes, modalidade: e.modalidade });
        const c = sc.contemplacao, rende1 = c.creditoDisponivel * b.rendAm, pPos = sc.parcelaPosInicial;
        const venda = Motor.vendaCarta({ creditoDisponivel: c.creditoDisponivel, pagoAteContemplar: c.pagoTotal, agio: e.agio });
        const alug = c.creditoDisponivel * p.aluguel_am;
        const alt = ((ctx.D.alternativas && ctx.D.alternativas.length ? ctx.D.alternativas : DADOS_PADRAO.alternativas) || []).find(a => a.taxa_am > 0);
        const altV = alt ? c.creditoDisponivel * alt.taxa_am : 0;
        const card = (selo, corpo, cls = "") => `<div class="plano-card ${cls}"><span class="opcao-selo">${selo}</span>${corpo}</div>`;
        const contemp = `contemplado no mês ${e.mes}${e.modalidade === "embutido" ? ", com lance embutido" : ""}`;
        el.querySelector('[data-alvo="plano"]').innerHTML =
          card("Seu consórcio",
            H.numero("Crédito", f(V), `${b.prazo} meses`, "grande") +
            H.numero(b.meia ? "Meia parcela" : "Parcela", f(parc, 2), `taxa de ${ctx.fmtPct(b.taxaAdm / b.prazo, 3)} ao mês, sem juros`), "plano-destaque") +
          card(`Aquisição <span class="seg seg-mini seg-card" role="group" aria-label="Tabela do financiamento"><button data-sis="Price" aria-pressed="${sistema === "Price"}">Price</button><button data-sis="SAC" aria-pressed="${sistema === "SAC"}">SAC</button></span>`,
            H.numero("Juros de um financiamento", f(fin.totalJuros), `para financiar o mesmo valor (${sistema}) a ${ctx.fmtPct(p.fin_taxa_aa, 2)} ao ano + TR`) +
            H.numero("Mesmo com os reajustes, você economiza", f(cmp.economia), `contemplado no mês ${e.mes}, comparado ao financiamento, e sem ${f(fin.valorEntrada)} de entrada`, cmp.economia > 0 ? "positivo" : "")) +
          card("Poupança",
            H.numero(`Crédito em ${Math.floor((m5 - 1) / 12)} anos`, f(l5.creditoAtual), `+${f(l5.creditoAtual - V)} de reajuste`) +
            `<p class="plano-frase">O crédito aumenta todo ano e o custo real da cota diminui.</p>`) +
          card("Rendimento",
            H.numero("Rende no primeiro mês", f(rende1), contemp) +
            `<p class="resultado ${rende1 >= pPos ? "positivo" : ""}">${rende1 >= pPos ? `paga a parcela de ${f(pPos)} e sobram ${f(rende1 - pPos)}` : `cobre ${ctx.fmtPct(rende1 / pPos)} da parcela de ${f(pPos)}`}</p>`) +
          card("Venda da carta",
            H.numero("Vende a carta por", f(venda.recebe), contemp) +
            H.numero(venda.lucro >= 0 ? "Lucro" : "Resultado", f(venda.lucro), `sobre ${f(c.pagoTotal)} pagos`, venda.lucro > 0 ? "positivo" : "")) +
          card("Renda com aluguel",
            H.numero("Aluguel tradicional", f(alug) + " por mês", `${ctx.fmtPct(p.aluguel_am, 1)} do imóvel`) +
            (alt ? H.numero(ctx.esc(alt.nome), f(altV) + " por mês", `${ctx.fmtPct(alt.taxa_am, 1)} do investido`, altV >= pPos ? "positivo" : "") : ""));
        el.querySelectorAll("[data-sis]").forEach(x => x.addEventListener("click", () => { e.sistema = x.dataset.sis; ctx.mudou(); }));
        el.querySelector('[data-alvo="rodape"]').innerHTML = H.rodape(ctx, {
          itens: [
            `Reajuste de ${ctx.fmtPct(b.reajuste)} ao ano; crédito contemplado rendendo ${ctx.fmtPct(p.pct_selic_credito)} da Selic (${ctx.fmtPct(p.selic, 2)} ao ano), líquido de IR; venda com ágio de ${ctx.fmtPct(e.agio)}.`,
            `Financiamento ${sistema} com ${ctx.fmtPct(p.fin_entrada)} de entrada e ${p.fin_prazo} meses; aluguel sobre o crédito disponível na contemplação.`
          ]
        });
      });
      aplicarModo();
    }
  };

  // ---------- Encerramento ----------
  // ---------- Proposta direcionada ----------
  // Um objetivo principal define o foco (números grandes + gráfico); os demais entram como "também possível".
  // Nada fica salvo: o PDF é gerado no próprio aparelho.
  const OBJ = [
    { k: "comprar", nome: "Comprar ou construir", ico: "casa" },
    { k: "quitar", nome: "Quitar financiamento", ico: "escudo" },
    { k: "render", nome: "Fazer o crédito render", ico: "rende" },
    { k: "vender", nome: "Vender a carta", ico: "venda" },
    { k: "aluguel", nome: "Renda com aluguel", ico: "aluguel" },
    { k: "poupar", nome: "Poupar com disciplina", ico: "grafico" }
  ];
  function validade(hoje = new Date()) {
    const d = hoje.getDate(), m = hoje.getMonth(), a = hoje.getFullYear();
    const alvo = d <= 10 ? new Date(a, m, 10) : d <= 25 ? new Date(a, m, 25) : new Date(a, m + 1, 10);
    return alvo.toLocaleDateString("pt-BR");
  }
  // Todos os números da proposta, a partir do plano ("O seu plano")
  function numerosProposta(ctx) {
    const H = A(), e = ctx.estado, b = H.base(ctx), p = b.p;
    const parc = Motor.parcela({ credito: b.credito, prazo: b.prazo, taxaTotal: b.taxaTotal, meia: b.meia });
    const sc = H.cota(b, { mesContemplacao: e.mes, modalidade: e.modalidade });
    const c = sc.contemplacao, cred = c.creditoDisponivel;
    const cmp = H.compararFinanciamento(b, { mes: e.mes, comReaj: true, sistema: e.sistema || "Price" });
    const venda = Motor.vendaCarta({ creditoDisponivel: cred, pagoAteContemplar: c.pagoTotal, agio: e.agio });
    const parcelas = sc.meses.filter(x => x.mes <= e.mes).map(x => x.parcela);
    const cdb = Motor.aplicarAportes({ aportes: parcelas.map((valor, k) => ({ mes: k + 1, valor })), mesFinal: e.mes, taxaAa: b.cdbAa, tabelaIR: b.ir });
    const alts = (ctx.D.alternativas && ctx.D.alternativas.length ? ctx.D.alternativas : DADOS_PADRAO.alternativas) || [];
    const alt = alts.find(a => a.taxa_am > 0);
    const s0 = H.cota(b, { modalidade: "nenhuma" });
    const credAno = anos => s0.meses[Math.min(anos * 12 + 1, b.prazo) - 1].creditoAtual;
    const f4 = (ctx.D.funil || []).slice().sort((x, y) => x.concorrencia - y.concorrencia)[0];
    return { b, e, p, parc, sc, c, cred, cmp, venda, cdb, alt, credAno, f4,
      rende1: cred * b.rendAm, parcPos: sc.parcelaPosInicial, fimGrupo: sc.meses[sc.meses.length - 1].creditoDisponivel,
      alug: cred * p.aluguel_am, altV: alt ? cred * alt.taxa_am : 0, sistema: e.sistema || "Price" };
  }
  // Barras horizontais simples (funcionam na tela e no PDF)
  const barras = (itens, f) => {
    const max = Math.max(...itens.map(i => Math.abs(i.v)), 1);
    return `<div class="pf-barras">${itens.map(i => `
      <div class="pf-barra"><span>${i.r}</span><div class="pf-trilho"><i class="${i.cls || ""}" style="width:${Math.max(3, Math.abs(i.v) / max * 100).toFixed(1)}%"></i></div><strong>${f(i.v)}</strong></div>`).join("")}</div>`;
  };
  // Foco de cada objetivo: destaque principal, apoio e gráfico
  function focoProposta(k, n, ctx) {
    const f = ctx.fmtReal, mc = `contemplado no mês ${n.e.mes}`;
    switch (k) {
      case "comprar": case "quitar": return {
        grande: f(n.cmp.economia), legenda: k === "quitar" ? "a menos que manter um financiamento do mesmo valor" : "a menos que financiar o mesmo valor",
        apoio: [["Entrada", "Sem entrada"], ["Juros", "Sem juros"], ["Entrada do financiamento", f(n.cmp.fin.valorEntrada)]],
        graf: barras([{ r: "Financiamento", v: n.cmp.fin.totalPago, cls: "neutra" }, { r: "Consórcio", v: n.cmp.total }], f),
        nota: `Total pago no fim, já com reajustes, ${mc}.` };
      case "render": return {
        grande: f(n.rende1), legenda: `de rendimento no 1º mês, ${mc}`,
        apoio: [["Crédito aplicado", f(n.cred)], ["Parcela depois", f(n.parcPos)], ["No fim do grupo", f(n.fimGrupo)]],
        graf: barras([{ r: "Rendimento", v: n.rende1 }, { r: "Parcela", v: n.parcPos, cls: "neutra" }], f),
        nota: "O rendimento é sobre o crédito total, não sobre o valor pago." };
      case "vender": return {
        grande: f(n.venda.recebe), legenda: `valor de venda da carta, ${mc}`,
        apoio: [["Você pagou", f(n.c.pagoTotal)], ["Lucro na venda", f(n.venda.lucro)], ["Mesmas parcelas no CDB", f(n.cdb.ganho)]],
        graf: barras([{ r: "Lucro na venda", v: n.venda.lucro }, { r: "Ganho no CDB", v: n.cdb.ganho, cls: "neutra" }], f),
        nota: `Ágio de referência de ${ctx.fmtPct(n.e.agio)} sobre o crédito.` };
      case "aluguel": return {
        grande: f(Math.max(n.alug, n.altV)), legenda: `por mês de aluguel estimado${n.altV > n.alug && n.alt ? " (" + ctx.esc(n.alt.nome).toLowerCase() + ")" : ""}`,
        apoio: [["Aluguel tradicional", f(n.alug)], [n.alt ? ctx.esc(n.alt.nome) : "Fora do tradicional", f(n.altV)], ["Parcela depois", f(n.parcPos)]],
        graf: barras([{ r: "Tradicional", v: n.alug }, ...(n.alt ? [{ r: ctx.esc(n.alt.nome), v: n.altV }] : []), { r: "Parcela", v: n.parcPos, cls: "neutra" }], f),
        nota: `Imóvel de ${f(n.cred)}, ${mc}.` };
      default: return {
        grande: f(n.credAno(5)), legenda: "de crédito em 5 anos, com o reajuste anual",
        apoio: [["Crédito hoje", f(n.b.credito)], ["Em 5 anos", f(n.credAno(5))], ["Em 10 anos", f(n.credAno(10))]],
        graf: barras([{ r: "Hoje", v: n.b.credito, cls: "neutra" }, { r: "5 anos", v: n.credAno(5) }, { r: "10 anos", v: n.credAno(10) }], f),
        nota: `Reajuste de ${ctx.fmtPct(n.b.reajuste)} ao ano enquanto aguarda a contemplação.` };
    }
  }
  // Um número por objetivo, para os quadros "também possível"
  const extraProposta = (k, n, ctx) => {
    const f = ctx.fmtReal;
    return ({
      comprar: ["Economia vs. financiamento", f(n.cmp.economia)],
      quitar: ["Economia vs. financiamento", f(n.cmp.economia)],
      render: ["Rende no 1º mês", f(n.rende1)],
      vender: ["Venda da carta", f(n.venda.recebe)],
      aluguel: ["Aluguel estimado", f(Math.max(n.alug, n.altV)) + "/mês"],
      poupar: ["Crédito em 5 anos", f(n.credAno(5))]
    })[k];
  };
  const proposta = {
    id: "proposta", nome: "Proposta direcionada",
    html: ctx => `
      <h2 class="titulo">${ctx.T("prop_titulo")}</h2>
      <div class="prop">
        <div class="prop-escolhas">
          <p class="prop-rotulo">Objetivo principal</p>
          <div class="prop-chips">${OBJ.map(o => `<button class="chip-op" data-obj="${o.k}" aria-pressed="false">${o.nome}</button>`).join("")}</div>
          <p class="prop-rotulo">Também mostrar</p>
          <div class="prop-chips" data-alvo="extras"></div>
          <label class="tela-op"><input type="checkbox" data-estrategia checked> Estratégia de contemplação</label>
          <p class="prop-nota">Crédito, parcela e mês de contemplação vêm de "O seu plano".</p>
          <button class="btn btn-pdf" data-acao="pdf">Gerar PDF da proposta</button>
        </div>
        <div class="prop-folha-caixa"><div class="prop-folha" data-alvo="folha"></div></div>
      </div>`,
    iniciar: (el, ctx) => {
      // Para cada objetivo, o que costuma entrar como "plus" (o apresentador ajusta)
      const PLUS = { comprar: ["render", "vender", "poupar"], quitar: ["render", "poupar"], render: ["vender", "aluguel"],
        vender: ["render", "comprar"], aluguel: ["comprar", "render"], poupar: ["comprar", "render"] };
      let principal = "comprar";
      const extras = new Set(PLUS.comprar);
      let estrategia = true;
      const desenharEscolhas = () => {
        el.querySelectorAll("[data-obj]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.obj === principal)));
        el.querySelector('[data-alvo="extras"]').innerHTML = OBJ.filter(o => o.k !== principal && !(principal === "comprar" && o.k === "quitar") && !(principal === "quitar" && o.k === "comprar"))
          .map(o => `<button class="chip-op chip-mini" data-extra="${o.k}" aria-pressed="${extras.has(o.k)}">${o.nome}</button>`).join("");
        el.querySelectorAll("[data-extra]").forEach(b => b.addEventListener("click", () => {
          extras.has(b.dataset.extra) ? extras.delete(b.dataset.extra) : extras.add(b.dataset.extra);
          desenharEscolhas(); montar();
        }));
      };
      const montar = () => {
        if (!el.isConnected) { document.removeEventListener("redecon:estado", montar); return; }
        const n = numerosProposta(ctx), f = ctx.fmtReal, aj = ctx.ajustes, ii = k => inst(ctx, k);
        const obj = OBJ.find(o => o.k === principal), foco = focoProposta(principal, n, ctx);
        const lista = [...extras].filter(k => k !== principal && !(principal === "comprar" && k === "quitar") && !(principal === "quitar" && k === "comprar"));
        const cols = lista.length <= 3 ? Math.max(1, lista.length) : lista.length === 4 ? 2 : 3;
        const fun = ctx.D.funil || [];
        el.querySelector('[data-alvo="folha"]').innerHTML = `
          <header class="pf-topo">
            <img src="img/logo-positivo.png" alt="Redecon Consórcios">
            <div><strong>${ctx.T("prop_titulo")}</strong><span>${new Date().toLocaleDateString("pt-BR")}${aj.apresentador ? " · " + ctx.esc(aj.apresentador) : ""}</span></div>
          </header>
          <div class="pf-faixa">
            <div class="pf-cli">${aj.cliente ? ctx.esc(aj.cliente) : "Seu plano"}<span>Objetivo: <strong>${obj.nome}</strong></span></div>
            <div class="pf-kpi"><span>Crédito</span><strong>${f(n.b.credito)}</strong></div>
            <div class="pf-kpi"><span>${n.b.meia ? "Meia parcela" : "Parcela"}</span><strong>${f(n.parc, 2)}</strong></div>
          </div>
          <section class="pf-foco">
            <div class="pf-foco-esq">
              <div class="pf-foco-tit">${icone(obj.ico)}<span>${obj.nome}</span></div>
              <strong class="pf-grande">${foco.grande}</strong>
              <span class="pf-legenda">${foco.legenda}</span>
              <div class="pf-apoio">${foco.apoio.map(([r, v]) => `<div><span>${r}</span><strong>${v}</strong></div>`).join("")}</div>
            </div>
            <div class="pf-foco-dir">${foco.graf}<p class="pf-nota">${foco.nota}</p></div>
          </section>
          <div class="pf-indica"><strong>Indicação Redecon</strong><p>${ctx.T("prop_ind_" + principal)}</p></div>
          ${lista.length ? `<p class="pf-sec">Também possível com o seu crédito</p>
          <div class="pf-extras" style="grid-template-columns:repeat(${cols},minmax(0,1fr))">${lista.map(k => {
            const o = OBJ.find(x => x.k === k), [r, v] = extraProposta(k, n, ctx);
            return `<div class="pf-extra">${icone(o.ico)}<div><span>${r}</span><strong>${v}</strong></div></div>`; }).join("")}</div>` : ""}
          ${estrategia && fun.length ? `<p class="pf-sec">Como chegar lá: parcelas em dia</p>
          <div class="pf-trilha">${fun.map(x => `<div class="${x === n.f4 ? "melhor" : ""}"><strong>${ctx.fmtPct(x.concorrencia)}</strong><span>${ctx.esc(x.modalidade)}</span></div>`).join("")}</div>
          <p class="pf-nota">Concorrência média histórica por modalidade. Lance embutido de até ${ctx.fmtPct(n.p.lance_embutido)} do crédito.</p>` : ""}
          <p class="pf-aviso">${ctx.T("prop_aviso")} Premissas: contemplação no mês ${n.e.mes} por ${n.e.modalidade === "embutido" ? "lance embutido" : "sorteio"}; reajuste de ${ctx.fmtPct(n.b.reajuste)} ao ano; crédito rendendo ${ctx.fmtPct(n.p.pct_selic_credito)} da Selic.</p>
          <footer class="pf-rodape">
            <span>Proposta válida até <strong>${validade()}</strong></span>
            <span>${ii("ct_telefone")} · ${ii("ct_instagram")} · ${ii("ct_site")}</span>
          </footer>`;
      };
      el.querySelectorAll("[data-obj]").forEach(bt => bt.addEventListener("click", () => { principal = bt.dataset.obj; extras.clear(); PLUS[principal].forEach(k => extras.add(k)); desenharEscolhas(); montar(); }));
      el.querySelector("[data-estrategia]").addEventListener("change", ev => { estrategia = ev.target.checked; montar(); });
      el.querySelector('[data-acao="pdf"]').addEventListener("click", () => {
        let caixa = document.getElementById("impressao");
        if (!caixa) { caixa = document.createElement("div"); caixa.id = "impressao"; document.body.appendChild(caixa); }
        caixa.innerHTML = `<div class="prop-folha">${el.querySelector('[data-alvo="folha"]').innerHTML}</div>`;
        const tituloAntes = document.title;
        document.title = "Proposta Redecon" + (ctx.ajustes.cliente ? " - " + ctx.ajustes.cliente : "");
        const img = caixa.querySelector("img");
        const imprimir = () => { window.print(); document.title = tituloAntes; };
        img && !img.complete ? img.addEventListener("load", imprimir, { once: true }) : imprimir();
      });
      desenharEscolhas();
      document.addEventListener("redecon:estado", montar);
      el._aoMostrar = montar;
      montar();
    }
  };

  const encerramento = {
    id: "encerramento", nome: "Obrigado", classe: "fim-slide",
    html: ctx => {
      const aj = ctx.ajustes, ii = k => inst(ctx, k);
      return `
      <div class="fim">
        <img class="fim-foto" src="img/equipe.jpg" alt="Equipe Redecon Consórcios">
        <div class="fim-texto">
          <img class="fim-logo" src="img/logo-negativo.png" alt="Redecon Consórcios">
          <div class="fim-corpo">
          <h2 class="titulo">${ctx.T("fim_titulo")}${aj.cliente ? ", " + ctx.esc(aj.cliente) : ""}</h2>
          <p class="sub">${ctx.T("fim_sub")}</p>
          <div class="stats stats-2 stats-mini">${["rd_clientes", "rd_creditos", "rd_anos", "rd_bens"].map(k => grande(ctx, k)).join("")}</div>
          <div class="fim-contato">
            <a href="${ii("ct_instagram_url")}" target="_blank" rel="noopener"><img class="qr" src="img/qr-instagram.svg" alt="QR code do Instagram da Redecon"></a>
            <div>
              <strong>${ii("ct_instagram")}</strong>
              <span>${ctx.T("fim_qr")}</span>
              <span>${ii("ct_site")} · ${ii("ct_telefone")}</span>
              ${aj.apresentador ? `<span>Apresentado por ${ctx.esc(aj.apresentador)}</span>` : ""}
            </div>
          </div>
          </div>
        </div>
      </div>`;
    }
  };

  window.ETAPA4 = { quemRedecon, quemHs, virada, mapa, sintese, casos, fechamento, proposta, encerramento };
})();
