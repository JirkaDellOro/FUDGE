var Compare;
(function (Compare) {
    var ƒ = FudgeCore;
    async function compare(_object1, _object2, _level = 0, _checked = [], _path = [], _mismatch = false) {
        if (_checked.indexOf(_object1) >= 0 || _checked.indexOf(_object2) >= 0)
            return _mismatch;
        _checked.push(_object1);
        _checked.push(_object2);
        for (var prefix = "", i = 0; i <= _level; prefix += "-", i++)
            ;
        for (let prop in _object1) {
            _path.push(prop);
            let path = _path.toString();
            if (Number(prop).toString() != prop)
                ƒ.Debug.log(`${prefix} Comparing ${prop}`);
            //Check property exists on both objects
            if (_object1.hasOwnProperty(prop) !== _object2.hasOwnProperty(prop)) {
                ƒ.Debug.warn(`Property mismatch ${path}`);
                return true;
            }
            try {
                if ((typeof _object1[prop]) != (typeof _object2[prop])) {
                    ƒ.Debug.warn(`Type mismatch at ${path} -> ${typeof _object1[prop]} | ${typeof _object2[prop]}`);
                    // ƒ.Debug.warn(_object1, _object2);
                    return true;
                }
            }
            catch (error) {
                ƒ.Debug.log(error, path);
                _path.pop();
                continue;
            }
            switch (typeof (_object1[prop])) {
                //Deep compare objects
                case "object":
                    _mismatch ||= await compare(_object1[prop], _object2[prop], _level + 1, _checked, _path, _mismatch);
                    // _path.pop();
                    if (_mismatch) {
                        // ƒ.Debug.warn(`Found in ${path}`);
                        return true;
                    }
                    break;
                case "number":
                    if (isNaN(_object1[prop]) && isNaN(_object2[prop]))
                        break;
                case "function":
                    if (_object1[prop].prototype != _object2[prop].prototype)
                        ƒ.Debug.error(`Function prototype mismatch ${path}`);
                    break;
                //Compare values
                default:
                    if (_object1[prop] != _object2[prop]) {
                        ƒ.Debug.warn(`Value mismatch at ${path} -> ${_object1[prop]} | ${_object2[prop]}`);
                        // ƒ.Debug.warn(_object1, _object2);
                        return true;
                    }
            }
            _path.pop();
        }
        //Check object 2 for any extra properties
        for (let prop in _object2) {
            _path.push(prop);
            try {
                if (typeof (_object1[prop]) == "undefined" && typeof (_object2[prop]) != "undefined") {
                    // if (!_object1.hasOwnProperty(prop)) {
                    ƒ.Debug.error(`Property mismatch ${_path} | ${_object1} : ${_object2}`);
                    return true;
                }
            }
            catch (error) {
                ƒ.Debug.log(error, _path);
            }
            _path.pop();
        }
        return _mismatch;
    }
    Compare.compare = compare;
})(Compare || (Compare = {}));
//# sourceMappingURL=Compare.js.map