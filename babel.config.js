/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


module.exports = function (api) {
    api.cache(true);
    return {
        presets: ["babel-preset-expo"],
    };
};
