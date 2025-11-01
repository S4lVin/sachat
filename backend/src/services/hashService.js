import bcrypt from 'bcrypt'

export const hashService = {
  hash: (raw) => bcrypt.hash(raw, Number(process.env.BCRYPT_ROUNDS)),
  verify: (raw, hashed) => bcrypt.compare(raw, hashed),
}
