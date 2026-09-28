# secrets

**The kit holds no secrets, and should not.** It is a public convention repo; anything here is
world-readable the moment it is pushed.

This directory exists so the tier's shape ships with the kit. A home fills in its own, using
`skeleton/memory/secrets/README.md` as the template: public key, master key location as a
path, and the spare's custody with both a deposit date and a verification date.

If a secret ever lands in this repo it is burned. Rotate it; do not delete the commit and
hope -- the push already happened.
