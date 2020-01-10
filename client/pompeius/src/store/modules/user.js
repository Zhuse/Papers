const { USER_STATUSES } = require('../../constants')
const defaultState = {
    loginStatus: false,
    userInfo: {
        email: '',
        id: '',
        authorizationToken: ''
    },
    userStatus: USER_STATUSES.DISCONNECTED,
    match: null
};

const actions = {
    setLogin: ({ commit }, userPayload) => {
        commit('LOGIN', userPayload);
    },
    setLogout: ({ commit }) => {
        commit('LOGOUT');
    },
    setUserStatus: ({ commit }, status) => {
        commit('SET_STATUS', status);
    },
    setMatch: ({ commit }, match) => {
        commit('SET_MATCH', match);
    }
};

const mutations = {
    'LOGIN': (state, payload) => {
        state.loginStatus = true;
        state.userInfo.email = payload.email;
        state.userInfo.id = payload.id;
        state.userInfo.authorizationToken = payload.authorizationToken;
    },
    'LOGOUT': (state) => {
        state.email = '';
        state.id = '';
        state.authorizationToken = '';
        state.loginStatus = false;
    },
    'SET_STATUS': (state, status) => {
        state.userStatus = status;
    },
    'SET_MATCH': (state, payload) => {
        state.match = payload;
    }
};

const getters = {
    getLoginStatus: state => state.loginStatus,
    getUserInfo: state => state.userInfo,
    getUserStatus: state => state.userStatus,
    getMatch: state => state.match
};

export default {
    namespaced: true,
    state: defaultState,
    getters,
    actions,
    mutations,
};