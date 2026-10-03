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
        <div class="stats stats-2">${["rd_clientes", "rd_creditos", "rd_anos", "rd_bens"].map(k => grande(ctx, k)).join("")}</div>
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
      <div class="stats stats-3 centro-vertical">
        ${["hs_vendas_ano", "hs_vendas_mes", "hs_contemplacoes", "hs_cotas", "hs_corretores", "hs_cidades"].map(k => grande(ctx, k)).join("")}
      </div>`
  };

  // ---------- Virada de chave ----------
  const virada = {
    id: "virada", nome: "Do tradicional à inteligência financeira",
    html: ctx => {
      const p = ctx.D.parametros, pz = ctx.D.prazos.find(x => +x.prazo === +(p.ex_prazo || 220)) || ctx.D.prazos[0];
      const cred = p.ex_credito || 1e6;
      const meia = Motor.parcela({ credito: cred, prazo: +pz.prazo, taxaTotal: pz.taxa_adm + pz.fundo_reserva, meia: true });
      return `
      <h2 class="titulo">${ctx.T("virada_titulo")}</h2>
      <div class="virada centro-vertical">
        <div class="virada-antes">
          <h3>${ctx.T("virada_antes_t")}</h3>
          <div class="ccm"><span>Casa</span><span>Carro</span><span>Moto</span></div>
          <p>${ctx.T("virada_antes")}</p>
        </div>
        <div class="virada-seta" aria-hidden="true"><svg viewBox="0 0 48 48"><path d="M10 24h28M28 14l10 10-10 10"/></svg></div>
        <div class="virada-depois">
          <h3>${ctx.T("virada_depois_t")}</h3>
          <p class="virada-frase">${ctx.T("virada_frase")}</p>
          <p>${ctx.T("virada_depois")}</p>
          <p class="virada-exemplo">Exemplo: <strong>${ctx.fmtReal(cred)}</strong> de crédito por <strong>${ctx.fmtReal(meia, 2)}</strong> de meia parcela (${pz.prazo} meses).</p>
          <ul class="chips">${lista(ctx.T("virada_usos")).map(u => `<li>${u}</li>`).join("")}</ul>
        </div>
      </div>`;
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
    id: "sintese", nome: "Segurança, rendimento e liquidez",
    html: ctx => {
      const p = ctx.D.parametros, est = ctx.estado;
      const col = (n, t, stat, nota, chave) => `
        <div class="pilar-sint">
          <span class="sint-n">${n}</span><h3>${t}</h3>
          <div class="stat"><strong>${stat}</strong><span>${nota}</span></div>
          <ul>${lista(ctx.T(chave)).map(i => `<li>${i}</li>`).join("")}</ul>
        </div>`;
      return `
      <h2 class="titulo">${ctx.T("sintese_titulo")}</h2>
      <div class="sintese centro-vertical">
        ${col(1, "Segurança", inst(ctx, "hs_vendas_ano"), rot(ctx, "hs_vendas_ano") + " pela HS", "sintese_seg")}
        ${col(2, "Rendimento", A().pctTxt(p.rend_credito_am, 2) + " ao mês", "líquido, sobre o crédito total contemplado", "sintese_ren")}
        ${col(3, "Liquidez", ctx.fmtPct(est ? est.agio : p.agio_venda) + " de ágio", "referência na venda da carta contemplada", "sintese_liq")}
      </div>
      <p class="aviso">${ctx.T("aviso_padrao")}</p>`;
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
        const fin = Motor.financiamentoSAC({ valorImovel: V, entrada: p.fin_entrada, taxaAa: p.fin_taxa_aa, trAa: p.tr_aa, prazo: p.fin_prazo });
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
          card("Aquisição",
            H.numero("Juros que você deixa de pagar", f(fin.totalJuros), `comparado a financiar o mesmo valor a ${ctx.fmtPct(p.fin_taxa_aa, 2)} ao ano + TR`) +
            H.numero("Custo do consórcio", f(V * b.taxaTotal), `taxas no prazo todo, sem juros e sem entrada (no financiamento: ${f(fin.valorEntrada)} de entrada)`)) +
          card("Poupança",
            H.numero(`Crédito em ${Math.floor((m5 - 1) / 12)} anos`, f(l5.creditoAtual), `+${f(l5.creditoAtual - V)} de reajuste`) +
            H.numero("Custo real nesse ponto", H.pctTxt(Motor.taxaEfetiva(s0, m5)), "e segue caindo a cada ano")) +
          card("Rendimento",
            H.numero("Rende no primeiro mês", f(rende1), contemp) +
            `<p class="resultado ${rende1 >= pPos ? "positivo" : ""}">${rende1 >= pPos ? `paga a parcela de ${f(pPos)} e sobram ${f(rende1 - pPos)}` : `cobre ${ctx.fmtPct(rende1 / pPos)} da parcela de ${f(pPos)}`}</p>`) +
          card("Venda da carta",
            H.numero("Vende a carta por", f(venda.recebe), contemp) +
            H.numero(venda.lucro >= 0 ? "Lucro" : "Resultado", f(venda.lucro), `sobre ${f(c.pagoTotal)} pagos`, venda.lucro > 0 ? "positivo" : "")) +
          card("Renda com aluguel",
            H.numero("Aluguel tradicional", f(alug) + " por mês", `${ctx.fmtPct(p.aluguel_am, 1)} do imóvel`) +
            (alt ? H.numero(ctx.esc(alt.nome), f(altV) + " por mês", `${ctx.fmtPct(alt.taxa_am, 1)} do investido`, altV >= pPos ? "positivo" : "") : ""));
        el.querySelector('[data-alvo="rodape"]').innerHTML = H.rodape(ctx, {
          itens: [
            `Reajuste de ${ctx.fmtPct(b.reajuste)} ao ano; crédito contemplado rendendo ${ctx.fmtPct(p.pct_selic_credito)} da Selic (${ctx.fmtPct(p.selic, 2)} ao ano), líquido de IR; venda com ágio de ${ctx.fmtPct(e.agio)}.`,
            `Financiamento SAC com ${ctx.fmtPct(p.fin_entrada)} de entrada e ${p.fin_prazo} meses; aluguel sobre o crédito disponível na contemplação.`
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
          <h2 class="titulo">${ctx.T("fim_titulo")}${aj.cliente ? ", " + ctx.esc(aj.cliente) : ""}</h2>
          <p class="sub">${ctx.T("fim_sub")}</p>
          <div class="stats stats-2 stats-mini">${["rd_clientes", "rd_creditos", "rd_anos", "rd_bens"].map(k => grande(ctx, k)).join("")}</div>
          <div class="fim-contato">
            <a href="${ii("ct_instagram_url")}" target="_blank" rel="noopener"><img class="qr" src="img/qr-instagram.svg" alt="QR code do Instagram da Redecon"></a>
            <div>
              <strong>${ii("ct_instagram")}</strong>
              <span>${ctx.T("fim_qr")}</span>
              <span>${ii("ct_site")} · WhatsApp ${ii("ct_whatsapp")}</span>
              ${aj.apresentador ? `<span>Apresentado por ${ctx.esc(aj.apresentador)}</span>` : ""}
            </div>
          </div>
        </div>
      </div>`;
    }
  };

  window.ETAPA4 = { quemRedecon, quemHs, virada, mapa, sintese, casos, fechamento, encerramento };
})();
