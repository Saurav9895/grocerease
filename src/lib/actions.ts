"use server";

// This file is intentionally left minimal.
//
// Database write operations (like adding products or placing orders) have been
// moved from this file to their corresponding client components.
//
// This change was necessary to resolve "Permission Denied" errors from Firestore.
// Server Actions run in a server environment that doesn't automatically have the
// user's authentication context, causing Firestore security rules to fail.
// By moving these operations to the client, they run with the user's live
// authentication state, and the rules pass as expected.
