export default class GameEvent {
    constructor() {
        this.events = [];
    }
    subscribe = (key, callback, callOnce = false) => {
        const isPresent = this.events.findIndex(event=> event.key == key);
        if(isPresent === -1) {
            this.events.push({key, callback, callOnce});
            return {isSuccess: true, message: "Event added !"}
        } else {
            return {isSuccess: false, message: "Event already present !"}
        }
    }
    unsubscribe = (key) => {
        this.events = this.events.filter(event=> event.key != key);
    }
    trigger = () => {
        this.events = this.events.filter((event) => {
            const { key, callback, callOnce } = event;
            callback();
            console.log(`Game Event - ${key} Triggered`);
            return !callOnce;
        });
    }
}