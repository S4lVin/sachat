import bcrypt from 'bcrypt'

export const hasher = {
  hash: (raw) => bcrypt.hash(raw, Number(process.env.BCRYPT_ROUNDS)),
  verify: (raw, hashed) => bcrypt.compare(raw, hashed),
}
