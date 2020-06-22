namespace Import {
  test();

  function test(): void {
    console.log(data);
    let storedValues: StoredValues = {
      "time": 0.5,
      "index": 0,
      "size": 1
    };
    let randomNumbers: number[] = [42];
    let effectImporter: ParticleEffectImporter = new ParticleEffectImporter(storedValues, randomNumbers);
    let effectDefinition: ParticleEffectDefinition = effectImporter.parseFile(data);

    // evaluate storage
    for (const key in effectDefinition.update) {
      console.groupCollapsed(`Evaluate storage "${key}"`);
      storedValues[key] = effectDefinition.update[key]();
      console.log(`Stored "${key}"`, storedValues[key]);
      console.groupEnd();
    }

    //evaluate translation
    for (const key in effectDefinition.translation) {
      console.groupCollapsed(`Evaluate translation "${key}"`);
      console.log(`${key} =`, (<ClosureStorage>effectDefinition.translation)[key]());
      console.groupEnd();
    }

    //evaluate rotation
    for (const key in effectDefinition.rotation) {
      console.groupCollapsed(`Evaluate rotation "${key}"`);
      console.log(`${key} =`, (<ClosureStorage>effectDefinition.rotation)[key]());
      console.groupEnd();
    }

    //evaluate translation world
    for (const key in effectDefinition.translationWorld) {
      console.groupCollapsed(`Evaluate translation world "${key}"`);
      console.log(`${key} =`, (<ClosureStorage>effectDefinition.translationWorld)[key]());
      console.groupEnd();
    }

    // iterration 2
    storedValues["time"] = 2.3;
    storedValues["index"] = 1;
    storedValues["size"] = 3;

    // evaluate storage
    for (const key in effectDefinition.update) {
      console.groupCollapsed(`Evaluate storage "${key}"`);
      storedValues[key] = effectDefinition.update[key]();
      console.log(`Stored "${key}"`, storedValues[key]);
      console.groupEnd();
    }

    //evaluate translation
    for (const key in effectDefinition.translation) {
      console.groupCollapsed(`Evaluate translation "${key}"`);
      console.log(`${key} =`, (<ClosureStorage>effectDefinition.translation)[key]());
      console.groupEnd();
    }

    //evaluate translation world
    for (const key in effectDefinition.translationWorld) {
      console.groupCollapsed(`Evaluate translation world "${key}"`);
      console.log(`${key} =`, (<ClosureStorage>effectDefinition.translationWorld)[key]());
      console.groupEnd();
    }
  }
}