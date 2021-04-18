import { random } from '../utils';

export default class Shape {
  length: any;
  width: any;

  constructor(maxLength, maxWidth) {
    let length = 0;
    let width = 0;
    while (length === 0 || width === 0) {
      length = random(0, maxLength);
      width = random(0, maxWidth);
    }
    let orientation = random(0, 1);

    this.length = (orientation) ? length : width;
    this.width = (orientation) ? width : length;
  }
}
