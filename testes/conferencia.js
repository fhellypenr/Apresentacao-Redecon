// Conferência do motor contra exemplos conhecidos. Rodar: node testes/conferencia.js
const M = require("../js/motor.js");
let falhas = 0;
const R = v => Math.round(v * 100) / 100;
function igual(nome, obtido, esperado, tol = 0.01) {
  const ok = Math.abs(obtido - esperado) <= tol;
  if (!ok) falhas++;
  console.log(`${ok ? "OK  " : "ERRO"} ${nome}: ${R(obtido).toLocaleString("pt-BR")} (esperado ${R(esperado).toLocaleString("pt-BR")})`);
}

// 1. Exemplo do Fhellype: 1 mi, 220 meses, 23% → meia parcela 2.795,45
igual("Meia parcela 1 mi / 220m", M.parcela({ credito: 1e6, prazo: 220, taxaTotal: 0.23 }), 2795.45);

// 2. Após 12 meses, reajuste de 5%: crédito 1,05 mi, meia 2.935,23, diferença 139,77/mês e 1.677,27/ano
const s = M.simularCota({ credito: 1e6, prazo: 220, taxaTotal: 0.23, meia: true, reajuste: 0.05, modalidade: "nenhuma" });
igual("Crédito no mês 13", s.meses[12].creditoAtual, 1050000);
igual("Meia parcela no mês 13", s.meses[12].parcela, 2935.23);
igual("Diferença por parcela", s.meses[12].parcela - s.meses[11].parcela, 139.77);
igual("Diferença no ano", (s.meses[12].parcela - s.meses[11].parcela) * 12, 1677.27);

// 3. Material API: 600 mil → meia 1.677,27; reajuste → 630 mil
igual("API: meia parcela 600 mil", M.parcela({ credito: 6e5, prazo: 220, taxaTotal: 0.23 }), 1677.27);

// 3b. Material API: 1 mi, meia parcela, reajuste 7% a.a., 30 meses pagos = R$ 88.642,19 aplicados
const api = M.simularCota({ credito: 1e6, prazo: 220, taxaTotal: 0.23, meia: true, reajuste: 0.07, modalidade: "nenhuma" });
igual("API: valor aplicado em 30 meses (reajuste 7%)", api.meses[29].pagoTotal, 88642.19);
igual("API: crédito após 2 reajustes de 7% (~1,1 mi)", api.meses[29].creditoAtual, 1144900);

// 4. Tabelas da apresentação MAR26 (200 meses = 23%): 400 mil → 1.230,00 · 200 mil → 615,00
igual("MAR26: 400 mil / 200m", M.parcela({ credito: 4e5, prazo: 200, taxaTotal: 0.23 }), 1230);
igual("MAR26: 200 mil / 200m", M.parcela({ credito: 2e5, prazo: 200, taxaTotal: 0.23 }), 615);

// 5. Crédito pela parcela (inverso)
igual("Crédito para meia de 2.795,45", M.creditoPelaParcela({ valorParcela: 2795.4545, prazo: 220, taxaTotal: 0.23 }), 1e6, 1);

// 6. Gerador de propostas (fórmula validada): 1 mi, 220m, contemplado na parcela 30
function proposta({ credito, prazo, taxaTotal, nParcela, lance, embutido }) {
  const pctPorParcela = (1 + taxaTotal) / prazo / 2;
  let reaj = 0; for (let mes = 13; mes <= nParcela; mes += 12) reaj++;
  const cred = credito * Math.pow(1.05, reaj);
  const saldo = cred * (1 + taxaTotal);
  const pago = cred * pctPorParcela * nParcela;
  const emb = lance && embutido ? cred * 0.3 : 0;
  const saldoFinal = saldo - pago - emb;
  const restantes = prazo - nParcela - (lance ? 2 : 0);
  return { cred, saldoFinal, parcelaPos: saldoFinal / restantes, disp: lance && embutido ? cred * 0.7 : cred };
}
for (const caso of [{ n: 30, lance: false }, { n: 30, lance: true }, { n: 47, lance: true }]) {
  const p = proposta({ credito: 1e6, prazo: 220, taxaTotal: 0.23, nParcela: caso.n, lance: caso.lance, embutido: true });
  const m = M.simularCota({ credito: 1e6, prazo: 220, taxaTotal: 0.23, meia: true, reajuste: 0.05,
    mesContemplacao: caso.n, modalidade: caso.lance ? "embutido" : "sorteio" });
  const tag = `contemplação mês ${caso.n} ${caso.lance ? "lance embutido" : "sorteio"}`;
  igual(`Proposta × motor, crédito disponível (${tag})`, m.contemplacao.creditoDisponivel, p.disp);
  igual(`Proposta × motor, saldo devedor (${tag})`, m.contemplacao.saldoDevedor, p.saldoFinal);
  // Se cair um aniversário do grupo antes do 1º pagamento pós-contemplação, o motor aplica
  // o reajuste de 5% no saldo (regra da HS). O gerador de propostas não aplica.
  const prim = m.contemplacao.primeiroPagamentoPos;
  let aniversarios = 0; for (let k = caso.n + 1; k <= prim; k++) if ((k - 1) % 12 === 0) aniversarios++;
  igual(`Proposta × motor, 1ª parcela pós (${tag}${aniversarios ? ", com reajuste do saldo" : ""})`,
    m.parcelaPosInicial, p.parcelaPos * Math.pow(1.05, aniversarios));
}

// 7. Taxa efetiva (conferida antes em Python): parcela cheia, ano 1 = 22,7%, ano 10 = 7,7%
const c = M.simularCota({ credito: 1e6, prazo: 220, taxaTotal: 0.23, meia: false, reajuste: 0.05, modalidade: "nenhuma" });
igual("Taxa efetiva cheia, fim do ano 1 (%)", M.taxaEfetiva(c, 13) * 100, 22.7, 0.1);
igual("Taxa efetiva cheia, fim do ano 10 (%)", M.taxaEfetiva(c, 121) * 100, 7.7, 0.1);

// 8. Rendimento do crédito: 80% de 13,75% = 11% a.a. → 0,873% a.m.
igual("Rendimento ao mês (%)", M.mensal(0.1375 * 0.8) * 100, 0.8735, 0.001);

// 9. Financiamento SAC sem TR: 400 mil financiados, 360m, 11,5% a.a.
const f = M.financiamentoSAC({ valorImovel: 5e5, entrada: 0.2, taxaAa: 0.115, prazo: 360 });
const im = Math.pow(1.115, 1 / 12) - 1;
igual("SAC 1ª parcela", f.primeiraParcela, 4e5 / 360 + 4e5 * im);

// 10. IR: aporte único 100 mil, 24 meses, 13,65% a.a., IR 15%
const ir = [{ ate: 180, aliquota: 0.225 }, { ate: 360, aliquota: 0.2 }, { ate: 720, aliquota: 0.175 }, { ate: 99999, aliquota: 0.15 }];
const a = M.aplicarAportes({ aportes: [{ mes: 0, valor: 1e5 }], mesFinal: 25, taxaAa: 0.1365, tabelaIR: ir });
const rend = 1e5 * (Math.pow(1.1365, 25 / 12) - 1);
igual("CDB líquido 25 meses", a.liquido, 1e5 + rend * 0.85);

// 11. Venda da carta: 20% sobre o crédito líquido; lucro = venda − pago
const v = M.simularCota({ credito: 1e6, prazo: 220, taxaTotal: 0.23, meia: true, reajuste: 0.05, mesContemplacao: 36, modalidade: "sorteio" });
const venda = M.vendaCarta({ creditoDisponivel: v.contemplacao.creditoDisponivel, pagoAteContemplar: v.contemplacao.pagoTotal, agio: 0.2 });
igual("Venda: 20% de 1.102.500", venda.recebe, 220500);
igual("Venda: lucro = venda − pago", venda.lucro, 220500 - v.contemplacao.pagoTotal);

// 12. Seguro prestamista só quando escolhido (compra do bem)
const semSeg = M.simularCota({ credito: 1e6, prazo: 220, taxaTotal: 0.23, mesContemplacao: 36, modalidade: "sorteio", seguroPrestamista: 0.00055 });
const comSeg = M.simularCota({ credito: 1e6, prazo: 220, taxaTotal: 0.23, mesContemplacao: 36, modalidade: "sorteio", seguroPrestamista: 0.00055, comSeguro: true });
igual("Sem seguro, total de seguro = 0", semSeg.seguroTotal, 0);
// mês 37 é aniversário do grupo: o saldo reajusta 5% antes do seguro
igual("Com seguro, 1º mês = 0,055% do saldo reajustado", comSeg.meses[36].seguro, comSeg.contemplacao.saldoDevedor * 1.05 * 0.00055);

// 13. TIR: aplicar 100 e receber 110 um mês depois = 10% ao mês
igual("TIR simples (%)", M.tir([-100, 110]) * 100, 10, 0.001);

console.log(falhas ? `\n${falhas} conferência(s) com erro.` : "\nTodas as conferências bateram.");
process.exit(falhas ? 1 : 0);
