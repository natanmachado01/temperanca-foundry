Hooks.once('diceSoNiceReady', (dice3d) => {
    // 1. REGISTRAR AS CORES (COLORSETS)
    // Isso faz com que "Temperança: Normal" e "Temperança: Estresse" apareçam
    // nas listas de temas para qualquer um usar.
    
    dice3d.addColorset({
        name: 'Normal', // Nome interno (usado no chat: d10[Normal])
        description: 'Temperança: Dados Normais', // Nome legível no menu
        category: 'Temperança',
        foreground: '#ffffff', // Cor do Texto
        background: '#111111', // Cor do Fundo
        outline: '#000000',
        texture: 'marble',
        material: 'plastic'
    }, "default");

    dice3d.addColorset({
        name: 'Estresse', // Nome interno (usado no chat: d10[Estresse])
        description: 'Temperança: Dados de Estresse',
        category: 'Temperança',
        foreground: '#000000',
        background: '#8a0303', // Vermelho Sangue
        outline: '#000000',
        texture: 'marble',     // Textura padrão
        material: 'plastic'
    }, "default");

    // 2. REGISTRAR O SISTEMA (SYSTEM PRESET)
    // Isso cria a opção "Temperança RPG" no menu "Sistema" do Dice So Nice.
    // Ao selecionar isso, ele aplica automaticamente as cores acima.
    
    dice3d.addSystem({
        id: "temperanca", // ID único do seu sistema
        name: "Temperança RPG" // Nome que aparece no menu
    }, "default"); // "default" significa que usa os modelos 3D padrões

    // 3. VINCULAR DADOS AO SISTEMA
    // Aqui dizemos: "Neste sistema, o d10 usa a cor Normal".
    // O dado de Estresse é chamado via chat command, então não precisa de vínculo padrão,
    // mas se quiser forçar um padrão global, faria aqui.
    dice3d.addDicePreset({
        type: "d10",
        labels: ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10"], // Labels padrões
        system: "temperanca", // Vincula ao sistema criado acima
        colorset: "Normal" // Define a cor padrão para d10 neste sistema
    });
});