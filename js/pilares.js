// Telas dos três pilares do Método API: Aquisição, Poupança e Investimento.
// Cada tela tem html(ctx) e iniciar(el, ctx). ctx traz dados, textos, formatação e o estado da simulação.
(function () {
  const COR_A = "#F84434";   // crédito / ganho do consórcio
  const COR_B = "#5B8DEF";   // saldo devedor / CDB / comparação
  const COR_C = "#3D5482";   // barra em que a outra opção vence (recessiva)

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
  const pctTxt = (v, casas = 1) => (v * 100).toLocaleString("pt-BR", { minimumFractionDigits: casas, maximumFractionDigits: casas }) + "%";
  const alturaGraf = () => Math.round(Math.min(520, Math.max(220, window.innerHeight * (window.innerHeight < 860 ? 0.27 : 0.30))));
  const lerMoeda = s => Number(String(s).replace(/\D/g, "")) || 0;
  const dolar = ctx => (ctx.D.indices.dolar && ctx.D.indices.dolar.valor) || ctx.D.parametros.dolar_reserva || 5.2;

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
      agio: `<label class="ctl ctl-unid"><span>Ágio na venda</span><input data-ctl="agio" type="number" min="0" max="100" step="1" value="${Math.round(e.agio * 100)}"><em>%</em></label>`
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
  // Roda o cálculo agora e sempre que o estado mudar
  function reagir(el, ctx, fn) {
    const rodar = () => {
      if (!el.isConnected) { document.removeEventListener("redecon:estado", rodar); return; }
      sincronizar(el, ctx); fn();
    };
    ligarControles(el, ctx);
    document.addEventListener("redecon:estado", rodar);
    el._aoMostrar = rodar;
    el._redesenhar = rodar;
    rodar();
  }
  const numero = (rotulo, valor, nota = "", classe = "") =>
    `<div class="num ${classe}"><span class="num-rotulo">${rotulo}</span><strong class="num-valor">${valor}</strong>${nota ? `<span class="num-nota">${nota}</span>` : ""}</div>`;

  // Nota de rodapé: o sentido da tela (opcional), as premissas em lista e o aviso padrão.
  function rodape(ctx, { sentido = "", itens = [] }) {
    const lis = itens.filter(Boolean).map(i => `<li>${i}</li>`).join("");
    return `<footer class="rodape">
      ${sentido ? `<p class="rodape-sentido">${sentido}</p>` : ""}
      ${lis ? `<ul class="rodape-lista">${lis}</ul>` : ""}
      <p class="rodape-aviso">${ctx.T("aviso_padrao")}</p>
    </footer>`;
  }

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
      <p class="usos-rodape">${ctx.T("aq_usos_rodape")}</p>`
  };

  const comparativo = {
    id: "aq-comparativo", nome: "Consórcio, financiamento e à vista",
    html: ctx => `
      <h2 class="titulo">${ctx.T("aq_comp_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela"])}
      <div class="tres" data-alvo="tres"></div>
      <div data-alvo="rodape"></div>`,
    iniciar: (el, ctx) => { let comReaj = false; reagir(el, ctx, () => {
      const b = base(ctx), f = ctx.fmtReal, p = b.p, V = b.credito;
      // Custo final do consórcio: sem reajuste = crédito + taxas; com reajuste = todas as parcelas
      // reajustadas ano a ano até o fim do prazo (o crédito sobe junto).
      let totalReaj = 0;
      for (let m = 1; m <= b.prazo; m++) totalReaj += V * Motor.fatorReajuste(m, b.reajuste) * (1 + b.taxaTotal) / b.prazo;
      const credFinal = V * Motor.fatorReajuste(b.prazo, b.reajuste);
      const fin = Motor.financiamentoSAC({ valorImovel: V, entrada: p.fin_entrada, taxaAa: p.fin_taxa_aa, trAa: p.tr_aa, prazo: p.fin_prazo });
      const rendeMes = V * cdbLiquidoAm(b);
      const parc = Motor.parcela({ credito: V, prazo: b.prazo, taxaTotal: b.taxaTotal, meia: b.meia });
      const custoCons = V * b.taxaTotal;
      const cet = p.fin_cet_aa ? `CET de ${ctx.fmtPct(p.fin_cet_aa, 2)} ao ano` : "o custo total (CET) inclui ainda seguros e tarifas do banco";
      el.querySelector('[data-alvo="tres"]').innerHTML = `
        <div class="opcao">
          <h3>À vista</h3>
          <p class="quando">Imóvel <strong>na hora</strong></p>
          ${numero("Sai do caixa hoje", f(V))}
          ${numero("Seu dinheiro deixa de render", f(rendeMes) + " por mês")}
          <p class="opcao-premissa">Rendimento de um CDB a ${ctx.fmtPct(p.cdb_pct_cdi)} do CDI (${ctx.fmtPct(p.cdi, 2)} ao ano), já descontado o IR de 15%.</p>
        </div>
        <div class="opcao">
          <h3>Financiamento</h3>
          <p class="quando">Imóvel <strong>na hora</strong></p>
          ${numero("Entrada", f(fin.valorEntrada), ctx.fmtPct(p.fin_entrada) + " do imóvel")}
          ${numero("Primeira parcela", f(fin.primeiraParcela), `${p.fin_sistema}, ${p.fin_prazo} meses`)}
          ${numero("Juros pagos ao banco", f(fin.totalJuros), "ao longo do contrato")}
          ${numero("Total pago no fim", f(fin.totalPago), `entrada + ${p.fin_prazo} parcelas`)}
          <p class="opcao-premissa">Juros de ${ctx.fmtPct(p.fin_taxa_aa, 2)} ao ano + TR; ${cet}.</p>
        </div>
        <div class="opcao opcao-destaque">
          <h3>Consórcio</h3>
          <p class="quando">Imóvel <strong>na contemplação</strong>, por sorteio ou lance</p>
          ${numero("Entrada", "Sem entrada")}
          ${numero(b.meia ? "Meia parcela" : "Parcela", f(parc, 2), `${b.prazo} meses`)}
          ${numero("Taxa de administração", ctx.fmtPct(b.taxaAdm / b.prazo, 3) + " ao mês", `${f(custoCons)} no total, sem juros`)}
          <div class="seg seg-mini" role="group" aria-label="Custo final">
            <button data-reaj="0" aria-pressed="${!comReaj}">Sem reajuste</button><button data-reaj="1" aria-pressed="${comReaj}">Com reajuste</button></div>
          ${comReaj
            ? numero("Total pago no fim", f(totalReaj), `com ${ctx.fmtPct(b.reajuste)} ao ano em todo o prazo; o crédito também sobe, para ${f(credFinal)}`)
            : numero("Total pago no fim", f(V + custoCons), "crédito + taxas, sem reajuste")}
          <p class="opcao-premissa">Taxa de administração de ${ctx.fmtPct(b.taxaAdm)} e fundo de reserva de ${ctx.fmtPct(b.taxaTotal - b.taxaAdm)}; crédito e parcela reajustados ${ctx.fmtPct(b.reajuste)} ao ano.</p>
        </div>`;
      el.querySelectorAll("[data-reaj]").forEach(x => x.addEventListener("click", () => { comReaj = x.dataset.reaj === "1"; el._redesenhar(); }));
      el.querySelector('[data-alvo="rodape"]').innerHTML = rodape(ctx, {});
    }); }
  };

  // =========================================================
  // POUPANÇA
  // =========================================================
  const reajuste = {
    id: "po-reajuste", nome: "Reajuste e custo real",
    html: ctx => `
      <h2 class="titulo">${ctx.T("po_reaj_titulo")}</h2>
      <p class="sub sub-largo">${ctx.T("po_reaj_sub")}</p>
      ${controles(ctx, ["credito", "prazo", "parcela"])}
      <div class="dois">
        <div class="nums" data-alvo="nums"></div>
        <div><p class="graf-titulo">Custo real da cota ano a ano (toque no gráfico para escolher o ano)</p><div data-alvo="graf"></div>
          <p class="custo-real" data-alvo="custo"></p></div>
      </div>
      <div data-alvo="rodape"></div>`,
    iniciar: (el, ctx) => {
      let anoSel = 1;
      reagir(el, ctx, () => {
        const b = base(ctx), f = ctx.fmtReal;
        const s = cota(b, { modalidade: "nenhuma" });
        // Pontos: início, fim de cada ano (logo após o reajuste) e o último mês do grupo
        const pts = [{ rot: "Início", mes: 1, ano: 0 }];
        for (let a = 1; a * 12 + 1 <= b.prazo; a++) pts.push({ rot: "Ano " + a, mes: a * 12 + 1, ano: a });
        if (pts[pts.length - 1].mes !== b.prazo) pts.push({ rot: "Fim (mês " + b.prazo + ")", mes: b.prazo, ano: b.prazo / 12 });
        anoSel = Math.min(anoSel, pts.length - 1);
        const taxas = pts.map(x => Motor.taxaEfetiva(s, x.mes) * 100);
        const sel = pts[anoSel], ls = s.meses[sel.mes - 1], l0 = s.meses[0];
        const te = Motor.taxaEfetiva(s, sel.mes);
        const totalCota = ls.pagoTotal + ls.saldoDevedor;
        const sobra = ls.creditoAtual - totalCota;
        el.querySelector('[data-alvo="nums"]').innerHTML = `
          <p class="nums-titulo">${sel.ano === 0 ? "No início" : sel.rot.startsWith("Fim") ? "No fim do grupo" : "No " + sel.rot.toLowerCase()}</p>
          ${numero("Crédito", f(ls.creditoAtual), sel.ano === 0 ? "" : `+${f(ls.creditoAtual - l0.creditoAtual)} desde o início`, "grande")}
          ${numero(b.meia ? "Meia parcela" : "Parcela", f(ls.parcela, 2), sel.ano === 0 ? "" : `+${f(ls.parcela - l0.parcela, 2)} desde o início`)}
          ${sobra > 0 ? numero("Crédito a mais do que o total da cota", f(sobra), `${f(totalCota)} pagos e a pagar`, "positivo") : ""}`;
        el.querySelector('[data-alvo="custo"]').innerHTML =
          `Custo real da cota ${sel.ano === 0 ? "no início" : sel.rot.startsWith("Fim") ? "no fim do grupo" : "no " + sel.rot.toLowerCase()}: <strong>${pctTxt(te)}</strong> <span>o que pagou mais o que falta, comparado ao crédito de hoje</span>`;
        Graficos.linhas(el.querySelector('[data-alvo="graf"]'), {
          series: [{ nome: "Custo real", cor: COR_A, valores: taxas }], rotulosX: pts.map(x => x.rot),
          fmtY: v => v.toLocaleString("pt-BR", { maximumFractionDigits: 1 }) + "%", altura: alturaGraf(),
          selecionado: anoSel, aoEscolher: i => { anoSel = i; el._redesenhar(); }
        });
        el.querySelector('[data-alvo="rodape"]').innerHTML = rodape(ctx, {
          itens: [
            `Reajuste de ${ctx.fmtPct(b.reajuste)} ao ano no crédito e na parcela.`,
            "Custo real (taxa efetiva) = (total pago + saldo a pagar) ÷ crédito atualizado − 1.",
            "Cota sem contemplação."
          ]
        });
      });
    }
  };

  const previdencia = {
    id: "po-previdencia", nome: "Previdência e renda",
    html: ctx => `
      <h2 class="titulo">${ctx.T("po_prev_titulo")}</h2>
      <p class="sub">${ctx.T("po_prev_sub")}</p>
      ${controles(ctx, ["credito", "prazo", "parcela", "mes"])}
      <div class="ctl ctl-base"><span>Valor que vira renda</span><div class="seg" role="group">
        <button data-base="credito" aria-pressed="true">O crédito contratado</button>
        <button data-base="fim" aria-pressed="false">O crédito rendendo até o fim do grupo</button></div></div>
      <div class="rendas" data-alvo="rendas"></div>
      <div data-alvo="rodape"></div>`,
    iniciar: (el, ctx) => {
      let modo = "credito";
      el.querySelectorAll("[data-base]").forEach(btn => btn.addEventListener("click", () => {
        modo = btn.dataset.base;
        el.querySelectorAll("[data-base]").forEach(x => x.setAttribute("aria-pressed", String(x === btn)));
        el._redesenhar();
      }));
      reagir(el, ctx, () => {
        const b = base(ctx), f = ctx.fmtReal, r = cdbLiquidoAm(b), e = ctx.estado;
        let V = b.credito, origem = "valor do crédito contratado";
        if (modo === "fim") {
          const s = cota(b, { mesContemplacao: e.mes, modalidade: "sorteio" });
          V = s.meses[s.meses.length - 1].creditoDisponivel;
          origem = `crédito contemplado no mês ${e.mes}, rendendo até o fim do grupo (${f(V)})`;
        }
        el.querySelector('[data-ctl="mes"]').closest(".ctl").hidden = modo !== "fim";
        const cards = [15, 20, 25, 30].map(a => {
          const x = Motor.previdencia({ valor: V, taxaAmLiquida: r, anos: a });
          return `<div class="renda"><span>Por ${a} anos</span><strong>${f(x.renda)}</strong><em>por mês</em></div>`;
        }).join("");
        const vit = Motor.rendaVitalicia({ valor: V, taxaAmLiquida: r });
        el.querySelector('[data-alvo="rendas"]').innerHTML = cards +
          `<div class="renda renda-destaque"><span>Para sempre</span><strong>${f(vit)}</strong><em>por mês, sem mexer no valor aplicado</em></div>`;
        el.querySelector('[data-alvo="rodape"]').innerHTML = rodape(ctx, {
          sentido: ctx.T("po_prev_sentido"),
          itens: [
            `Valor de partida: ${origem}.`,
            `Aplicação em CDB a ${ctx.fmtPct(b.p.cdb_pct_cdi)} do CDI (${ctx.fmtPct(b.p.cdi, 2)} ao ano), IR de 15%: ${ctx.fmtPct(r, 2)} ao mês líquido.`,
            "Resgates mensais iguais até zerar o valor; a renda para sempre usa só o rendimento.",
            "Valores em reais de hoje, sem descontar a inflação."
          ]
        });
      });
    }
  };

  // =========================================================
  // INVESTIMENTO
  // =========================================================
  const selic = {
    id: "in-selic", nome: "Paga sobre o saldo, rende sobre o crédito",
    html: ctx => `
      <h2 class="titulo">${ctx.T("in_selic_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela", "mes", "modalidade"])}
      <div class="dois centro-vertical">
        <div class="nums" data-alvo="nums"></div>
        <div><p class="graf-titulo">Depois da contemplação: crédito aplicado e saldo devedor</p><div data-alvo="graf"></div>
          <div class="destaque-fim" data-alvo="fim"></div></div>
      </div>
      <div data-alvo="rodape"></div>`,
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
      el.querySelector('[data-alvo="fim"]').innerHTML =
        `<span>No fim do grupo</span><strong>${f(fim.creditoDisponivel)} aplicados</strong><span>tendo pago ${f(s.pagoTotal)} no total</span>`;
      Graficos.linhas(el.querySelector('[data-alvo="graf"]'), {
        series: [
          { nome: "Crédito aplicado", cor: COR_A, valores: depois.map(x => x.creditoDisponivel != null ? x.creditoDisponivel : c.creditoDisponivel) },
          { nome: "Saldo devedor", cor: COR_B, valores: depois.map(x => x.saldoDevedor) }
        ],
        rotulosX: depois.map(x => "Mês " + x.mes), yMin: 0, altura: alturaGraf(),
        fmtY: v => moedaCurta(v), fmtTip: v => f(v)
      });
      el.querySelector('[data-alvo="rodape"]').innerHTML = rodape(ctx, {
        sentido: ctx.T("in_selic_sentido"),
        itens: [
          `Crédito aplicado rendendo ${ctx.fmtPct(b.p.pct_selic_credito)} da Selic (${ctx.fmtPct(b.p.selic, 2)} ao ano), líquido de IR, sobre o valor total.`,
          `Saldo devedor reajustado ${ctx.fmtPct(b.reajuste)} ao ano.`,
          "Parcelas pagas com outros recursos, sem usar o crédito."
        ]
      });
    })
  };

  const venda = {
    id: "in-venda", nome: "Venda da carta contemplada",
    html: ctx => `
      <h2 class="titulo">${ctx.T("in_venda_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela", "mes", "modalidade", "agio"])}
      <div class="dois dois-venda afastado">
        <div class="nums" data-alvo="nums"></div>
        <div><p class="graf-titulo">Ganho conforme o mês da contemplação (toque numa barra para escolher)</p><div data-alvo="graf"></div></div>
      </div>
      <div data-alvo="rodape"></div>`,
    iniciar: (el, ctx) => reagir(el, ctx, () => {
      const b = base(ctx), f = ctx.fmtReal, e = ctx.estado;
      // Venda no mês m comparada às mesmas parcelas aplicadas no CDB
      const calc = mes => {
        const s = cota(b, { mesContemplacao: mes, modalidade: e.modalidade });
        const c = s.contemplacao;
        const v = Motor.vendaCarta({ creditoDisponivel: c.creditoDisponivel, pagoAteContemplar: c.pagoTotal, agio: e.agio });
        const parcelas = s.meses.filter(x => x.mes <= mes).map(x => x.parcela);
        const cdb = Motor.aplicarAportes({ aportes: parcelas.map((valor, k) => ({ mes: k + 1, valor })), mesFinal: mes, taxaAa: b.cdbAa, tabelaIR: b.ir });
        const fluxo = (final) => { const fl = parcelas.map(p => -p); fl[fl.length - 1] += final; return fl; };
        const tirVenda = mes >= 6 ? Motor.tir(fluxo(v.recebe)) : null;
        const tirCdb = mes >= 6 ? Motor.tir(fluxo(cdb.liquido)) : null;
        return { s, c, v, cdb, tirVenda, tirCdb };
      };
      const a = calc(e.mes);
      const venceu = a.v.lucro > a.cdb.ganho;
      const vezes = a.cdb.ganho > 0 ? a.v.lucro / a.cdb.ganho : null;
      const dif = a.v.lucro - a.cdb.ganho;
      const vezesTxt = venceu && vezes && vezes >= 1.5 ? `${vezes.toLocaleString("pt-BR", { maximumFractionDigits: 1 })} vezes o ganho do CDB` : "";
      const ritmo = a.tirVenda != null && a.tirCdb != null
        ? `<p class="ritmo">Rendimento equivalente: <strong>${pctTxt(a.tirVenda, 2)} ao mês</strong> na venda, contra ${pctTxt(a.tirCdb, 2)} ao mês no CDB.</p>` : "";
      const orientacao = venceu ? "" :
        `<p class="orientacao-curta"><strong>${ctx.T("in_venda_orientacao_t")}</strong> ${ctx.T("in_venda_orientacao")}</p>`;
      el.querySelector('[data-alvo="nums"]').innerHTML = `
        <p class="linha-info">Contemplado no mês ${e.mes}, você pagou <strong>${f(a.c.pagoTotal)}</strong></p>
        <div class="grade-venda">
          ${numero("Vende a carta por", f(a.v.recebe), "", "grande")}
          ${numero(a.v.lucro >= 0 ? "Lucro na venda" : "Resultado da venda", f(a.v.lucro), "venda − total pago", "grande" + (a.v.lucro > 0 && venceu ? " positivo" : ""))}
          ${numero(venceu ? "No CDB, apenas" : "No CDB", f(a.cdb.ganho), "mesmas parcelas, líquido de IR", venceu ? "" : "positivo")}
          ${numero(venceu ? "A favor da venda" : "A favor do CDB", f(Math.abs(dif)), vezesTxt, venceu ? "positivo" : "")}
        </div>
        ${orientacao}
        ${ritmo}`;
      const itens = [], linhaCdb = [];
      const limite = Math.min(b.prazo - 1, 120);
      for (let m = 6; m <= limite; m += 6) {
        const r = calc(m);
        const ganha = r.v.lucro > r.cdb.ganho;
        itens.push({ rotulo: "Mês " + m, valor: r.v.lucro, cor: ganha ? COR_A : COR_C, destaque: Math.abs(m - e.mes) < 3, nomeTip: "vendendo a carta", mes: m });
        linhaCdb.push(r.cdb.ganho);
      }
      Graficos.barras(el.querySelector('[data-alvo="graf"]'), {
        itens, altura: alturaGraf(), fmtY: v => moedaCurta(v), fmtTip: v => f(v),
        linha: { nome: "no CDB", cor: COR_B, valores: linhaCdb },
        legendaItens: [
          { nome: "Ganho vendendo a carta", cor: COR_A, tipo: "barra" },
          { nome: "Venda abaixo do CDB", cor: COR_C, tipo: "barra" },
          { nome: "Ganho das mesmas parcelas no CDB", cor: COR_B, tipo: "linha" }
        ],
        aoEscolher: i => { e.mes = itens[i].mes; ctx.mudou(); }
      });
      el.querySelector('[data-alvo="rodape"]').innerHTML = rodape(ctx, {
        sentido: ctx.T("in_venda_sentido"),
        itens: [
          `Venda com ágio de ${ctx.fmtPct(e.agio)} sobre o crédito líquido na contemplação; lucro = venda − total pago.`,
          `CDB a ${ctx.fmtPct(b.p.cdb_pct_cdi)} do CDI, IR conforme o prazo de cada parcela; rendimento equivalente = taxa mensal que leva as parcelas pagas ao valor recebido.`
        ]
      });
    })
  };

  const aluguel = {
    id: "in-aluguel", nome: "Aluguel, short stay e barracão",
    html: ctx => `
      <h2 class="titulo">${ctx.T("in_aluguel_titulo")}</h2>
      ${controles(ctx, ["credito", "prazo", "parcela", "mes", "modalidade"])}
      <div class="aluguel-grade">
        <div class="aluguel-cons" data-alvo="resumo"></div>
        <div class="aluguel-col" data-alvo="esq"></div>
        <div class="aluguel-col" data-alvo="dir"></div>
        <div class="fora" data-alvo="fora"></div>
      </div>
      <div data-alvo="rodape"></div>`,
    iniciar: (el, ctx) => {
      const cidades = (ctx.D.cidades || []).filter(c => c.cidade);
      const OUTRA = "Outra cidade";
      const ocupPadrao = Math.round((ctx.D.parametros.st_ocupacao || 0.75) * 100);
      const st = { cidade: cidades[0] ? cidades[0].cidade : OUTRA, diaria: "", ocupacao: ocupPadrao };
      const aplicarCidade = () => {
        const c = cidades.find(x => x.cidade === st.cidade);
        st.diaria = c && c.diaria_usd ? Math.round(c.diaria_usd * dolar(ctx)) : "";
      };
      aplicarCidade();
      // Só o short stay muda quando o cliente mexe na cidade, diária ou ocupação
      const desenharShort = (V, parc, cobre) => {
        const f = ctx.fmtReal, p = ctx.D.parametros, caixa = el.querySelector('[data-alvo="res-st"]');
        if (!caixa) return;
        if (!(+st.diaria > 0)) { caixa.innerHTML = `<p class="opcao-premissa sem-borda">Escolha a cidade ou digite a diária para calcular.</p>`; return; }
        const ss = Motor.shortStay({ diaria: +st.diaria, ocupacao: st.ocupacao / 100, custos: p.st_custos });
        caixa.innerHTML = `
          ${numero("Líquido por mês", f(ss.liquido), `receita de ${f(ss.receitaBruta)} menos ${ctx.fmtPct(p.st_custos)} de custos`)}
          <p class="resultado ${ss.liquido >= parc ? "positivo" : ""}">${cobre(ss.liquido)}</p>`;
      };
      let ultimo = null;
      let foraSel = null; // opção "fora do tradicional" aberta (nome) ou nenhuma
      const alternativas = () => (ctx.D.alternativas && ctx.D.alternativas.length ? ctx.D.alternativas : (window.DADOS_PADRAO.alternativas || []));
      const desenharFora = () => {
        const f = ctx.fmtReal, { V, parc, cobre } = ultimo, alts = alternativas();
        const alt = alts.find(a => a.nome === foraSel);
        const botoes = alts.map(a => `<button data-fora="${ctx.esc(a.nome)}" aria-pressed="${a.nome === foraSel}">${ctx.esc(a.nome)}</button>`).join("");
        let caixa = "";
        if (alt) {
          const ganho = Motor.aluguelTradicional({ valorImovel: V, taxaAm: alt.taxa_am });
          caixa = `<div class="fora-caixa opcao-destaque">
            ${numero(`Aluguel por mês (${ctx.fmtPct(alt.taxa_am, 1)} do investido)`, f(ganho))}
            <p class="resultado ${ganho >= parc ? "positivo" : ""}">${cobre(ganho)}</p>
            ${alt.obs ? `<p class="fora-obs">${ctx.esc(alt.obs)}</p>` : ""}
          </div>`;
        }
        const box = el.querySelector('[data-alvo="fora"]');
        box.innerHTML = `<div class="fora-topo"><span class="opcao-selo">Fora do tradicional</span><div class="seg" role="group">${botoes}</div>
          ${alt ? "" : `<span class="fora-dica">escolha uma opção para ver o cálculo</span>`}</div>${caixa}`;
        box.querySelectorAll("[data-fora]").forEach(b => b.addEventListener("click", () => {
          foraSel = foraSel === b.dataset.fora ? null : b.dataset.fora;
          desenharFora();
        }));
      };
      const desenhar = () => {
        const b = base(ctx), f = ctx.fmtReal, e = ctx.estado, p = b.p;
        const s = cota(b, { mesContemplacao: e.mes, modalidade: e.modalidade, comSeguro: true });
        const V = s.contemplacao.creditoDisponivel;
        const pm = s.meses.find(x => x.fase === "depois" && x.parcela > 0) || { parcela: 0, seguro: 0 };
        const parc = pm.parcela + (pm.seguro || 0);
        const alug = Motor.aluguelTradicional({ valorImovel: V, taxaAm: p.aluguel_am });
        const cobre = x => x >= parc ? `paga a parcela e sobram ${f(x - parc)}` : `cobre ${ctx.fmtPct(x / parc)} da parcela`;
        ultimo = { V, parc, cobre };
        el.querySelector('[data-alvo="resumo"]').innerHTML = `
          <p class="nums-titulo">No consórcio</p>
          ${numero("Crédito para investir", f(V), `contemplação no mês ${e.mes}`, "grande")}
          ${numero("Parcela depois de contemplar", f(parc), "com seguro prestamista")}`;
        el.querySelector('[data-alvo="esq"]').innerHTML = `
          <div class="opcao opcao-alta">
            <h3>Aluguel tradicional</h3>
            ${numero(`Aluguel por mês (${ctx.fmtPct(p.aluguel_am, 1)} do imóvel)`, f(alug))}
            <p class="resultado ${alug >= parc ? "positivo" : ""}">${cobre(alug)}</p>
          </div>`;
        const opCid = cidades.map(c => `<option ${c.cidade === st.cidade ? "selected" : ""}>${ctx.esc(c.cidade)}</option>`).join("") +
          `<option ${st.cidade === OUTRA ? "selected" : ""}>${OUTRA}</option>`;
        el.querySelector('[data-alvo="dir"]').innerHTML = `
          <div class="opcao opcao-alta">
            <h3>Short stay (Airbnb e similares)</h3>
            <div class="st-campos">
              <label>Cidade <select data-st="cidade">${opCid}</select></label>
              <label>Diária (R$) <input data-st="diaria" type="number" min="0" step="10" inputmode="numeric" placeholder="digite" value="${st.diaria}"></label>
              <label>Ocupação (%) <input data-st="ocupacao" type="number" min="0" max="100" step="1" inputmode="numeric" value="${st.ocupacao}"></label>
            </div>
            <div data-alvo="res-st"></div>
          </div>`;
        desenharShort(V, parc, cobre);
        desenharFora();
        el.querySelectorAll("[data-st]").forEach(i => {
          const k = i.dataset.st;
          i.addEventListener(k === "cidade" ? "change" : "input", () => {
            if (k === "cidade") {
              st.cidade = i.value; aplicarCidade();
              el.querySelector('[data-st="diaria"]').value = st.diaria;
            } else if (k === "diaria") {
              st.diaria = i.value === "" ? "" : Math.max(0, +i.value);
              if (st.cidade !== OUTRA) { st.cidade = OUTRA; el.querySelector('[data-st="cidade"]').value = OUTRA; }
            } else {
              const v = +i.value; if (i.value !== "" && v >= 0 && v <= 100) st.ocupacao = v;
            }
            desenharShort(ultimo.V, ultimo.parc, ultimo.cobre);
          });
        });
        el.querySelector('[data-alvo="rodape"]').innerHTML = rodape(ctx, {
          sentido: ctx.T("in_aluguel_sentido"),
          itens: [
            `Aluguel tradicional de ${ctx.fmtPct(p.aluguel_am, 1)} ao mês sobre o valor do imóvel; opções fora do tradicional com o percentual de cada uma.`,
            `Short stay: 30,4 dias por mês, ocupação padrão de ${ocupPadrao}%, ${ctx.fmtPct(p.st_custos)} de custos (plataforma, limpeza, gestão e contas) e diária das cidades pelo dólar do dia (R$ ${dolar(ctx).toLocaleString("pt-BR", { maximumFractionDigits: 2 })}).`
          ]
        });
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

  // Ajudas reaproveitadas pelas telas da Etapa 4 (fechamento etc.)
  window.PILARES_AJUDA = { base, cota, cdbLiquidoAm, controles, ligarControles, sincronizar, reagir, numero, rodape, pctTxt, moedaCurta, lerMoeda };

  window.PILARES = {
    aquisicao: { nome: "Aquisição", telas: [usosAquisicao, comparativo] },
    poupanca: { nome: "Poupança", telas: [reajuste, previdencia] },
    investimento: { nome: "Investimento", telas: [selic, venda, aluguel] }
  };
})();
