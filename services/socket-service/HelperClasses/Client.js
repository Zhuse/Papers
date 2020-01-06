class Client {
    constructor(userId, status, room) {
        this.userId = userId;
        this.status = status;
        this.room = room;
    }

    getUserId () {
        return this.userId;
    }

    getStatus () {
        return this.status;
    }

    changeRoom (roomId) {
        this.room = roomId;
    }
}

module.exports = Client;