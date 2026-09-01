export class HistoryManager {
  constructor(initialState, onChange) {
    this.stack = [JSON.parse(JSON.stringify(initialState))];
    this.currentIndex = 0;
    this.onChange = onChange;
  }

  pushState(state) {
    this.stack = this.stack.slice(0, this.currentIndex + 1);
    this.stack.push(JSON.parse(JSON.stringify(state)));
    this.currentIndex++;
    this.notify();
  }

  undo() {
    if (this.canUndo()) {
      this.currentIndex--;
      this.notify();
    }
  }

  redo() {
    if (this.canRedo()) {
      this.currentIndex++;
      this.notify();
    }
  }

  canUndo() {
    return this.currentIndex > 0;
  }

  canRedo() {
    return this.currentIndex < this.stack.length - 1;
  }

  getCurrentState() {
    return this.stack[this.currentIndex];
  }

  notify() {
    this.onChange(this.getCurrentState(), this.canUndo(), this.canRedo());
  }
}
