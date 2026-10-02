// Telas dos três pilares do Método API: Aquisição, Poupança e Investimento.
// Cada tela tem html(ctx) e iniciar(el, ctx). ctx traz dados, textos, formatação e o estado da simulação.
(function () {
  const COR_A = "#F84434";   // crédito / ganho
  const COR_B = "#5B8DEF";   // saldo devedor / pago / comparação

  // ---------- Ajudas ----------
  function base(ctx) {
    const p = ctx.D.parametros, e = ctx.estado;
    const pz = ctx.D.prazos.find(x => +x.prazo === +e.prazo) || ctx.D.prazos[0];
    return {
      p, e, credito: e.credito, prazo: +pz.prazo, meia: e.meia,
      taxaTotal: pz.taxa_adm + pz.fundo_reserva, taxaAdm: pz.taxa_adm,
      reajuste: p.reajuste_aa, rendAm: p.rend_credito_am,
      cdbAa: p.cdi * p.cdb_pct_cdi, ir: ctx.D.ir
    };
  }
  const cota = (b, extra = {}) => Motor.simularCota(Object.assign({
    credito: b.credito, prazo: b.prazo, taxaTotal: b.taxaTotal, meia: b.meia, reajuste: b.reajuste,
    rendCreditoAm: b.rendAm, lanceEmbutido: b.p.lance_embutido, mesesSemPagarLance: b.p.meses_sem_pagar_lance,
    seguroPrestamista: b.p.seguro_prestamista
  }, extra));
  const cdbLiquidoAm = b => Motor.mensal(b.cdbAa) * (1 - b.ir[b.ir.length - 1].aliquota);
  const moedaCurta = v => {
    const a = Math.abs(v), s = v < 0 ? "−" : "";
    if (a >= 1e6) return s + "R$ " + (a / 1e6).toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + " mi";
    if (a >= 1e3) return s + "R$ " + Math.round(a / 1e3).toLocaleString("pt-BR") + " mil";
    return s + "R$ " + Math.round(a).toLocaleString("pt-BR");
  };
  const alturaGraf = () => Math.round(Math.min(560, Math.max(260, window.innerHeight * 0.40)));
  const lerMoeda = s => Number(String(s).replace(/\D/g, "")) || 0;

  // Barra de controles da simulação (compartilhada entre as telas)
  function controles(ctx, quais) {
    const e = ctx.estado, f = ctx.fmtReal;
    const opPrazos = ctx.D.prazos.map(x => `<option value="${x.prazo}" ${+x.prazo === +e.prazo ? "selected" : ""}>${x.prazo} meses</option>`).join("");
    const partes = {
      credito: `<label class="ctl"><span>Crédito</span><input data-ctl="credito" inputmode="numeric" value="${f(e.credito)}"></label>`,
      prazo: `<label class="ctl"><span>Prazo</span><select data-ctl="prazo">${opPrazos}</select></label>`,
      parcela: `<div class="ctl"><span>Parcela</span><div class="seg" role="group">
        <button data-ctl="meia" data-v="1" aria-pressed="${e.meia}">Meia</button><button data-ctl="meia" data-v="0" aria-pressed="${!e.meia}">Cheia</button></div></div>`,
      mes: `<label class="ctl"><span>Contemplação no mês</span><input data-ctl="mes" type="number" min="1" max="${e.prazo - 1}" value="${e.mes}"></label>`,
      modalidade: `<div class="ctl"><span>Contemplação por</span><div class="seg" role="group">
        <button data-ctl="modalidade" data-v="sorteio" aria-pressed="${e.modalidade === "sorteio"}">Sorteio</button><button data-ctl="modalidade" data-v="embutido" aria-pressed="${e.modalidade === "embutido"}">Lance embutido</button></div></div>`,
      agio: `<label class="ctl"><span>Ágio na venda</span><input data-ctl="agio" type="number" min="0" max="100" step="1" value="${Math.round(e.agio * 100)}"><em>%</em></label>`
    };
    return `<div class="controles">${quais.map(q => partes[q]).join("")}</div>`;
  }
  function ligarControles(el, ctx) {
    el.querySelectorAll("[data-ctl]").forEach(c => {
      const k = c.dataset.ctl;
      const aplicar = () => {
        const e = ctx.estado;
        if (k === "credito") { const v = lerMoeda(c.value); if (v > 0) e.credito = v; c.value = ctx.fmtReal(e.credito); }
        if (k === "prazo") { e.prazo = +c.value; e.mes = Math.min(e.mes, e.prazo - 1); }
        if (k === "meia") e.meia = c.dataset.v === "1";
        if (k === "modalidade") e.modalidade = c.dataset.v;
        if (k === "mes") { const v = Math.round(+c.value); if (v >= 1) e.mes = Math.min(v, e.prazo - 1); }
        if (k === "agio") { const v = +c.value; if (v >= 0) e.agio = v / 100; }
        ctx.mudou();
      };
      if (c.tagName === "BUTTON") c.addEventListener("click", aplicar);
      else c.addEventListener("change", aplicar);
    });
  }
  // Mantém os controles de uma tela iguais ao estado atual
  function sincronizar(el, ctx) {
    const e = ctx.estado;
    el.querySelectorAll("[data-ctl]").forEach(c => {
      const k = c.dataset.ctl;
      if (k === "credito" && document.activeElement !== c) c.value = ctx.fmtReal(e.credito);
      if (k === "prazo") c.value = e.prazo;
      if (k === "mes" && document.activeElement !== c) { c.value = e.mes; c.max = e.prazo - 1; }
      if (k === "agio" && document.activeElement !== c) c.value = Math.round(e.agio * 100);
      if (k === "meia") c.setAttribute("aria-pressed", String((c.dataset.v === "1") === e.meia));
      if (k === "modalidade") c.setAttribute("aria-pressed", String(c.dataset.v === e.modalidade));
    });
  }
  // Registra uma função de cálculo que roda agora e sempre que o estado mudar
  function reagir(el, ctx, fn) {
    const rodar = () => {
      if (!el.isConnected) { document.removeEventListener("redecon:estado", rodar); return; }
      sincronizar(el, ctx); fn();
    };
    ligarControles(el, ctx);
    document.addEventListener("redecon:estado", rodar);
    el._aoMostrar = rodar;
    rodar();
  }
  const numero = (rotulo, valor, nota = "", classe = "") =>
    `<div class="num ${classe}"><span class="num-rotulo">${rotulo}</span><strong class="num-valor">${valor}</strong>${nota ? `<span class="num-nota">${nota}</span>` : ""}</div>`;
  const premissas = (ctx, itens) => `<p class="premissas"><strong>Premissas:</strong> ${itens.join(" · ")}. ${ctx.T("aviso_padrao")}</p>`;

  // =========================================================
  // AQUISIÇÃO
  // =========================================================
  const usosAquisicao = {
    id: "aq-usos", nome: "Para que serve o crédito",
    html: ctx => `
      <h2 class="titulo">${ctx.T("aq_usos_titulo")}</h2>
      <div class="usos">
        ${["comprar", "construir", "quitar"].map(k => `
          <div class="uso"><h3>${ctx.T("aq_usos_" + k + "_t")}</h3><p>${ctx.T("aq_usos_" + k)}</p></div>`).join("")}
      </div>
      <p class="sub usos-rodape">${ctx.T("aq_usos_rodape")}</p>`
  };

  const comparativo = {
    id: "aq-comparativo", nome: "Consórcio, financiamento e à vista",
    html: ctx => `
      <h2 class="titulo">${ctx.T("aq_comp_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela"])}
      <div class="tres" data-alvo="tres"></div>
      <div data-alvo="premissas"></div>`,
    iniciar: (el, ctx) => reagir(el, ctx, () => {
      const b = base(ctx), f = ctx.fmtReal, p = b.p, V = b.credito;
      const fin = Motor.financiamentoSAC({ valorImovel: V, entrada: p.fin_entrada, taxaAa: p.fin_taxa_aa, trAa: p.tr_aa, prazo: p.fin_prazo });
      const rendeMes = V * cdbLiquidoAm(b);
      const parc = Motor.parcela({ credito: V, prazo: b.prazo, taxaTotal: b.taxaTotal, meia: b.meia });
      const custoCons = V * b.taxaTotal;
      el.querySelector('[data-alvo="tres"]').innerHTML = `
        <div class="opcao">
          <h3>À vista</h3>
          ${numero("Sai do caixa hoje", f(V))}
          ${numero("Seu dinheiro deixa de render", f(rendeMes) + " por mês", "CDB líquido de IR")}
          ${numero("Quando você tem o imóvel", "Na hora")}
        </div>
        <div class="opcao">
          <h3>Financiamento</h3>
          ${numero("Entrada", f(fin.valorEntrada), ctx.fmtPct(p.fin_entrada) + " do imóvel")}
          ${numero("Primeira parcela", f(fin.primeiraParcela), `${p.fin_sistema}, ${p.fin_prazo} meses`)}
          ${numero("Juros pagos ao banco", f(fin.totalJuros), "ao longo do contrato")}
          ${numero("Quando você tem o imóvel", "Na hora")}
        </div>
        <div class="opcao opcao-destaque">
          <h3>Consórcio</h3>
          ${numero("Entrada", "Sem entrada")}
          ${numero(b.meia ? "Meia parcela" : "Parcela", f(parc, 2), `${b.prazo} meses, reajuste ${ctx.fmtPct(b.reajuste)} ao ano`)}
          ${numero("Taxa de administração", ctx.fmtPct(b.taxaAdm / b.prazo, 3) + " ao mês", `total ${f(custoCons)} com fundo de reserva, sem juros`)}
          ${numero("Quando você tem o imóvel", "Na contemplação", "sorteio, lances e fidelidades")}
        </div>`;
      const cet = p.fin_cet_aa ? `CET informado ${ctx.fmtPct(p.fin_cet_aa, 2)} ao ano` : "CET depende de seguros e tarifas do banco";
      el.querySelector('[data-alvo="premissas"]').innerHTML = premissas(ctx, [
        `financiamento ${ctx.fmtPct(p.fin_taxa_aa, 2)} ao ano + TR (${cet})`,
        `CDB ${ctx.fmtPct(p.cdb_pct_cdi)} do CDI (${ctx.fmtPct(p.cdi, 2)} ao ano), IR de 15%`,
        `consórcio com taxa de administração ${ctx.fmtPct(b.taxaAdm)} e fundo de reserva ${ctx.fmtPct(b.taxaTotal - b.taxaAdm)}`
      ]);
    })
  };

  // =========================================================
  // POUPANÇA
  // =========================================================
  const reajuste = {
    id: "po-reajuste", nome: "Reajuste e taxa efetiva",
    html: ctx => `
      <h2 class="titulo">${ctx.T("po_reaj_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela"])}
      <div class="dois">
        <div class="nums" data-alvo="nums"></div>
        <div><p class="graf-titulo">Taxa efetiva de quem ainda não foi contemplado, ano a ano</p><div data-alvo="graf"></div></div>
      </div>
      <div data-alvo="premissas"></div>`,
    iniciar: (el, ctx) => reagir(el, ctx, () => {
      const b = base(ctx), f = ctx.fmtReal;
      const s = cota(b, { modalidade: "nenhuma" });
      const anos = Math.floor((b.prazo - 1) / 12);
      const mesAno = a => a * 12 + 1; // primeiro mês do ano seguinte (após o reajuste)
      const taxas = [], rot = [];
      for (let a = 0; a <= anos; a++) { taxas.push(Motor.taxaEfetiva(s, a === 0 ? 1 : mesAno(a)) * 100); rot.push(a === 0 ? "Início" : "Ano " + a); }
      const m1 = s.meses[0], m13 = s.meses[12];
      const a10 = s.meses[Math.min(mesAno(10), b.prazo) - 1];
      el.querySelector('[data-alvo="nums"]').innerHTML = `
        ${numero("Em 1 ano, o crédito sobe", "+" + f(m13.creditoAtual - m1.creditoAtual), `de ${f(m1.creditoAtual)} para ${f(m13.creditoAtual)}`, "grande")}
        ${numero("E a parcela sobe", "+" + f(m13.parcela - m1.parcela, 2) + " por mês", `${f((m13.parcela - m1.parcela) * 12, 2)} no ano`)}
        ${numero("Taxa efetiva no ano 10", ctx.fmtPct(Motor.taxaEfetiva(s, Math.min(mesAno(10), b.prazo)), 1), `começa em ${ctx.fmtPct(b.taxaTotal, 0)}; crédito de ${f(a10.creditoAtual)}`)}`;
      Graficos.linhas(el.querySelector('[data-alvo="graf"]'), {
        series: [{ nome: "Taxa efetiva", cor: COR_A, valores: taxas }], rotulosX: rot, yMin: 0,
        fmtY: v => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%", altura: alturaGraf()
      });
      el.querySelector('[data-alvo="premissas"]').innerHTML = premissas(ctx, [
        `reajuste ${ctx.fmtPct(b.reajuste)} ao ano no crédito e na parcela`,
        "taxa efetiva = (total pago + saldo a pagar) ÷ crédito atualizado − 1",
        "cota sem contemplação"
      ]);
    })
  };

  const previdencia = {
    id: "po-previdencia", nome: "Previdência e renda",
    html: ctx => `
      <h2 class="titulo">${ctx.T("po_prev_titulo")}</h2>
      ${controles(ctx, ["credito"])}
      <p class="sub">${ctx.T("po_prev_sub")}</p>
      <div class="rendas" data-alvo="rendas"></div>
      <div data-alvo="premissas"></div>`,
    iniciar: (el, ctx) => reagir(el, ctx, () => {
      const b = base(ctx), f = ctx.fmtReal, r = cdbLiquidoAm(b), V = b.credito;
      const cards = [15, 20, 25, 30].map(a => {
        const x = Motor.previdencia({ valor: V, taxaAmLiquida: r, anos: a });
        return `<div class="renda"><span>Por ${a} anos</span><strong>${f(x.renda)}</strong><em>por mês</em></div>`;
      }).join("");
      const vit = Motor.rendaVitalicia({ valor: V, taxaAmLiquida: r });
      el.querySelector('[data-alvo="rendas"]').innerHTML = cards +
        `<div class="renda renda-destaque"><span>Para sempre</span><strong>${f(vit)}</strong><em>por mês, sem mexer no valor aplicado</em></div>`;
      el.querySelector('[data-alvo="premissas"]').innerHTML = premissas(ctx, [
        `valor aplicado em CDB ${ctx.fmtPct(b.p.cdb_pct_cdi)} do CDI (${ctx.fmtPct(b.p.cdi, 2)} ao ano), IR de 15%: ${ctx.fmtPct(r, 2)} ao mês líquido`,
        "resgates mensais iguais até zerar o valor; renda vitalícia usa só o rendimento",
        "valores em reais de hoje, sem descontar a inflação"
      ]);
    })
  };

  // =========================================================
  // INVESTIMENTO
  // =========================================================
  const selic = {
    id: "in-selic", nome: "Paga reajuste, recebe Selic",
    html: ctx => `
      <h2 class="titulo">${ctx.T("in_selic_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela", "mes", "modalidade"])}
      <div class="dois">
        <div class="nums" data-alvo="nums"></div>
        <div><p class="graf-titulo">Depois da contemplação: crédito aplicado e saldo devedor</p><div data-alvo="graf"></div></div>
      </div>
      <div data-alvo="premissas"></div>`,
    iniciar: (el, ctx) => reagir(el, ctx, () => {
      const b = base(ctx), f = ctx.fmtReal, e = ctx.estado;
      const s = cota(b, { mesContemplacao: e.mes, modalidade: e.modalidade });
      const c = s.contemplacao;
      const rende1 = c.creditoDisponivel * b.rendAm;
      const parc = s.parcelaPosInicial;
      const depois = s.meses.filter(x => x.mes >= e.mes);
      const fim = s.meses[s.meses.length - 1];
      el.querySelector('[data-alvo="nums"]').innerHTML = `
        ${numero("Crédito disponível", f(c.creditoDisponivel), e.modalidade === "embutido" ? `já sem o lance embutido de ${f(c.embutido)}` : "contemplado por sorteio", "grande")}
        ${numero("Rende no primeiro mês", f(rende1), `${ctx.fmtPct(b.rendAm, 2)} ao mês, líquido`)}
        ${numero("Primeira parcela depois de contemplar", f(parc), `${e.modalidade === "embutido" ? b.p.meses_sem_pagar_lance + " meses sem pagar e depois " : ""}saldo ÷ meses restantes`)}
        ${numero(rende1 >= parc ? "O rendimento paga a parcela e sobra" : "O rendimento cobre da parcela", rende1 >= parc ? f(rende1 - parc) + " por mês" : ctx.fmtPct(rende1 / parc), "", rende1 >= parc ? "positivo" : "")}`;
      Graficos.linhas(el.querySelector('[data-alvo="graf"]'), {
        series: [
          { nome: "Crédito aplicado", cor: COR_A, valores: depois.map(x => x.creditoDisponivel != null ? x.creditoDisponivel : c.creditoDisponivel) },
          { nome: "Saldo devedor", cor: COR_B, valores: depois.map(x => x.saldoDevedor) }
        ],
        rotulosX: depois.map(x => "Mês " + x.mes), yMin: 0, altura: alturaGraf(),
        fmtY: (v, rotulo) => moedaCurta(v), fmtTip: v => f(v)
      });
      el.querySelector('[data-alvo="premissas"]').innerHTML = premissas(ctx, [
        `crédito rendendo ${ctx.fmtPct(b.p.pct_selic_credito)} da Selic (${ctx.fmtPct(b.p.selic, 2)} ao ano), líquido de IR`,
        `saldo devedor reajustado ${ctx.fmtPct(b.reajuste)} ao ano`,
        "parcelas pagas com outros recursos, crédito sem uso",
        `no fim do grupo: crédito aplicado de ${f(fim.creditoDisponivel)} para ${f(s.pagoTotal)} pagos no total`
      ]);
    })
  };

  const venda = {
    id: "in-venda", nome: "Venda da carta contemplada",
    html: ctx => `
      <h2 class="titulo">${ctx.T("in_venda_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela", "mes", "modalidade", "agio"])}
      <div class="dois">
        <div class="nums" data-alvo="nums"></div>
        <div><p class="graf-titulo">Lucro na venda conforme o mês da contemplação (toque numa barra para escolher)</p><div data-alvo="graf"></div></div>
      </div>
      <div data-alvo="premissas"></div>`,
    iniciar: (el, ctx) => reagir(el, ctx, () => {
      const b = base(ctx), f = ctx.fmtReal, e = ctx.estado;
      const calc = mes => {
        const s = cota(b, { mesContemplacao: mes, modalidade: e.modalidade });
        const c = s.contemplacao;
        const v = Motor.vendaCarta({ creditoDisponivel: c.creditoDisponivel, pagoAteContemplar: c.pagoTotal, agio: e.agio });
        return { s, c, v };
      };
      const atual = calc(e.mes);
      const aportes = atual.s.meses.filter(x => x.mes <= e.mes).map(x => ({ mes: x.mes, valor: x.parcela }));
      const cdb = Motor.aplicarAportes({ aportes, mesFinal: e.mes, taxaAa: b.cdbAa, tabelaIR: b.ir });
      el.querySelector('[data-alvo="nums"]').innerHTML = `
        ${numero(`Contemplado no mês ${e.mes}, você pagou`, f(atual.c.pagoTotal))}
        ${numero("Valor da venda", f(atual.v.recebe), `${ctx.fmtPct(e.agio)} de ${f(atual.c.creditoDisponivel)}`)}
        ${numero(atual.v.lucro >= 0 ? "Lucro" : "Resultado", f(atual.v.lucro), atual.v.lucro >= 0 ? `${ctx.fmtPct(atual.v.lucroPct, 0)} sobre o que foi pago` : "abaixo do que foi pago", atual.v.lucro >= 0 ? "grande positivo" : "grande")}
        ${numero("As mesmas parcelas no CDB", f(cdb.liquido), `ganho de ${f(cdb.ganho)}, líquido de IR`)}`;
      const itens = [];
      const limite = Math.min(b.prazo - 1, 120);
      for (let m = 6; m <= limite; m += 6) {
        const r = calc(m);
        itens.push({ rotulo: "Mês " + m, valor: r.v.lucro, destaque: Math.abs(m - e.mes) < 3, nomeTip: "de lucro", mes: m });
      }
      Graficos.barras(el.querySelector('[data-alvo="graf"]'), {
        itens, altura: alturaGraf(), fmtY: v => moedaCurta(v), fmtTip: v => f(v),
        aoEscolher: i => { e.mes = itens[i].mes; ctx.mudou(); }
      });
      el.querySelector('[data-alvo="premissas"]').innerHTML = premissas(ctx, [
        `valor da venda = ágio de ${ctx.fmtPct(e.agio)} sobre o crédito líquido na contemplação`,
        "lucro = valor da venda − total pago",
        `CDB ${ctx.fmtPct(b.p.cdb_pct_cdi)} do CDI, IR conforme o prazo de cada parcela`
      ]);
    })
  };

  const aluguel = {
    id: "in-aluguel", nome: "Aluguel e short stay",
    html: ctx => `
      <h2 class="titulo">${ctx.T("in_aluguel_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela", "mes", "modalidade"])}
      <div class="tres tres-2" data-alvo="tres"></div>
      <div data-alvo="premissas"></div>`,
    iniciar: (el, ctx) => {
      const p = ctx.D.parametros;
      const st = { diaria: Math.round(p.st_diaria_brl || 200), ocupacao: Math.round(p.st_ocupacao * 1000) / 10 };
      const desenhar = () => {
        const b = base(ctx), f = ctx.fmtReal, e = ctx.estado;
        const s = cota(b, { mesContemplacao: e.mes, modalidade: e.modalidade, comSeguro: true });
        const V = s.contemplacao.creditoDisponivel;
        const pm = s.meses.find(x => x.fase === "depois" && x.parcela > 0) || { parcela: 0, seguro: 0 };
        const parc = pm.parcela + (pm.seguro || 0);
        const alug = Motor.aluguelTradicional({ valorImovel: V, taxaAm: b.p.aluguel_am });
        const ss = Motor.shortStay({ diaria: st.diaria, ocupacao: st.ocupacao / 100, custos: b.p.st_custos });
        const cobre = (x) => x >= parc ? `paga a parcela e sobram ${f(x - parc)}` : `cobre ${ctx.fmtPct(x / parc)} da parcela`;
        el.querySelector('[data-alvo="tres"]').innerHTML = `
          <div class="opcao">
            <h3>Imóvel comprado com o crédito</h3>
            ${numero("Valor do imóvel", f(V), `contemplação no mês ${e.mes}`)}
            ${numero("Parcela depois de contemplar", f(parc), "com seguro prestamista")}
          </div>
          <div class="opcao">
            <h3>Aluguel tradicional</h3>
            ${numero("Aluguel por mês", f(alug), `${ctx.fmtPct(b.p.aluguel_am, 1)} do valor do imóvel`)}
            ${numero("Resultado", cobre(alug), "", alug >= parc ? "positivo" : "")}
          </div>
          <div class="opcao">
            <h3>Short stay (Airbnb e similares)</h3>
            <div class="mini-ctl">
              <label>Diária <input data-st="diaria" type="number" min="0" step="10" value="${st.diaria}"></label>
              <label>Ocupação <input data-st="ocupacao" type="number" min="0" max="100" step="1" value="${st.ocupacao}"><em>%</em></label>
            </div>
            ${numero("Líquido por mês", f(ss.liquido), `receita ${f(ss.receitaBruta)} menos ${ctx.fmtPct(b.p.st_custos)} de custos`)}
            ${numero("Resultado", cobre(ss.liquido), "", ss.liquido >= parc ? "positivo" : "")}
          </div>`;
        el.querySelectorAll("[data-st]").forEach(i => i.addEventListener("change", () => {
          const v = +i.value; if (v >= 0) st[i.dataset.st] = v; desenhar();
        }));
        const ref = p.st_diaria_brl ? `referência Pato Branco: diária média de US$ ${p.st_diaria_usd} (≈ ${f(p.st_diaria_brl)}) e ocupação de ${ctx.fmtPct(p.st_ocupacao, 1)} (AirROI)` : "";
        el.querySelector('[data-alvo="premissas"]').innerHTML = premissas(ctx, [
          `aluguel tradicional de ${ctx.fmtPct(b.p.aluguel_am, 1)} ao mês do valor do imóvel`,
          `short stay com 30,4 dias por mês e ${ctx.fmtPct(b.p.st_custos)} de custos (plataforma, limpeza, gestão e contas)`,
          ref, "o resultado depende da localização e da gestão do imóvel"
        ].filter(Boolean));
      };
      ligarControles(el, ctx);
      const rodar = () => {
        if (!el.isConnected) { document.removeEventListener("redecon:estado", rodar); return; }
        sincronizar(el, ctx); desenhar();
      };
      document.addEventListener("redecon:estado", rodar);
      el._aoMostrar = rodar;
      rodar();
    }
  };

  window.PILARES = {
    aquisicao: { nome: "Aquisição", telas: [usosAquisicao, comparativo] },
    poupanca: { nome: "Poupança", telas: [reajuste, previdencia] },
    investimento: { nome: "Investimento", telas: [selic, venda, aluguel] }
  };
})();
