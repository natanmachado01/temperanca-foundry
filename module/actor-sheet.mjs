import { rollCheck } from "./dice.mjs";
import { TALENTOS_DB } from "./talents.mjs";
import { FEITICOS_DB } from "./spells.mjs";
import { ITENS_DB } from "./items_db.mjs";

export class TemperancaActorSheet extends ActorSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      classes: ["temperanca", "sheet", "actor"],
      template: "systems/temperanca/templates/actor-sheet.hbs",
      width: 800,
      height: 920,
      tabs: [{ navSelector: ".sheet-tabs", contentSelector: ".sheet-body", initial: "inventory" }]
    });
  }

  getData() {
    const context = super.getData();
    context.system = context.data.system;
    context.config = CONFIG.temperanca;

    this._prepareCharacterData(context);
    this._prepareInventory(context);

    return context;
  }

  _prepareCharacterData(context) {
    const sys = context.system;
    const fisico = sys.stats?.fisico?.value || 1;
    const mente = sys.stats?.mente?.value || 1;
    
    // Saúde (Baseado em Físico + Temp)
    let baseM = 4; let baseF = 2; let baseT = 1; let baseL = 1;
    if (fisico >= 2) baseF = 3;
    if (fisico >= 3) baseT = 2;
    if (fisico >= 4) baseM = 5;
    if (fisico >= 5) baseF = 4;

    if (sys.saude) {
        const tempM = sys.saude.machucado.temp || 0;
        const tempF = sys.saude.ferimento.temp || 0;
        const tempT = sys.saude.trauma.temp || 0;
        const tempL = sys.saude.letal.temp || 0;

        sys.saude.machucado.max = baseM + tempM;
        sys.saude.ferimento.max = baseF + tempF;
        sys.saude.trauma.max = baseT + tempT;
        sys.saude.letal.max = baseL + tempL;
    }
    
    // Estresse
    sys.attributes.estresse.max = 4 + mente;

    // Limiares
    if (sys.attributes.limiares) {
        const grave = sys.attributes.limiares.grave || 0;
        sys.attributes.limiares.letal = grave * 2;
    }

    // Skills Separadas
    context.tecnicas = {};
    context.combate = {};
    for (let [key, skill] of Object.entries(sys.skills)) {
        if (skill.type === 'combate') context.combate[key] = skill;
        else context.tecnicas[key] = skill;
    }
  }

  _prepareInventory(context) {
      const fisico = context.system.stats.fisico.value || 1;
      
      // REGRA DE CARGA
      const maxCarga = 10 + (2 * fisico);
      context.system.attributes.carga = { max: maxCarga, value: 0 };

      context.armas = [];
      context.protecoes = [];
      context.equipamentos = [];
      context.consumiveis = [];
      context.recursos = [];
      context.talentos = [];
      context.feiticos = [];

      let cargaAtual = 0;

      for (let i of context.items) {
          if (i.type === 'talento') { context.talentos.push(i); continue; }
          if (i.type === 'feitico') { context.feiticos.push(i); continue; }

          let peso = i.system.weight || 0;
          let qtd = i.system.quantity || 1;
          cargaAtual += (peso * qtd);

          if (i.type === 'arma') context.armas.push(i);
          else if (i.type === 'protecao') context.protecoes.push(i);
          else if (i.type === 'consumivel') context.consumiveis.push(i);
          else if (i.type === 'recurso') context.recursos.push(i);
          else context.equipamentos.push(i);
      }

      context.system.attributes.carga.value = Math.round(cargaAtual * 10) / 10;
      context.system.attributes.carga.pct = Math.min(100, (cargaAtual / maxCarga) * 100);
  }

  activateListeners(html) {
    super.activateListeners(html);

    // Rolagens e Controles Básicos
    html.find('.rollable').click(this._onRollDialog.bind(this));
    html.find('.pip').click(this._onPipClick.bind(this));
    html.find('.temp-btn').click(this._onTempControl.bind(this));

    // CRUD Itens Genérico
    html.find('.item-create').click(this._onItemCreate.bind(this));
    html.find('.item-edit').click(ev => { const li = $(ev.currentTarget).parents(".item"); const item = this.actor.items.get(li.data("itemId")); item.sheet.render(true); });
    html.find('.item-delete').click(ev => { const li = $(ev.currentTarget).parents(".item"); this.actor.deleteEmbeddedDocuments("Item", [li.data("itemId")]); });
    html.find('.item-chat').click(this._onItemChat.bind(this));

    // BOTÕES ESPECÍFICOS (TALENTOS, FEITIÇOS, ITENS)
    html.find('.add-talent-btn').click(this._onAddTalentDialog.bind(this));
    html.find('.add-spell-btn').click(this._onAddSpellDialog.bind(this));
    html.find('.cast-spell-btn').click(this._onCastSpell.bind(this));
    html.find('.add-item-btn').click(this._onAddItemDialog.bind(this));
  }

  // --- FUNÇÕES DE ITEM E CHAT ---
  
  _onItemChat(ev) {
    ev.preventDefault();
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    
    let stats = "";
    if (item.type === 'arma') stats = `<p><strong>Dano:</strong> ${item.system.damage}</p><p><strong>Qualidade:</strong> ${item.system.quality}</p>`;
    if (item.type === 'protecao') stats = `<p><strong>Redução:</strong> ${item.system.reduction}</p><p><strong>Durabilidade:</strong> ${item.system.durability}</p>`;
    
    const content = `
        <div class="temperanca-chat-item">
            <div class="chat-header"><img src="${item.img}" width="30" height="30"/><h3>${item.name}</h3></div>
            <div class="chat-desc">${item.system.description}</div>
            <div class="chat-footer">${stats}</div>
        </div>
    `;
    ChatMessage.create({ content: content, speaker: ChatMessage.getSpeaker({ actor: this.actor }) });
  }

  _onPipClick(ev) { ev.preventDefault(); const d=ev.currentTarget.dataset; const v=(parseInt(d.index)+1); const c=this.actor.system.saude[d.type].value; this.actor.update({[`system.saude.${d.type}.value`]: v===c?v-1:v}); }
  
  _onTempControl(ev) { ev.preventDefault(); const d=ev.currentTarget.dataset; let v=this.actor.system.saude[d.type].temp||0; if(d.action==="plus")v++; else v--; this.actor.update({[`system.saude.${d.type}.temp`]: v}); }

  async _onItemCreate(event) {
    event.preventDefault();
    const type = event.currentTarget.dataset.type;
    const itemData = { name: `Novo ${type}`, type: type };
    return await Item.create(itemData, { parent: this.actor });
  }

  // --- DIALOGS DE SELEÇÃO ---

  // 1. ADICIONAR ITEM (INVENTÁRIO)
async _onAddItemDialog(ev) {
      ev.preventDefault();
      const content = `
        <form><div class="form-group"><label>Tipo</label><select name="type">
          <option value="arma">Armas</option><option value="protecao">Proteções</option>
          <option value="consumivel">Consumíveis</option><option value="equipamento">Equipamentos</option>
          <option value="recurso">Recursos</option></select></div></form>`;

      new Dialog({
          title: "Adicionar Item", content: content,
          buttons: { next: { label: "Listar", callback: (html) => { const type = html.find('[name="type"]').val(); this._showItemList(type); } } }
      }).render(true);
  }

  _showItemList(type) {
      const items = ITENS_DB[type] || [];
      let listHtml = `<div class="talent-selection-list">`;
      
      // Opção Personalizada
      listHtml += `<div class="talent-option custom-option" style="border: 1px dashed #500; background: rgba(100,0,0,0.05);"><input type="radio" name="selectedItem" id="i_custom" value="custom" checked><label for="i_custom"><strong>+ Criar Personalizado</strong></label></div>`;

      // Lista do DB
      items.forEach((i, index) => {
          listHtml += `<div class="talent-option"><input type="radio" name="selectedItem" id="i_${index}" value="${index}"><label for="i_${index}"><strong>${i.name}</strong> <span style="font-size:0.8em">(${i.weight} Carga)</span><br><span class="desc">${i.description}</span></label></div>`;
      });
      listHtml += `</div>`;

      new Dialog({
          title: `Itens: ${type.toUpperCase()}`, content: `<form>${listHtml}</form>`,
          buttons: {
              add: {
                  label: "Adicionar",
                  icon: '<i class="fas fa-check"></i>',
                  callback: async (html) => {
                      const val = html.find('input[name="selectedItem"]:checked').val();
                      let itemData = {};

                      if (val === "custom") {
                          // CORREÇÃO AQUI: Garantir que system.description existe e está vazio
                          itemData = { 
                              name: "Novo Item", 
                              type: type, 
                              img: "icons/svg/item-bag.svg",
                              system: {
                                  description: "Edite a descrição aqui...", // Texto padrão para evitar campo vazio/travado
                                  weight: 0,
                                  quantity: 1,
                                  // Campos específicos para evitar erros de validação
                                  damage: "",
                                  quality: "",
                                  durability: 0,
                                  uses: 0,
                                  reduction: 0
                              }
                          };
                      } else {
                          const dbItem = items[val];
                          itemData = {
                              name: dbItem.name,
                              type: type,
                              img: "icons/svg/item-bag.svg",
                              system: {
                                  description: dbItem.description,
                                  weight: dbItem.weight || 0,
                                  quantity: dbItem.quantity || 1,
                                  damage: dbItem.damage || "",
                                  quality: dbItem.quality || "",
                                  durability: dbItem.durability || 0,
                                  uses: dbItem.uses || 0,
                                  reduction: dbItem.reduction || 0
                              }
                          };
                      }
                      
                      const created = await Item.create(itemData, { parent: this.actor });
                      
                      // Forçar abertura da ficha se for personalizado
                      if (val === "custom") {
                          created.sheet.render(true);
                      }
                  }
              }
          }
      }).render(true);
  }

  // 2. ADICIONAR TALENTO
  async _onAddTalentDialog(event) {
    event.preventDefault();
    const content = `
      <form><div class="form-group"><label>Árvore</label><select name="tree"><option value="Violencia">Violência</option><option value="Sobrevivencia">Sobrevivência</option><option value="Convivencia">Convivência</option></select></div><div class="form-group"><label>Tier</label><select name="tier"><option value="1">Tier 1</option><option value="2">Tier 2</option><option value="3">Tier 3</option></select></div></form>`;

    new Dialog({
      title: "Selecionar Categoria", content: content,
      buttons: { next: { label: "Buscar", callback: (html) => { const tree = html.find('[name="tree"]').val(); const tier = html.find('[name="tier"]').val(); this._showTalentList(tree, tier); } } }
    }).render(true);
  }

  _showTalentList(tree, tier) {
    const talents = TALENTOS_DB[tree][tier] || [];
    let listHtml = `<div class="talent-selection-list">`;
    talents.forEach((t, index) => { listHtml += `<div class="talent-option"><input type="radio" name="selectedTalent" id="t_${index}" value="${index}"><label for="t_${index}"><strong>${t.name}</strong><br><span class="desc">${t.description}</span></label></div>`; });
    listHtml += `<div class="talent-option custom-option" style="border: 1px dashed #500; background: rgba(100,0,0,0.05);"><input type="radio" name="selectedTalent" id="t_custom" value="custom"><label for="t_custom"><strong>+ Criar Personalizado</strong></label></div></div>`;

    new Dialog({
      title: `Talentos: ${tree} (Tier ${tier})`, content: `<form>${listHtml}</form>`,
      buttons: {
        add: { label: "Adicionar", icon: '<i class="fas fa-check"></i>', callback: async (html) => {
            const val = html.find('input[name="selectedTalent"]:checked').val();
            if (val === "custom") { const i = await Item.create({ name: "Novo Talento", type: "talento", img: "icons/svg/book.svg", system: { description: "...", tree: tree, tier: parseInt(tier) } }, { parent: this.actor }); i.sheet.render(true); } 
            else if (val !== undefined) { const t = talents[val]; await Item.create({ name: t.name, type: "talento", img: "icons/svg/book.svg", system: { description: t.description, tree: tree, tier: parseInt(tier) } }, { parent: this.actor }); }
        }}
      }
    }).render(true);
  }

  // 3. ADICIONAR FEITIÇO
  async _onAddSpellDialog(ev) {
    ev.preventDefault();
    let listHtml = `<div class="talent-selection-list">`;
    listHtml += `<div class="talent-option custom-option" style="border: 1px dashed #500; background: rgba(100,0,0,0.05);"><input type="radio" name="selectedSpell" id="s_custom" value="custom" checked><label for="s_custom"><strong>+ Criar Personalizado</strong></label></div>`;
    
    FEITICOS_DB.forEach((s, index) => {
        if(s.custom) return; // Pula o custom do DB se existir, já pusemos acima
        listHtml += `<div class="talent-option"><input type="radio" name="selectedSpell" id="s_${index}" value="${index}"><label for="s_${index}"><strong>${s.name}</strong><br><span class="desc">${s.description}</span></label></div>`;
    });
    listHtml += `</div>`;

    new Dialog({
        title: `Grimório`, content: `<form>${listHtml}</form>`,
        buttons: {
            add: { label: "Aprender", icon: '<i class="fas fa-book"></i>', callback: async (html) => {
                const val = html.find('input[name="selectedSpell"]:checked').val();
                if (val === "custom") { const i = await Item.create({ name: "Novo Feitiço", type: "feitico", img: "icons/svg/mystery-man.svg", system: { description: "..." } }, { parent: this.actor }); i.sheet.render(true); }
                else { const s = FEITICOS_DB[val]; await Item.create({ name: s.name, type: "feitico", img: "icons/svg/mystery-man.svg", system: { description: s.description } }, { parent: this.actor }); }
            }}
        }
    }).render(true);
  }

// --- CONJURAÇÃO (COM VANTAGEM/DESVANTAGEM) ---
  _onCastSpell(ev) {
    ev.preventDefault();
    const li = $(ev.currentTarget).parents(".item");
    const item = this.actor.items.get(li.data("itemId"));
    const vontadeBonus = this.actor.system.passivas.vontade.value || 0;
    
    new Dialog({
        title: `Conjurar ${item.name}`,
        content: `
            <form style="font-family:'Georgia'">
                <div class="grid grid-2col" style="gap:10px;">
                      <div class="form-group">
                          <label>Dificuldade (DT)</label>
                          <input type="number" name="dt" value="8" style="text-align:center">
                      </div>
                      <div class="form-group">
                          <label style="color:#0055a0">Modificador Extra</label>
                          <input type="number" name="modifier" value="0" style="text-align:center">
                      </div>
                </div>
                <div class="grid grid-2col" style="margin-top:10px; gap:10px;">
                    <div class="form-group">
                        <label style="color:green">Vantagem (+d)</label>
                        <input type="number" name="advantage" value="0" min="0" style="text-align:center">
                    </div>
                    <div class="form-group">
                        <label style="color:red">Desvantagem (-d)</label>
                        <input type="number" name="disadvantage" value="0" min="0" style="text-align:center">
                    </div>
                </div>
                <hr>
                <p style="font-size:0.9em; text-align:center;">Teste de Mente + Vontade (${vontadeBonus})</p>
            </form>
        `,
        buttons: {
            cast: {
                label: "CONJURAR",
                icon: '<i class="fas fa-magic"></i>',
                callback: (html) => {
                    const dt = parseInt(html.find('[name="dt"]').val()) || 8;
                    const adv = parseInt(html.find('[name="advantage"]').val()) || 0;
                    const dis = parseInt(html.find('[name="disadvantage"]').val()) || 0;
                    const modifier = parseInt(html.find('[name="modifier"]').val()) || 0;
                    // Passa adv e dis para a função
                    rollCheck(this.actor, `Conjurar: ${item.name}`, vontadeBonus, "mente", dt, true, adv, dis, modifier);
                }
            }
        },
        default: "cast"
    }).render(true);
  }

  // --- ROLAGEM GERAL (COM VANTAGEM/DESVANTAGEM) ---
  async _onRollDialog(event) {
    event.preventDefault();
    const d = event.currentTarget.dataset;
    const label = d.label;
    const bonus = parseInt(d.bonus) || 0;
    const defaultAttr = d.attr || "intelecto";

    new Dialog({
      title: `Testar ${label}`,
      content: `
      <form style="font-family:'Georgia'">
        <div class="form-group">
          <label>Atributo</label>
          <select name="attribute">
            <option value="fisico" ${defaultAttr === "fisico" ? "selected" : ""}>Físico</option>
            <option value="motoras" ${defaultAttr === "motoras" ? "selected" : ""}>Motoras</option>
            <option value="intelecto" ${defaultAttr === "intelecto" ? "selected" : ""}>Intelecto</option>
            <option value="mente" ${defaultAttr === "mente" ? "selected" : ""}>Mente</option>
          </select>
        </div>
        <div class="grid grid-2col" style="gap:10px;">
              <div class="form-group">
                  <label>Dificuldade (DT)</label>
                  <input type="number" name="dt" value="8" style="text-align:center">
              </div>
              <div class="form-group">
                  <label style="color:#0055a0">Modificador Extra</label>
                  <input type="number" name="modifier" value="0" style="text-align:center">
              </div>
          </div>
        <div class="grid grid-2col" style="margin-top:10px; gap:10px;">
            <div class="form-group">
                <label style="color:green">Vantagem (+d)</label>
                <input type="number" name="advantage" value="0" min="0" style="text-align:center">
            </div>
            <div class="form-group">
                <label style="color:red">Desvantagem (-d)</label>
                <input type="number" name="disadvantage" value="0" min="0" style="text-align:center">
            </div>
        </div>
        <hr>
        <div style="text-align:center; font-size: 0.9em; color: #555;">Bônus: +${bonus}</div>
      </form>`,
      buttons: {
        roll: {
          label: "Rolar Dados",
          callback: (html) => {
            const attr = html.find('[name="attribute"]').val();
            const dt = parseInt(html.find('[name="dt"]').val()) || 8;
            const adv = parseInt(html.find('[name="advantage"]').val()) || 0;
            const dis = parseInt(html.find('[name="disadvantage"]').val()) || 0;
            const modifier = parseInt(html.find('[name="modifier"]').val()) || 0;
            // Passa adv e dis para a função
            rollCheck(this.actor, label, bonus, attr, dt, false, adv, dis, modifier);
          }
        }
      },
      default: "roll"
    }).render(true);
  }
}