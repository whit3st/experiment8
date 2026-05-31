/** Pure domain logic. Knows nothing about the browser or UI. */
export class TodoDomain {
    constructor() {
        this.state = { todos: [] };
    }
    add(text) {
        const t = text.trim();
        if (!t)
            return this.state;
        this.state = { todos: [...this.state.todos, t] };
        return this.state;
    }
    remove(index) {
        this.state = { todos: this.state.todos.filter((_, i) => i !== index) };
        return this.state;
    }
}
