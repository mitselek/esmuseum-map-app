// Keys: memory/keys.yaml. One row per access grant held or handed out.
// The tier exists for `revoke`: a grant nobody can withdraw is permanent by accident.

import type { IsoDate, Ref } from './memory-common';

export interface KeysFile {
  keys: KeyGrant[];
}

export interface KeyGrant {
  /** Service, repo, device or share. */
  subject: string;
  /** A role or an account. Never a credential value. */
  holder: string;
  scope: string;
  granted: IsoDate;
  /** The exact step that withdraws it. Blank is a finding, not a blank. */
  revoke: string;
  ref: Ref;
}
