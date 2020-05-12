namespace Import {
  export interface StoredValues {
    [key: string]: number;
  }
  
  test();

  function test(): void {
    console.log(data);
    let storedValues: StoredValues = {
      "time": 0.5,
      "index": 0,
      "size": 1
    };
    let randomNumbers: number[] = [42];
    let effectImporter: ParticleEffectImporter = new ParticleEffectImporter();
    effectImporter.randomNumbers = randomNumbers;
    effectImporter.storedValues = storedValues;
    let effect: ParticleEffectDefinition = effectImporter.parseFile(data);

    // evaluate storage
    for (const key in effect.storage) {
      console.groupCollapsed(`Evaluate storage "${key}"`);
      storedValues[key] = effect.storage[key]();
      console.log(`Stored "${key}"`, storedValues[key]);
      console.groupEnd();
    }

    //evaluate translation
    for (const key in effect.translation) {
      console.groupCollapsed(`Evaluate translation "${key}"`);
      storedValues[key] = effect.translation[key]();
      // console.log(`Stored "${key}"`, storedValues[key]);
      console.groupEnd();
    }
  }
}