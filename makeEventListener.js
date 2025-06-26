export default function makeEventListener(eventList) {
    return class {
        static Events = eventList;

        #listeners = Object.fromEntries(Object.values(eventList).map(name => [name, []]));

        addEventListener(name, callable) {
            if (typeof this.#listeners[name] === 'undefined') {
                throw new Error(`Unknown event: ${name}`);
            }
            this.#listeners[name].push(callable);
        }

        removeEventListener(name, callable) {
            const index = this.#listeners[name].indexOf(callable);
            if (!~index) {
                return;
            }

            this.#listeners[name].splice(index, 1);
        }

        dispatchEvent(name, params = {}) {
            const eventStuff = {
                prevented: false,
                preventDefault() {
                    this.prevented = true;
                },
                stopPropagation() {
                    // does nothing
                }
            };
            this.#listeners[name].forEach(async (callable) => {
                callable(Object.assign({}, params, eventStuff));
            });
        }
    };
}