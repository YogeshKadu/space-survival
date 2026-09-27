export default class GameEvent {
    constructor() {
        this.events = [];
    }
    addHandler = (key, callback, callOnce = false) => {
        const isPresent = this.events.findIndex(event=> event.key == key);
        if(isPresent === -1) {
            this.events.push({key, callback, callOnce, firstRun:false});
            return {isSuccess: true, message: "Event added !"}
        } else {
            return {isSuccess: false, message: "Event already present !"}
        }
    }
    removeHandler = (key) => {
        this.events = this.events.filter(event=> event.key != key);
    }
    trigger = () => {
        this.events = this.events.map((event) => {
            const { callback, callOnce, firstRun } = event;
            if(callOnce && firstRun) {
                // already called.
                return;
            }
            callback();
            return { ...event, firstRun: true }
        });
        this.#AfterTrigger();
    }
    #AfterTrigger = () => {
        this.events.filter(event => event.callOnce && event.firstRun ? false : true);
    }
} 