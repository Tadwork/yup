import { getter } from 'property-expr';
import makePath from './util/makePath';

let validateType = d => {
  if (typeof d !== 'string')
    throw new TypeError("ref's must be strings, got: " + d);
};
function getParentPath(path) {
  const objectIndex = path.lastIndexOf('.');
  return path.substring(0, objectIndex);
}
function getRelativePath(key, path) {
  // remove '../' from the beginning of the key
  key = key.slice(3);
  path = getParentPath(path);
  const isRelativePath = key.indexOf('../') === 0;
  if (isRelativePath) {
    return getRelativePath(key, path);
  }
  return makePath`${path}.${key}`;
}
export default class Reference {
  static isRef(value) {
    return !!(value && (value.__isYupRef || value instanceof Reference));
  }

  toString() {
    return `Ref(${this.key})`;
  }

  constructor(key, mapFn, options = {}) {
    validateType(key);
    let prefix = options.contextPrefix || '$';

    this.key = key.trim();
    this.prefix = prefix;
    this.isContext = this.key.indexOf(prefix) === 0;
    this.isRelativePath = this.key.indexOf('../') === 0;
    this.path = this.isContext ? this.key.slice(this.prefix.length) : this.key;
    if (!this.isRelativePath) {
      this._get = getter(this.path, true);
    }
    this.map = mapFn || (value => value);
  }
  resolve() {
    return this;
  }

  cast(value, options) {
    return this.getValue(options);
  }

  getValue(options) {
    const { context, parent, value } = options;
    let refValue;
    if (this.isRelativePath) {
      const relativePath = getRelativePath(
        this.key,
        getParentPath(options.path),
      );
      const _get = getter(relativePath, true);
      refValue = _get(value);
    } else {
      refValue = this._get(this.isContext ? context : parent || context || {});
    }

    return this.map(refValue);
  }
}

Reference.prototype.__isYupRef = true;
