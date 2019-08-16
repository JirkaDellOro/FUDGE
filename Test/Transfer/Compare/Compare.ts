namespace Compare {
    import ƒ = FudgeCore;

    export function compare(_object1: Object, _object2: Object, _level: number = 0, _checked: Object[] = []): boolean {
        if (_checked.indexOf(_object1) >= 0 || _checked.indexOf(_object2) >= 0)
            return true;
        _checked.push(_object1);
        _checked.push(_object2);

        for (var prefix: string = "", i: number = 0; i <= _level; prefix += "-", i++);

        for (let prop in _object1) {
            // if (prop == "ComponentMaterial")
            //     continue;
            if (Number(prop).toString() != prop)
                console.log(`${prefix} Comparing ${prop}`);
            //Check property exists on both objects
            if (_object1.hasOwnProperty(prop) !== _object2.hasOwnProperty(prop)) {
                console.warn(`Property mismatch ${prop}`);
                return true;
            }

            if ((typeof _object1[prop]) != (typeof _object2[prop])) {
                console.warn(`Type mismatch ${typeof _object1[prop]} : ${typeof _object2[prop]}`);
                return true;
            }

            switch (typeof (_object1[prop])) {
                //Deep compare objects
                case "object":
                    if (!compare(_object1[prop], _object2[prop], _level + 1, _checked)) {
                        console.log(`Found in ${prop}`);
                        return true;
                    }
                    break;
                case "number":
                    if (isNaN(_object1[prop]) && isNaN(_object2[prop]))
                        break;
                case "function":
                    if (_object1[prop].prototype != _object2[prop].prototype)
                        console.error(`Function prototype mismatch ${prop}`);
                    break;
                //Compare values
                default:
                    if (_object1[prop] != _object2[prop]) {
                        console.warn(`Value mismatch ${_object1[prop]} | ${_object2[prop]}`);
                        return true;
                    }
            }
        }

        //Check object 2 for any extra properties
        for (let prop in _object2) {
            if (typeof (_object1[prop]) == "undefined" && typeof (_object2[prop]) != "undefined") {
                // if (!_object1.hasOwnProperty(prop)) {
                console.error(`Property mismatch ${prop} | ${_object1} : ${_object2}`);
                return true;
            }
        }

        return true;
    }
}