// Cópia de reserva dos dados da planilha.
// Só é usada quando a apresentação abre pela primeira vez sem internet.
// Com internet, os dados vêm sempre da planilha "Apresentação Redecon – Dados".
window.DADOS_PADRAO = {
  atualizadoEm: "2026-10-02",
  parametros: {
    selic_auto: 0.1375, selic_manual: null, pct_selic_credito: 0.80,
    reajuste_aa: 0.05, incc_12m: null, lance_embutido: 0.30, meses_sem_pagar_lance: 2,
    seguro_prestamista: 0.00055, agio_venda: 0.20,
    cdi_auto: 0.1365, cdb_pct_cdi: 1.00, poupanca_am: 0.005, tr_aa: 0.01166,
    fin_taxa_aa: 0.115, fin_entrada: 0.20, fin_prazo: 360, fin_sistema: "SAC", fin_cet_aa: null,
    aluguel_am: 0.004, st_diaria_usd: 40, st_ocupacao: 0.321, st_custos: 0.40,
    ex_credito: 1000000, ex_prazo: 220, ex_parcela: "meia"
  },
  indices: { selic: { data: "16/09/2026", valor: 13.75 }, cdi: { data: null, valor: 13.65 }, dolar: { data: null, valor: null } },
  prazos: [
    { prazo: 180, taxa_adm: 0.22, fundo_reserva: 0.01 },
    { prazo: 200, taxa_adm: 0.22, fundo_reserva: 0.01 },
    { prazo: 220, taxa_adm: 0.22, fundo_reserva: 0.01 },
    { prazo: 240, taxa_adm: 0.23, fundo_reserva: 0.01 }
  ],
  funil: [
    { modalidade: "Sorteio", condicao: "Parcela em dia", meses: 0, concorrencia: 0.90, obs: "" },
    { modalidade: "Lance Limitado", condicao: "Parcela em dia", meses: 0, concorrencia: 0.85, obs: "" },
    { modalidade: "Fidelidade 1", condicao: "6 parcelas consecutivas em dia", meses: 6, concorrencia: 0.50, obs: "" },
    { modalidade: "Fidelidade 2", condicao: "12 parcelas consecutivas em dia", meses: 12, concorrencia: 0.35, obs: "" },
    { modalidade: "Fidelidade 3", condicao: "18 parcelas consecutivas em dia", meses: 18, concorrencia: 0.15, obs: "" },
    { modalidade: "Fidelidade 4", condicao: "24 parcelas consecutivas em dia", meses: 24, concorrencia: 0.07, obs: "" }
  ],
  ir: [
    { ate: 180, aliquota: 0.225 }, { ate: 360, aliquota: 0.20 },
    { ate: 720, aliquota: 0.175 }, { ate: 99999, aliquota: 0.15 }
  ],
  institucional: {
    hs_corretores: "+1.000", hs_cidades: "+1.400", hs_cotas: "+400 mil",
    hs_vendas_ano: "+R$ 27 bilhões", hs_vendas_mes: "+R$ 2,5 bilhões", hs_contemplacoes: "+2 mil",
    rd_clientes: "+3.200 no Brasil e em outros 12 países", rd_creditos: "+R$ 1 bilhão",
    rd_anos: "+15 anos", rd_bens: "+900",
    ct_instagram: "@redeconconsorcios", ct_instagram_url: "https://www.instagram.com/redeconconsorcios/",
    ct_site: "www.redeconconsorcios.com.br", ct_whatsapp: "(46) 99128-3114"
  },
  textos: {
    aviso_padrao: "Simulação estimada. Valores sujeitos a variações. Não representa promessa de contemplação.",
    aviso_funil: "Concorrência média por modalidade, com base no histórico dos grupos. Não é promessa de contemplação.",
    capa_titulo: "Aquisição, poupança e investimento em um só produto.",
    capa_subtitulo: "Consórcio imobiliário como decisão financeira.",
    regras_titulo: "As regras do jogo",
    regra_investimento_titulo: "Você define o investimento",
    regra_investimento: "Defina quanto quer investir por mês.",
    regra_vencimento_titulo: "Vencimento no dia 10",
    regra_vencimento: "Vencimento todo dia 10. Se cair em fim de semana ou feriado, vai para o próximo dia útil.",
    regra_fidelidade_titulo: "Fidelidade não acumula",
    regra_fidelidade: "As fidelidades exigem parcelas pagas em dia, seguidas. Um dia de atraso zera a contagem e as fidelidades precisam ser conquistadas de novo.",
    funil_titulo: "Quanto mais disciplina, menor a concorrência.",
    otimizar_titulo: "Estratégias para acelerar sua contemplação",
    otimizar_grupo_t: "Escolha do grupo",
    otimizar_grupo: "Prazo e regras de lance mudam de um grupo para outro. Indicamos o grupo que combina com o seu objetivo.",
    otimizar_multicotas_t: "Multicotas",
    otimizar_multicotas: "Dividir o crédito em mais de uma cota coloca mais cotas concorrendo em cada assembleia.",
    otimizar_multicotas_obs: "Faz mais sentido para quem pretende vender a carta. Para usar o crédito todo, é preciso aguardar a contemplação de todas as cotas.",
    otimizar_lance_t: "Lance embutido",
    otimizar_lance: "Até {lance_embutido} do próprio crédito pode ser usado como lance, sem tirar dinheiro do bolso.",
    otimizar_fidelidade_t: "Fidelidade",
    otimizar_fidelidade: "Pagando em dia, você entra em modalidades com bem menos concorrência.",
    aq_usos_titulo: "Um crédito, vários caminhos para o seu imóvel",
    aq_usos_comprar_t: "Comprar",
    aq_usos_comprar: "Casa pronta, apartamento, sala comercial, terreno urbano ou rural e barracão.",
    aq_usos_construir_t: "Construir ou reformar",
    aq_usos_construir: "Construção, reforma e ampliação do seu imóvel.",
    aq_usos_quitar_t: "Quitar financiamento",
    aq_usos_quitar: "Use o crédito para quitar o financiamento e sair dos juros do banco.",
    aq_usos_rodape: "Contemplou e não quer comprar agora? O crédito também pode ser vendido ou ficar rendendo.",
    aq_comp_titulo: "Três formas de comprar o mesmo imóvel",
    po_reaj_titulo: "O seu crédito acompanha o reajuste, e a taxa efetiva cai com o tempo",
    po_prev_titulo: "Do crédito para a renda",
    po_prev_sub: "Quanto esse valor aplicado pode pagar por mês para você.",
    in_selic_titulo: "Você paga {reajuste_aa} ao ano sobre o saldo. Seu crédito rende {pct_selic_credito} da Selic.",
    in_venda_titulo: "A carta contemplada tem valor de mercado",
    in_aluguel_titulo: "O aluguel pode pagar a parcela",
    compromisso_titulo: "O seu compromisso e o nosso",
    compromisso_cliente_rotulo: "O seu único compromisso",
    compromisso_cliente: "Pagar a parcela em dia.",
    compromisso_redecon_rotulo: "O que a Redecon faz por você",
    compromisso_redecon_itens: "Envia o boleto todo mês; Oferta os lances nas assembleias; Orienta, sugere caminhos e analisa as possibilidades a cada decisão; Acompanha você da primeira conversa até a entrega do bem"
  }
};
