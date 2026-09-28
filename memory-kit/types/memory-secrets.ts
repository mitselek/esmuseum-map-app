// Secrets: memory/secrets/<name>.<ext>, one encrypted file per secret, plus a README.
// The kit mandates the discipline, not the tool: a secret VALUE never appears in the clear.

import type { IsoDate } from './memory-common';

export interface SecretsReadme {
  /** Encrypt-only. Safe to commit; that is the point. */
  publicKey: string;
  /** A PATH, never the key. */
  masterKeyLocation: string;
  spare: {
    deposited: IsoDate | null;
    /** In words. Never a credential. */
    location: string;
    /** Re-derived the public key from the deposited copy. Depositing without verifying is
     *  depositing nothing. */
    verified: IsoDate | null;
  };
}

// Decrypt into a file or the consumer, never to stdout: a tool result is transcript.
