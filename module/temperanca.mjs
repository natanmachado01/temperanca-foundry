import { TemperancaActorSheet } from "./actor-sheet.mjs";
import { TemperancaItemSheet } from "./item-sheet.mjs";
import { TALENTOS_DB } from "./talents.mjs";
import { FEITICOS_DB } from "./spells.mjs";
import { ITENS_DB } from "./items_db.mjs"; 
import "./dice-3d.mjs";

Hooks.once("init", async function () {
  console.log("Temperança | Inicializando...");

  CONFIG.temperanca = {
      talentos: TALENTOS_DB,
      feiticos: FEITICOS_DB,
      itens: ITENS_DB
  };

  Actors.unregisterSheet("core", ActorSheet);
  Actors.registerSheet("temperanca", TemperancaActorSheet, { makeDefault: true });
  
  Items.unregisterSheet("core", ItemSheet);
  Items.registerSheet("temperanca", TemperancaItemSheet, { makeDefault: true });

  Handlebars.registerHelper("times", function(n, content){
      let result = "";
      for(let i = 0; i < n; ++i) result += content.fn(i);
      return result;
  });
  
  Handlebars.registerHelper("checkPip", function(index, val){
      return index < val ? "filled" : "";
  });
  
  // Helper para comparar valores (útil para os ifs do template)
  Handlebars.registerHelper("gt", function(a, b){
      return a > b;
  });
  
  Handlebars.registerHelper("eq", function(a, b){
      return a === b;
  });

  return preloadHandlebarsTemplates();
});

async function preloadHandlebarsTemplates() {
  return loadTemplates([
    "systems/temperanca/templates/actor-sheet.hbs",
    "systems/temperanca/templates/item-sheet.hbs"
  ]);
}