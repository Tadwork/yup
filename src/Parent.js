// import { getter } from 'property-expr';
// import { isRelativePath, getRelativePath } from './util/makePath';

// let validateType = d => {
//   if (typeof d !== 'string')
//     throw new TypeError("ref's must be strings, got: " + d);
// };

export default class Parent {
  static isParent(value) {
    return !!(value && (value.__isYupParent || value instanceof Parent));
  }

  toString() {
    return `Parent`;
  }
  value = [];
  constructor(value = {}, parent) {
    if (parent) {
      if (!Parent.isParent(parent)) {
        parent = new Parent({});
      } else {
        this.value = [...parent.value];
      }
    }
    if (Parent.isParent(value)) {
      this.value = [...value.value];
    } else {
      this.value.push(value);
    }
  }

  resolve() {
    return this;
  }

  getMostRecent() {
    return this.value[this.value.length - 1] || {};
  }
}

Parent.prototype.__isYupParent = true;
