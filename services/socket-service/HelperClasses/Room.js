class Room {
    constructor(id) {
        this.id = id;
        this.userSet = {};
        this.numPeople = 0;
    }

    joinRoom(userId, userInstance) {
        if (userInstance == null || userId != userInstance.getUserId()) {
            return;
        }
        this.userSet[userId] = userInstance;
        userInstance.changeRoom(this.id);
        this.numPeople++;
    }

    leaveRoom(userId) {
        if (this.userSet[userId]) {
            this.userSet[userId].changeRoom(null);
            this.userSet[userId] = null;
            this.numPeople--;
        }
    }

    getRoomId() {
        return this.id;
    }

    getNumberOfPeople() {
        return this.numPeople;
    }
}

module.exports = Room;