export async function rollCheck(actor, label, bonus, attributeKey, difficulty, isSpell = false, advantage = 0, disadvantage = 0) {
  // 1. Obter valores iniciais
  const attributeValue = actor.system.stats[attributeKey]?.value || 0;
  const stressValue = actor.system.attributes.estresse.value || 0;
  
  // 2. Divisão Inicial (Normal vs Estresse)
  // Calcula quantos dados seriam de estresse e quantos normais BASEADO NO ATRIBUTO
  let baseStressDice = Math.min(stressValue, attributeValue); 
  let baseNormalDice = Math.max(0, attributeValue - baseStressDice); 

  // Proteção: Se atributo for 0 (rola 1 dado de chance)
  if (attributeValue === 0) {
      if (stressValue > 0) { baseStressDice = 1; baseNormalDice = 0; }
      else { baseStressDice = 0; baseNormalDice = 1; }
  }

  // 3. Aplicar DESVANTAGEM (Remove dados)
  // Regra: "dão prioridade para remover dados comuns e depois os dados de estresse"
  let currentNormal = baseNormalDice;
  let currentStress = baseStressDice;
  let textDisadv = "";

  if (disadvantage > 0) {
      // 1º: Tenta remover dos normais
      let removeNormal = Math.min(currentNormal, disadvantage);
      currentNormal -= removeNormal;
      
      // 2º: Se sobrou desvantagem, remove do estresse
      let remainingDisadv = disadvantage - removeNormal;
      if (remainingDisadv > 0) {
          let removeStress = Math.min(currentStress, remainingDisadv);
          currentStress -= removeStress;
      }
      textDisadv = `(-${disadvantage} dados)`;
  }

  // 4. Aplicar VANTAGEM (Adiciona dados normais)
  // Regra: "dados extras que não são afetados por estresse"
  if (advantage > 0) {
      currentNormal += advantage;
  }

  // 5. Montar a Fórmula
  let formulaParts = [];
  
  // Só adiciona na fórmula se tiver dados > 0
  if (currentNormal > 0) formulaParts.push(`${currentNormal}d10[Normal]`);
  if (currentStress > 0) formulaParts.push(`${currentStress}d10[Estresse]`); 

  // Se a desvantagem zerou tudo, não rola nada (ou rola 0d10)
  if (formulaParts.length === 0) {
      formulaParts.push("0d10");
  }

  let formula = formulaParts.join(" + ");
  
  // 6. Rolar
  let roll = new Roll(formula);
  await roll.evaluate();

  // 7. Analisar Resultados
  let highest = 0;
  let panicCount = 0; 
  let currentTermIndex = 0;
  
  // -- Checa Dados Normais --
  if (currentNormal > 0) {
      let term = roll.terms[currentTermIndex];
      if (term && term.results) {
          term.results.forEach(r => {
              if (r.result > highest) highest = r.result;
          });
      }
      currentTermIndex += 2; 
  }

  // -- Checa Dados de Estresse --
  if (currentStress > 0) {
      // Se não teve normal antes, o estresse é o termo 0, senão é o 2 (pula o +)
      let termIndex = (currentNormal > 0) ? 2 : 0;
      let term = roll.terms[termIndex];
      
      if (term && term.results) {
          term.results.forEach(r => {
              if (r.result === 1) panicCount++; 
              if (r.result > highest) highest = r.result;
          });
      }
  }

  let total = highest + bonus;
  
  // 8. Determinar Resultado (Lógica de Pânico/Distorção/Falha)
  let outcome = "Falha";
  let flavorClass = "failure";
  let warningMsg = "";
  
  if (panicCount >= 2) {
      outcome = isSpell ? "A conjuração é falha" : "Sua mente é testada.";
      flavorClass = "panic-total"; 
      warningMsg = isSpell ? "Rolagem de Distorção" : "Rolagem de Pânico";
  
  } else if (panicCount === 1) {
      if (isSpell) {
          outcome = "DISTORÇÃO";
          flavorClass = "distortion"; 
          warningMsg = "A magia falha e se corrompe.";
      } else {
          outcome = "FALHA AGRAVADA";
          flavorClass = "panic";
          warningMsg = "O medo cobra seu preço";
      }

  } else if (total >= difficulty) {
      outcome = "Sucesso";
      flavorClass = "success";
  }

  // 9. Mensagem no Chat
  let content = `
    <div class="temperanca-roll ${flavorClass}">
      <div class="roll-header">
        <h3>${isSpell ? '🔮 ' : ''}${label}</h3>
        <span class="roll-attr">${attributeKey.toUpperCase()} (${attributeValue}) vs DT ${difficulty}</span>
      </div>
      
      <div class="roll-dice">
        ${formula} + ${bonus} (Mod)
      </div>
      
      ${(advantage > 0 || disadvantage > 0) ? 
        `<div style="font-size:0.8em; color:#777; text-align:center; margin-bottom:5px;">
           ${advantage > 0 ? `+${advantage} Vantagem` : ''} 
           ${disadvantage > 0 ? `-${disadvantage} Desvantagem` : ''}
        </div>` : ''}

      <div class="roll-total">
        ${total}
      </div>

      <div class="roll-outcome">
        ${outcome}
      </div>

      ${warningMsg ? `<div class="warning-box">${warningMsg}</div>` : ''}
    </div>
  `;

  roll.toMessage({
    speaker: ChatMessage.getSpeaker({ actor: actor }),
    flavor: content
  });
}