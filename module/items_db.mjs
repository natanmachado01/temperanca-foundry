export const ITENS_DB = {
    "arma": [
        { name: "Desarmado", damage: "1d4", type: "Branca", range: "Corpo a Corpo", weight: 0, durability: 3, quality: "Improvisado", description: "Ataques com o próprio corpo" },
        { name: "Faca / Canivete (Leve)", damage: "1d6", type: "Branca", range: "Arremesso", weight: 1, durability: 5, quality: "Comum", description: "Lâminas curtas, fáceis de esconder." },
        { name: "Facão / Machado (Uma Mão)", damage: "1d8", type: "Branca", range: "Corpo a Corpo", weight: 2, durability: 5, quality: "Comum", description: "Armas de médio porte." },
        { name: "Marreta / Montante (Duas Mãos)", damage: "1d10", type: "Branca", range: "Corpo a Corpo", weight: 3, durability: 5, quality: "Comum", description: "Armas pesadas que exigem as duas mãos." },
        { name: "Arco de Caça", damage: "1d10 + Físico", type: "Disparo", range: "Médio", weight: 2, durability: 5, quality: "Comum", description: "Silencioso. Recarga livre." },
        { name: "Balestra", damage: "2d6", type: "Disparo", range: "Longo", weight: 3, durability: 5, quality: "Comum", description: "Potente. Recarga: 1 Ação Rápida." },
        { name: "Revólver", damage: "2d4 (Pequeno) / 2d6 (Médio)", type: "Fogo", range: "Médio", weight: 2, durability: 5, quality: "Comum", ammo: "4", description: "Confiável: Não trava com falhas agravadas. Recarga: Demorada." },
        { name: "Pistola", damage: "2d4 (Pequeno)", type: "Fogo", range: "Curto", weight: 1, durability: 5, quality: "Comum", ammo: "8", description: "Discreta: +1 para esconder. Recarga: Rápida." },
        { name: "Espingarda", damage: "2d6 (Médio) / 2d8 (Pesado)", type: "Fogo", range: "Curto", weight: 3, durability: 5, quality: "Comum", ammo: "2", description: "Letal: +1 dado de dano em alcance próximo. Recarga: Demorada." },
        { name: "Rifle de Caça", damage: "2d6 (Médio) / 2d8 (Pesado)", type: "Fogo", range: "Médio", weight: 3, durability: 5, quality: "Comum", ammo: "2", description: "Precisão: Pode gastar ação rápida para mirar (+2 dano). Recarga: Rápida." }
    ],
    "protecao": [
        { name: "Proteção Genérica", reduction: 1, threshold_bonus_major: 3, threshold_bonus_severe: 3, weight: 2, durability: 5, description: "Roupas grossas ou improvisadas." },
        { name: "Jaleco de Doutor", reduction: 2, threshold_bonus_major: 2, threshold_bonus_severe: 2, weight: 1, durability: 4, description: "+2 ao usar itens/talentos de cura. Redução física." },
        { name: "Robe de Cultista", reduction: 2, threshold_bonus_major: 1, threshold_bonus_severe: 1, weight: 1, durability: 4, description: "+2 dano/cura em feitiços. Redução sobrenatural." },
        { name: "Uniforme Militar", reduction: 2, threshold_bonus_major: 3, threshold_bonus_severe: 4, weight: 2, durability: 5, description: "+1 dano armas de fogo, +1 atletismo. Redução física/balística." },
        { name: "Jaqueta de Combate", reduction: 2, threshold_bonus_major: 4, threshold_bonus_severe: 3, weight: 2, durability: 4, description: "+1 dano corpo a corpo. Redução física/elemental." },
        { name: "Armadura de Couro", reduction: 3, threshold_bonus_major: 5, threshold_bonus_severe: 4, weight: 2, durability: 4, description: "+1 furtividade, +2m movimento. Redução física/elemental." },
        { name: "Cota de Malha", reduction: 4, threshold_bonus_major: 6, threshold_bonus_severe: 5, weight: 4, durability: 5, description: "Reduz movimento em 2m. Redução física/balística." },
        { name: "Militar de Elite", reduction: 5, threshold_bonus_major: 7, threshold_bonus_severe: 10, weight: 5, durability: 7, description: "Impede desmembramento. Reduz movimento em 2m. Redução total." }
    ],
    "equipamento": [
        { name: "Algemas", weight: 1, description: "Prende alguém (teste de ataque). Soltar exige sucesso crítico em Força ou chave." },
        { name: "Binóculos", weight: 1, description: "+2 em testes de percepção para observar longe." },
        { name: "Lanterna/Lamparina", weight: 1, description: "Ilumina. Pode cegar alvo por 1 rodada (ação, alcance curto)." },
        { name: "Pé de Cabra", weight: 2, description: "+1 para arrombar portas. Conta como arma improvisada." },
        { name: "Pistola Sinalizadora", weight: 1, description: "Dispara luz. Como arma: 1d8+2 fogo (curto). 2 cargas." },
        { name: "Máscara de Gás", weight: 1, description: "Vantagem em resistência contra gases." },
        { name: "Bandoleira", weight: 0, description: "Permite sacar/guardar item como ação livre 1x/rodada." },
        { name: "Mochila", weight: 0, description: "Necessária para carregar itens além do básico." }
    ],
    "consumivel": [
        { name: "Erva Azul", uses: 1, weight: 0.3, description: "Cura 1 espaço de Machucado." },
        { name: "Erva Vermelha", uses: 1, weight: 0.3, description: "Cura 1 Machucado e uma condição em membros." },
        { name: "Erva Verde", uses: 1, weight: 0.3, description: "Cura Infecção." },
        { name: "Raiz Azul Escura", uses: 1, weight: 0.3, description: "Cura 1 Ferimento agora e 1 Machucado na próxima rodada." },
        { name: "Lavanda / Tabaco", uses: 1, weight: 0.3, description: "Limpa 1 ponto de Estresse." },
        { name: "Álcool (Vodka/Whisky)", uses: 2, weight: 1, description: "Restaura 2 Sanidade (fica bêbado se usar tudo)." },
        { name: "Medikit (Faixas)", uses: 2, weight: 1, description: "Para conter sangramentos." },
        { name: "Molotov", uses: 1, weight: 1, description: "3d6 dano de fogo em área. Queimadura." },
        { name: "Granada", uses: 1, weight: 1, description: "6d6 dano de fragmentação em área." }
    ],
    "recurso": [
        { name: "Sucata", quantity: 1, weight: 1, description: "Usada para reparos e modificações." },
        { name: "Comida (Ração)", quantity: 1, weight: 0.3, description: "Remove fome. 1 Carga a cada 3 unidades." },
        { name: "Munição (Pack)", quantity: 1, weight: 1, description: "Munição para armas de fogo." },
        { name: "Componentes Místicos", quantity: 1, weight: 0.3, description: "Para rituais e feitiços." }
    ]
};