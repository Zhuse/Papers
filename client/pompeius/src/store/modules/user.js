const defaultState = {
    loginStatus: false,
    userInfo: {
        email: '',
        id: '',
        authorizationToken: ''
    }
};

const actions = {
    setLogin: ({ commit }, userPayload) => {
        commit('LOGIN', userPayload);
    },
    setLogout: ({ commit }) => {
        commit('LOGOUT');
    },
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
    }
};

const getters = {
    getLoginStatus: state => state.loginStatus,
    getUserInfo: state => state.userInfo
};

export default {
    namespaced: true,
    state: defaultState,
    getters,
    actions,
    mutations,
};