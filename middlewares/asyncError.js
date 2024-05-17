module.exports = function (asyncFunction) {
    return function (req, res, next) {
        Promise.resolve(asyncFunction(req, res, next)).catch(next);
    };
};
