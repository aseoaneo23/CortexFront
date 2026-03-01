/*
 * SPDX-FileCopyrightText: 2026 Antonio Seoane De Ois
 *
 * SPDX-License-Identifier: MIT
 */


import { Redirect } from "expo-router";

export default function Index() {
    return <Redirect href="/(tabs)/home" />;
}
