const crypto = require('crypto');
const Redis = require('ioredis');
const eloCalculator = require('elo-rating')
const { matchStore, matchFindById } = require('../../controllers/MatchController');
const { getRandomProblem } = require('../../controllers/ProblemController');
const { updateElo } = require('../../controllers/UserController');
const { MATCH_STATUSES, USER_STATUSES } = require('./constants');
const redis = new Redis(`${process.env.REDIS_URL}:${process.env.REDIS_PORT}`);
const subRedis = new Redis(`${process.env.REDIS_URL}:${process.env.REDIS_PORT}`);
const keys = {
    users: (id) => `u/${id}`,
    matches: (id) => `m/${id}`,
    activeMatches: (id) => `p/${id}`
}

redis.on("error", function (err) {
    throw err;
});

function remoteEmitPipe(pipe, matchId, type, ...args) {
    pipe.publish(matchId, JSON.stringify([type, ...args]))
}

function textUpdate(data) {
    this.to(this.match.id).emit('textUpdate', data);
}

function calculateElo(p1Elo, p2Elo, player1Win) {
    const newElos = eloCalculator.calculate(p1Elo, p2Elo, player1Win)
    return {
        p1Elo: newElos.playerRating,
        p2Elo: newElos.opponentRating
    }
}

async function finalizeMatch(matchId, io) {
    const match = await matchFindById(matchId);
    let tie;
    let winner;
    let loser;
    let winnerScore;
    let loserScore;
    if (match.player1Score > match.player2Score) {
        tie = false;
        winner = match.player1;
        loser = match.player2;
        winnerScore = match.player1Score;
        loserScore = match.player2Score;
    } else if (match.player1Score < match.player2Score) {
        tie = false;
        winner = match.player1;
        loser = match.player2;
        winnerScore = match.player2Score;
        loserScore = match.player1Score;
    } else {
        tie = true;
        winner = match.player1;
        loser = match.player2;
        winnerScore = match.player1Score;
        loserScore = match.player2Score;
    }

    // Unless it was a tie, we need to update elo scores now.
    if (!tie) {

    }
    io.in(match._id).emit('matchUpdates', {
        tie,
        winner,
        loser,
        winnerScore,
        loserScore
    });
}
async function getRedisMatchById(id) {
    const match = await redis.hgetall(keys.matches(id));
    if (match.id !== id) throw new Error('Match not found');
    return match;
}

async function joinPendingMatch(matchesKey) {
    for (const matchId of await redis.srandmember(matchesKey, 100)) {
        const matchKey = keys.matches(matchId)
        const { player1, status } = await redis.hgetall(matchKey)
        if (status === undefined) {    // expired pending match
            await redis.srem(matchesKey, matchId)
        } else {
            if (status === MATCH_STATUSES.WAITING && player1 !== this.user.id) {
                if (await redis.hsetnx(matchKey, 'player2', this.user.id)) {
                    const pipe = redis.pipeline()
                    // Establish second user in match
                    pipe.hset(keys.users(this.user.id), 'matchId', matchId)
                    pipe.srem(matchesKey, matchId)
                    pipe.hmset(matchKey, {
                        status: MATCH_STATUSES.MATCH_IN_PROG,
                        player2: this.user.id,
                        player2Score: 0,
                        started: new Date(),
                    })

                    remoteEmitPipe(pipe, matchId, 'match started')
                    await pipe.exec()

                    const match = await getRedisMatchById(matchId);
                    match.problem = await getRandomProblem();
                    await matchStore({
                        _id: matchId,
                        player1: match.player1,
                        player2: match.player2,
                        player1Score: match.player1Score,
                        player2Score: match.player2Score,
                        started: match.started,
                        problem: match.problem
                    })

                    return match;
                }
            }
        }
    }
}

async function userConnect(userId) {
    this.user = {
        id: userId,
        status: USER_STATUSES.CONNECTED
    }
}

async function disconnect(msg, io) {
    if (this.user && this.match) {
        await matchDisconnect.call(this, io);
        io.in(this.match.id).clients((err, clients) => {
            if (!err && clients.length === 0) {
                subRedis.unsubscribe(this.match.id);
            }
        })
    }
}

async function matchDisconnect(io) {

    const match = await getRedisMatchById(this.match.id);
    const matchKey = keys.matches(match.id);
    const matchStatus = match.status;
    const { player1, player2 } = match;
    const pipe = redis.pipeline();
    let newStatus = matchStatus;
    let delMatch = false;
    switch (matchStatus) {
        case MATCH_STATUSES.WAITING:
            pipe.hdel(keys.users(match.player1), ['matchId']);
            redis.del(matchKey);
            delMatch = true;
        case MATCH_STATUSES.MATCH_IN_PROG:
            if (this.user.id == player1) {
                newStatus = MATCH_STATUSES.PLAYER_ONE_DISCONNECTED;
            } else {
                newStatus = MATCH_STATUSES.PLAYER_TWO_DISCONNECTED;
            }
            break;
        case MATCH_STATUSES.PLAYER_ONE_DISCONNECTED:
            pipe.hdel(keys.users(match.player1), ['matchId']);
            user
        case MATCH_STATUSES.PLAYER_ONE_FINISHED:
            if (this.user.id == player2) {
                newStatus = MATCH_STATUSES.ALL_FINISHED
                finalizeMatch(match.id, io);
            }
            break;
        case MATCH_STATUSES.PLAYER_TWO_DISCONNECTED:
            pipe.hdel(keys.users(match.player2), ['matchId']);
        case MATCH_STATUSES.PLAYER_TWO_FINISHED:
            if (this.user.id == player1) {
                newStatus = MATCH_STATUSES.ALL_FINISHED;
                finalizeMatch(match.id, io);
            }
            break;
    }
    io.in(match.id).emit('matchAlert', `${this.user.id} has disconnected from the match.`);
    if (!delMatch) {
        pipe.hmset(matchKey, {
            status: newStatus
        })
    }
    await pipe.exec();
}

async function finished(io) {
    const match = await getRedisMatchById(this.match.id);
    const matchKey = keys.matches(match.id);
    const matchStatus = match.status;
    const { player1, player2 } = match;
    const pipe = redis.pipeline();
    let newStatus = matchStatus;
    switch (matchStatus) {
        case MATCH_STATUSES.MATCH_IN_PROG:
            if (this.user.id == player1) {
                newStatus = MATCH_STATUSES.PLAYER_ONE_FINISHED;
            } else {
                newStatus = MATCH_STATUSES.PLAYER_TWO_FINISHED;
            }
            break;
        case MATCH_STATUSES.PLAYER_ONE_FINISHED:
        case MATCH_STATUSES.PLAYER_ONE_DISCONNECTED:
            if (this.user.id == player2) {
                newStatus = MATCH_STATUSES.ALL_FINISHED
                finalizeMatch(match.id, io);
            }
            break;
        case MATCH_STATUSES.PLAYER_TWO_FINISHED:
        case MATCH_STATUSES.PLAYER_TWO_DISCONNECTED:
            if (this.user.id == player1) {
                newStatus = MATCH_STATUSES.ALL_FINISHED;
                finalizeMatch(match.id, io);
            }
            break;
    }
    this.to(match.id).emit('matchAlert', `${this.user.id} has finished.`)
    pipe.hmset(matchKey, {
        status: newStatus
    })
    await pipe.exec();
}

async function createPendingMatch(matchesKey) {
    const match = {
        id: crypto.randomBytes(64).toString('hex'),
        player1: this.user.id,
        player1Score: 0,
        created: new Date(),
        status: MATCH_STATUSES.WAITING
    }
    await redis.pipeline()
        .hmset(keys.matches(match.id), match)
        .sadd(matchesKey, match.id)
        .hset(keys.users(this.user.id), 'matchId', match.id)
        .exec();

    return match;
}

async function autoMatch(io) {
    if (this.match) throw new Error('user in a match')

    const matchesKey = keys.matches

    let match = await joinPendingMatch.call(this, matchesKey);

    if (match) {
        this.join(match.id);
        io.in(match.id).emit('matchInfo', match);
    } else {
        match = await createPendingMatch.call(this, matchesKey)
        this.join(match.id);
    }

    this.match = match
    subRedis.subscribe(match.id);
}

module.exports = {
    autoMatch,
    textUpdate,
    matchDisconnect,
    disconnect,
    userConnect,
    finished
}