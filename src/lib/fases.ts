export const fasesLic = [
    'Elaboração do DFD',
    'Levantamento dos Itens',
    'Especificação',
    'Quantitativos',
    'Cadastro SIPAC',
    'Elaboração do ETP',
    'Requisições SIPAC',
    'Pesquisa Preços',
    'Consolidação da Pesquisa de Preços',
    'Email DCOM',
    'MAPA DE RISCO',
    'Elaboração do TR',
    'Análise de proposta',
    'Elaboração contrato',
    'Assinatura contrato',
    'STATUS FINAL',
    'Nº PROCESSO SEI',
] as const;

export function isValidFase(fase: string): boolean {
    return fasesLic.includes(fase as (typeof fasesLic)[number]);
}
