# Assignment: Client-Side Ownership Checks

## Overview

Right now the Edit, Delete, and comment ✕ buttons are visible to every signed-in user —
any user can try to edit or delete any post or comment.

Your task is to add **client-side ownership checks** inside `app/(protected)/postDetails/[id].tsx`
so that:

- The **Edit** and **Delete** buttons only appear when the signed-in user owns the post
- The comment **✕** button only appears when the signed-in user wrote that comment

These are UI-level checks only — you are not changing any API functions.

---

## Part 1 — Show Edit and Delete only for your own posts

Open `app/(protected)/postDetails/[id].tsx`.

After the post loads, compute whether the signed-in user is the post owner:

```ts
const isOwner = !!user && post.authorId === user.uid;
```

Then wrap the Edit and Delete buttons so they only render when `isOwner` is true.

**Where to find it:** look for the `<View style={styles.actions}>` block near the bottom of the return statement.

**Expected result:** when you open a post you did not create, the Edit and Delete buttons are hidden.

---

## Part 2 — Show the comment ✕ button only for your own comments

In the same file, comments are rendered in a `.map()` loop. Each item has `item.comment.authorId`.

Wrap the delete button so it only renders when the comment belongs to the signed-in user:

```ts
item.comment.authorId === user?.uid
```

**Where to find it:** look for the `<TouchableOpacity style={styles.deleteCommentButton}>` inside the comments map.

**Expected result:** you can only see the ✕ button on comments you wrote yourself.

---

## What to hand in

Your edited version of `app/(protected)/postDetails/[id].tsx` with both checks in place.
