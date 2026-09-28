// Shapes shared by every tier.

/** YYYY-MM-DD. */
export type IsoDate = string;

/** A claim's address (REF_PATTERN in caps.ts):
 *    sha | path | #NN | urls/<name> | po:SNN | <person>:<date> | <date> | '' (blank)
 *  Blank is COUNTED, never failed: a fabricated ref survives a sweep, a missing one does not.
 *  A memory record is a claim about a source, never a source. Open the ref before citing it. */
export type Ref = string;
