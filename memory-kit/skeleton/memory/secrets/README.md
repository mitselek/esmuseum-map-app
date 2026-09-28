# secrets

One encrypted file per secret. The kit mandates the discipline, not the tool.

- **Public key (encrypt-only, safe to commit):** _fill in_
- **Master key location (a PATH, never the key):** _fill in_
- **Spare deposited:** _date or NOT YET_ — **where:** _in words_ — **verified:** _date or NOT YET_

Verification means re-deriving the public key from the deposited copy. Depositing without
verifying is depositing nothing.

A secret VALUE never appears in the clear: not in a memory file, not in a commit, not in a
tool result, not in chat. Decrypt into a file or straight into the consumer, never to stdout.
