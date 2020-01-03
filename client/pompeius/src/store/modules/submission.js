const defaultState = {
    editorText: ''
};

const actions = {
    changeText: ({ commit }, newText) => {
        commit('TEXT_UPDATED', newText);
    },
};

const mutations = {
    'TEXT_UPDATED': (state, newText) => {
        state.editorText = newText;
    },
};

const getters = {
    getEditorText: state => state.editorText,
};

export default {
    namespaced: true,
    state: defaultState,
    getters,
    actions,
    mutations,
};