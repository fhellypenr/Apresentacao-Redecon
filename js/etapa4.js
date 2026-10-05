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
    // Etapa 1: só o consórcio do passado, que é riscado. Etapa 2 (botão ou "próxima"): o consórcio de hoje entra
    // e o passado vai para o canto esquerdo, menor.
    html: ctx => `
      <h2 class="titulo">${ctx.T("virada_titulo")}</h2>
      <div class="virada virada-etapa1 centro-vertical">
        <div class="virada-antes">
          <span class="carimbo" aria-hidden="true"></span>
          <h3>${ctx.T("virada_antes_t")}</h3>
          <div class="ccm"><span>Casa</span><span>Carro</span><span>Moto</span></div>
          <p>${ctx.T("virada_antes")}</p>
        </div>
        <button class="btn btn-virada" data-acao="virada">${ctx.T("virada_botao")} <span aria-hidden="true">→</span></button>
        <div class="virada-seta" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M10 24h28M28 14l10 10-10 10"/></svg></div>
        <div class="virada-depois">
          <h3>${ctx.T("virada_depois_t")}</h3>
          <p class="virada-frase">${ctx.T("virada_frase")}</p>
          <ul class="hoje">${lista(ctx.T("virada_usos")).map((u, i) => `<li style="--k:${i}">${icone(ICONES_HOJE[i] || "casa")}<span>${u}</span></li>`).join("")}</ul>
        </div>
      </div>`,
    iniciar: (el) => {
      const caixa = el.querySelector(".virada");
      const etapa2 = () => {
        if (!caixa.classList.contains("virada-etapa1")) return;
        const antes = caixa.querySelector(".virada-antes");
        const r0 = antes.getBoundingClientRect();
        caixa.classList.remove("virada-etapa1"); caixa.classList.add("virada-etapa2");
        if (!document.documentElement.classList.contains("animado") || !antes.animate) return;
        const r1 = antes.getBoundingClientRect();
        const dx = r0.left - r1.left, dy = r0.top - r1.top, sx = r0.width / r1.width, sy = r0.height / r1.height;
        antes.animate([
          { transformOrigin: "top left", transform: `translate(${dx}px, ${dy}px) scale(${sx}, ${sy})`, opacity: 1 },
          { transformOrigin: "top left", transform: "none", opacity: .55 }
        ], { duration: 650, easing: "cubic-bezier(.2,.8,.2,1)" });
      };
      el.querySelector('[data-acao="virada"]').addEventListener("click", etapa2);
      // "Próxima" na etapa 1 mostra o consórcio de hoje antes de trocar de tela
      el._avancar = () => { if (caixa.classList.contains("virada-etapa1")) { etapa2(); return true; } return false; };
      el._reiniciar = () => { caixa.classList.remove("virada-etapa2"); caixa.classList.add("virada-etapa1"); };
    }
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
      <button class="btn-gerar-prop" data-acao="abrir-proposta" title="Gerar proposta direcionada"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5M9 13h6M9 17h4"/></svg><span>Gerar proposta</span></button>
      <div class="controles">
        <div class="ctl"><span>Calcular pela</span><div class="seg" role="group">
          <button data-modo="parcela" aria-pressed="false">Parcela</button><button data-modo="credito" aria-pressed="true">Crédito</button></div></div>
        <label class="ctl" data-campo="parcela" hidden><span>Parcela que cabe no mês (R$)</span><input data-f="parcela" class="campo-moeda" inputmode="decimal"></label>
        ${ctl}
      </div>
      <div class="centro-vertical"><div class="plano" data-alvo="plano"></div>
      <div class="proximo"><strong>${ctx.T("fech_proximo_t")}</strong> ${ctx.T("fech_proximo")}</div></div>
      <div data-alvo="rodape"></div>`;
    },
    iniciar: (el, ctx) => {
      const H = A();
      el.querySelector('[data-acao="abrir-proposta"]').addEventListener("click", () => ctx.irPara("proposta"));
      let modo = "credito", parcelaDesejada = null;
      const campoParc = el.querySelector('[data-campo="parcela"]'), inParc = el.querySelector('[data-f="parcela"]');
      const campoCred = el.querySelector('[data-ctl="credito"]').closest(".ctl");
      const parcelaAtual = () => { const b = H.base(ctx); return Motor.parcela({ credito: b.credito, prazo: b.prazo, taxaTotal: b.taxaTotal, meia: b.meia }); };
      const aplicarModo = () => {
        el.querySelectorAll("[data-modo]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.modo === modo)));
        campoParc.hidden = modo !== "parcela"; campoCred.hidden = modo === "parcela";
        if (modo === "parcela") { parcelaDesejada = parcelaAtual(); inParc.value = Moeda.formatar(parcelaDesejada); }
      };
      el.querySelectorAll("[data-modo]").forEach(b => b.addEventListener("click", () => { modo = b.dataset.modo; aplicarModo(); }));
      inParc.addEventListener("change", () => {
        const v = Moeda.ler(inParc.value);
        if (v > 0) { parcelaDesejada = v; ctx.mudou(); }
      });
      H.reagir(el, ctx, () => {
        const e = ctx.estado, f = ctx.fmtReal;
        // No modo parcela, o crédito acompanha a parcela digitada (inclusive ao trocar prazo ou meia/cheia)
        if (modo === "parcela" && parcelaDesejada) {
          const b0 = H.base(ctx);
          e.credito = Math.round(Motor.creditoPelaParcela({ valorParcela: parcelaDesejada, prazo: b0.prazo, taxaTotal: b0.taxaTotal, meia: b0.meia }));
          if (document.activeElement !== inParc) inParc.value = Moeda.formatar(parcelaDesejada);
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
  // Linha de raciocínio da folha: 1) o plano  2) o foco (pilar principal do API, com o "de onde vem" de cada número)
  // 3) outros caminhos com o mesmo crédito  4) indicação Redecon  5) como chegar lá  6) premissas e validade.
  const PILAR = {
    aquisicao: { nome: "Aquisição", ico: "casa", blocos: ["comparativo"] },
    poupanca: { nome: "Poupança", ico: "grafico", blocos: ["reajuste"] },
    investimento: { nome: "Investimento", ico: "rende", blocos: ["rendendo", "venda", "aluguel"] }
  };
  const BLOCOS = {
    comparativo: { pilar: "aquisicao", nome: "Consórcio × financiamento", ico: "casa" },
    reajuste: { pilar: "poupanca", nome: "Crédito que cresce", ico: "grafico" },
    rendendo: { pilar: "investimento", nome: "Crédito rendendo", ico: "rende" },
    venda: { pilar: "investimento", nome: "Venda da carta", ico: "venda" },
    aluguel: { pilar: "investimento", nome: "Renda com aluguel", ico: "aluguel" }
  };
  // Sugestão inicial de blocos para cada pilar principal (o apresentador ajusta)
  const SUGESTAO = { aquisicao: ["comparativo", "reajuste"], poupanca: ["reajuste", "rendendo"], investimento: ["rendendo", "venda", "aluguel"] };
  function validade(hoje = new Date()) {
    const d = hoje.getDate(), m = hoje.getMonth(), a = hoje.getFullYear();
    const alvo = d <= 10 ? new Date(a, m, 10) : d <= 25 ? new Date(a, m, 25) : new Date(a, m + 1, 10);
    return alvo.toLocaleDateString("pt-BR");
  }
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
    const rendeVista = b.credito * H.cdbLiquidoAm(b);
    return { b, e, p, parc, c, cred, cmp, venda, cdb, alt, credAno, f4, rendeVista,
      rende1: cred * b.rendAm, parcPos: sc.parcelaPosInicial,
      alug: cred * p.aluguel_am, altV: alt ? cred * alt.taxa_am : 0, sistema: e.sistema || "Price" };
  }
  const barras = (itens, f) => {
    const max = Math.max(...itens.map(i => Math.abs(i.v)), 1);
    return `<div class="pf-barras">${itens.map(i => `
      <div class="pf-barra"><span>${i.r}</span><div class="pf-trilho"><i class="${i.cls || ""}" style="width:${Math.max(3, Math.abs(i.v) / max * 100).toFixed(1)}%"></i></div><strong>${f(i.v)}</strong></div>`).join("")}</div>`;
  };
  // Conteúdo de cada bloco: contexto (de onde vem o número), destaque, pares e gráfico
  function bloco(k, n, ctx) {
    const f = v => ctx.fmtReal(v, 2), mes = n.e.mes;
    switch (k) {
      case "comparativo": return {
        contexto: `Imóvel de ${f(n.b.credito)}, com reajustes e contemplação no mês ${mes}`, grafTit: "Total pago pelo mesmo imóvel",
        destaque: f(n.cmp.economia), dLeg: "a menos que no financiamento",
        pares: [[`Financiamento (${n.sistema}), total pago`, f(n.cmp.fin.totalPago)], ["Consórcio, total pago", f(n.cmp.total)], ["À vista, deixaria de render", f(n.rendeVista) + "/mês"]],
        graf: barras([{ r: "Financiamento", v: n.cmp.fin.totalPago, cls: "neutra" }, { r: "Consórcio", v: n.cmp.total }], f) };
      case "reajuste": return {
        contexto: `Enquanto aguarda a contemplação, o crédito sobe ${ctx.fmtPct(n.b.reajuste)} ao ano`, grafTit: "Crédito ao longo do tempo",
        destaque: f(n.credAno(5)), dLeg: "de crédito em 5 anos",
        pares: [["Crédito hoje", f(n.b.credito)], ["Em 5 anos", f(n.credAno(5))], ["Em 10 anos", f(n.credAno(10))]],
        graf: barras([{ r: "Hoje", v: n.b.credito, cls: "neutra" }, { r: "5 anos", v: n.credAno(5) }, { r: "10 anos", v: n.credAno(10) }], f) };
      case "rendendo": return {
        contexto: `Contemplado no mês ${mes}, crédito de ${f(n.cred)} aplicado`, grafTit: "Por mês: rendimento × parcela",
        destaque: f(n.rende1), dLeg: "de rendimento no 1º mês",
        pares: [["Crédito aplicado", f(n.cred)], ["Rendimento no 1º mês", f(n.rende1)], ["Parcela depois de contemplar", f(n.parcPos)]],
        graf: barras([{ r: "Rendimento", v: n.rende1 }, { r: "Parcela", v: n.parcPos, cls: "neutra" }], f) };
      case "venda": return {
        contexto: `Contemplado no mês ${mes}, tendo pago ${f(n.c.pagoTotal)}`, grafTit: "Lucro na venda × mesmas parcelas no CDB",
        destaque: f(n.venda.recebe), dLeg: `valor de venda da carta (ágio de ${ctx.fmtPct(n.e.agio)})`,
        pares: [["Total pago até a contemplação", f(n.c.pagoTotal)], ["Valor de venda", f(n.venda.recebe)], ["Lucro na venda", f(n.venda.lucro)]],
        graf: barras([{ r: "Venda", v: n.venda.lucro }, { r: "CDB", v: n.cdb.ganho, cls: "neutra" }], f) };
      default: return {
        contexto: `Crédito de ${f(n.cred)} investido em um imóvel`, grafTit: "Por mês: aluguel × parcela",
        destaque: f(Math.max(n.alug, n.altV)) + "/mês", dLeg: "de aluguel estimado",
        pares: [["Aluguel tradicional", f(n.alug) + "/mês"], ...(n.alt ? [[ctx.esc(n.alt.nome), f(n.altV) + "/mês"]] : []), ["Parcela depois de contemplar", f(n.parcPos)]],
        graf: barras([{ r: "Tradicional", v: n.alug }, ...(n.alt ? [{ r: ctx.esc(n.alt.nome), v: n.altV }] : []), { r: "Parcela", v: n.parcPos, cls: "neutra" }], f) };
    }
  }
  // Premissas da folha: só as que valem para os blocos escolhidos
  function premissas(n, marcados, ctx) {
    const tem = k => marcados.includes(k), pct = ctx.fmtPct;
    const l = [`contemplação considerada no mês ${n.e.mes}${n.e.modalidade === "embutido" ? ", com lance embutido" : ""}`,
      `reajuste anual de ${pct(n.b.reajuste)}`];
    if (tem("comparativo")) l.push(`financiamento ${n.sistema} a ${pct(n.p.fin_taxa_aa, 2)} ao ano + TR, com ${pct(n.p.fin_entrada)} de entrada e ${n.p.fin_prazo} meses; à vista, valor aplicado em CDB líquido de IR`);
    if (tem("rendendo")) l.push(`rendimento sobre o crédito total, e não apenas sobre o que foi pago`);
    if (tem("venda")) l.push(`liberdade de vender a carta contemplada, com ágio de ${pct(n.e.agio)}`);
    if (tem("aluguel")) l.push(`aluguel tradicional de ${pct(n.p.aluguel_am, 1)} ao mês${n.alt ? `; ${ctx.esc(n.alt.nome).toLowerCase()} de ${pct(n.alt.taxa_am, 1)} ao mês` : ""}`);
    return l.join("; ");
  }
  const proposta = {
    id: "proposta", nome: "Proposta direcionada", oculta: true,
    html: ctx => `
      <div class="prop-topo"><h2 class="titulo">${ctx.T("prop_titulo")}</h2><button class="btn-voltar-plano" data-acao="voltar-plano"><span aria-hidden="true">←</span> Voltar ao plano</button></div>
      <div class="prop">
        <div class="prop-escolhas">
          <label class="prop-nome"><span class="prop-rotulo">Nome do cliente</span><input data-cliente type="text" autocomplete="off" placeholder="Digite o nome" value="${ctx.esc(ctx.ajustes.cliente || "")}"></label>
          <p class="prop-rotulo">Foco do cliente (Método API)</p>
          <div class="prop-chips">${Object.entries(PILAR).map(([k, p]) => `<button class="chip-op" data-pilar-p="${k}" aria-pressed="false">${p.nome}</button>`).join("")}</div>
          <p class="prop-rotulo">Blocos da proposta</p>
          <div class="prop-blocos">${Object.entries(PILAR).map(([pk, p]) => `
            <div class="prop-grupo"><span>${p.nome}</span>${p.blocos.map(k => `<label class="tela-op"><input type="checkbox" data-bloco="${k}"> ${BLOCOS[k].nome}</label>`).join("")}</div>`).join("")}
            <div class="prop-grupo"><span>Contemplação</span><label class="tela-op"><input type="checkbox" data-estrategia checked> Como chegar lá (fidelidades)</label></div>
          </div>
          <p class="prop-nota">Crédito, parcela e mês de contemplação vêm de "O seu plano". A data e a validade entram sozinhas.</p>
          <button class="btn btn-pdf" data-acao="pdf">Gerar PDF da proposta</button>
        </div>
        <div class="prop-folha-caixa"><div class="prop-folha" data-alvo="folha"></div></div>
      </div>`,
    iniciar: (el, ctx) => {
      el.querySelector('[data-acao="voltar-plano"]').addEventListener("click", () => ctx.irPara("fechamento"));
      let pilar = "aquisicao", estrategia = true;
      const blocos = new Set(SUGESTAO.aquisicao);
      const sincronizar = () => {
        el.querySelectorAll("[data-pilar-p]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.pilarP === pilar)));
        el.querySelectorAll("[data-bloco]").forEach(c => { c.checked = blocos.has(c.dataset.bloco); });
      };
      const montar = () => {
        if (!el.isConnected) { document.removeEventListener("redecon:estado", montar); return; }
        const n = numerosProposta(ctx), f = ctx.fmtReal, aj = ctx.ajustes, ii = k => inst(ctx, k);
        const P = PILAR[pilar];
        // Foco: todos os blocos marcados do pilar principal vêm primeiro e destacados; os demais vêm depois
        const marcados = Object.keys(BLOCOS).filter(k => blocos.has(k));
        const ehDoFoco = k => BLOCOS[k].pilar === pilar;
        const ordem = [...marcados.filter(ehDoFoco), ...marcados.filter(k => !ehDoFoco(k))];
        const fun = ctx.D.funil || [];
        el.querySelector('[data-alvo="folha"]').innerHTML = `
          <header class="pf-topo">
            <img src="img/logo-positivo.png" alt="Redecon Consórcios">
            <div><strong>${ctx.T("prop_titulo")}</strong><span>${new Date().toLocaleDateString("pt-BR")}${aj.apresentador ? " · " + ctx.esc(aj.apresentador) : ""}</span></div>
          </header>
          <div class="pf-cliente-linha">
            <span>Preparada para</span><strong>${aj.cliente ? ctx.esc(aj.cliente) : "Cliente"}</strong>
            <em class="pf-tag">${icone(P.ico)} Foco: ${P.nome}</em>
          </div>
          <div class="pf-corpo">
          <div class="pf-bloco">
            <p class="pf-sec"><b>1</b> Seu plano</p>
            <div class="pf-plano3">
              <div><span>Crédito</span><strong>${f(n.b.credito, 2)}</strong></div>
              <div><span>${n.b.meia ? "Meia parcela" : "Parcela"}</span><strong>${f(n.parc, 2)}</strong></div>
              <div class="pf-plano-sim"><span>Sem entrada · sem juros</span><small>Cenário: contemplação no mês ${n.e.mes}</small></div>
            </div>
          </div>

          ${marcados.length ? `<div class="pf-bloco">
            <p class="pf-sec"><b>2</b> O que o seu crédito pode fazer</p>
            <div class="pf-cards">${ordem.map(k => {
              const x = bloco(k, n, ctx), B = BLOCOS[k], ehFoco = ehDoFoco(k);
              return `<section class="pf-card${ehFoco ? " foco" : ""}">
                <header class="pf-card-topo">
                  ${icone(B.ico)}<div class="pf-card-nome"><small>${PILAR[B.pilar].nome}${ehFoco ? " · foco do cliente" : ""}</small><strong>${B.nome}</strong></div>
                  <p class="pf-card-ctx">${x.contexto}</p>
                </header>
                <div class="pf-destaque"><strong class="pf-grande">${x.destaque}</strong><span class="pf-legenda">${x.dLeg}</span></div>
                <div class="pf-card-grade">
                  <div class="pf-apoio">${x.pares.map(([r, v]) => `<div><span>${r}</span><strong>${v}</strong></div>`).join("")}</div>
                  <div class="pf-foco-dir"><p class="pf-graf-tit">${x.grafTit}</p>${x.graf}</div>
                </div>
              </section>`; }).join("")}</div>
          </div>` : ""}

          <div class="pf-bloco"><div class="pf-indica"><strong>Indicação Redecon</strong><p>${ctx.T("prop_ind_" + pilar)}</p></div></div>

          ${estrategia && fun.length ? `<div class="pf-bloco">
            <p class="pf-sec"><b>✓</b> Como chegar lá: parcelas em dia</p>
            <div class="pf-trilha">${fun.map(x => `<div class="${x === n.f4 ? "melhor" : ""}"><strong>${ctx.fmtPct(x.concorrencia)}</strong><span>${ctx.esc(x.modalidade)}</span></div>`).join("")}</div>
            <p class="pf-nota pf-nota-trilha">Concorrência média histórica por modalidade: quanto mais parcelas seguidas em dia, menor a concorrência. Lance embutido de até ${ctx.fmtPct(n.p.lance_embutido)} do crédito.</p>
          </div>` : ""}
          </div>
          <div class="pf-fim">
          <p class="pf-aviso">${ctx.T("prop_aviso")} Premissas: ${premissas(n, marcados, ctx)}.</p>
          <footer class="pf-rodape">
            <span>Proposta válida até <strong>${validade()}</strong></span>
            <span>${ii("ct_telefone")} · ${ii("ct_instagram")} · ${ii("ct_site")}</span>
          </footer>
          </div>`;
      };
      el.querySelector("[data-cliente]").addEventListener("input", ev => { ctx.definirCliente(ev.target.value); montar(); });
      el.querySelectorAll("[data-pilar-p]").forEach(bt => bt.addEventListener("click", () => {
        pilar = bt.dataset.pilarP; blocos.clear(); SUGESTAO[pilar].forEach(k => blocos.add(k)); sincronizar(); montar();
      }));
      el.querySelectorAll("[data-bloco]").forEach(c => c.addEventListener("change", () => { c.checked ? blocos.add(c.dataset.bloco) : blocos.delete(c.dataset.bloco); montar(); }));
      el.querySelector("[data-estrategia]").addEventListener("change", ev => { estrategia = ev.target.checked; montar(); });
      el.querySelector('[data-acao="pdf"]').addEventListener("click", () => {
        let caixa = document.getElementById("impressao");
        if (!caixa) { caixa = document.createElement("div"); caixa.id = "impressao"; document.body.appendChild(caixa); }
        caixa.innerHTML = `<div class="prop-folha">${el.querySelector('[data-alvo="folha"]').innerHTML}</div>`;
        // Mede a folha na largura do A4 e ajusta para 1 ou 2 páginas inteiras (rodapé sempre no pé)
        const folha = caixa.querySelector(".prop-folha");
        // Mede a altura natural (mesmas regras da impressão); 1 página se couber, senão 2; se nem em 2, compacta a fonte
        caixa.classList.remove("duas-paginas", "compacta");
        caixa.classList.add("medindo");
        const medir = () => folha.getBoundingClientRect().height * 25.4 / 96;
        let mm = medir();
        if (mm > 296) { caixa.classList.add("compacta"); mm = medir(); }          // tenta caber em 1 página
        if (mm > 296) {                                                            // não coube: 2 páginas
          caixa.classList.remove("compacta"); caixa.classList.add("duas-paginas"); mm = medir();
          if (mm > 568) caixa.classList.add("compacta");
        }
        const duas = caixa.classList.contains("duas-paginas");
        caixa.classList.remove("medindo");
        // Em 2 páginas a margem interna se repete no topo da 2ª e no pé da 1ª (24mm a mais)
        folha.style.minHeight = (duas ? 593 - 24 : 296.5) + "mm";
        const tituloAntes = document.title;
        document.title = "Proposta Redecon" + (ctx.ajustes.cliente ? " - " + ctx.ajustes.cliente : "");
        const img = caixa.querySelector("img");
        const imprimir = () => { window.print(); document.title = tituloAntes; };
        img && !img.complete ? img.addEventListener("load", imprimir, { once: true }) : imprimir();
      });
      sincronizar();
      document.addEventListener("redecon:estado", montar);
      el._aoMostrar = () => { const i = el.querySelector("[data-cliente]"); if (document.activeElement !== i) i.value = ctx.ajustes.cliente || ""; montar(); };
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
