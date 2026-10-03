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
        const alt = (ctx.D.alternativas && ctx.D.alternativas[0]) || (DADOS_PADRAO.alternativas || [])[0];
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

  window.ETAPA4 = { quemRedecon, quemHs, virada, mapa, sintese, casos, fechamento, encerramento };
})();
