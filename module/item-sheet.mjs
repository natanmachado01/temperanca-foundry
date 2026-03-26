export class TemperancaItemSheet extends ItemSheet {
  static get defaultOptions() {
    return foundry.utils.mergeObject(super.defaultOptions, {
      width: 530,
      height: 340,
      classes: ["temperanca", "sheet", "item"]
    });
  }

  get template() {
    // Caminho atualizado
    return `systems/temperanca/templates/item-sheet.hbs`;
  }

  getData() {
    const context = super.getData();
    context.system = context.item.system;
    return context;
  }
}