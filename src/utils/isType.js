export const _toString = Object.prototype.toString;

export function isType(arg, type) {
  return _toString.call(arg) === "[object " + type + "]";
}

export function isFunction(arg) {
  return isType(arg, "Function");
}

export function isPlainObject(arg) {
  return isType(arg, "Object");
}

export function isUndef(v) {
  return v === undefined || v === null;
}

export function isDate(arg) {
  return isType(arg, "Date");
}
export function isArray(arg) {
  return Array.isArray ? Array.isArray(arg) : isType(arg, "Array");
}

export function isString(arg) {
  return isType(arg, "String");
}

export function isBoolean(arg) {
  return isType(arg, "Boolean");
}

export function isElement(arg) {
  return (
    typeof arg === "object" &&
    arg !== null &&
    arg.nodeType === 1 &&
    !isPlainObject(arg)
  );
}
